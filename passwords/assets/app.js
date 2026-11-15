// Passwords: logins, one-time codes, cards, identities, notes and keys, kept in the app's own folder of the
// user's Peergos storage, as Bitwarden's plain export keeps them.
'use strict';

const API = '/peergos-api/v0';

let vault = null;
let currentId = null;       // the item open in the right pane
let mode = 'view';          // or 'edit'
let draft = null;           // the copy being edited
let shownDraft = null;      // the draft the form was last drawn for
let revealed = new Set();   // the secrets of the open item that are showing
let filterType = 'all';
let filterFolder = 'all';
let query = '';
let saving = false;
let importing = false;
// the items whose star is being saved, whose Edit waits for a save, and the one being deleted: an item view drawn
// meanwhile shows them busy
let starsSaving = new Set();
let editsWaiting = new Map();
// an import still writing its files, which an edit waits for: it starts from the files listed
let importDone = Promise.resolve();
let deleting = null;
const collator = new Intl.Collator(locale, {sensitivity: 'base', numeric: true});

// ------------------------------------------------------------ what the list shows

function itemName(item) {
	return typeof item.name == 'string' && item.name.trim() ? item.name : t('noName');
}

function typeData(item) {
	let key = Types.of(item).key;
	return item[key] && typeof item[key] == 'object' ? item[key] : {};
}

function hasValue(v) {
	return v != null && v !== '';
}

// the line under a name: what tells two items apart, never a secret
function subtitle(item) {
	let ty = Types.of(item);
	let d = typeData(item);
	switch (ty.key) {
	case 'login':
		if (hasValue(d.username))
			return d.username;
		if (d.uris && d.uris.length && d.uris[0].uri)
			return d.uris[0].uri;
		return hasValue(d.password) ? '' : hasValue(d.totp) ? t('codeOnly') : '';
	case 'card': {
		let last = hasValue(d.number) ? String(d.number).replace(/\s/g, '').slice(-4) : '';
		return [d.brand, last ? t('endingIn', last) : ''].filter(Boolean).join(' · ') || t('type_card');
	}
	case 'identity':
		return [d.firstName, d.lastName].filter(hasValue).join(' ') || d.email || t('type_identity');
	case 'sshKey':
		return d.keyFingerprint || t('type_sshKey');
	case 'secureNote':
		return t('type_secureNote');
	default:
		return t('type_unknown');
	}
}

// what a search looks in: names, notes, usernames, websites and every field that isn't secret
function searchText(item) {
	let ty = Types.of(item);
	let d = typeData(item);
	let parts = [item.name, item.notes];
	for (let f of ty.fields)
		if (f.kind != 'secret' && f.kind != 'secretMultiline' && f.name != 'password' && hasValue(d[f.name]))
			parts.push(d[f.name]);
	if (ty.key == 'login')
		for (let u of d.uris || [])
			parts.push(u.uri);
	for (let f of item.fields || []) {
		parts.push(f.name);
		if (f.type == 0)
			parts.push(f.value);
	}
	return parts.filter(hasValue).join('\n').toLocaleLowerCase(locale);
}

function folderName(id) {
	let f = vault.folders.find(x => x.id == id);
	return f ? f.name : null;
}

function shownItems() {
	let q = query.trim().toLocaleLowerCase(locale);
	return vault.items.filter(item => {
		if (filterType == 'favourites' ? ! item.favorite
			: filterType == 'other' ? Types.of(item).key != 'unknown'
			: filterType != 'all' && String(item.type) != filterType)
			return false;
		if (filterFolder == 'none' ? item.folderId != null && folderName(item.folderId) != null
			: filterFolder.startsWith('c:') ? ! (item.collectionIds || []).includes(filterFolder.substring(2))
			: filterFolder != 'all' && item.folderId != filterFolder)
			return false;
		return ! q || searchText(item).includes(q);
	}).sort((a, b) => collator.compare(itemName(a), itemName(b)));
}

// the row's Copy: a login's password, the one thing reached for most, or for a login that holds only a one-time
// code, the code as it is now
function quickCopy(item) {
	let d = typeData(item);
	if (Types.of(item).key != 'login')
		return null;
	if (hasValue(d.password))
		return {label: t('copyPasswordOf', itemName(item)), run: () => copyText(d.password, t('f_login_password'))};
	let code = hasValue(d.totp) ? Totp.parse(d.totp) : null;
	if (code != null)
		return {label: t('copyCodeOf', itemName(item)), run: async () => copyText((await Totp.code(code, Date.now())).code, t('oneTimeCode'))};
	return null;
}

// ------------------------------------------------------------ rendering

function setView(view) {
	$('app').className = view == 'detail' ? 'show-detail' : 'show-list';
}

// On a phone the list and the item are two screens. The Peergos Android app, like a phone's browser, takes its back
// button to the web view's history, and closes the app when there is none: so an item opened on a phone is a step in
// that history, and Back returns to the list, asking first in an editor with changes.
const phone = window.matchMedia('(max-width: 760px)');

function openStep() {
	if (phone.matches && ! (history.state && history.state.passwordsItem))
		history.pushState({passwordsItem: true}, '');
}

// an item opened on a wide screen gets its step when the screen narrows, as a phone turned upright does
phone.addEventListener('change', () => {
	if ($('app').className == 'show-detail')
		openStep();
});

// back to the list from the app's own back button, Escape, a delete or a new item left: the step goes with it. The
// caller draws what has changed, so a long list is drawn once. A dialog up when the step goes, such as an import's
// after a delete, or Import's own once a new item is left for it, came after: with keep, it isn't answered as Back
let keepDialog = false;
function toList(keep) {
	setView('list');
	if (history.state && history.state.passwordsItem) {
		keepDialog = !! keep;
		history.back();
	}
}

// when the button the keyboard was on has gone, hidden behind a phone's item or drawn again, the keyboard goes to the
// item's back arrow, or back to the row of the item left; unless it has gone to the page around the app
function focusInSight() {
	let at = document.activeElement;
	if (! document.hasFocus() || at != null && at != document.body && at.getClientRects().length > 0)
		return;
	// the open item's back arrow is a phone's; on a wide screen the list beside the item has the open row
	let back = $('app').className == 'show-detail' ? $('detail').querySelector('.head button.back') : null;
	if (back && back.getClientRects().length == 0)
		back = null;
	let current = $('items').querySelector('.row.current .open');
	let top = $('items').getBoundingClientRect().top, bottom = $('items').getBoundingClientRect().bottom;
	// on a phone's list no item is open beside it: the row of the one left is gone to only where the list is
	if (current && phone.matches && (current.getBoundingClientRect().bottom <= top || current.getBoundingClientRect().top >= bottom))
		current = null;
	// with no open row, the first row in sight: the list stays where it was left
	let rows = [...$('items').querySelectorAll('.row .open')];
	let first = rows.find(r => r.getBoundingClientRect().top >= top) || rows[0];
	let to = ! $('firstRun').hidden ? $('firstNew') : back || current || first || (phone.matches ? $('fabNew') : $('search'));
	if (to)
		to.focus({preventScroll: to === first});
}

function renderFilters() {
	let types = $('typeFilter');
	let counts = new Map();
	for (let item of vault.items)
		counts.set(item.type, (counts.get(item.type) || 0) + 1);
	types.textContent = '';
	types.append(el('option', {value: 'all', text: t('allTypes')}));
	if (vault.items.some(i => i.favorite))
		types.append(el('option', {value: 'favourites', text: t('favourites')}));
	for (let ty of Types.LIST)
		if (counts.has(ty.type))
			types.append(el('option', {value: String(ty.type), text: t('typeCount', t('type_' + ty.key), counts.get(ty.type))}));
	let others = vault.items.filter(i => Types.of(i).key == 'unknown').length;
	if (others > 0)
		types.append(el('option', {value: 'other', text: t('typeCount', t('type_unknown'), others)}));
	if (! [...types.options].some(o => o.value == filterType))
		filterType = 'all';
	types.value = filterType;

	let folders = $('folderFilter');
	folders.textContent = '';
	folders.append(el('option', {value: 'all', text: t('allFolders')}));
	for (let f of vault.folders.slice().sort((a, b) => collator.compare(a.name, b.name)))
		folders.append(el('option', {value: f.id, text: f.name}));
	folders.append(el('option', {value: 'none', text: t('noFolder')}));
	// an organisation's export groups items in collections rather than folders
	let collections = vault.collections || [];
	if (collections.length > 0) {
		let group = el('optgroup', {label: t('collections')});
		for (let c of collections.slice().sort((a, b) => collator.compare(a.name || '', b.name || '')))
			group.append(el('option', {value: 'c:' + c.id, text: c.name || ''}));
		folders.append(group);
	}
	if (! [...folders.options].some(o => o.value == filterFolder))
		filterFolder = 'all';
	folders.value = filterFolder;
}

function renderList() {
	let ul = $('items');
	// the keyboard on a row's button stays on it, the row drawn again (a refresh, an import)
	let at = ul.contains(document.activeElement) ? document.activeElement : null;
	let atRow = at && at.closest('.row') ? at.closest('.row').dataset.id : null;
	let atOpen = at != null && at.classList.contains('open');
	ul.textContent = '';
	let items = shownItems();
	for (let item of items)
		ul.append(row(item));
	if (items.length == 0)
		ul.append(el('li', {class: 'none', text: t(vault.items.length == 0 ? 'firstTitle' : 'noMatch')}));
	let again = atRow == null ? null : [...ul.children].find(r => r.dataset.id === atRow);
	let to = again && (atOpen ? again.querySelector('.open') : again.querySelector('button.small') || again.querySelector('.open'));
	if (to && document.hasFocus())
		to.focus({preventScroll: true});
}

function row(item) {
	let ty = Types.of(item);
	let current = item.id == currentId;
	let copy = quickCopy(item);
	return el('li', {class: 'row' + (current ? ' current' : ''), 'data-id': item.id}, [
		el('button', {type: 'button', class: 'open', 'aria-current': current ? 'true' : 'false', onclick: () => openItem(item.id)}, [
			el('span', {class: 'type'}, [svg(ty.icon)]),
			el('span', {class: 'names'}, [el('span', {class: 'name', text: itemName(item)}), el('span', {class: 'sub', text: subtitle(item)})]),
			item.favorite ? svg('star', 'fav') : null,
			item.favorite ? el('span', {class: 'sr', text: t('favourite')}) : null,
		]),
		copy ? el('button', {type: 'button', class: 'small', 'aria-label': copy.label, onclick: copy.run}, [svg('copy'), el('span', {text: t('copy')})]) : null,
	]);
}

// which row is open, without drawing the list again: a long list takes a while to draw on a phone
function markCurrent() {
	for (let r of $('items').children) {
		let current = r.dataset.id === currentId;
		r.classList.toggle('current', current);
		let open = r.querySelector('.open');
		if (open)
			open.setAttribute('aria-current', current ? 'true' : 'false');
	}
}

function renderDetail() {
	let host = $('detail');
	if (mode == 'edit' && draft != null) {
		if (shownDraft != draft) {
			shownDraft = draft;
			Editor.render(host, draft, vault.folders, {save: () => saveDraft(false), cancel: () => leaveEdit(() => {}), remove: () => askDelete(draft.item)});
		}
		return;
	}
	let leaving = shownDraft != null;
	shownDraft = null;
	// the editor reads a pasted picture for a QR code; once it has gone, a paste is just a paste
	host.onpaste = null;
	let item = vault.items.find(i => i.id == currentId);
	// a button that redraws the view, such as Show or the star, keeps the keyboard where it was; the editor, left by
	// Save, Cancel or Escape, gives it to the item's Edit. Not when the keyboard has gone to the page around the app,
	// in sight without it; the redraw that hides what was shown once the app is out of sight keeps it
	let away = ! document.hasFocus() && document.visibilityState == 'visible';
	let focused = away ? null
		: host.contains(document.activeElement) ? (leaving ? 'edit' : document.activeElement.dataset.focus)
		: leaving && document.activeElement == document.body ? 'edit' : null;
	let named = () => focused ? [...host.querySelectorAll('[data-focus="' + CSS.escape(focused) + '"]')] : [];
	let nth = Math.max(0, named().indexOf(document.activeElement));
	host.textContent = '';
	if (item == null) {
		host.append(el('div', {class: 'empty-box'}, [
			el('span', {class: 'empty-mark'}, [svg('key')]),
			el('p', {text: t('pickItem')}),
		]));
		return;
	}
	host.append(viewItem(item));
	host.style.scrollPaddingBottom = '';
	if (leaving)
		host.scrollTop = 0;
	startTicker();
	let again = named()[nth] || named()[0];
	// where it was: the view is the same height, so it stays scrolled where the user left it
	if (again)
		again.focus({preventScroll: true});
}

function render() {
	if (vault == null)
		return;
	// a vault read after a failed first one, coming back into sight or by an import, takes the error's place
	$('loadError').hidden = true;
	// an open item deleted on another device closes: on a phone the list comes back, not an empty pane with no way out
	if (mode == 'view' && currentId != null && ! vault.items.some(i => i.id === currentId)) {
		currentId = null;
		// unless the back arrow or Escape has already left it: a second history.back() before the first lands closes the app
		if ($('app').className == 'show-detail')
			toList();
	}
	// folders left with no items in them are still shown, as Bitwarden shows them, so they can be managed
	let empty = vault.items.length == 0 && vault.folders.length == 0 && mode != 'edit';
	$('panes').hidden = empty;
	$('firstRun').hidden = ! empty;
	if (empty)
		return;
	renderFilters();
	renderList();
	renderDetail();
}

// ------------------------------------------------------------ the open item

const DOTS = '••••••••••';

function secretValue(key, value, label, mono, multiline, primary) {
	let showing = revealed.has(key);
	let text = el('span', {class: 'text' + (showing ? '' : ' dots') + (mono && showing ? ' mono' : '') + (multiline && showing ? ' keybox' : ''),
		text: showing ? value : DOTS});
	let toggle = button(showing ? t('hide') : t('show'), {icon: showing ? 'eyeOff' : 'eye', cls: 'small', focus: 'show:' + key, onclick: () => {
		if (revealed.has(key))
			revealed.delete(key);
		else
			revealed.add(key);
		renderDetail();
	}});
	let copy = button(t('copy'), {icon: 'copy', cls: 'small' + (primary ? ' primary' : ''), focus: 'copy:' + key, onclick: () => copyText(value, label)});
	copy.setAttribute('aria-label', t('copyNamed', label));
	return el('div', {class: 'val' + (multiline && showing ? ' block' : '')}, [text, toggle, copy]);
}

function plainValue(value, label, mono, multiline) {
	let copy = button(t('copy'), {icon: 'copy', cls: 'small', focus: 'copy:' + label, onclick: () => copyText(value, label)});
	copy.setAttribute('aria-label', t('copyNamed', label));
	if (multiline)
		return el('div', {class: 'val block'}, [el('span', {class: 'text notebox' + (mono ? ' keybox' : ''), text: value}), copy]);
	return el('div', {class: 'val'}, [el('span', {class: 'text' + (mono ? ' mono' : ''), text: value}), copy]);
}

// a one-time code as it is now, with the seconds it has left; tick() keeps it current
const RING = 2 * Math.PI * 9;

function codeValue(code) {
	let node = el('div', {class: 'val', 'data-totp': ''}, [
		el('span', {class: 'code', text: '–––'}),
		(() => {
			let wrap = document.createElement('span');
			wrap.innerHTML = '<svg class="ring" viewBox="0 0 22 22" aria-hidden="true"><circle class="track" cx="11" cy="11" r="9"/><circle class="left" cx="11" cy="11" r="9" stroke-dasharray="' + RING.toFixed(2) + '"/></svg>';
			return wrap.firstChild;
		})(),
		el('span', {class: 'secs'}),
		button(t('copy'), {icon: 'copy', cls: 'small', focus: 'copy:totp', onclick: async () => copyText((await Totp.code(code, Date.now())).code, t('oneTimeCode'))}),
	]);
	node.lastChild.setAttribute('aria-label', t('copyNamed', t('oneTimeCode')));
	node.totp = code;
	return node;
}

// a code in two halves, as authenticator apps show it: 482 913
function grouped(code) {
	if (code.length < 6)
		return code;
	let half = Math.floor(code.length / 2);
	return code.substring(0, half) + ' ' + code.substring(half);
}

let ticker = null;
async function tick() {
	let nodes = [...document.querySelectorAll('[data-totp]')];
	if (nodes.length == 0) {
		clearTimeout(ticker);
		ticker = null;
		return;
	}
	let now = Date.now();
	for (let node of nodes) {
		let r = await Totp.code(node.totp, now);
		node.querySelector('.code').textContent = grouped(r.code);
		node.querySelector('.left').setAttribute('stroke-dashoffset', (RING * (1 - r.left / r.period)).toFixed(2));
		node.querySelector('.secs').textContent = t('secondsLeft', r.left);
	}
}

function startTicker() {
	if (! document.querySelector('[data-totp]'))
		return;
	tick();
	// just after each turn of the clock's second, so the countdown and the code change when the second does
	let wait = () => 1005 - Date.now() % 1000;
	if (ticker == null)
		ticker = setTimeout(function next() {
			tick();
			if (ticker != null)
				ticker = setTimeout(next, wait());
		}, wait());
}

function viewField(label, children, wide) {
	return el('div', {class: 'field' + (wide ? ' wide' : '')}, [el('span', {class: 'label', text: label})].concat(children));
}

function shownTypeValue(f, value) {
	if (f.kind == 'month' && /^\d+$/.test(String(value)))
		return String(value).padStart(2, '0');
	return String(value);
}

function linkedLabel(item, linkedId) {
	let link = Types.linkable(item).find(l => l.id == linkedId);
	return link ? t('f_' + Types.of(item).key + '_' + link.field) : String(linkedId);
}

function viewItem(item) {
	let ty = Types.of(item);
	let d = typeData(item);
	let inner = el('div', {class: 'detail-inner'});
	let chips = [el('span', {class: 'chip', text: t('type_' + ty.key)})];
	let folder = folderName(item.folderId);
	if (folder)
		chips.push(el('span', {class: 'chip', text: folder}));
	for (let id of item.collectionIds || []) {
		let c = (vault.collections || []).find(x => x.id == id);
		if (c)
			chips.push(el('span', {class: 'chip', text: c.name}));
	}
	if (item.archivedDate)
		chips.push(el('span', {class: 'chip warn', text: t('archived')}));
	let star = button(t('favourite'), {icon: 'star', iconOnly: true, cls: 'quiet star', pressed: !! item.favorite,
		focus: 'star', onclick: () => toggleFavourite(item.id)});
	if (starsSaving.has(item.id))
		busy(star, t('saving'), true);
	let edit = button(t('edit'), {icon: 'pencil', cls: 'edit', focus: 'edit', onclick: () => startEdit(item)});
	if (editsWaiting.has(item.id))
		busy(edit, t('saving'), true);
	// as Bitwarden's item view has it, beside Edit: not only inside the editor
	let remove = button(t('delete'), {icon: 'trash', iconOnly: true, cls: 'quiet danger', focus: 'delete', onclick: () => askDelete(item)});
	if (deleting === item.id)
		busy(remove, t('saving'), true);
	inner.append(el('div', {class: 'head'}, [
		button(t('backToList'), {icon: 'back', iconOnly: true, cls: 'quiet back', focus: 'back', onclick: () => {
			toList();
			renderList();
			focusInSight();
		}}),
		el('span', {class: 'type big'}, [svg(ty.icon)]),
		el('div', {class: 'titles'}, [el('h2', {text: itemName(item)}), el('div', {class: 'chips'}, chips)]),
		star,
		remove,
		edit,
	]));

	let fields = el('div', {class: 'fields'});
	let label = name => t('f_' + ty.key + '_' + name);
	if (ty.key == 'unknown')
		fields.append(el('div', {class: 'field wide'}, [el('div', {class: 'notice'}, [svg('note'), el('span', {text: t('unknownKept')})])]));
	for (let f of ty.fields) {
		let value = d[f.name];
		if (! hasValue(value))
			continue;
		let multiline = f.kind == 'multiline' || f.kind == 'secretMultiline';
		let node = f.kind == 'secret' || f.kind == 'secretMultiline'
			? secretValue('t:' + f.name, String(value), label(f.name), f.mono, multiline, ty.key == 'login' && f.name == 'password')
			: plainValue(shownTypeValue(f, value), label(f.name), f.mono, multiline);
		fields.append(viewField(label(f.name), [node], f.wide || multiline));
	}
	if (ty.key == 'login') {
		let code = hasValue(d.totp) ? Totp.parse(d.totp) : null;
		if (code != null)
			fields.append(viewField(t('oneTimeCode'), [codeValue(code)]));
		else if (hasValue(d.totp))
			// a key this app can't read is still the item's: kept, and shown as it is
			fields.append(viewField(t('totpKey'), [secretValue('totp', String(d.totp), t('totpKey'), true),
				el('span', {class: 'chip warn', text: t('totpUnreadable')})], true));
		let uris = (d.uris || []).filter(u => hasValue(u.uri));
		if (uris.length > 0) {
			// websites are shown as text to copy: an app can't open a link in a new tab
			fields.append(viewField(uris.length == 1 ? t('website') : t('websites'), uris.map(u => plainValue(u.uri, t('website'))), true));
		}
	}
	(item.fields || []).forEach((f, i) => {
		let name = hasValue(f.name) ? f.name : t('unnamedField');
		let node;
		if (f.type == 1)
			node = secretValue('f:' + i, f.value || '', name);
		else if (f.type == 2)
			node = el('div', {class: 'val'}, [el('span', {class: 'text', text: f.value == 'true' ? t('yes') : t('no')})]);
		else if (f.type == 3)
			node = el('div', {class: 'val'}, [el('span', {class: 'text', text: t('linkedToField', linkedLabel(item, f.linkedId))})]);
		else if (hasValue(f.value))
			node = plainValue(f.value, name);
		else
			node = el('div', {class: 'val'}, [el('span', {class: 'text muted', text: '—'})]);
		fields.append(viewField(name, [node]));
	});
	if (ty.key == 'login')
		for (let pk of d.fido2Credentials || [])
			fields.append(el('div', {class: 'field wide'}, [el('div', {class: 'notice'}, [svg('fingerprint'), el('span', {text: t('passkeyKept', pk.rpId || '')})])]));
	let attachments = item.attachments || [];
	if (attachments.length > 0) {
		let list = el('div', {class: 'attachments'});
		for (let a of attachments)
			list.append(el('div', {class: 'attachment'}, [svg('paperclip'), el('span', {class: 'text', text: a.fileName}),
				el('span', {class: 'size', text: formatSize(a.size)}),
				button(t('saveToPeergos'), {icon: 'save', cls: 'small', focus: 'save:' + a.id, onclick: () => saveAttachment(item, a)})]));
		fields.append(viewField(t('attachments'), [list], true));
	}
	if (hasValue(item.notes))
		fields.append(viewField(t('notes'), [el('div', {class: 'notebox', text: item.notes})], true));
	inner.append(fields);

	let foot = el('div', {class: 'foot'});
	let history = item.passwordHistory || [];
	if (history.length > 0)
		foot.append(button(t('earlierPasswords', history.length), {icon: 'history', focus: 'history', onclick: () => showHistory(item)}));
	if (item.creationDate)
		foot.append(el('span', {text: t('created', formatDate(item.creationDate))}));
	if (item.revisionDate)
		foot.append(el('span', {text: t('changed', formatDate(item.revisionDate))}));
	if (item.archivedDate)
		foot.append(el('span', {text: t('archivedOn', formatDate(item.archivedDate))}));
	inner.append(foot);
	return inner;
}

async function showHistory(item) {
	let shown = new Set();
	let list = el('ul', {class: 'history'});
	let draw = () => {
		let focused = list.contains(document.activeElement) ? document.activeElement.dataset.focus : null;
		list.textContent = '';
		(item.passwordHistory || []).forEach((h, i) => {
			let showing = shown.has(i);
			list.append(el('li', {}, [
				el('span', {class: 'when', text: formatDate(h.lastUsedDate)}),
				el('span', {class: 'text' + (showing ? ' mono' : ' dots'), text: showing ? h.password : DOTS}),
				button(showing ? t('hide') : t('show'), {icon: showing ? 'eyeOff' : 'eye', iconOnly: true, cls: 'quiet small', focus: 'h' + i, onclick: () => {
					showing ? shown.delete(i) : shown.add(i);
					draw();
				}}),
				button(t('copy'), {icon: 'copy', iconOnly: true, cls: 'quiet small', focus: 'hc' + i, onclick: () => copyText(h.password, t('earlierPassword'))}),
			]));
		});
		let again = focused ? list.querySelector('[data-focus="' + focused + '"]') : null;
		if (again)
			again.focus();
	};
	let hide = () => {
		shown.clear();
		draw();
	};
	draw();
	whenHidden.add(hide);
	await ask({title: t('earlierPasswordsTitle', itemName(item)), body: [list], actions: [null, {key: 'close', label: t('close'), cls: 'primary'}], cancel: 'close'});
	whenHidden.delete(hide);
}

// ------------------------------------------------------------ actions

function openItem(id) {
	let same = mode == 'view' && id === currentId;
	leaveEdit(() => {
		let other = currentId != id;
		if (other)
			revealed.clear();
		currentId = id;
		setView('detail');
		// another item is shown from its top, not where the last one was left scrolled; on a phone, where the item is
		// a screen of its own, the same one opened again from the list too
		if (other || phone.matches)
			$('detail').scrollTop = 0;
		openStep();
		markCurrent();
		renderDetail();
		focusInSight();
	}, same);
}

async function startEdit(item) {
	// pressed again while it waits: it opens for this press, as if the user had not turned away meanwhile
	if (editsWaiting.has(item.id)) {
		editsWaiting.set(item.id, turns);
		return;
	}
	// A change of this device's still being saved, such as a star, is waited for, and so is one started meanwhile (the
	// star pressed while Edit waits): the edit starts from it, and isn't taken for one made on another device when it
	// is saved. Edit turns meanwhile, and keeps the keyboard.
	let edit = $('detail').querySelector('.head button.edit');
	editsWaiting.set(item.id, turns);
	if (edit)
		busy(edit, t('saving'), true);
	for (let q = null; q !== Vault.idle(); ) {
		q = Vault.idle();
		await q;
		await importDone;
	}
	let turn = editsWaiting.get(item.id);
	editsWaiting.delete(item.id);
	// the open item's Edit, if it is this item's: another's may be waiting too
	edit = $('detail').querySelector('.head button.edit.busy');
	if (edit && currentId === item.id)
		busy(edit, null, true);
	// unless the user has moved on meanwhile: to another item, a new one, Folders or Import (even if back on this item
	// since, or in a file chooser, which is no dialog), this edit already open, a dialog (the editor would open behind
	// it and take its keyboard), on a phone back to the list, where the editor would open out of sight, or this item's
	// Delete, still being written
	if (turns != turn || mode != 'view' || currentId !== item.id || dialogOpen || phone.matches && $('app').className != 'show-detail'
		|| deleting === item.id)
		return;
	item = Vault.get().items.find(i => i.id === item.id) || item;
	revealed.clear();
	draft = Editor.start(item, false);
	mode = 'edit';
	setView('detail');
	render();
	// an Edit that waited takes the keyboard only where Edit left it: not from the search or the page around the app,
	// gone to meanwhile
	let name = $('e-name');
	let at = document.activeElement;
	if (name && document.hasFocus() && (at == null || at == document.body || $('detail').contains(at)))
		name.focus();
}

async function startNew() {
	// with no vault read yet there is nothing to draw the editor into (a save under way is told by leaveEdit)
	if (vault == null)
		return;
	// nor during an import, whose tally would open over the new item and take the keys typed into it
	if (importing) {
		notice(t('importing'), true);
		return;
	}
	// an editor with changes is asked about first, then the new item's type
	leaveEdit(async () => {
		let type = await askType();
		if (type == null)
			return;
		// the folder's own id, which an import may have kept as a number
		let folder = filterFolder != 'all' && filterFolder != 'none' && ! filterFolder.startsWith('c:') ? vault.folders.find(f => String(f.id) === filterFolder) : null;
		revealed.clear();
		draft = Editor.start(Types.blank(type, folder ? folder.id : null), true);
		mode = 'edit';
		currentId = draft.item.id;
		setView('detail');
		openStep();
		render();
		$('e-name').focus();
	});
}

// Leaves the editor, asking first when it holds changes, then does next
// how often the user has turned to something else (another item, New, Folders, Import): an Edit still waiting then
// doesn't open. One that stays on the item shown (its own row) isn't counted.
let turns = 0;
async function leaveEdit(next, stays) {
	// a save under way ends the edit itself: until it has, the editor stays, and what waits for it says why
	if (saving) {
		notice(t('saving'));
		return;
	}
	if (! stays)
		turns++;
	if (mode == 'edit' && draft != null && Editor.isDirty(draft)) {
		let choice = await ask({title: t('discardTitle'), body: [p(t('discardText'))],
			actions: [null, {key: 'keep', label: t('keepEditing')}, {key: 'discard', label: t('discard'), cls: 'danger-outline'}], cancel: 'keep'});
		if (choice != 'discard')
			return;
	}
	let leftNew = false;
	if (mode == 'edit') {
		let left = draft;
		let wasNew = leftNew = !! (draft && draft.isNew);
		mode = 'view';
		draft = null;
		if (wasNew) {
			currentId = null;
			// what the editor is left for, such as Import, may open a dialog before the step has gone
			toList(true);
		}
		render();
		if (left && left.tried) {
			unsure.push({id: left.item.id, tried: left.tried, removedAttachments: left.removedAttachments});
			readLanded();
		}
	}
	next();
	// a new item left, and what came next (another item, say) not placing the keyboard: back on the New item that
	// started it. A dialog what came next opens takes it from there.
	let at = document.activeElement;
	if (leftNew && document.hasFocus() && (at == null || at == document.body || at.getClientRects().length == 0))
		(! $('firstRun').hidden ? $('firstNew') : phone.matches ? $('fabNew') : $('newButton')).focus();
}

// The edits left after a save reported as failed. One may have landed after all, when Peergos finished a write it had
// stopped answering for, perhaps once the network was back: the vault is read again when the edit is left, and when
// the app comes back into sight or online, so what landed is shown (the item isn't shown as it was, nor its next edit
// taken for one made on another device), and said.
let unsure = [];

async function readLanded() {
	// offline, the read once the network is back looks
	if (Vault.offline())
		return;
	try {
		let now = await Vault.load(true);
		// the latest, whether or not a save of this device's landed: drawn at once, under a dialog too; an editor opened
		// meanwhile is left as it is, the rest drawn
		vault = now;
		let had = document.activeElement;
		if (saving)
			renderList();
		else
			render();
		if (had && had !== document.body && (! document.contains(had) || had.getClientRects().length == 0))
			focusInSight();
		tellLanded(now);
	} catch (e) {}
}

function tellLanded(now) {
	for (let left of unsure.slice()) {
		let landed = now.items.find(i => left.tried.includes(JSON.stringify(i)));
		if (landed == null)
			continue;
		unsure.splice(unsure.indexOf(left), 1);
		// the files the edit removed go, as a save's do
		if (landed.id === left.id)
			for (let a of left.removedAttachments)
				if (! (landed.attachments || []).some(x => x.id === a.id))
					Vault.deleteAttachment(landed.id, a.id).catch(() => {});
		notice(t('savedAfterAll', itemName(landed)));
	}
}

// Bitwarden keeps a password's earlier values, newest first, and the earlier values of hidden fields as
// "name: value"; its import takes the first five
function recordHistory(before, after, now) {
	let history = [];
	if (Types.of(after).key == 'login') {
		let old = (before.login || {}).password;
		if (hasValue(old) && old != (after.login || {}).password)
			history.push({lastUsedDate: now, password: old});
	}
	// as Bitwarden does, a hidden field without a name has no history
	for (let f of before.fields || []) {
		if (f.type != 1 || ! hasValue(f.name) || ! hasValue(f.value))
			continue;
		let still = (after.fields || []).find(g => g.type == 1 && g.name == f.name);
		if (still == null || still.value != f.value)
			history.push({lastUsedDate: now, password: f.name + ': ' + f.value});
	}
	if (history.length > 0)
		after.passwordHistory = history.concat(after.passwordHistory || []);
}

// listed: the ids of the files the item as stored lists
class ChangedElsewhere extends Error {
	constructor(listed) {
		super();
		this.listed = listed;
	}
}

// Saves the draft. asCopy saves it as a new item beside the one it was opened from.
async function saveDraft(asCopy) {
	// not while a dialog is open over the editor (Ctrl+S reaches here under one), nor without the editor's form
	if (saving || draft == null || dialogOpen || ! $('e-save'))
		return;
	// nor while a file picked a moment ago is still being read: Save turns until it is, so none is left out, and a
	// press meanwhile is told why nothing happens
	if (Editor.reading(draft)) {
		notice(t(Editor.readingWhat(draft) == 'files' ? 'stillReading' : 'pictureStillReading'));
		return;
	}
	if (! Editor.validate(draft, $('detail')))
		return;
	let d = draft;
	saving = true;
	busy($('e-save'), t('saving'));
	// the form holds still while it is saved: what is typed meanwhile would not be in the save. That takes the keyboard,
	// which a save that fails gives back.
	let typedIn = document.activeElement;
	$('detail').inert = true;
	// the save works on a copy, so one that fails leaves the draft as it was, to be saved again
	let item = JSON.parse(JSON.stringify(d.item));
	let now = new Date().toISOString();
	if (Types.of(item).key == 'login' && item.login.uris)
		item.login.uris = item.login.uris.filter(u => hasValue(u.uri));
	if (! d.isNew)
		recordHistory(d.before, item, now);
	item.revisionDate = now;
	if (asCopy) {
		// a copy reported as failed may have landed: trying again writes that copy again, not a second one
		item.id = d.copyId = d.copyId || crypto.randomUUID();
		item.creationDate = now;
		// the files are kept under the original's id, so they stay the original's
		delete item.attachments;
	}
	// the files added in the editor are the item's (the copy's, when both are kept), listed once they are written; one
	// that couldn't be read has left the list
	let added = d.addedAttachments.slice();
	if (added.length > 0)
		item.attachments = (item.attachments || []).concat(added.map(a => ({id: a.id, fileName: a.fileName, size: a.bytes.length})));
	// what this edit has tried to write: one reported as failed may have landed, and is this device's own
	let tried = d.tried = (d.tried || []).concat([JSON.stringify(item)]);
	// as Bitwarden's server refuses an edit whose last known revision is out of date: what another device did to this
	// item since the edit began, a star or a delete included, isn't written over. The conflict, or null.
	let conflict = doc => {
		let at = doc.items.findIndex(x => x.id === item.id);
		let stored = at >= 0 ? JSON.stringify(doc.items[at]) : null;
		if (d.isNew || asCopy || at >= 0 && (stored == JSON.stringify(d.before) || tried.includes(stored)))
			return null;
		return new ChangedElsewhere(new Set((at >= 0 && doc.items[at].attachments || []).map(x => x.id)));
	};
	let uploaded = [];
	try {
		// the files go up first, so the item never lists one that isn't there; asked about a conflict before they go,
		// so "Keep editing" doesn't send them again each time. One written by a save that then failed is written
		// again, under the same name, by the next; if the edit is given up it stays unlisted.
		if (added.length > 0) {
			if (Vault.offline())
				throw new Error(t('offline'));
			let early = conflict(await Vault.load(true));
			if (early)
				throw early;
		}
		for (let a of added) {
			await Vault.writeAttachment(item.id, a.id, a.bytes);
			uploaded.push(a);
		}
		await Vault.change(doc => {
			let at = doc.items.findIndex(x => x.id === item.id);
			// a write reported as failed may have landed: on the retry this very save is what is stored
			if (at >= 0 && JSON.stringify(doc.items[at]) == tried[tried.length - 1])
				return;
			let late = conflict(doc);
			if (late)
				throw late;
			for (let f of d.newFolders)
				if (item.folderId == f.id && ! doc.folders.some(x => x.id == f.id))
					doc.folders.push(f);
			if (at >= 0)
				doc.items[at] = item;
			else
				doc.items.push(item);
		});
	} catch (e) {
		saving = false;
		$('detail').inert = false;
		if ($('e-save'))
			busy($('e-save'), null);
		if (! (e instanceof ChangedElsewhere)) {
			notice(t('couldNotSave', e.message));
			if (document.hasFocus() && document.activeElement == document.body) {
				if (typedIn && typedIn !== document.body && document.contains(typedIn) && typedIn.getClientRects().length > 0)
					typedIn.focus();
				if (document.activeElement == document.body && $('e-save'))
					$('e-save').focus();
			}
			return;
		}
		// the files this try put up that nothing lists are let go, and get new names for the save the user chooses
		// next to write them under (the copy's id, for both kept): a delete that lands late can't take what that writes
		for (let a of uploaded)
			if (! e.listed.has(a.id)) {
				Vault.deleteAttachment(item.id, a.id).catch(() => {});
				a.id = crypto.randomUUID();
			}
		let choice = await ask({title: t('conflictTitle', itemName(d.before)), body: [p(t('conflictText'))], own: true,
			actions: [null, {key: 'edit', label: t('keepEditing')}, {key: 'both', label: t('keepBoth'), cls: 'primary'}], cancel: 'edit'});
		if (choice == 'both')
			await saveDraft(true);
		// Save lost the keyboard while it was busy: it gets it back, to be pressed again once the edit is looked over
		else if ($('e-save') && document.hasFocus())
			$('e-save').focus();
		return;
	}
	saving = false;
	$('detail').inert = false;
	for (let a of d.removedAttachments)
		Vault.deleteAttachment(item.id, a.id).catch(() => {});
	vault = Vault.get();
	mode = 'view';
	draft = null;
	currentId = item.id;
	notice(t('saved'));
	render();
}

async function askDelete(item) {
	// a delete already under way is not asked for again: its end would close whatever was opened after the first
	if (saving) {
		notice(t('saving'));
		return;
	}
	let choice = await ask({title: t('deleteTitle', itemName(item)), body: [p(t('deleteText'))],
		actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'delete', label: t('delete'), cls: 'danger-outline'}], cancel: 'cancel'});
	if (choice != 'delete')
		return;
	// the attachments are the stored item's: from the editor, item is the draft, which may have let some go already
	let stored = null;
	// a delete under way ends the edit itself, as a save does: Back meanwhile doesn't ask about the changes, and the
	// form holds still
	saving = true;
	$('detail').inert = true;
	// and nothing else opens until it is written, so its Delete turns meanwhile, as a star does
	deleting = item.id;
	let pressed = $('detail').querySelector('.head button.danger, .edit-actions button.danger');
	if (pressed)
		busy(pressed, t('saving'), true);
	try {
		await Vault.change(doc => {
			// a retry after a write that landed finds the item gone already: what the first try found is kept
			stored = doc.items.find(x => x.id === item.id) || stored;
			doc.items = doc.items.filter(x => x.id !== item.id);
		});
	} catch (e) {
		notice(t('couldNotDelete', e.message));
		return;
	} finally {
		saving = false;
		$('detail').inert = false;
		deleting = null;
		// the Delete in sight, which a redraw meanwhile may have made anew
		pressed = $('detail').querySelector('button.danger.busy');
		if (pressed) {
			busy(pressed, null, true);
			// the inert pane took the keyboard from it: unless the keyboard has gone meanwhile to the page around the app
			if (document.activeElement == document.body && document.hasFocus())
				pressed.focus();
		}
	}
	// and the files an edit of it removed, or put up for a save that didn't list them: nothing lists them any more
	let edited = draft && draft.item.id === item.id ? draft.removedAttachments.concat(draft.addedAttachments) : [];
	for (let a of ((stored || item).attachments || []).concat(edited))
		Vault.deleteAttachment(item.id, a.id).catch(() => {});
	vault = Vault.get();
	mode = 'view';
	draft = null;
	currentId = null;
	toList(true);
	notice(t('deleted', itemName(item)));
	// the keyboard, which the redraw takes, goes to the row now in the deleted one's place, or back to a row the user
	// has moved to meanwhile; an item the list's filter hides has no place in it: the keyboard goes to the first row in
	// sight, and the list stays where it is
	let rows = [...$('items').querySelectorAll('.row')];
	let at = rows.findIndex(r => r.dataset.id === item.id);
	let mine = document.activeElement.closest('#items .row');
	let top = $('items').getBoundingClientRect().top;
	let after = mine && mine != rows[at] ? mine : at < 0 ? rows.find(r => r.getBoundingClientRect().top >= top) : rows[at + 1] || rows[at - 1];
	render();
	let to = after && $('items').querySelector('.row[data-id="' + CSS.escape(after.dataset.id) + '"] .open');
	if (to && document.activeElement == document.body && document.hasFocus())
		to.focus();
	// the last one deleted: the first-run screen's
	else
		focusInSight();
}

async function toggleFavourite(id) {
	// the star turns while its change is saved, which takes a while when Peergos can't reach its server; it keeps the
	// keyboard, and pressing it again meanwhile does nothing
	if (starsSaving.has(id))
		return;
	let favorite = ! vault.items.find(x => x.id == id).favorite;
	let star = $('detail').querySelector('.head button.star');
	starsSaving.add(id);
	if (star)
		busy(star, t('saving'), true);
	try {
		await Vault.change(doc => {
			let item = doc.items.find(x => x.id == id);
			if (item)
				item.favorite = favorite;
		});
	} catch (e) {
		starsSaving.delete(id);
		// the star in sight, which a redraw meanwhile may have made anew
		let now = $('detail').querySelector('.head button.star.busy');
		if (now && currentId === id)
			busy(now, null, true);
		notice(t('couldNotSave', e.message));
		return;
	}
	starsSaving.delete(id);
	vault = Vault.get();
	render();
}

// The folders, each with how many items it holds: made, renamed or deleted here. A deleted folder's items are kept,
// under No folder, as Bitwarden keeps them.
async function manageFolders() {
	if (saving || vault == null)
		return;
	if (importing) {
		notice(t('importing'), true);
		return;
	}
	// it comes back after each change, unless an editor was opened, or Edit pressed (one that will open: pressed after
	// Folders), while the change was written
	for (let again = false; mode != 'edit' && ! (again && [...editsWaiting.values()].includes(turns)); again = true) {
		let folders = vault.folders.slice().sort((a, b) => collator.compare(a.name, b.name));
		let rows = folders.map(f => {
			let rename = button(t('rename'), {icon: 'pencil', iconOnly: true, cls: 'small quiet'});
			rename.dataset.answer = 'rename:' + f.id;
			let remove = button(t('delete'), {icon: 'trash', iconOnly: true, cls: 'small quiet'});
			remove.dataset.answer = 'delete:' + f.id;
			return el('li', {}, [el('span', {class: 'name', text: t('typeCount', f.name, vault.items.filter(i => i.folderId === f.id).length)}), rename, remove]);
		});
		let key = await ask({title: t('folders'), body: rows.length > 0 ? [el('ul', {class: 'folder-list'}, rows)] : [p(t('noFolders'))],
			actions: [{key: 'new', label: t('newFolderTitle'), cls: 'small'}, null, {key: 'close', label: t('close'), cls: 'primary'}], cancel: 'close'});
		// an import keeps a folder id that isn't text, such as 1, as it came
		let folder = vault.folders.find(f => String(f.id) === key.substring(key.indexOf(':') + 1));
		let id = folder && folder.id;
		if (key == 'new') {
			let name = await Editor.askFolderName(vault.folders);
			let made = {id: crypto.randomUUID(), name: name};
			// a write reported as failed may have landed: on the retry, or on making it again, the folder is there already
			if (name != null)
				await changeFolders(doc => {
					if (! doc.folders.some(f => f.id === made.id || f.name === made.name))
						doc.folders.push(made);
				});
		} else if (key.startsWith('rename:') && folder) {
			let name = await Editor.askFolderName(vault.folders.filter(f => f.id !== id), {title: t('renameFolderTitle', folder.name), action: t('rename'), value: folder.name});
			if (name != null && name != folder.name)
				await changeFolders(doc => {
					let f = doc.folders.find(x => x.id === id);
					if (f)
						f.name = name;
				});
		} else if (key.startsWith('delete:') && folder) {
			let choice = await ask({title: t('deleteFolderTitle', folder.name), body: [p(t('deleteFolderText'))],
				actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'delete', label: t('delete'), cls: 'danger-outline'}], cancel: 'cancel'});
			if (choice == 'delete')
				await changeFolders(doc => {
					doc.folders = doc.folders.filter(f => f.id !== id);
					for (let item of doc.items)
						if (item.folderId === id)
							item.folderId = null;
				});
		} else {
			return;
		}
	}
}

// a change to the folders, written as an item's is: the vault is read again and only the change applied
async function changeFolders(change) {
	saving = true;
	// nothing opens until it is written, so the Folders button turns meanwhile
	busy($('foldersButton'), t('saving'), true);
	try {
		await Vault.change(change);
	} catch (e) {
		notice(t('couldNotSave', e.message));
		// one reported as failed may have landed: the folders shown are read again, unless there is no network to read from
		if (! Vault.offline())
			await Vault.load().catch(() => {});
	} finally {
		saving = false;
		busy($('foldersButton'), null, true);
	}
	vault = Vault.get();
	render();
}

// Peergos asks the user to confirm the name, and saves into the user's home folder: apps can't download. It writes
// over a file of the same name there without asking, so every name proposed carries the time, to the second, as
// Bitwarden names its exports. Its service worker reads the name with decodeURI, which leaves # & ? and the like
// encoded, so those are proposed as _. Gives the name proposed, which is the one told; a save the user cancels, or
// Peergos refuses, is told as not saved and gives null.
async function saveToPeergos(name, bytes) {
	let proposed = name.replace(/[#$&+,/:;=?@\\]/g, '_');
	let r = await fetch(API + '/save/' + encodeURIComponent(proposed), {method: 'POST', body: bytes}).catch(() => null);
	if (r == null || ! r.ok) {
		notice(t('notSaved'));
		return null;
	}
	return proposed;
}

// the time to the second, for a file name: 2026-11-15-143205
function fileStamp() {
	let d = new Date(), two = n => String(n).padStart(2, '0');
	return d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()) + '-' + two(d.getHours()) + two(d.getMinutes()) + two(d.getSeconds());
}

// scan.pdf as scan 2026-11-15-143205.pdf, a.tar.gz as a 2026-11-15-143205.tar.gz. Peergos refuses a name that
// starts with a dot, so .env is offered as _env 2026-11-15-143205.
function stampedName(fileName) {
	fileName = fileName.replace(/^\./, '_');
	let tar = fileName.match(/\.tar\.[^.]+$/i);
	let dot = tar ? tar.index : fileName.lastIndexOf('.');
	return dot > 0 ? fileName.substring(0, dot) + ' ' + fileStamp() + fileName.substring(dot) : fileName + ' ' + fileStamp();
}

async function saveAttachment(item, a) {
	if (Vault.offline()) {
		notice(t('couldNotSave', t('offline')));
		return;
	}
	let bytes;
	try {
		bytes = await Vault.readAttachment(item.id, a.id, a.size);
	} catch (e) {
		notice(t('couldNotRead', a.fileName));
		return;
	}
	let saved = await saveToPeergos(stampedName(a.fileName), bytes);
	if (saved)
		notice(t('savedFile', saved));
}

// ------------------------------------------------------------ new item, import and export

function askType() {
	let chosen = 1;
	let tiles = el('div', {class: 'types', role: 'radiogroup', 'aria-label': t('itemType')});
	// a radio group: one Tab stop, and the arrow keys move between the types
	tiles.addEventListener('keydown', e => {
		let step = {ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1}[e.key];
		if (! step)
			return;
		e.preventDefault();
		let at = Types.LIST.findIndex(ty => ty.type == chosen);
		chosen = Types.LIST[(at + step + Types.LIST.length) % Types.LIST.length].type;
		draw();
		tiles.querySelector('[aria-checked="true"]').focus();
	});
	let draw = () => {
		tiles.textContent = '';
		for (let ty of Types.LIST)
			tiles.append(el('button', {type: 'button', class: 'tile', role: 'radio', 'aria-checked': String(ty.type == chosen),
				tabindex: ty.type == chosen ? '0' : '-1',
				onclick: () => {
					chosen = ty.type;
					draw();
					tiles.querySelector('[aria-checked="true"]').focus();
				},
				ondblclick: () => $('dialogActions').querySelector('[data-key="ok"]').click()}, [svg(ty.icon), el('span', {text: t('type_' + ty.key)})]));
	};
	draw();
	return ask({title: t('newItem'), body: [tiles], wide: true,
		actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'ok', label: t('continue'), cls: 'primary'}], cancel: 'cancel'})
		.then(key => key == 'ok' ? chosen : null);
}

function choice(name, value, checked, title, text) {
	let id = 'c-' + name + '-' + value;
	return el('label', {class: 'choice', for: id}, [
		el('input', {type: 'radio', name: name, id: id, value: value, checked: checked}),
		el('div', {}, [el('b', {text: title}), el('span', {text: text})]),
	]);
}

function chosen(name) {
	let e = document.querySelector('input[name="' + name + '"]:checked');
	return e ? e.value : null;
}

let importKind = null;

async function startImport() {
	// one at a time: files are listed only once written, so a second import meanwhile would add them again
	if (importing) {
		notice(t('importing'), true);
		return;
	}
	let body = [
		choice('import', 'bitwarden', true, t('importBitwarden'), t('importBitwardenText')),
		choice('import', 'csv', false, t('importCsv'), t('importCsvText')),
		choice('import', 'codes', false, t('importCodes'), t('importCodesText')),
		p(t('importOnlyAdds')),
	];
	await ask({title: t('import'), body: body, actions: [null, {key: 'cancel', label: t('cancel')},
		{key: 'choose', label: t('chooseFile'), cls: 'primary', check: () => {
			// the file picker opens within the click, as browsers require
			importKind = chosen('import');
			let input = $('fileInput');
			input.value = '';
			input.accept = importKind == 'csv' ? '.csv,text/csv' : importKind == 'codes' ? '.txt,text/plain' : '.json,.zip,application/json,application/zip';
			input.click();
			return true;
		}}], cancel: 'cancel'});
}

async function readImport(file) {
	// as long as the vault's own writes are given, for a file of its size
	let patience = 5 * 60000 + Math.ceil(file.size / 64);
	let buffer = await Promise.race([file.arrayBuffer().catch(() => {
			throw new Error(t('couldNotRead', file.name));
		}),
		new Promise((_, no) => setTimeout(() => no(new Error(t('couldNotRead', file.name))), patience))]);
	let head = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
	let isZip = head.length == 4 && head[0] == 0x50 && head[1] == 0x4b && head[2] == 3 && head[3] == 4;
	if (isZip)
		return Formats.readBitwardenZip(buffer);
	let text = Formats.utf8(new Uint8Array(buffer));
	if (importKind == 'codes')
		return Formats.readCodesList(text);
	if (importKind == 'csv')
		return Formats.readCsvFile(text);
	// a password-protected Bitwarden export is opened first, with its file password
	if (text.includes('"passwordProtected"')) {
		let doc = null;
		try {
			doc = JSON.parse(text.charCodeAt(0) == 0xfeff ? text.substring(1) : text);
		} catch (e) {}
		if (Protected.isProtected(doc)) {
			if (Protected.kdf(doc) == null)
				throw new Error(t('protectedUnsupported'));
			text = await askFilePassword(doc);
			if (text == null)
				return null;
		}
	}
	return Formats.readBitwardenJson(text);
}

// The file password, asked for as Bitwarden asks for it. It is tried before the dialog closes, so a wrong one can be
// typed again. Resolves with the export's plain text, or null if the user cancels.
async function askFilePassword(doc) {
	let box = el('input', {id: 'filePassword', type: 'password', autocomplete: 'off'});
	let message = el('p', {class: 'hint bad', hidden: true});
	let say = text => {
		message.textContent = text || '';
		message.hidden = text == null;
	};
	box.addEventListener('keydown', e => {
		if (e.key == 'Enter') {
			e.preventDefault();
			$('dialogActions').querySelector('[data-key="import"]').click();
		}
	});
	let text = null;
	let key = await ask({title: t('protectedTitle'), body: [p(t('protectedText')),
			el('div', {class: 'field'}, [el('label', {class: 'label', for: 'filePassword', text: t('filePassword')}), box, message])],
		actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'import', label: t('import'), cls: 'primary', check: async () => {
			if (box.value == '') {
				say(t('required'));
				return false;
			}
			// the key takes a moment to make, longer on a phone
			let go = $('dialogActions').querySelector('[data-key="import"]');
			busy(go, t('importing'));
			say(null);
			try {
				text = await Protected.open(doc, box.value);
				if (text == null)
					say(t('wrongFilePassword'));
			} catch (e) {
				text = null;
				say(e.message);
			} finally {
				busy(go, null);
			}
			// the button lost the keyboard while it was disabled: it goes back to the password, to be typed again
			if (text == null && document.hasFocus()) {
				box.focus();
				box.select();
			}
			return text != null;
		}}],
		cancel: 'cancel', focus: '#filePassword'});
	return key == 'import' ? text : null;
}

async function importFile(file) {
	// from the read on, which takes a while for a large file: another import is refused meanwhile, and an Edit waits
	importing = true;
	let finished;
	importDone = new Promise(resolve => finished = resolve);
	let incoming, failure = null;
	try {
		incoming = await readImport(file);
		if (incoming != null && incoming.items.length == 0 && incoming.folders.length == 0)
			failure = incoming.migration ? t('migrationLines', incoming.migration) : incoming.unreadable ? t('noCodesInList') : t('nothingToImport');
	} catch (e) {
		failure = e.message;
	}
	if (incoming == null || failure != null) {
		importing = false;
		// an Importing… given meanwhile to an Import pressed again
		$('toast').hidden = true;
		if (failure != null)
			await ask({title: t('importFailed'), body: [p(failure)], own: true, actions: [null, {key: 'ok', label: t('close'), cls: 'primary'}], cancel: 'ok'});
		finished();
		// what another device saved, which coming back into sight or online during the read didn't read in
		refresh();
		return;
	}
	// until the tally: the attachments go up after the vault, which can take a while
	notice(t('importing'), true);
	let result, tried = null;
	try {
		result = await Vault.change(doc => {
			// a write reported as failed may have landed: on the retry this very import is what is stored, and what it
			// did stands, its attachments still to be written
			if (tried != null && JSON.stringify(doc) == tried.vault)
				return tried.result;
			let done = Formats.addToVault(doc, incoming);
			tried = {vault: JSON.stringify(doc), result: done};
			return done;
		});
	} catch (e) {
		importing = false;
		$('toast').hidden = true;
		// not a passing notice: a write the network cut off may still have landed, so the way on is the same file
		// again, which adds only what isn't here yet
		await ask({title: t('importFailed'), body: [p(t('couldNotSave', e.message)), p(t('importAgainToFinish'))], own: true,
			actions: [null, {key: 'ok', label: t('close'), cls: 'primary'}], cancel: 'ok'});
		finished();
		refresh();
		return;
	}
	// the files go up once their items are saved, and are listed on their items once written. One of the same name
	// and size as files its item has is written only if none of them has its bytes.
	let written = [], failed = [], listed = [];
	for (let a of result.attachments) {
		try {
			let here = false;
			for (let id of a.check || []) {
				let stored = await Vault.readAttachment(a.itemId, id, a.bytes.length).catch(() => null);
				if (stored != null && Formats.sameBytes(stored, a.bytes)) {
					here = true;
					break;
				}
			}
			if (here)
				continue;
			await Vault.writeAttachment(a.itemId, a.id, a.bytes);
			written.push(a);
		} catch (e) {
			failed.push(a);
		}
	}
	if (written.length > 0) {
		try {
			listed = await Vault.change(doc => Formats.listAttachments(doc, written));
			// a file whose item was deleted meanwhile goes too: nothing lists it, so nothing would ever delete it
			for (let a of written)
				if (! listed.includes(a))
					Vault.deleteAttachment(a.itemId, a.id).catch(() => {});
		} catch (e) {
			// written but not listed: not attached, as far as anyone can see
			failed = failed.concat(written);
		}
	}
	importing = false;
	vault = Vault.get();
	render();
	$('toast').hidden = true;
	let tally = el('div', {class: 'tally'}, [
		el('span', {text: t('tallyAdded')}), el('b', {text: String(result.added)}),
		el('span', {text: t('tallySkipped')}), el('b', {text: String(result.skipped)}),
		el('span', {text: t('tallyFolders')}), el('b', {text: String(result.folders)}),
		el('span', {text: t('tallyAttachments')}), el('b', {text: String(listed.length)}),
	]);
	let body = [tally];
	if (result.unmatched > 0)
		body.push(p(t('unmatchedExplain', result.unmatched, t('unmatchedName'))));
	if (failed.length > 0) {
		// which ones, and how to get them: the same file again adds what is missing and nothing twice
		body.push(p(t('attachmentsFailed', failed.length)));
		body.push(namesList(failed.map(a => {
			let item = vault.items.find(i => i.id == a.itemId);
			return item ? t('fileOfItem', a.fileName, itemName(item)) : a.fileName;
		})));
		body.push(p(t('importAgainForFiles')));
	}
	if (incoming.missing.length > 0) {
		body.push(p(t('zipMissing', incoming.missing.length)));
		body.push(namesList(incoming.missing));
	}
	if (incoming.unreadable)
		body.push(p(t('linesNotRead', incoming.unreadable)));
	if (incoming.migration)
		body.push(p(t('migrationLines', incoming.migration)));
	if (incoming.extraCells)
		body.push(p(t('csvExtraCells', incoming.extraCells)));
	if (incoming.dropped) {
		body.push(p(t('itemsNotRead', incoming.dropped)));
		if (incoming.droppedNames.length > 0)
			body.push(namesList(incoming.droppedNames));
	}
	await ask({title: t('importDone'), body: body, own: true, actions: [null, {key: 'ok', label: t('close'), cls: 'primary'}], cancel: 'ok'});
	// the first import's Import, which opened it, has gone with the first-run screen
	focusInSight();
	// an Edit pressed meanwhile opens once the tally is closed, not under it
	finished();
}

async function startExport() {
	let withFiles = vault.items.some(i => (i.attachments || []).length > 0);
	// the .json holds no files: said in its own words when there are some, so it isn't taken for a whole backup
	let body = [withFiles ? choice('export', 'json', true, t('exportJsonNoFiles'), t('exportJsonNoFilesText'))
		: choice('export', 'json', true, t('exportJson'), t('exportJsonText'))];
	if (withFiles)
		body.push(choice('export', 'zip', false, t('exportZip'), t('exportZipText')));
	if (Formats.codesList(vault) != '') {
		let left = Formats.codesLeftOut(vault).length;
		body.push(choice('export', 'codes', false, t('exportCodes'), t('exportCodesText') + (left ? ' ' + t('codesLeftOut', left) : '')));
	}
	// what Bitwarden would refuse or cut, before the file is relied on to move there
	let problems = Formats.bitwardenProblems(vault);
	let tooLong = problems.tooLong.map(itemName).concat(problems.longFolders.map(f => f.name));
	if (tooLong.length > 0)
		body.push(el('div', {class: 'note-box'}, [p(t('bitwardenTooLong', tooLong.length)), namesList(tooLong)]));
	if (problems.noPrivateKey.length > 0)
		body.push(el('div', {class: 'note-box'}, [p(t('bitwardenNoKey', problems.noPrivateKey.length)), namesList(problems.noPrivateKey.map(itemName))]));
	if (problems.longHistory.length > 0)
		body.push(el('div', {class: 'note-box'}, [p(t('bitwardenHistory', problems.longHistory.length))]));
	// KeePassXC's reader knows logins, cards and identities: of the rest it keeps the name, notes and custom fields
	let notForKeePassXC = vault.items.filter(i => ['sshKey', 'unknown'].includes(Types.of(i).key)).length;
	if (notForKeePassXC > 0)
		body.push(el('div', {class: 'note-box'}, [p(t('keepassLeavesOut', notForKeePassXC))]));
	// nor does it read Bitwarden's steam:// keys
	let steamForKeePassXC = vault.items.filter(i => i.login && /^steam:\/\//i.test(i.login.totp || '')).length;
	if (steamForKeePassXC > 0)
		body.push(el('div', {class: 'note-box'}, [p(t('keepassSteam', steamForKeePassXC))]));
	body.push(el('div', {class: 'warn-box'}, [svg('alert'), el('span', {text: t('exportWarning')})]));
	body.push(p(t('exportWhere')));
	let kind = null;
	let key = await ask({title: t('export'), body: body, actions: [null, {key: 'cancel', label: t('cancel')},
		{key: 'save', label: t('saveToPeergos'), cls: 'primary', check: () => {
			kind = chosen('export');
			return true;
		}}], cancel: 'cancel'});
	if (key != 'save')
		return;
	if (Vault.offline()) {
		notice(t('exportFailed', t('offline')));
		return;
	}
	let stamp = fileStamp();
	try {
		// the vault as it is now, with what another device saved since it was read
		notice(t('loading'), true);
		let now = await Vault.load(true);
		// shown too, as a refresh shows it: not under an editor, whose draft would be drawn again
		if (mode == 'view') {
			vault = now;
			render();
		}
		let bytes, name, skipped = [];
		if (kind == 'zip') {
			// the attachments are read first, which can take a while
			let zip = await Formats.bitwardenZip(now, Vault.readAttachment);
			bytes = zip.bytes;
			skipped = zip.skipped;
			name = 'passwords-' + stamp + '.zip';
		} else if (kind == 'codes') {
			bytes = new TextEncoder().encode(Formats.codesList(now));
			name = 'passwords-codes-' + stamp + '.txt';
		} else {
			bytes = new TextEncoder().encode(Formats.bitwardenJson(now));
			name = 'passwords-' + stamp + '.json';
		}
		$('toast').hidden = true;
		let saved = await saveToPeergos(name, bytes);
		if (saved == null)
			return;
		if (skipped.length == 0) {
			notice(t('savedFile', saved));
			return;
		}
		// which files the .zip is without, by name: each can be saved on its own from its item, or the export tried again
		await ask({title: t('savedFile', saved), own: true, body: [p(t('exportSkipped', skipped.length)),
				namesList(skipped.map(s => t('fileOfItem', s.fileName, itemName(s.item))))],
			actions: [null, {key: 'ok', label: t('close'), cls: 'primary'}], cancel: 'ok'});
	} catch (e) {
		notice(t('exportFailed', e.message));
	}
}

// ------------------------------------------------------------ wiring

function applyTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme == 'dark-mode' ? 'dark' : 'light');
}

function closeMenu() {
	let inside = $('moreMenu').contains(document.activeElement);
	$('moreMenu').hidden = true;
	$('moreButton').setAttribute('aria-expanded', 'false');
	// the keyboard, on a menu item, goes to the menu's button: what the item opens hands it back there
	if (inside)
		$('moreButton').focus();
}

// the list is drawn again once typing pauses, not at every key
let searchTimer = null;
$('search').addEventListener('input', e => {
	query = e.target.value;
	clearTimeout(searchTimer);
	searchTimer = setTimeout(renderList, 120);
});
// as in KeePassXC: Down goes from the search to the results and Enter opens the first; Up and Down move along them
$('search').addEventListener('keydown', e => {
	// not the Enter or arrow that picks a word in an input method
	if (e.isComposing || e.keyCode == 229)
		return;
	if (e.key != 'ArrowDown' && ! (e.key == 'Enter' && query.trim() != ''))
		return;
	// the list for what is typed, not for what was there before the pause
	clearTimeout(searchTimer);
	renderList();
	let first = $('items').querySelector('.row .open');
	if (first == null)
		return;
	e.preventDefault();
	first.focus();
	if (e.key == 'Enter')
		first.click();
});
$('items').addEventListener('keydown', e => {
	let step = {ArrowDown: 1, ArrowUp: -1}[e.key];
	if (! step || ! e.target.classList.contains('open'))
		return;
	e.preventDefault();
	let rows = [...$('items').querySelectorAll('.row .open')];
	let next = rows[rows.indexOf(e.target) + step] || (step < 0 ? $('search') : null);
	if (next)
		next.focus();
});
$('typeFilter').addEventListener('change', e => {
	filterType = e.target.value;
	renderList();
});
$('folderFilter').addEventListener('change', e => {
	filterFolder = e.target.value;
	renderList();
});
for (let id of ['newButton', 'fabNew', 'firstNew'])
	$(id).addEventListener('click', () => startNew());
// the editor is left first, as for New and Folders: an import's tally mustn't open over it
for (let id of ['importButton', 'menuImport', 'firstImport'])
	$(id).addEventListener('click', () => {
		closeMenu();
		// refused during an import before anything is left
		if (importing)
			notice(t('importing'), true);
		else
			leaveEdit(() => startImport());
	});
for (let id of ['exportButton', 'menuExport'])
	$(id).addEventListener('click', () => {
		closeMenu();
		// the files an import is still writing would be left out
		if (importing)
			notice(t('importing'), true);
		else if (vault == null || vault.items.length == 0)
			notice(t('nothingToExport'));
		else
			startExport();
	});
// the editor is left first, as opening another item leaves it
$('foldersButton').addEventListener('click', () => importing ? notice(t('importing'), true) : leaveEdit(() => manageFolders()));
$('moreButton').addEventListener('click', e => {
	e.stopPropagation();
	let open = $('moreMenu').hidden;
	$('moreMenu').hidden = ! open;
	$('moreButton').setAttribute('aria-expanded', String(open));
	if (open)
		$('moreMenu').querySelector('button').focus();
});
document.addEventListener('click', e => {
	if (! $('moreMenu').hidden && ! $('moreMenu').contains(e.target))
		closeMenu();
});
// not on a focus going nowhere: a click on a button in Safari moves no focus, and the menu has to stay for it
$('moreButton').parentNode.addEventListener('focusout', e => {
	if (! $('moreMenu').hidden && e.relatedTarget != null && ! e.currentTarget.contains(e.relatedTarget))
		closeMenu();
});
$('fileInput').addEventListener('change', e => {
	let file = e.target.files[0];
	if (file)
		importFile(file);
});
$('retryButton').addEventListener('click', () => start());
document.addEventListener('keydown', e => {
	if (e.isComposing || e.keyCode == 229)
		return;
	// Ctrl+S saves the edit; under a dialog it does nothing, and is still not the browser's own Save page
	if ((e.ctrlKey || e.metaKey) && (e.key == 's' || e.key == 'S') && (mode == 'edit' || e.repeat)) {
		e.preventDefault();
		if (mode == 'edit')
			saveDraft();
		return;
	}
	if (dialogOpen)
		return;
	if (e.key == 'Escape') {
		if (! $('moreMenu').hidden) {
			closeMenu();
			$('moreButton').focus();
		} else if (mode == 'edit') {
			e.preventDefault();
			leaveEdit(() => {});
		} else if ($('app').className == 'show-detail') {
			toList();
			renderList();
			focusInSight();
		}
	}
});
// the phone's Back: a dialog closes, an editor is left as Cancel leaves it, an item goes back to the list
window.addEventListener('popstate', async () => {
	let keep = keepDialog;
	keepDialog = false;
	if (dialogOpen) {
		if (keep)
			return;
		document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape'}));
		// the step comes back only while an item or the editor is in sight: the app's own Back, as when an item
		// deleted on another device closes under its dialog, leaves none behind
		if (mode == 'edit' || $('app').className == 'show-detail')
			openStep();
		return;
	}
	if (mode == 'edit') {
		// as Cancel does: back to the item (a new one, to the list), or still editing if the changes are kept. The
		// step comes back first, so a second Back over "Discard your changes?" answers it rather than closing the app
		openStep();
		await leaveEdit(() => {});
		return;
	}
	if ($('app').className == 'show-detail') {
		setView('list');
		renderList();
		focusInSight();
	}
});

// what was shown is hidden again when the app goes out of sight, and what another device saved is read in
document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		if (revealed.size > 0) {
			revealed.clear();
			if (mode == 'view')
				renderDetail();
		}
		for (let hide of [...whenHidden])
			hide();
		return;
	}
	refresh();
});

// what another device saved is read in when the app comes back into sight or online, unless something is under way;
// offline, what is on screen stays
async function refresh() {
	if (mode == 'view' && ! saving && ! importing && ! dialogOpen && ! Vault.offline()) {
		try {
			vault = await Vault.load(true);
			let had = document.activeElement;
			render();
			tellLanded(vault);
			// its row or item gone with the redraw: the keyboard gets a place
			if (had && had !== document.body && (! document.contains(had) || had.getClientRects().length == 0))
				focusInSight();
		} catch (e) {}
	}
}
addEventListener('online', refresh);

async function start() {
	$('loadError').hidden = true;
	$('loading').hidden = false;
	try {
		vault = await Vault.load();
	} catch (e) {
		$('loading').hidden = true;
		$('loadErrorText').textContent = t('couldNotLoad', e.message);
		$('loadError').hidden = false;
		return;
	}
	$('loading').hidden = true;
	render();
	// the search has the cursor on a wide screen; on a phone it would open the keyboard over the list
	if (vault.items.length > 0 && window.matchMedia('(min-width: 761px)').matches && document.hasFocus())
		$('search').focus();
}

translatePage();
applyTheme(params.get('theme'));
start();
