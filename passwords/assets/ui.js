// The pieces every screen uses: elements, icons, the dialog, the notice at the bottom, and copying.
'use strict';

const $ = id => document.getElementById(id);
const params = new URL(window.location.href).searchParams;
// dates and sorting follow the language Peergos is in; one the browser doesn't know falls back to its own
const locale = (() => {
	try {
		return Intl.DateTimeFormat.supportedLocalesOf([params.get('lang')]).length > 0 ? params.get('lang') : undefined;
	} catch (e) {
		return undefined;
	}
})();

const ICONS = {
	key: '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2 20 3M16 7l3 3M14 9l2 2"/>',
	note: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h5"/>',
	card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
	id: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.4"/><path d="M5.5 17c.7-2 2-3 3.5-3s2.8 1 3.5 3M15 9h3M15 13h3"/>',
	terminal: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 10 3 2-3 2M12 15h5"/>',
	copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
	eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
	eyeOff: '<path d="M3 3l18 18M10.6 6.1A10.6 10.6 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.8M6.6 6.7C3.8 8.4 2 12 2 12s3.6 6 10 6a9.9 9.9 0 0 0 4.4-1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
	star: '<path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9z"/>',
	back: '<path d="M15 6l-6 6 6 6"/>',
	pencil: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M14 6l4 4"/>',
	plus: '<path d="M12 5v14M5 12h14"/>',
	generate: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16M20 20v-4h-4"/>',
	trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 12.5h9L17.5 7M10 11v5M14 11v5"/>',
	alert: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4M12 17v.5"/>',
	history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 8v4l3 2"/>',
	fingerprint: '<path d="M12 11v3a8 8 0 0 1-2 5M8 9.5A4 4 0 0 1 16 11v1M5 9a7.5 7.5 0 0 1 14 2v2M15.5 15a12 12 0 0 1-1 4M8 14a10 10 0 0 1-1 3"/>',
	paperclip: '<path d="M20 11.5 12.2 19.3a5 5 0 0 1-7.1-7.1l8-8a3.3 3.3 0 0 1 4.7 4.7l-8 8a1.7 1.7 0 0 1-2.4-2.4l7.3-7.3"/>',
	save: '<path d="M12 4v12M7 11l5 5 5-5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
	qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h3v-3"/>',
};

function el(tag, attrs, children) {
	let e = document.createElement(tag);
	for (let [k, v] of Object.entries(attrs || {})) {
		if (k == 'text')
			e.textContent = v;
		else if (k.startsWith('on'))
			e.addEventListener(k.substring(2), v);
		else if (k == 'value') {
			if (v != null)
				e.value = v;
		}
		else if (k == 'checked')
			e.checked = v;
		else if (v != null && v !== false)
			e.setAttribute(k, v === true ? '' : v);
	}
	for (let c of [].concat(children || []))
		if (c != null)
			e.append(c);
	return e;
}

function svg(name, cls) {
	let wrap = document.createElement('span');
	wrap.innerHTML = '<svg ' + (cls ? 'class="' + cls + '" ' : '') + 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
	return wrap.firstChild;
}

// a button with an icon and words, or with an icon alone whose name is its aria-label and tooltip
function button(label, opts) {
	opts = opts || {};
	let attrs = {type: 'button', class: opts.cls || '', onclick: opts.onclick, 'data-focus': opts.focus};
	if (opts.iconOnly) {
		attrs['aria-label'] = label;
		attrs.title = label;
		attrs.class += ' icon';
	}
	if (opts.pressed != null)
		attrs['aria-pressed'] = String(opts.pressed);
	let kids = [opts.icon ? svg(opts.icon) : null];
	if (! opts.iconOnly)
		kids.push(el('span', {text: label}));
	return el('button', attrs, kids);
}

function p(content) {
	return el('p', {}, content);
}

// what a message is about, by name: the first few, and how many more
function namesList(names) {
	let shown = names.slice(0, 5).map(n => el('li', {text: n}));
	if (names.length > 5)
		shown.push(el('li', {text: t('andMore', names.length - 5)}));
	return el('ul', {class: 'names'}, shown);
}

function formatDate(iso) {
	if (! iso)
		return '';
	let d = new Date(iso);
	if (isNaN(d.getTime()))
		return iso;
	return d.toLocaleDateString(locale, {day: 'numeric', month: 'short', year: 'numeric'});
}

function formatSize(bytes) {
	if (bytes == null)
		return '';
	let units = ['B', 'KB', 'MB', 'GB'], i = 0, n = bytes;
	while (n >= 1024 && i < units.length - 1) {
		n /= 1024;
		i++;
	}
	return new Intl.NumberFormat(locale, {maximumFractionDigits: i == 0 ? 0 : 1}).format(n) + ' ' + units[i];
}

// A button at work on its answer keeps its size, so nothing beside it moves: a spinner takes the place of its words,
// and assistive technology hears label instead. busy(button, null) gives it back, with its own label if it had one.
// One that keeps the keyboard (keep) isn't disabled, which would drop the keyboard to the page: it is marked as
// unavailable instead, and its own action ignores it meanwhile.
function busy(b, label, keep) {
	let on = label != null;
	if (on && ! b.classList.contains('busy'))
		b.dataset.label = b.getAttribute('aria-label') || '';
	if (keep && on)
		b.setAttribute('aria-disabled', 'true');
	else if (keep)
		b.removeAttribute('aria-disabled');
	else
		b.disabled = on;
	b.classList.toggle('busy', on);
	if (on)
		b.setAttribute('aria-label', label);
	else if (b.dataset.label)
		b.setAttribute('aria-label', b.dataset.label);
	else
		b.removeAttribute('aria-label');
}

// ------------------------------------------------------------ the dialog

let dialogOpen = false;

// Shows a dialog and resolves with the key of the button pressed. body is a list of nodes; null in actions is
// the gap that pushes the rest to the right; Escape answers with cancel. A button's check(), if it has one, runs
// first and keeps the dialog open by returning false. A button in the body with data-answer answers with that.
let dialogs = Promise.resolve();
function ask(opts) {
	// one at a time: a question asked while another is open, such as an import's tally, waits for it
	let answer = dialogs.then(() => show(opts));
	dialogs = answer.catch(() => {});
	return answer;
}

// A held Enter repeats, and each repeat would press whatever the one before brought up, unseen: a dialog's answer, the
// next row's Remove, Save, or a text box shown by the first press. Only its first press counts, except in the text area
// it was pressed in, where the repeats are new lines.
let enterAt = null;
window.addEventListener('keydown', e => {
	if (e.key != 'Enter' || e.isComposing)
		return;
	if (! e.repeat)
		enterAt = e.target;
	else if (e.target !== enterAt || e.target.tagName != 'TEXTAREA') {
		e.preventDefault();
		e.stopPropagation();
	}
}, true);

// Whether a key, click, picked file or the phone's Back is being answered right now. A dialog opened by one gives the
// keyboard to its safe answer; one that opens later on its own (an import's tally, a save's question; those also say
// so with `own`) takes it itself, so keys typed meanwhile, as into the search, answer nothing unseen.
let answering = false;
for (let type of ['keydown', 'click', 'change', 'popstate'])
	window.addEventListener(type, () => {
		answering = true;
		setTimeout(() => answering = false);
	}, true);

function show({title, body, actions, cancel, wide, focus, own}) {
	return new Promise(resolve => {
		let scrim = $('dialog');
		$('dialogBox').classList.toggle('wide', !! wide);
		$('dialogTitle').textContent = title;
		let bodyEl = $('dialogBody');
		bodyEl.textContent = '';
		bodyEl.append(...body);
		let row = $('dialogActions');
		row.textContent = '';
		let opener = document.activeElement;
		// once only: an answer still being checked when Escape closed the dialog mustn't close the next one
		let finished = false;
		let done = key => {
			if (finished)
				return;
			finished = true;
			scrim.hidden = true;
			dialogOpen = false;
			document.removeEventListener('keydown', onKey, true);
			document.removeEventListener('focusin', keepIn);
			// the keyboard goes back to what opened the dialog, or to the one of the same name drawn in its place meanwhile
			// (the item drawn again when its star was saved)
			let back = opener && document.contains(opener) ? opener
				: opener && opener.dataset && opener.dataset.focus ? document.querySelector('[data-focus="' + CSS.escape(opener.dataset.focus) + '"]') : null;
			// not when the keyboard has gone to the page around the app meanwhile
			if (back && back.focus && document.hasFocus())
				back.focus();
			resolve(key);
		};
		// Escape answers with cancel, and Tab goes round the dialog's own controls, not those behind it
		let onKey = e => {
			// an input method's own keys, such as the Escape that drops its word, are its own
			if (e.isComposing || e.keyCode == 229)
				return;
			if (e.key == 'Escape') {
				e.preventDefault();
				e.stopPropagation();
				done(cancel);
			} else if (e.key == 'Tab') {
				// a radio group is one stop, at its chosen radio, as the browser's own Tab has it
				// the body, when it scrolls, is a stop too, so the keys can scroll to what is below its last control
				let body = $('dialogBody');
				body.tabIndex = body.scrollHeight > body.clientHeight ? 0 : -1;
				let all = [...$('dialogBox').querySelectorAll('#dialogBody, button, input, select, textarea')]
					.filter(x => ! x.disabled && x.tabIndex >= 0 && x.getClientRects().length > 0 && ! (x.type == 'radio' && ! x.checked));
				if (all.length == 0)
					return;
				let at = all.indexOf(document.activeElement);
				let next = e.shiftKey ? (at <= 0 ? all.length - 1 : at - 1) : (at < 0 || at == all.length - 1 ? 0 : at + 1);
				e.preventDefault();
				all[next].focus();
			}
		};
		let last = null;
		for (let a of actions) {
			if (a == null) {
				row.append(el('span', {class: 'spacer'}));
				continue;
			}
			last = el('button', {type: 'button', class: a.cls, text: a.label, 'data-key': a.key, onclick: async e => {
				// the second click of a double-click on the button that opened this dialog is not an answer
				if (e.detail > 1 || a.check && await a.check() === false)
					return;
				done(a.key);
			}});
			row.append(last);
		}
		for (let b of bodyEl.querySelectorAll('button[data-answer]'))
			b.addEventListener('click', () => done(b.dataset.answer));
		document.addEventListener('keydown', onKey, true);
		// the keyboard can't get behind the dialog, as by Tab from the page around the app into the app
		let keepIn = e => {
			if (! $('dialogBox').contains(e.target))
				$('dialogBox').focus();
		};
		document.addEventListener('focusin', keepIn);
		scrim.hidden = false;
		dialogOpen = true;
		// the keyboard isn't taken from the page around the app
		if (! document.hasFocus())
			return;
		// a box to type in has it; else the safe answer (with no primary one, as before a delete or a discard), unless
		// the dialog opened on its own
		let first = focus ? bodyEl.querySelector(focus) : null;
		let primary = first || (answering && ! own ? row.querySelector('button.primary:not(:disabled)') || row.querySelector('[data-key="' + cancel + '"]') || last : null);
		(primary || $('dialogBox')).focus();
	});
}

// what hides a shown secret again when the app goes out of sight: the editor's password boxes, the history dialog
const whenHidden = new Set();

let noticeTimer = null;
// one that stays, such as Importing…, is there until the next notice or the end of its work
function notice(text, stays) {
	let toast = $('toast');
	toast.textContent = text;
	toast.hidden = false;
	clearTimeout(noticeTimer);
	if (! stays)
		noticeTimer = setTimeout(() => toast.hidden = true, 4000);
}

// ------------------------------------------------------------ copying

// Peergos lets an app write to the clipboard (the app frame allows clipboard-write). Where the browser still says
// no, the older copy command is tried.
async function copyText(text, what) {
	let ok = false;
	try {
		await navigator.clipboard.writeText(text);
		ok = true;
	} catch (e) {
		// the old way, through a hidden box: inside an open dialog, which keeps the keyboard in it, and the keyboard back
		// where it was afterwards
		let at = document.activeElement;
		let area = el('textarea', {value: text, readonly: true, class: 'sr'});
		(dialogOpen ? $('dialogBox') : document.body).append(area);
		area.select();
		try {
			ok = document.execCommand('copy');
		} catch (e2) {}
		area.remove();
		if (at && at !== document.body && at.focus && document.contains(at))
			at.focus({preventScroll: true});
	}
	notice(ok ? t('copied', what) : t('copyFailed'));
}
