// Plain Notes: plain text notes, each a .txt file in a folder of the user's Drive.
//
// The folder comes from Peergos' folder picker: the app asks for write access to be remembered, and from then
// on reaches the folder only through the grant id the picker handed back (/peergos-api/v0/folder/<id>/...).
// A note's title is its file name without ".txt". Saving is by hand.
'use strict';

const API = '/peergos-api/v0';
const EXT = '.txt';
const UNTITLED = t('untitled');
// a file bigger than this is listed and opens, but its text is not read just to search it
const SEARCH_LIMIT = 1024 * 1024;
const KEYS = {grant: 'plainnotes.grant', wrap: 'plainnotes.wrap', draft: 'plainnotes.draft'};
const params = new URL(window.location.href).searchParams;
// dates follow the language Peergos is in; one the browser doesn't know falls back to its own
const locale = (() => {
	try {
		return Intl.DateTimeFormat.supportedLocalesOf([params.get('lang')]).length > 0 ? params.get('lang') : undefined;
	} catch (e) {
		return undefined;
	}
})();

const $ = id => document.getElementById(id);

const ICONS = {
	trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9L17.5 7M10 11v5M14 11v5"/>',
	tick: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
};

let grant = null;       // {grantId, write, path}
let rich = null;        // the listing gives times and sizes, and the folder API renames and moves; null until seen
let notes = [];
let current = null;
let busy = false;       // a save, delete or move under way
let shown = {note: null, loaded: false};  // the note whose text the fields hold, and whether it had been read
let draftTimer = null;

class UserError extends Error {}

// ------------------------------------------------------------------ storage, per device

function stored(key) {
	try { return localStorage.getItem(key); } catch (e) { return null; }
}
function store(key, value) {
	try {
		if (value == null)
			localStorage.removeItem(key);
		else
			localStorage.setItem(key, value);
	} catch (e) {}
}

// ------------------------------------------------------------------ the folder API

function inFolder(name, g) {
	return API + '/folder/' + (g || grant).grantId + '/' + (name == null ? '' : encodeURIComponent(name));
}

async function expect(response, ...statuses) {
	if (! statuses.includes(response.status))
		throw new Error(t('serverAnswered', response.status));
	return response;
}

async function listFolder(g) {
	let r = await fetch(inFolder(null, g) + '?details=true');
	if (! r.ok)
		throw new Error(t('serverAnswered', r.status));
	let listing = await r.json();
	let entries = listing.files.concat(listing.subFolders);
	// a server from before the details gives bare names, and has no rename or move either
	if (entries.length > 0)
		rich = typeof entries[0] == 'object';
	return listing.files.map(f => typeof f == 'object' ? f : {name: f})
		.filter(f => f.name.length > EXT.length && f.name.toLowerCase().endsWith(EXT));
}

async function exists(name, g) {
	let r = await fetch(inFolder(name, g), {method: 'HEAD'});
	if (r.status == 404)
		return false;
	await expect(r, 200);
	return true;
}

async function readFile(name, g) {
	return (await expect(await fetch(inFolder(name, g)), 200)).text();
}

async function writeFile(name, text, g) {
	await expect(await fetch(inFolder(name, g), {method: 'PUT', body: text}), 200, 201);
}

async function deleteFile(name, g) {
	await expect(await fetch(inFolder(name, g), {method: 'DELETE'}), 204);
}

// a real rename keeps the file, and with it whatever it is shared with
async function renameFile(name, newName, g) {
	await expect(await fetch(inFolder(name, g) + '?action=rename', {method: 'POST', body: newName}), 201);
}

// Peergos asks the user, as Drive does, whether people keep access to a moved file that is shared
async function moveFile(name, from, to) {
	await expect(await fetch(inFolder(name, from) + '?action=move', {method: 'POST', body: to.grantId + '/'}), 201);
}

// ------------------------------------------------------------------ notes

function titleOf(name) {
	return name.substring(0, name.length - EXT.length);
}

function listedNote(file) {
	let title = titleOf(file.name);
	return {name: file.name, savedTitle: title, title: title, savedBody: '', body: '', raw: null, eol: '\n',
		loaded: false, loading: null, modified: file.modified ? new Date(file.modified) : null, size: file.size};
}

function newNote() {
	return {name: null, savedTitle: '', title: '', savedBody: '', body: '', raw: '', eol: '\n',
		loaded: true, loading: null, modified: null, size: 0};
}

function isDirty(n) {
	if (n.name == null)
		return n.title.trim() != '' || n.body != '';
	return n.loaded && (n.title != n.savedTitle || n.body != n.savedBody);
}

function readOnly() {
	return grant != null && ! grant.write;
}

// a note left without a title is still saved, under the first of these no other note has
function titleToSave(n, typed) {
	let title = typed.trim();
	if (title)
		return title;
	return freeTitle(UNTITLED, new Set(notes.filter(m => m != n && m.name != null).map(m => m.name.toLowerCase())));
}

function titleProblem(n) {
	let title = n.title.trim();
	if (! title)
		return null;
	if (/[\/\\]/.test(title))
		return t('titleSlash');
	if (title.startsWith('.'))
		return t('titleDot');
	let file = (title + EXT).toLowerCase();
	if (notes.some(m => m != n && m.name != null && m.name.toLowerCase() == file))
		return t('titleTaken');
	return null;
}

// the first "title (n)" not taken: a note never replaces another, it is kept beside it
function freeTitle(title, taken) {
	if (! taken.has((title + EXT).toLowerCase()))
		return title;
	let n = 2;
	while (taken.has((title + ' (' + n + ')' + EXT).toLowerCase()))
		n++;
	return title + ' (' + n + ')';
}

function sortNotes() {
	let unsaved = notes.filter(n => n.name == null);
	let saved = notes.filter(n => n.name != null);
	if (rich)
		saved.sort((a, b) => (b.modified || 0) - (a.modified || 0));
	else
		saved.sort((a, b) => a.savedTitle.localeCompare(b.savedTitle, locale));
	notes = unsaved.concat(saved);
}

// Reads a note's text, once however many ask. The file keeps its own line ends: a textarea turns \r\n into
// \n, so what is saved puts them back, and a note written on Windows stays as it was.
function loadBody(n) {
	if (n.loaded || n.name == null)
		return Promise.resolve();
	if (n.loading == null) {
		n.loading = readFile(n.name).then(raw => {
			n.raw = raw;
			n.eol = raw.includes('\r\n') ? '\r\n' : '\n';
			n.savedBody = raw.replace(/\r\n/g, '\n');
			n.body = n.savedBody;
			n.loaded = true;
		}).finally(() => n.loading = null);
	}
	return n.loading;
}

// the text of each note small enough, in the background, so a search finds what is in them
async function loadForSearch() {
	let folder = grant;
	for (let n of notes.slice()) {
		if (grant != folder)
			return;
		if (n.loaded || n.name == null || (n.size != null && n.size > SEARCH_LIMIT))
			continue;
		try {
			await loadBody(n);
		} catch (e) {}
	}
	renderList();
}

async function loadList() {
	let files = await listFolder();
	let byName = new Map(notes.filter(n => n.name != null).map(n => [n.name, n]));
	let kept = notes.filter(n => n.name == null);
	for (let f of files) {
		let n = byName.get(f.name);
		byName.delete(f.name);
		if (n == null) {
			kept.push(listedNote(f));
			continue;
		}
		let modified = f.modified ? new Date(f.modified) : null;
		// changed elsewhere since it was read: read it again when it is next opened, unless it is being edited
		if (! isDirty(n) && modified != null && n.modified != null && modified.getTime() != n.modified.getTime()) {
			n.loaded = false;
			n.raw = null;
		}
		n.modified = modified || n.modified;
		n.size = f.size;
		kept.push(n);
	}
	// gone from the folder: dropped, unless it holds edits, which a save puts back
	for (let n of byName.values())
		if (isDirty(n))
			kept.push(n);
	notes = kept;
	if (current != null && ! notes.includes(current))
		current = null;
	sortNotes();
}

// ------------------------------------------------------------------ the draft kept on this device

// While a note has edits that are not saved, they are kept in this browser too, so closing the app - which
// Peergos does without asking it - loses nothing: they are offered back the next time.
function scheduleDraft() {
	clearTimeout(draftTimer);
	draftTimer = setTimeout(() => {
		if (current != null && isDirty(current))
			store(KEYS.draft, JSON.stringify({grantId: grant.grantId, name: current.name, title: current.title, body: current.body}));
		else
			store(KEYS.draft, null);
	}, 800);
}

function clearDraft() {
	clearTimeout(draftTimer);
	store(KEYS.draft, null);
}

async function offerDraft() {
	let draft = null;
	try { draft = JSON.parse(stored(KEYS.draft)); } catch (e) {}
	if (draft == null || draft.grantId != grant.grantId || readOnly())
		return;
	let n = draft.name == null ? null : notes.find(m => m.name == draft.name);
	let title = draft.name == null ? draft.title.trim() : titleOf(draft.name);
	let choice = await ask({
		title: title ? t('restoreTitle', title) : t('restoreTitleNew'),
		body: [p(t('restoreText'))],
		actions: [{key: 'discard', label: t('discard'), cls: 'danger'}, null, {key: 'restore', label: t('restore'), cls: 'primary'}],
		cancel: 'discard'});
	if (choice != 'restore') {
		clearDraft();
		return;
	}
	if (n == null) {
		n = newNote();
		notes.unshift(n);
	} else {
		try {
			await loadBody(n);
		} catch (e) {
			notice(t('couldNotRead', n.savedTitle));
			return;
		}
	}
	n.title = draft.title;
	n.body = draft.body;
	showNote(n);
}

// ------------------------------------------------------------------ actions

function showNote(n) {
	current = n;
	setView('detail');
	render();
	if (! n.loaded) {
		loadBody(n).then(() => {
			if (current == n)
				render();
		}).catch(() => {
			if (current == n)
				notice(t('couldNotRead', n.savedTitle));
		});
	}
}

// Leaves the open note - asking first when it has edits - then does next. The question says what comes next:
// "Save them before you open “Books”?"
async function leaveCurrent(question, next) {
	if (current != null && isDirty(current)) {
		let choice = await ask({
			title: t('saveChangesTitle', current.name == null ? current.title.trim() || UNTITLED : current.savedTitle),
			body: [p(question)],
			actions: [{key: 'discard', label: t('discard'), cls: 'danger'}, null, {key: 'cancel', label: t('cancel')},
				{key: 'save', label: t('save'), cls: 'primary', disabled: titleProblem(current) != null || readOnly()}],
			cancel: 'cancel'});
		if (choice == 'cancel')
			return;
		if (choice == 'save' && ! await save())
			return;
		if (choice == 'discard')
			discard(current);
	} else if (current != null && current.name == null) {
		discard(current);
	}
	next();
}

function discard(n) {
	clearDraft();
	if (n.name == null) {
		notes = notes.filter(m => m != n);
		if (current == n)
			current = null;
	} else {
		n.title = n.savedTitle;
		n.body = n.savedBody;
	}
}

function openNote(n) {
	if (n == current) {
		setView('detail');
		render();
		return;
	}
	leaveCurrent(t('saveBeforeOpen', n.savedTitle), () => showNote(n));
}

function startNewNote() {
	if (readOnly())
		return;
	leaveCurrent(t('saveBeforeNew'), () => {
		let n = newNote();
		notes.unshift(n);
		showNote(n);
		$('title').focus();
	});
}

function goBack() {
	leaveCurrent(t('saveBeforeBack'), () => {
		setView('list');
		render();
	});
}

async function save() {
	let n = current;
	if (n == null || busy || readOnly() || ! isDirty(n) || titleProblem(n) != null)
		return false;
	busy = true;
	render();
	// what is saved is what the fields hold now: typing goes on while the save is under way, and stays unsaved
	let typed = {title: n.title, body: n.body};
	try {
		let title = titleToSave(n, typed.title);
		let target = title + EXT;
		let text = typed.body.replace(/\n/g, n.eol);
		if (n.name == null) {
			// a PUT replaces what is there, so first make sure nothing is
			if (await exists(target))
				throw new UserError(t('alreadyInFolder', target));
			await writeFile(target, text);
		} else {
			// saved from somewhere else since it was opened?
			let there = null;
			try {
				there = await readFile(n.name);
			} catch (e) {
				// gone: deleted elsewhere, and this save puts it back
			}
			if (there != null && there != n.raw) {
				let choice = await askConflict(n, typed);
				if (choice == 'cancel')
					return false;
				if (choice == 'both')
					return await saveBeside(n, typed, text);
			}
			let replaced = null;
			if (target != n.name) {
				if (there == null || ! rich) {
					if (await exists(target))
						throw new UserError(t('alreadyInFolder', target));
					replaced = there == null ? null : n.name;
				} else {
					await renameFile(n.name, target);
				}
			}
			await writeFile(target, text);
			if (replaced != null)
				await deleteFile(replaced);
		}
		// an empty folder can't tell whether the server lists details and renames: the first note saved in it can
		if (rich == null) {
			try {
				await listFolder();
			} catch (e) {}
		}
		n.name = target;
		n.savedTitle = title;
		n.raw = text;
		n.savedBody = typed.body;
		n.loaded = true;
		n.modified = new Date();
		n.size = new TextEncoder().encode(text).length;
		afterSave(n, typed);
		return true;
	} catch (e) {
		notice(e instanceof UserError ? e.message : t('couldNotSave', e.message));
		return false;
	} finally {
		busy = false;
		sortNotes();
		render();
	}
}

function askConflict(n, typed) {
	let beside = freeTitle(titleToSave(n, typed.title), new Set(notes.filter(m => m.name != null).map(m => m.name.toLowerCase())));
	return ask({
		title: t('conflictTitle', n.savedTitle),
		body: [p(t('conflictText')), p(richText('conflictChoice', beside))],
		actions: [{key: 'cancel', label: t('cancel'), cls: 'quiet'}, null, {key: 'replace', label: t('replace')},
			{key: 'both', label: t('keepBoth'), cls: 'primary'}],
		cancel: 'cancel'});
}

// keep both: this version goes beside the other, which is read again when opened
async function saveBeside(n, typed, text) {
	let taken = new Set(notes.filter(m => m.name != null).map(m => m.name.toLowerCase()));
	let title = freeTitle(titleToSave(n, typed.title), taken);
	await writeFile(title + EXT, text);
	let theirs = listedNote({name: n.name, modified: new Date().toISOString(), size: null});
	notes.push(theirs);
	n.name = title + EXT;
	n.savedTitle = title;
	n.raw = text;
	n.savedBody = typed.body;
	n.modified = new Date();
	afterSave(n, typed);
	return true;
}

// After a save: the title takes the name it was saved under, unless it was typed in meanwhile, and the draft is
// kept for whatever was typed while the save was under way.
function afterSave(n, typed) {
	if (n.title == typed.title) {
		n.title = n.savedTitle;
		if (current == n)
			$('title').value = n.title;
	}
	if (isDirty(n))
		scheduleDraft();
	else
		clearDraft();
}

async function askDelete(n) {
	if (readOnly())
		return;
	if (n.name == null && ! isDirty(n)) {
		discard(n);
		setView('list');
		render();
		return;
	}
	let unsaved = n.name == null;
	let title = unsaved ? n.title.trim() || UNTITLED : n.savedTitle;
	let choice = await ask({
		title: unsaved ? t('discardTitle', title) : t('deleteTitle', title),
		body: [p(unsaved ? t('discardText') : t('deleteText', n.name, grant.path))],
		actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'delete', label: unsaved ? t('discard') : t('delete'), cls: 'danger-outline'}],
		cancel: 'cancel'});
	if (choice != 'delete')
		return;
	if (! unsaved) {
		busy = true;
		render();
		try {
			await deleteFile(n.name);
		} catch (e) {
			notice(t('couldNotDelete', title, e.message));
			return;
		} finally {
			busy = false;
		}
	}
	if (n == current)
		clearDraft();
	notes = notes.filter(m => m != n);
	if (current == n) {
		current = null;
		setView('list');
	}
	render();
}

// ------------------------------------------------------------------ the folder

async function useGrant(g) {
	grant = g;
	store(KEYS.grant, g.grantId);
	notes = [];
	current = null;
	rich = null;
	setView('list');
	try {
		await loadList();
	} catch (e) {
		showUnreachable();
		return;
	}
	showApp();
	render();
	await offerDraft();
	loadForSearch();
}

async function chooseFolder() {
	let picked = [];
	// without a folder in use, Peergos' picker starts on a new one named for the notes, made only if it is chosen
	let suggest = $('setup').dataset.mode == 'change' ? '' : '&suggest=' + encodeURIComponent(t('notes'));
	try {
		let r = await fetch(API + '/folders/?write=true&persist=true&multiple=false' + suggest);
		if (r.ok)
			picked = await r.json();
	} catch (e) {}
	// closed without choosing
	if (picked.length == 0)
		return;
	// a Peergos from before folder grants answers with paths, and has no way to give the app a folder
	if (typeof picked[0] != 'object') {
		notice(t('tooOld'));
		return;
	}
	let chosen = picked[0];
	let old = grant;
	if (old == null || chosen.grantId == old.grantId) {
		await useGrant(chosen);
		return;
	}
	// what can't be reached can't be moved from, nor is it any use to the app
	if ($('setup').dataset.mode == 'unreachable') {
		await leave(old, chosen);
		return;
	}
	let saved = notes.filter(n => n.name != null);
	if (saved.length == 0 || ! chosen.write) {
		await leave(old, chosen);
		return;
	}
	let there = [];
	try {
		there = (await listFolder(chosen)).map(f => f.name.toLowerCase());
	} catch (e) {
		notice(t('couldNotReadFolder', chosen.path));
		return;
	}
	let plan = movePlan(saved, there);
	let renamed = saved.filter(n => plan.get(n) != n.name);
	let body = [p(t('moveCount', saved.length, old.path)), p(richText('moveExplain', old.path)),
		p(richText('leaveExplain', chosen.path, old.path))];
	if (renamed.length > 0) {
		let first = renamed[0];
		let as = titleOf(plan.get(first));
		body.push(p(renamed.length == 1 ? t('moveRenamedOne', first.savedTitle, chosen.path, as)
			: t('moveRenamedMany', renamed.length, chosen.path, as), 'note'));
	}
	let choice = await ask({
		title: t('moveTitle', chosen.path),
		body: body,
		actions: [{key: 'cancel', label: t('cancel'), cls: 'quiet'}, null, {key: 'leave', label: t('leaveThem')},
			{key: 'move', label: t('moveButton', saved.length), cls: 'primary'}],
		cancel: 'cancel'});
	if (choice == 'leave')
		await leave(old, chosen);
	else if (choice == 'move')
		await moveAll(old, chosen, saved, plan);
}

// The name each note goes under in the folder it moves to: its own, or the first "title (n)" free both there
// and among the notes it moves with - so no note is ever written over another.
function movePlan(saved, there) {
	let plan = new Map();
	let assigned = new Set();
	for (let n of saved) {
		let taken = new Set(there);
		for (let m of saved)
			if (m != n)
				taken.add(m.name.toLowerCase());
		assigned.forEach(a => taken.add(a));
		let name = freeTitle(n.savedTitle, taken) + EXT;
		assigned.add(name.toLowerCase());
		plan.set(n, name);
	}
	return plan;
}

// the app no longer needs the folder it leaves, so Peergos is told to forget that access
async function leave(old, chosen) {
	try {
		await fetch(API + '/grants/' + old.grantId, {method: 'DELETE'});
	} catch (e) {}
	await useGrant(chosen);
}

async function moveAll(from, to, saved, plan) {
	busy = true;
	showApp();
	render();
	let moved = 0;
	try {
		for (let n of saved) {
			let name = plan.get(n);
			if (rich) {
				// written to its new name in the folder it is in, then moved: the file itself goes, shares and all
				if (name != n.name)
					await renameFile(n.name, name, from);
				await moveFile(name, from, to);
			} else {
				// copied, then removed - only once the copy is there, so a failure leaves a duplicate, not a loss
				await writeFile(name, await readFile(n.name, from), to);
				await deleteFile(n.name, from);
			}
			moved++;
		}
	} catch (e) {
		busy = false;
		notice(t('movedSome', saved.length, moved, e.message, from.path));
		await useGrant(from);
		return;
	}
	busy = false;
	await leave(from, to);
}

// ------------------------------------------------------------------ rendering

function el(tag, attrs, children) {
	let e = document.createElement(tag);
	for (let [k, v] of Object.entries(attrs || {})) {
		if (k == 'text')
			e.textContent = v;
		else if (k == 'html')
			e.innerHTML = v;
		else if (k.startsWith('on'))
			e.addEventListener(k.substring(2), v);
		else if (v != null && v !== false)
			e.setAttribute(k, v === true ? '' : v);
	}
	for (let c of [].concat(children || []))
		if (c != null)
			e.append(c);
	return e;
}

function svg(path, cls) {
	return el('span', {class: 'svg-wrap', html: '<svg ' + (cls ? 'class="' + cls + '" ' : '') + 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>'}).firstChild;
}

function p(content, cls) {
	return el('p', {class: cls}, content);
}

function strong(text) {
	return el('strong', {text: text});
}

// a translated sentence with <b>…</b> in it, as text and bold parts: what fills it in only ever becomes text
function richText(key, ...args) {
	return template(key, args[0]).split(/<b>(.*?)<\/b>/).map((part, i) => i % 2 ? strong(fill(part, args)) : fill(part, args));
}

function formatDate(d) {
	if (d == null)
		return '';
	let now = new Date();
	let day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
	let days = Math.round((day(now) - day(d)) / 86400000);
	let time = d.toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'});
	if (days == 0)
		return t('today', time);
	if (days == 1)
		return t('yesterday', time);
	return d.toLocaleDateString(locale, d.getFullYear() == now.getFullYear()
		? {day: 'numeric', month: 'short'} : {day: 'numeric', month: 'short', year: 'numeric'});
}

function setView(view) {
	$('app').className = view == 'detail' ? 'show-detail' : 'show-list';
}

function showSetup(mode) {
	$('setup').dataset.mode = mode;
	let path = grant ? grant.path : '';
	$('setupTitle').textContent = {first: t('setupFirstTitle'), change: t('setupChangeTitle'),
		unreachable: t('setupUnreachableTitle')}[mode];
	$('setupText').textContent = {first: t('setupFirstText'), change: t('setupChangeText', path),
		unreachable: t('setupUnreachableText', path)}[mode];
	$('setupCancel').hidden = mode != 'change';
	$('setupRetry').hidden = mode != 'unreachable';
	$('setup').hidden = false;
	$('panes').hidden = true;
}

function showUnreachable() {
	showSetup('unreachable');
}

function showApp() {
	$('setup').hidden = true;
	$('panes').hidden = false;
}

function renderList() {
	let ul = $('notes');
	ul.textContent = '';
	let q = $('search').value.trim().toLowerCase();
	let shown = notes.filter(n => ! q || (n.title + '\n' + n.body).toLowerCase().includes(q));
	for (let n of shown) {
		let dirty = isDirty(n);
		let title = n.title.trim() || UNTITLED;
		let sub = n.name == null ? t('notSavedYet') : dirty ? t('editedNotSaved') : formatDate(n.modified);
		// a long title is cut to fit the row, so the whole of it is the tooltip
		let open = el('button', {type: 'button', class: 'open', title: title, 'aria-current': n == current ? 'true' : 'false', onclick: () => openNote(n)}, [
			el('span', {class: 'names'}, [el('span', {class: 'name', text: title}), el('span', {class: 'sub', text: sub})]),
			dirty ? el('span', {class: 'dot'}) : null,
			dirty ? el('span', {class: 'sr', text: t('unsavedChanges')}) : null]);
		let del = readOnly() ? null : el('button', {type: 'button', class: 'quiet icon delete', 'aria-label': t('deleteNamed', title),
			title: t('delete'), onclick: () => askDelete(n)}, [svg(ICONS.trash)]);
		ul.append(el('li', {class: 'entry' + (n == current ? ' current' : '')}, [open, del]));
	}
	if (shown.length == 0)
		ul.append(el('li', {class: 'empty', text: notes.length == 0 ? t('noNotesYet') : t('noMatch')}));
}

function renderEditor() {
	let n = current;
	$('editor').hidden = n == null;
	$('noNote').hidden = n != null;
	if (n == null) {
		$('noNoteText').textContent = notes.length == 0 ? t('folderEmpty') : t('pickNote');
		$('emptyNewButton').hidden = readOnly();
		shown = {note: null, loaded: false};
		return;
	}
	// the fields take a note's text when it is opened or has been read, never while it is typed in
	if (shown.note != n || shown.loaded != n.loaded) {
		$('title').value = n.title;
		$('body').value = n.loaded ? n.body : '';
		shown = {note: n, loaded: n.loaded};
	}
	renderState();
}

// what changes as the note is typed in: the status, the buttons and the title's hint
function renderState() {
	let n = current;
	if (n == null)
		return;
	let dirty = isDirty(n);
	let problem = titleProblem(n);
	let status = $('status');
	status.textContent = '';
	if (busy)
		status.append(t('saving'));
	else if (! n.loaded)
		status.append(t('loading'));
	else if (dirty)
		status.append(el('span', {class: 'dot'}), t('unsavedChanges'));
	else if (n.name == null)
		status.append(t('newNotSaved'));
	else
		status.append(svg(ICONS.tick, 'tick'), t('saved', formatDate(n.modified)));
	let ro = readOnly();
	$('saveButton').disabled = busy || ro || ! n.loaded || ! dirty || problem != null;
	$('deleteButton').disabled = busy || ro || ! n.loaded;
	$('title').readOnly = ro || ! n.loaded;
	$('body').readOnly = ro || ! n.loaded;
	let showProblem = problem != null && (dirty || n.name != null) && ! ro;
	$('title').classList.toggle('bad', showProblem);
	let hint = $('titleHint');
	hint.classList.toggle('bad', showProblem);
	hint.textContent = showProblem ? problem
		: dirty ? t('savesAs', titleToSave(n, n.title) + EXT, grant.path)
		: n.name != null ? t('savedAs', n.savedTitle + EXT, grant.path)
		: t('titleIsFileName');
}

function render() {
	if (grant == null)
		return;
	// as Peergos shows a path: what is above the folder gives way first, so its own name stays in view
	let path = $('folderPath'), cut = grant.path.lastIndexOf('/');
	path.textContent = '';
	path.append(el('span', {class: 'path-head', text: cut > 0 ? grant.path.substring(0, cut) : grant.path}),
		el('span', {class: 'path-tail', text: cut > 0 ? grant.path.substring(cut) : ''}));
	path.title = grant.path;
	$('readOnly').hidden = ! readOnly();
	$('newButton').disabled = readOnly();
	$('changeFolder').disabled = busy;
	renderList();
	renderEditor();
}

// ------------------------------------------------------------------ dialogs and notices

// Shows a question and resolves with the key of the button pressed; null in actions is the gap that pushes
// the rest to the right, and Escape answers with cancel
function ask({title, body, actions, cancel}) {
	return new Promise(resolve => {
		let scrim = $('dialog');
		$('dialogTitle').textContent = title;
		let bodyEl = $('dialogBody');
		bodyEl.textContent = '';
		bodyEl.append(...body);
		let row = $('dialogActions');
		row.textContent = '';
		let opener = document.activeElement;
		let done = key => {
			scrim.hidden = true;
			document.removeEventListener('keydown', onKey, true);
			if (opener && opener.focus)
				opener.focus();
			resolve(key);
		};
		let onKey = e => {
			if (e.key == 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				done(cancel);
			}
		};
		let last = null;
		for (let a of actions) {
			if (a == null) {
				row.append(el('span', {class: 'spacer'}));
				continue;
			}
			last = el('button', {type: 'button', class: a.cls, disabled: a.disabled, text: a.label, onclick: () => done(a.key)});
			row.append(last);
		}
		document.addEventListener('keydown', onKey, true);
		scrim.hidden = false;
		let primary = row.querySelector('button.primary:not(:disabled)') || last;
		if (primary)
			primary.focus();
	});
}

let noticeTimer = null;
function notice(text) {
	let toast = $('toast');
	toast.textContent = text;
	toast.hidden = false;
	clearTimeout(noticeTimer);
	noticeTimer = setTimeout(() => toast.hidden = true, 6000);
}

// ------------------------------------------------------------------ wiring

function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme == 'dark-mode' ? 'dark' : 'light');
}

// a view setting, so per device, as the Address Book remembers its open book: wrapping is on unless turned off
function applyWrap() {
	let wrap = stored(KEYS.wrap) !== 'false';
	$('body').classList.toggle('nowrap', ! wrap);
	$('body').setAttribute('wrap', wrap ? 'soft' : 'off');
	$('wrapButton').setAttribute('aria-pressed', String(wrap));
}

$('title').addEventListener('input', e => {
	if (current == null)
		return;
	current.title = e.target.value;
	scheduleDraft();
	renderList();
	renderState();
});
$('body').addEventListener('input', e => {
	if (current == null)
		return;
	current.body = e.target.value;
	scheduleDraft();
	renderList();
	renderState();
});
$('search').addEventListener('input', () => renderList());
// a tooltip is desktop only, so a tap or a key opens the whole path out, and another closes it
$('folderPath').addEventListener('click', () => $('folderPath').setAttribute('aria-expanded', $('folderPath').classList.toggle('open')));
$('newButton').addEventListener('click', () => startNewNote());
$('emptyNewButton').addEventListener('click', () => startNewNote());
$('saveButton').addEventListener('click', () => save());
$('deleteButton').addEventListener('click', () => { if (current) askDelete(current); });
$('backButton').addEventListener('click', () => goBack());
$('wrapButton').addEventListener('click', () => {
	store(KEYS.wrap, $('wrapButton').getAttribute('aria-pressed') == 'true' ? 'false' : 'true');
	applyWrap();
});
$('changeFolder').addEventListener('click', () => leaveCurrent(t('saveBeforeChange'), () => showSetup('change')));
$('setupChoose').addEventListener('click', () => chooseFolder());
$('setupCancel').addEventListener('click', () => showApp());
$('setupRetry').addEventListener('click', () => useGrant(grant));
document.addEventListener('keydown', e => {
	if ((e.ctrlKey || e.metaKey) && (e.key == 's' || e.key == 'S')) {
		e.preventDefault();
		save();
	}
});

async function start() {
	translatePage();
	applyTheme(params.get('theme'));
	applyWrap();
	let grants = [];
	try {
		let r = await fetch(API + '/grants/');
		if (r.ok)
			grants = await r.json();
	} catch (e) {}
	let remembered = stored(KEYS.grant);
	let writable = grants.filter(g => g.write);
	let g = grants.find(x => x.grantId == remembered) || (writable.length == 1 ? writable[0] : null);
	if (g == null) {
		showSetup('first');
		return;
	}
	await useGrant(g);
}

start();
