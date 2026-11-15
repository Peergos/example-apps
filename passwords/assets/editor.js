// Editing an item, in the item's pane. The form edits a copy (the draft); the vault changes only on Save.
'use strict';

const Editor = (() => {
	// Bitwarden's UriMatchStrategy; none means the user's own default in Bitwarden
	const MATCHES = [null, 0, 1, 2, 3, 4, 5];
	const MATCH_KEYS = {0: 'matchDomain', 1: 'matchHost', 2: 'matchStartsWith', 3: 'matchExact', 4: 'matchRegex', 5: 'matchNever'};
	const FIELD_TYPES = [0, 1, 2, 3];
	const FIELD_TYPE_KEYS = {0: 'fieldText', 1: 'fieldHidden', 2: 'fieldBoolean', 3: 'fieldLinked'};

	function start(item, isNew) {
		let copy = JSON.parse(JSON.stringify(item));
		// the lists and the type's object the form makes on opening are made first, so opening it isn't a change
		if (Types.of(copy).key != 'unknown')
			data(copy);
		if (Types.of(copy).key == 'login')
			copy.login.uris = copy.login.uris || [];
		copy.fields = copy.fields || [];
		return {item: copy, original: stable(copy), before: item, isNew: isNew, newFolders: [], removedAttachments: [],
			addedAttachments: [], leftOut: [], kept: longTexts(item, new Set())};
	}

	// Bitwarden's largest attachment, in the MB this app shows sizes in
	const MAX_ATTACHMENT = 500 * 1024 * 1024;

	// The long texts an item held when its edit began. Bitwarden's limits stop what is typed, not what came in: an
	// import from an app without them, such as KeePassXC, keeps its text and the item can still be saved.
	function longTexts(value, out) {
		if (typeof value == 'string') {
			if (Types.utf8Length(value) > Types.LIMIT.short)
				out.add(sameLines(value));
		} else if (value != null && typeof value == 'object') {
			for (let v of Object.values(value))
				longTexts(v, out);
		}
		return out;
	}

	// An item as text for telling whether the edit changed it: its parts in name order, and one that is null, empty or
	// false left out as absent, so a type changed and changed back (which puts a field's value last), or a box typed in
	// and emptied again, isn't a change.
	function stable(item) {
		let absent = v => v == null || v === '' || v === false;
		return JSON.stringify(item, (k, v) => v && typeof v == 'object' && ! Array.isArray(v)
			? Object.fromEntries(Object.keys(v).sort().filter(key => ! absent(v[key])).map(key => [key, v[key]])) : v);
	}

	// a row's Remove is named after what the row holds, as it is typed: "Remove https://mail.example.com"; an empty
	// row's is "Remove website" or "Remove field"
	function nameRemove(remove, name, empty) {
		let text = name == null ? '' : String(name).trim();
		let label = text ? t('removeNamed', text) : t(empty);
		remove.setAttribute('aria-label', label);
		remove.title = label;
	}

	// a text box gives back \r\n as \n
	function sameLines(text) {
		return text.replace(/\r\n?/g, '\n');
	}

	function isDirty(draft) {
		return stable(draft.item) != draft.original || draft.removedAttachments.length > 0 || draft.addedAttachments.length > 0;
	}

	// the object a type keeps its own fields in, made when first written to
	function data(item) {
		let key = Types.of(item).key;
		if (item[key] == null || typeof item[key] != 'object')
			item[key] = {};
		return item[key];
	}

	// an emptied optional value is left out, as Bitwarden's export leaves it out; an SSH key keeps its three
	// fields, which Bitwarden always writes
	function setValue(obj, name, value, keepEmpty) {
		if (value === '' && ! keepEmpty)
			delete obj[name];
		else
			obj[name] = value;
	}

	function fieldLabel(item, name) {
		return t('f_' + Types.of(item).key + '_' + name);
	}

	// ------------------------------------------------------------ checks

	// over the length Bitwarden's server takes back on an import, unless the item held it when the edit began
	function tooLong(input) {
		return input.dataset.limit && Types.utf8Length(input.value) > parseInt(input.dataset.limit, 10)
			&& ! (shown && shown.kept.has(sameLines(input.value)));
	}

	// What stops a save, as [{input, message}]: an empty name or required field, or a value too long
	function problems(form) {
		let out = [];
		for (let input of form.querySelectorAll('[data-limit], [data-required]')) {
			let value = input.value;
			let message = null;
			if (input.dataset.required != null && value.trim() == '')
				message = t('required');
			else if (tooLong(input))
				message = t('tooLong', Number(input.dataset.limit).toLocaleString(locale));
			if (message != null)
				out.push({input: input, message: message});
		}
		return out;
	}

	// shows a field's problem under it as it is typed
	function check(input) {
		let hint = document.querySelector('.hint[data-for="' + input.id + '"]');
		let value = input.value;
		let message = null;
		if (input.dataset.required != null && value.trim() == '' && input.dataset.touched)
			message = t('required');
		else if (tooLong(input))
			message = t('tooLong', Number(input.dataset.limit).toLocaleString(locale));
		input.classList.toggle('bad', message != null);
		if (hint) {
			hint.textContent = message || '';
			hint.hidden = message == null;
		}
		let counter = input.id == 'e-notes' ? $('e-notes-count') : null;
		if (counter) {
			let n = Types.utf8Length(value);
			counter.textContent = t('notesCount', n.toLocaleString(locale), Types.LIMIT.notes.toLocaleString(locale));
			counter.classList.toggle('bad', n > Types.LIMIT.notes);
		}
	}

	// ------------------------------------------------------------ inputs

	let shown = null;   // the draft the form on the page is for

	function input(attrs, onValue) {
		let e = el('input', Object.assign({autocomplete: 'off', spellcheck: 'false'}, attrs));
		e.addEventListener('input', () => {
			e.dataset.touched = '1';
			onValue(e.value);
			check(e);
		});
		return e;
	}

	function hint(forId) {
		return el('p', {class: 'hint bad', 'data-for': forId, hidden: true});
	}

	// a secret is typed into a password box with a button to see it, and the browser is asked not to fill or keep it
	function secretInput(attrs, onValue) {
		let e = input(Object.assign({type: 'password', autocomplete: 'new-password'}, attrs), onValue);
		let set = showing => {
			e.type = showing ? 'text' : 'password';
			toggle.setAttribute('aria-label', showing ? t('hide') : t('show'));
			toggle.title = toggle.getAttribute('aria-label');
			toggle.replaceChild(svg(showing ? 'eyeOff' : 'eye'), toggle.firstChild);
		};
		let toggle = button(t('show'), {icon: 'eye', iconOnly: true, cls: 'quiet', onclick: () => set(e.type != 'text')});
		// and goes back to dots when the app is out of sight; a box no longer on the page lets go of its hook
		let hide = () => e.isConnected ? set(false) : whenHidden.delete(hide);
		whenHidden.add(hide);
		return {input: e, node: el('div', {class: 'with-button'}, [e, toggle])};
	}

	function textArea(attrs, onValue) {
		let e = el('textarea', Object.assign({rows: 4, spellcheck: 'false'}, attrs));
		e.addEventListener('input', () => {
			e.dataset.touched = '1';
			onValue(e.value);
			check(e);
		});
		return e;
	}

	function select(id, options, current, onValue) {
		let e = el('select', {id: id});
		let values = options.map(o => o.value);
		if (current != null && current !== '' && ! values.includes(String(current)))
			options = options.concat([{value: String(current), label: String(current)}]);
		for (let o of options)
			e.append(el('option', {value: o.value, text: o.label}));
		e.value = current == null ? '' : String(current);
		e.addEventListener('change', () => {
			onValue(e.value);
		});
		return e;
	}

	function field(label, forId, control, opts) {
		opts = opts || {};
		return el('div', {class: 'field' + (opts.wide ? ' wide' : '')}, [
			el('label', {class: 'label', for: forId, text: label}), control, opts.after || null, hint(forId)]);
	}

	// ------------------------------------------------------------ the form

	function typeField(draft, f) {
		let item = draft.item;
		let obj = data(item);
		let id = 'e-' + f.name;
		let label = fieldLabel(item, f.name);
		let keep = Types.of(item).key == 'sshKey';
		let set = v => setValue(obj, f.name, v, keep);
		let value = obj[f.name] == null ? '' : String(obj[f.name]);
		let common = {id: id, value: value, 'data-limit': f.limit, class: f.mono ? 'mono' : null, inputmode: f.inputmode,
			placeholder: f.placeholder, 'data-required': f.required ? '' : null};
		if (f.kind == 'secret') {
			let s = secretInput(common, set);
			// a login's password can be made here, as in Bitwarden
			if (Types.of(item).key == 'login' && f.name == 'password')
				s.node.append(button(t('generatePassword'), {icon: 'generate', iconOnly: true, cls: 'quiet', focus: 'generate', onclick: async () => {
					let made = await askGenerated();
					if (made != null) {
						s.input.value = made;
						s.input.dispatchEvent(new Event('input', {bubbles: true}));
					}
				}}));
			return field(label, id, s.node, {wide: f.wide});
		}
		if (f.kind == 'multiline' || f.kind == 'secretMultiline') {
			let area = textArea(Object.assign({}, common, {value: undefined}), set);
			area.value = value;
			if (f.kind == 'secretMultiline' && value != '') {
				// a private key stays out of sight until asked for, as a password does
				area.hidden = true;
				let reveal = button(t('showToEdit'), {icon: 'eye', cls: 'small', onclick: () => {
					area.hidden = false;
					reveal.remove();
					area.focus();
				}});
				// and goes out of sight again with the app, as a password box does
				let hide = () => {
					if (! area.isConnected)
						return whenHidden.delete(hide);
					if (! area.hidden) {
						area.hidden = true;
						area.before(reveal);
					}
				};
				whenHidden.add(hide);
				return field(label, id, el('div', {class: 'rows'}, [reveal, area]), {wide: true});
			}
			return field(label, id, area, {wide: true});
		}
		if (f.kind == 'select') {
			let options = [{value: '', label: '—'}].concat(f.options.map(o => ({value: o, label: o})));
			return field(label, id, select(id, options, obj[f.name], set), {wide: f.wide});
		}
		if (f.kind == 'month') {
			let months = [{value: '', label: '—'}];
			for (let m = 1; m <= 12; m++) {
				let name = new Intl.DateTimeFormat(locale, {month: 'long'}).format(new Date(2000, m - 1, 1));
				months.push({value: String(m), label: String(m).padStart(2, '0') + ' · ' + name});
			}
			// "04" and "4" are the same month: a stored value is shown as its number, and kept as it was until changed
			let current = obj[f.name] == null || obj[f.name] === '' ? '' : String(parseInt(obj[f.name], 10));
			return field(label, id, select(id, months, current == 'NaN' ? obj[f.name] : current, set), {wide: f.wide});
		}
		return field(label, id, input(common, set), {wide: f.wide});
	}

	function uriRows(draft) {
		let login = data(draft.item);
		login.uris = login.uris || [];
		let host = el('div', {class: 'rows'});
		let draw = () => {
			host.textContent = '';
			login.uris.forEach((u, i) => {
				let id = 'e-uri-' + i;
				let matchOptions = MATCHES.map(m => ({value: m == null ? '' : String(m), label: m == null ? t('matchDefault') : t(MATCH_KEYS[m])}));
				let remove = button('', {icon: 'trash', iconOnly: true, cls: 'quiet', focus: 'remove-uri:' + i, onclick: () => {
					login.uris.splice(i, 1);
					draw();
					keyboardAfterRemove('remove-uri:' + i, 'add-website');
				}});
				nameRemove(remove, u.uri, 'removeWebsite');
				let row = el('div', {class: 'uri-row'}, [
					input({id: id, value: u.uri || '', inputmode: 'url', placeholder: 'https://', 'data-limit': Types.LIMIT.uri,
						'aria-label': t('website')}, v => {
						setValue(u, 'uri', v);
						nameRemove(remove, v, 'removeWebsite');
					}),
					select('e-match-' + i, matchOptions, u.match, v => {
						if (v === '')
							delete u.match;
						else
							u.match = parseInt(v, 10);
					}),
					remove,
				]);
				row.lastChild.previousSibling.setAttribute('aria-label', t('matchRule'));
				host.append(row, hint(id));
			});
			host.append(button(t('addWebsite'), {icon: 'plus', cls: 'add', focus: 'add-website', onclick: () => {
				login.uris.push({uri: ''});
				draw();
				$('e-uri-' + (login.uris.length - 1)).focus();
			}}));
		};
		draw();
		return host;
	}

	function customRows(draft) {
		let item = draft.item;
		item.fields = item.fields || [];
		let links = Types.linkable(item);
		let host = el('div', {class: 'rows'});
		let draw = () => {
			host.textContent = '';
			item.fields.forEach((f, i) => {
				let nameId = 'e-fname-' + i, valueId = 'e-fvalue-' + i;
				let value;
				if (f.type == 2) {
					let box = el('input', {type: 'checkbox', id: valueId, checked: f.value == 'true', onchange: e => {
						f.value = e.target.checked ? 'true' : 'false';
					}});
					value = el('label', {class: 'check-cell'}, [box, el('span', {text: t('yes')})]);
				} else if (f.type == 3) {
					let options = [{value: '', label: '—'}].concat(links.map(l => ({value: String(l.id), label: fieldLabel(item, l.field)})));
					value = select(valueId, options, f.linkedId, v => {
						if (v === '')
							delete f.linkedId;
						else
							f.linkedId = parseInt(v, 10);
					});
					value.setAttribute('aria-label', t('linkedTo'));
				} else {
					let attrs = {id: valueId, value: f.value || '', 'data-limit': Types.LIMIT.long, 'aria-label': t('fieldValue')};
					value = f.type == 1 ? secretInput(attrs, v => setValue(f, 'value', v)).node : input(attrs, v => setValue(f, 'value', v));
				}
				let typeOptions = FIELD_TYPES.filter(ft => ft != 3 || links.length > 0 || f.type == 3 || 'link' in (fieldHeld.get(f) || {}))
					.map(ft => ({value: String(ft), label: t(FIELD_TYPE_KEYS[ft])}));
				let typeSelect = select('e-ftype-' + i, typeOptions, f.type == null ? 0 : f.type, v => {
					let type = parseInt(v, 10);
					// A value carries over between text and hidden; a checkbox and a link have their own. What the field
					// held as each is kept for the rest of the edit and comes back with that type, so stepping through the
					// types with the arrow keys (a change at each step) loses nothing.
					let held = fieldHeld.get(f) || {};
					let was = f.type == null ? 0 : f.type;
					if (was == 2)
						held.check = f.value;
					else if (was == 3)
						held.link = f.linkedId;
					else
						held.text = f.value;
					fieldHeld.set(f, held);
					delete f.value;
					delete f.linkedId;
					if (type == 2)
						f.value = 'check' in held ? held.check : 'false';
					else if (type == 3) {
						if (held.link != null)
							f.linkedId = held.link;
					} else if (held.text != null)
						f.value = held.text;
					f.type = type;
					keepKeyboard(draw);
				});
				typeSelect.setAttribute('aria-label', t('fieldType'));
				let remove = button('', {icon: 'trash', iconOnly: true, cls: 'quiet', focus: 'remove-field:' + i, onclick: () => {
					item.fields.splice(i, 1);
					draw();
					keyboardAfterRemove('remove-field:' + i, 'add-field');
				}});
				nameRemove(remove, f.name, 'removeField');
				host.append(el('div', {class: 'custom-row'}, [
					input({id: nameId, value: f.name || '', 'data-limit': Types.LIMIT.short, placeholder: t('fieldName'), 'aria-label': t('fieldName')},
						v => {
							setValue(f, 'name', v);
							nameRemove(remove, v, 'removeField');
						}),
					value,
					typeSelect,
					remove,
				]), hint(nameId), hint(valueId));
			});
			host.append(button(t('addField'), {icon: 'plus', cls: 'add', focus: 'add-field', onclick: () => {
				item.fields.push({name: '', value: '', type: 0});
				draw();
				$('e-fname-' + (item.fields.length - 1)).focus();
			}}));
		};
		draw();
		return host;
	}

	function folderSelect(draft, folders) {
		let item = draft.item;
		let all = folders.concat(draft.newFolders);
		let options = [{value: '', label: t('noFolder')}]
			.concat(all.slice().sort((a, b) => a.name.localeCompare(b.name, locale)).map(f => ({value: String(f.id), label: f.name})))
			.concat([{value: '*new', label: t('newFolder')}]);
		let host = el('div');
		let e = select('e-folder', options, item.folderId, async v => {
			if (v != '*new') {
				// the folder's own id, which an import may have kept as a number
				let f = all.find(x => String(x.id) === v);
				item.folderId = v === '' ? null : f ? f.id : v;
				return;
			}
			let name = await askFolderName(all);
			if (name == null) {
				e.value = item.folderId == null ? '' : item.folderId;
				return;
			}
			let f = {id: crypto.randomUUID(), name: name};
			draft.newFolders.push(f);
			item.folderId = f.id;
			keepKeyboard(() => host.replaceWith(folderSelect(draft, folders)));
		});
		host.append(e);
		return host;
	}

	// a new folder's name, or with opts {title, action, value} a folder's new name; folders are the names it mustn't take
	async function askFolderName(folders, opts) {
		opts = opts || {};
		let box = el('input', {id: 'folderName', autocomplete: 'off', 'data-limit': Types.LIMIT.short, value: opts.value});
		let message = el('p', {class: 'hint bad', hidden: true});
		box.addEventListener('keydown', e => {
			// not the Enter that picks a word in an input method
			if (e.key == 'Enter' && ! e.isComposing && e.keyCode != 229) {
				e.preventDefault();
				$('dialogActions').querySelector('[data-key="ok"]').click();
			}
		});
		let name = null;
		let key = await ask({title: opts.title || t('newFolderTitle'), body: [el('div', {class: 'field'}, [el('label', {class: 'label', for: 'folderName', text: t('folderName')}), box, message])],
			actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'ok', label: opts.action || t('createFolder'), cls: 'primary', check: () => {
				let v = box.value.trim();
				let problem = v == '' ? t('required') : Types.utf8Length(v) > Types.LIMIT.short ? t('tooLong', Types.LIMIT.short)
					: folders.some(f => f.name == v) ? t('folderExists') : null;
				message.textContent = problem || '';
				message.hidden = problem == null;
				name = v;
				return problem == null;
			}}],
			cancel: 'cancel', focus: '#folderName'});
		return key == 'ok' ? name : null;
	}

	// ------------------------------------------------------------ the password generator

	// Bitwarden's character sets; avoiding look-alikes leaves out I, O, l, 0 and 1, as its generator does
	const SETS = {upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', lower: 'abcdefghijklmnopqrstuvwxyz', digits: '0123456789', special: '!@#$%^&*'};
	const LOOK_ALIKE = /[IOl01]/g;

	// a whole number below n from the browser's cryptographic randomness, without the bias of a plain remainder
	function randomBelow(n) {
		let limit = Math.floor(0x100000000 / n) * n;
		let v = new Uint32Array(1);
		do
			crypto.getRandomValues(v);
		while (v[0] >= limit);
		return v[0] % n;
	}

	// at least one character from each set chosen, the rest from all of them, then shuffled
	function generate(opts) {
		let sets = Object.keys(SETS).filter(k => opts[k]).map(k => opts.avoidAmbiguous ? SETS[k].replace(LOOK_ALIKE, '') : SETS[k]);
		let chars = sets.map(s => s[randomBelow(s.length)]);
		let all = sets.join('');
		while (chars.length < opts.length)
			chars.push(all[randomBelow(all.length)]);
		for (let i = chars.length - 1; i > 0; i--) {
			let j = randomBelow(i + 1);
			[chars[i], chars[j]] = [chars[j], chars[i]];
		}
		return chars.join('');
	}

	// The generator, with Bitwarden's defaults: 14 letters and numbers. Resolves with the password to use, or null.
	async function askGenerated() {
		let opts = {length: 14, upper: true, lower: true, digits: true, special: false, avoidAmbiguous: false};
		let shown = el('output', {class: 'generated', id: 'genValue', 'aria-live': 'polite'});
		let value = null;
		let again = () => shown.textContent = value = generate(opts);
		// out of sight it goes back to dots, as every shown secret does; Generate another shows a new one
		let hide = () => shown.textContent = '••••••••••';
		whenHidden.add(hide);
		let length = el('input', {id: 'genLength', type: 'number', min: 5, max: 128, value: opts.length, inputmode: 'numeric'});
		length.addEventListener('input', () => {
			let n = parseInt(length.value, 10);
			if (n >= 5 && n <= 128) {
				opts.length = n;
				again();
			}
		});
		length.addEventListener('change', () => length.value = opts.length);
		// one set at least stays chosen
		let box = (key, label) => {
			let c = el('input', {type: 'checkbox', id: 'gen-' + key});
			c.checked = opts[key];
			c.addEventListener('change', () => {
				opts[key] = c.checked;
				if (! Object.keys(SETS).some(k => opts[k]))
					opts[key] = c.checked = true;
				again();
			});
			return el('label', {class: 'toggle-row', for: 'gen-' + key}, [c, el('span', {text: label})]);
		};
		again();
		let key = await ask({title: t('generatePassword'), body: [
			el('div', {class: 'generated-row'}, [shown, button(t('generateAgain'), {icon: 'generate', iconOnly: true, cls: 'quiet', onclick: again})]),
			field(t('length'), 'genLength', length),
			el('div', {class: 'generated-sets'}, [box('upper', 'A–Z'), box('lower', 'a–z'), box('digits', '0–9'), box('special', '!@#$%^&*')]),
			box('avoidAmbiguous', t('avoidAmbiguous')),
		], actions: [null, {key: 'cancel', label: t('cancel')}, {key: 'use', label: t('usePassword'), cls: 'primary'}], cancel: 'cancel'});
		whenHidden.delete(hide);
		return key == 'use' ? value : null;
	}

	// ------------------------------------------------------------ the one-time code key

	// what the key field says under it: the code's settings, or that it isn't a key this app can read
	function totpInfo(value) {
		if (value.trim() == '')
			return {text: t('totpHint'), bad: false};
		let p = Totp.parse(value);
		if (p == null)
			return {text: t('totpUnreadableHint'), bad: true};
		if (p.steam)
			return {text: t('totpSteam'), bad: false};
		return {text: t('totpSettings', p.algorithm.replace('SHA', 'SHA-'), p.digits, p.period), bad: false};
	}

	// A QR code's link fills in the key, and the name and username if they are still empty
	function applyQr(draft, text) {
		if (text == null)
			return notice(t('qrNotFound'));
		if (/^otpauth-migration:/i.test(text))
			return notice(t('qrMigration'));
		let code = Formats.storedCode(text);
		if (code == null)
			return notice(t('qrNotCode'));
		let item = draft.item;
		let label = Formats.labelOf(text);
		data(item).totp = code;
		if (! (item.name || '').trim() && (label.issuer || label.account))
			item.name = label.issuer || label.account;
		if (! data(item).username && label.account)
			data(item).username = label.account;
		notice(t('qrRead'));
		return true;
	}

	async function readPicture(draft, blob, redraw) {
		let text;
		// Save turns while the picture is read, so a key being read isn't left out of a save pressed meanwhile
		draft.picturesReading = (draft.picturesReading || 0) + 1;
		saveTurns($('detail'), draft);
		// the picture given last, or a key typed meanwhile, has the last word: a read that ends after either is dropped,
		// and not told
		let mine = draft.picturesGiven = (draft.picturesGiven || 0) + 1;
		let keyBefore = (draft.item.login || {}).totp;
		try {
			text = await Qr.read(blob);
		} catch (e) {
			if (shown === draft && $('e-totp') && mine == draft.picturesGiven)
				notice(t('pictureUnreadable'));
			return;
		} finally {
			draft.picturesReading--;
			saveTurns($('detail'), draft);
		}
		// a picture read once the form has gone, or while it is being saved, is dropped: a save has taken the form already
		if (mine != draft.picturesGiven || (draft.item.login || {}).totp !== keyBefore || shown !== draft || ! $('e-totp')
			|| $('e-totp').closest('[inert]'))
			return;
		if (applyQr(draft, text) === true)
			redrawWhenFree(draft, redraw);
	}

	// The form drawn again for this draft once no dialog is open over it: one (the generator) keeps writing to the
	// fields it opened with, which a redraw would replace with fields it doesn't know. Only while this draft's form is
	// still the one on the page: the edit may have been left from that dialog.
	function redrawWhenFree(draft, redraw) {
		if (shown !== draft || ! $('e-name'))
			return;
		// nor while it is being saved or deleted, whose buttons turn meanwhile
		if (dialogOpen || $('e-name').closest('[inert]')) {
			setTimeout(() => redrawWhenFree(draft, redraw), 200);
			return;
		}
		keepKeyboard(redraw);
	}

	// Something in the form drawn again keeps the keyboard where it was: on the control with the same id or data-focus,
	// else at the same place among the form's controls (the next one, when a row went), with the caret where it was.
	function keepKeyboard(redo) {
		let scope = $('detail');
		let at = document.activeElement;
		if (! scope || ! at || ! scope.contains(at) || ! document.hasFocus()) {
			redo();
			return;
		}
		let controls = () => [...scope.querySelectorAll('button, input, select, textarea')]
			.filter(e => ! e.disabled && e.type != 'file' && e.getClientRects().length > 0);
		let id = at.id, key = at.dataset.focus, index = controls().indexOf(at);
		let caret = typeof at.selectionStart == 'number' ? [at.selectionStart, at.selectionEnd] : null;
		redo();
		// still there, or placed by the redraw itself
		if (document.activeElement && document.activeElement !== document.body && scope.contains(document.activeElement))
			return;
		let now = controls();
		let back = (id && document.getElementById(id)) || (key && scope.querySelector('[data-focus="' + CSS.escape(key) + '"]'))
			|| (index >= 0 && now.length > 0 ? now[Math.min(index, now.length - 1)] : null);
		if (back == null)
			return;
		back.focus();
		if (caret && back.id == id && typeof back.setSelectionRange == 'function')
			try {
				back.setSelectionRange(caret[0], caret[1]);
			} catch (e) {}
	}

	function totpField(draft, host, folders, actions) {
		let login = data(draft.item);
		let info = el('p', {class: 'hint', id: 'e-totp-info'});
		let show = () => {
			let i = totpInfo($('e-totp') ? $('e-totp').value : login.totp || '');
			info.textContent = i.text;
			info.classList.toggle('bad', i.bad);
		};
		let totp = secretInput({id: 'e-totp', value: login.totp || '', class: 'mono', 'data-limit': Types.LIMIT.short,
			placeholder: t('totpPlaceholder')}, v => {
			setValue(login, 'totp', v);
			show();
		});
		let redraw = () => render(host, draft, folders, actions);
		// a photo or screenshot of the QR code: apps get no camera, so a phone's file picker offers its camera app
		let picker = el('input', {type: 'file', accept: 'image/*', hidden: true, onchange: e => {
			let file = e.target.files[0];
			if (file)
				readPicture(draft, file, redraw);
		}});
		let scan = button(t('readQr'), {icon: 'qr', cls: 'small', focus: 'read-qr', onclick: () => {
			picker.value = '';
			picker.click();
		}});
		let row = el('div', {class: 'with-button qr-row'}, [scan, el('span', {class: 'hint', text: t('qrPaste')}), picker]);
		let node = field(t('totpKey'), 'e-totp', el('div', {class: 'rows'}, [totp.node, row]), {wide: true, after: info});
		// A screenshot pasted anywhere in the form is read for a QR code. Text pasted into a box stays text, though a
		// picture comes with it (cells copied from a spreadsheet carry a picture of themselves), unless the text is only
		// the picture's address, as a browser's Copy Image gives it.
		host.onpaste = e => {
			let data = e.clipboardData;
			let file = [...(data ? data.items : [])].find(i => i.kind == 'file' && i.type.startsWith('image/'));
			if (file == null || Types.of(draft.item).key != 'login')
				return;
			let text = data.getData('text/plain').trim();
			let address = /^(https?|data|blob):/i.test(text) && /<img\b/i.test(data.getData('text/html'));
			if ((e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA') && text != '' && ! address)
				return;
			e.preventDefault();
			readPicture(draft, file.getAsFile(), redraw);
		};
		setTimeout(show);
		return node;
	}

	// The item's files and those added here, each with its remove, and the button to add one. A file goes up when the
	// item is saved, with the rest of the edit, so Cancel leaves the item as it was.
	function attachmentRows(draft, host, folders, actions) {
		let item = draft.item;
		let redraw = () => render(host, draft, folders, actions);
		let row = (id, fileName, size, remove) => el('div', {class: 'attachment'}, [svg('paperclip'), el('span', {class: 'text', text: fileName}),
			el('span', {class: 'size', text: size == null ? t('loading') : formatSize(size)}),
			button(t('removeNamed', fileName), {icon: 'trash', iconOnly: true, cls: 'quiet', focus: 'remove:' + id, onclick: () => {
				remove();
				redraw();
				// the keyboard stays in the list, on Add attachment, rather than dropping to the page
				let add = host.querySelector('[data-focus="add-attachment"]');
				if (add && document.hasFocus())
					add.focus();
			}})]);
		let list = el('div', {class: 'attachments'});
		for (let a of item.attachments || [])
			list.append(row(a.id, a.fileName, a.size, () => {
				item.attachments = item.attachments.filter(x => x != a);
				draft.removedAttachments.push(a);
			}));
		let removeAdded = a => draft.addedAttachments = draft.addedAttachments.filter(x => x != a);
		// each added file knows its row in the form now shown, which goes when its read fails
		let addedRow = a => a.row = row(a.id, a.fileName, a.bytes == null ? null : a.size, () => removeAdded(a));
		for (let a of draft.addedAttachments)
			list.append(addedRow(a));
		// A picked file is listed at once and read meanwhile, which takes a while for a large one on a phone: Save turns
		// until every one is read, so none is left out, and the rest of the form stays free (a read that never ends is
		// left by removing the file, or with Cancel). Its row goes into the list as it is, so nothing that has the
		// keyboard is drawn again.
		let picker = el('input', {type: 'file', multiple: true, hidden: true, onchange: e => {
			// a chooser answered after the edit ended, or while it is being saved, adds nothing to it
			if (shown !== draft || ! host.querySelector('#e-name') || host.inert)
				return;
			// the form may have been drawn again while the chooser was open (a QR picture read): then it is drawn once
			// more to list them, rather than their rows going into a list no longer shown
			let here = list.isConnected;
			let tooBig = [];
			for (let file of [...e.target.files]) {
				if (file.size > MAX_ATTACHMENT) {
					tooBig.push(file.name);
					continue;
				}
				let a = {id: crypto.randomUUID(), fileName: file.name, size: file.size, bytes: null};
				file.arrayBuffer().then(b => {
					a.bytes = new Uint8Array(b);
					// its size in place of "Loading…"
					let size = a.row && a.row.querySelector('.size');
					if (size)
						size.textContent = formatSize(a.size);
					// a file let go meanwhile has no say over Save (it may be saving)
					if (draft.addedAttachments.includes(a))
						saveTurns(host, draft);
				}, () => {
					// only a file still wanted is told of; its row goes without the form being drawn again, which would
					// leave a dialog open over it (the generator) writing to the old one
					if (! draft.addedAttachments.includes(a))
						return;
					removeAdded(a);
					if (a.row && a.row.isConnected) {
						// the keyboard on its row stays in the list, on Add attachment
						let had = a.row.contains(document.activeElement);
						a.row.remove();
						let add = host.querySelector('[data-focus="add-attachment"]');
						if (had && add && document.hasFocus())
							add.focus();
					}
					leaveOut(t('couldNotRead', file.name));
					saveTurns(host, draft);
				});
				draft.addedAttachments.push(a);
				if (here)
					list.append(addedRow(a));
			}
			for (let name of tooBig)
				leaveOut(t('attachmentTooBig', name));
			if (here)
				saveTurns(host, draft);
			else
				redrawWhenFree(draft, redraw);
		}});
		let add = button(t('addAttachment'), {icon: 'plus', cls: 'add', focus: 'add-attachment', onclick: () => {
			picker.value = '';
			picker.click();
		}});
		// What the picks of this edit left out, one line each, under the list for as long as the edit lasts: the notice
		// (a status, which is read out) says it too, but one takes the place of the one before. Nothing takes the
		// keyboard from what is being typed.
		let leftOut = el('div', {class: 'hint bad left-out'}, draft.leftOut.map(l => el('div', {text: l})));
		let leaveOut = line => {
			// an edit that has ended isn't told about
			if (shown !== draft || ! host.querySelector('#e-name'))
				return;
			draft.leftOut.push(line);
			// the form may have been drawn again since this one: the line goes into the one shown
			let shownList = host.querySelector('.left-out');
			if (shownList)
				shownList.append(el('div', {text: line}));
			// lines a moment apart go in one notice, which is read out whole; one after another, only the last would be
			toNotice.push(line);
			clearTimeout(noticeTimer);
			noticeTimer = setTimeout(() => {
				notice(toNotice.join('\n'));
				toNotice = [];
			}, 50);
		};
		return el('div', {class: 'rows'}, [list, leftOut, add, picker]);
	}

	let toNotice = [], noticeTimer = null;

	// whether a file picked for this draft is still being read
	function reading(draft) {
		return draft.addedAttachments.some(a => a.bytes == null) || draft.picturesReading > 0;
	}

	// what Save waits for: 'files' (added files being read), 'picture' (a QR picture), or null
	function readingWhat(draft) {
		return draft.addedAttachments.some(a => a.bytes == null) ? 'files' : draft.picturesReading > 0 ? 'picture' : null;
	}

	// what each custom field held as text, checkbox and link during this edit (fieldHeld) - not part of the item
	const fieldHeld = new WeakMap();

	// After a row is removed, the keyboard goes to the Remove of the row now in its place, else to the list's Add: not
	// several controls on (perhaps another row's Remove), and never a text box, which would open a phone's keyboard.
	function keyboardAfterRemove(key, addKey) {
		if (! document.hasFocus())
			return;
		let next = document.querySelector('#detail [data-focus="' + CSS.escape(key) + '"]') || document.querySelector('#detail [data-focus="' + addKey + '"]');
		if (next)
			next.focus();
	}

	// Save turns while a picked file is read, and keeps the keyboard if it has it; while this draft's form is shown
	function saveTurns(host, draft) {
		let save = shown === draft ? host.querySelector('#e-save') : null;
		if (save)
			busy(save, reading(draft) ? t('loading') : null, true);
	}

	// Draws the form for a draft into host. actions: {save, cancel, remove}; folders: the vault's folders.
	function render(host, draft, folders, actions) {
		shown = draft;
		host.onpaste = null;
		let item = draft.item;
		let ty = Types.of(item);
		let inner = el('div', {class: 'detail-inner'});
		let typeName = t('type_' + ty.key);
		inner.append(el('div', {class: 'head'}, [
			button(t('cancel'), {icon: 'back', iconOnly: true, cls: 'quiet back', focus: 'back', onclick: actions.cancel}),
			el('span', {class: 'type big'}, [svg(ty.icon)]),
			el('div', {class: 'titles'}, [el('h2', {text: draft.isNew ? t('newOf', typeName) : t('editOf', typeName)})]),
		]));
		let form = el('form', {class: 'form', novalidate: true, onsubmit: e => {
			e.preventDefault();
			actions.save();
		}});
		form.append(field(t('name'), 'e-name', input({id: 'e-name', value: item.name || '', 'data-limit': Types.LIMIT.short, 'data-required': ''},
			v => item.name = v), {wide: true}));
		if (ty.key == 'unknown')
			form.append(el('div', {class: 'field wide'}, [el('div', {class: 'notice'}, [svg('note'), el('span', {text: t('unknownKept')})])]));
		for (let f of ty.fields)
			form.append(typeField(draft, f));
		if (ty.key == 'login') {
			form.append(totpField(draft, host, folders, actions));
			form.append(el('div', {class: 'field wide'}, [el('span', {class: 'label', text: t('websites')}), uriRows(draft)]));
		}
		form.append(el('div', {class: 'field wide'}, [el('span', {class: 'label', text: t('customFields')}), customRows(draft)]));
		form.append(field(t('folder'), 'e-folder', folderSelect(draft, folders)));
		let fav = el('input', {type: 'checkbox', id: 'e-fav', checked: !! item.favorite, onchange: e => {
			item.favorite = e.target.checked;
		}});
		form.append(el('div', {class: 'field'}, [el('span', {class: 'label', text: ' '}),
			el('label', {class: 'toggle-row', for: 'e-fav'}, [fav, el('span', {text: t('favourite')})])]));
		let notes = textArea({id: 'e-notes', rows: 5, 'data-limit': Types.LIMIT.notes}, v => setValue(item, 'notes', v));
		notes.value = item.notes || '';
		form.append(field(t('notes'), 'e-notes', notes, {wide: true, after: el('span', {class: 'counter', id: 'e-notes-count'})}));
		let passkeys = ty.key == 'login' ? (item.login.fido2Credentials || []) : [];
		for (let pk of passkeys)
			form.append(el('div', {class: 'field wide'}, [el('div', {class: 'notice'}, [svg('fingerprint'), el('span', {text: t('passkeyKept', pk.rpId || '')})])]));
		form.append(el('div', {class: 'field wide'}, [el('span', {class: 'label', text: t('attachments')}), attachmentRows(draft, host, folders, actions)]));
		let bar = el('div', {class: 'edit-actions'}, [
			draft.isNew ? null : button(t('delete'), {icon: 'trash', cls: 'danger', focus: 'delete', onclick: actions.remove}),
			el('span', {class: 'spacer'}),
			button(t('cancel'), {focus: 'cancel', onclick: actions.cancel}),
			el('button', {type: 'submit', class: 'primary', id: 'e-save', text: t('save')}),
		]);
		form.append(bar);
		// the fields scroll clear of the bar held at the bottom, however many rows its buttons take (two, in some
		// languages on a phone)
		let keepClear = new ResizeObserver(() => {
			if (! bar.isConnected) {
				keepClear.disconnect();
				return;
			}
			host.style.scrollPaddingBottom = bar.offsetHeight + 8 + 'px';
		});
		keepClear.observe(bar);
		inner.append(form);
		host.textContent = '';
		host.append(inner);
		saveTurns(host, draft);
		check(notes);
	}

	// Shows every problem and puts the cursor in the first; true if there are none
	function validate(draft, host) {
		let found = problems(host);
		for (let input of host.querySelectorAll('[data-limit], [data-required]')) {
			input.dataset.touched = '1';
			check(input);
		}
		if (found.length > 0) {
			let first = found[0].input;
			if (first.hidden && first.previousSibling)
				first.previousSibling.click();
			first.focus();
			return false;
		}
		return true;
	}

	return {start, isDirty, render, validate, askFolderName, reading, readingWhat};
})();
