// Reading and writing the files other password managers use: CSV (RFC 4180), zip archives and, below, Bitwarden's
// JSON and the CSV columns of Bitwarden and KeePassXC.
'use strict';

const Formats = (() => {

	// ------------------------------------------------------------ CSV, RFC 4180

	// Rows of fields. Quoted fields may hold commas, quotes ("" for one) and line breaks; a byte order mark is
	// dropped; CRLF and LF both end a row; a last empty line is not a row.
	function parseCsv(text) {
		if (text.charCodeAt(0) == 0xfeff)
			text = text.substring(1);
		let rows = [], row = [], field = '', i = 0, quoted = false, fieldStarted = false;
		while (i < text.length) {
			let c = text[i];
			if (quoted) {
				if (c == '"') {
					if (text[i + 1] == '"') {
						field += '"';
						i += 2;
						continue;
					}
					quoted = false;
					i++;
					continue;
				}
				field += c;
				i++;
				continue;
			}
			if (c == '"' && ! fieldStarted) {
				quoted = true;
				fieldStarted = true;
				i++;
			} else if (c == ',') {
				row.push(field);
				field = '';
				fieldStarted = false;
				i++;
			} else if (c == '\r' || c == '\n') {
				row.push(field);
				rows.push(row);
				row = [];
				field = '';
				fieldStarted = false;
				i += c == '\r' && text[i + 1] == '\n' ? 2 : 1;
			} else {
				field += c;
				fieldStarted = true;
				i++;
			}
		}
		if (fieldStarted || field != '' || row.length > 0) {
			row.push(field);
			rows.push(row);
		}
		return rows.filter(r => ! (r.length == 1 && r[0] == ''));
	}

	// ------------------------------------------------------------ zip archives

	const CRC_TABLE = (() => {
		let table = new Uint32Array(256);
		for (let n = 0; n < 256; n++) {
			let c = n;
			for (let k = 0; k < 8; k++)
				c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
			table[n] = c >>> 0;
		}
		return table;
	})();

	function crc32(bytes) {
		let c = 0xffffffff;
		for (let i = 0; i < bytes.length; i++)
			c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
		return (c ^ 0xffffffff) >>> 0;
	}

	// Null once the output passes limit, the size the archive gives: a small entry that inflates to gigabytes
	// (a zip bomb) is stopped there rather than filling the tab's memory
	async function inflateRaw(bytes, limit) {
		let reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
		let chunks = [], total = 0;
		for (let r = await reader.read(); ! r.done; r = await reader.read()) {
			total += r.value.length;
			if (total > limit) {
				reader.cancel();
				return null;
			}
			chunks.push(r.value);
		}
		return new Uint8Array(await new Blob(chunks).arrayBuffer());
	}

	// what a .zip may unpack to in all, beyond its own size: Bitwarden's largest attachment is 500 MB. A zip that unpacks
	// to no more than it holds (this app's own, which stores its files) is read whatever its size
	const MAX_UNZIPPED = 512 * 1024 * 1024;

	// The files in a zip, as [{name, bytes}], folders left out. Reads the central directory (APPNOTE 4.3.12), so
	// the sizes are right even where a local header defers them to a data descriptor. Stored and deflated entries
	// only; an encrypted archive or entry is refused, as is ZIP64, which a password export never needs.
	async function readZip(buffer) {
		let bytes = new Uint8Array(buffer);
		let view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
		let eocd = -1;
		for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
			if (view.getUint32(i, true) == 0x06054b50) {
				eocd = i;
				break;
			}
		}
		if (eocd < 0)
			throw new Error(t('notAZip'));
		let count = view.getUint16(eocd + 10, true);
		let offset = view.getUint32(eocd + 16, true);
		if (count == 0xffff || offset == 0xffffffff)
			throw new Error(t('zipTooBig'));
		let utf8 = new TextDecoder();
		let files = [];
		let total = 0;
		for (let n = 0; n < count; n++) {
			if (view.getUint32(offset, true) != 0x02014b50)
				throw new Error(t('notAZip'));
			let flags = view.getUint16(offset + 8, true);
			let method = view.getUint16(offset + 10, true);
			let crc = view.getUint32(offset + 16, true);
			let compressed = view.getUint32(offset + 20, true);
			let size = view.getUint32(offset + 24, true);
			let nameLength = view.getUint16(offset + 28, true);
			let extraLength = view.getUint16(offset + 30, true);
			let commentLength = view.getUint16(offset + 32, true);
			let local = view.getUint32(offset + 42, true);
			// names are UTF-8 when bit 11 says so; Bitwarden and every current tool write them that way
			let name = utf8.decode(bytes.subarray(offset + 46, offset + 46 + nameLength));
			offset += 46 + nameLength + extraLength + commentLength;
			if (name.endsWith('/'))
				continue;
			if (flags & 1)
				throw new Error(t('zipEncrypted'));
			total += size;
			if (total > MAX_UNZIPPED && total > bytes.length)
				throw new Error(t('zipTooBig'));
			if (view.getUint32(local, true) != 0x04034b50)
				throw new Error(t('notAZip'));
			let start = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
			let raw = bytes.subarray(start, start + compressed);
			let data;
			if (method == 0)
				data = raw.slice();
			else if (method == 8)
				// a damaged stream says so in the app's words, not the browser's
				data = await inflateRaw(raw, size).catch(() => null);
			else
				throw new Error(t('zipMethod', method));
			if (data == null || data.length != size || crc32(data) != crc)
				throw new Error(t('zipDamaged', name));
			files.push({name: name, bytes: data});
		}
		return files;
	}

	// A zip of the given files, stored without compression: what goes in is mostly encrypted-looking attachment
	// data and a JSON file, and storing keeps the writer small. Names are marked UTF-8 (general purpose bit 11).
	function writeZip(files) {
		let encoder = new TextEncoder();
		let parts = [], central = [], offset = 0;
		let now = new Date();
		let time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
		let date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
		for (let f of files) {
			let name = encoder.encode(f.name);
			let crc = crc32(f.bytes);
			let local = new DataView(new ArrayBuffer(30));
			local.setUint32(0, 0x04034b50, true);
			local.setUint16(4, 20, true);
			local.setUint16(6, 0x0800, true);
			local.setUint16(8, 0, true);
			local.setUint16(10, time, true);
			local.setUint16(12, date, true);
			local.setUint32(14, crc, true);
			local.setUint32(18, f.bytes.length, true);
			local.setUint32(22, f.bytes.length, true);
			local.setUint16(26, name.length, true);
			local.setUint16(28, 0, true);
			parts.push(new Uint8Array(local.buffer), name, f.bytes);
			let entry = new DataView(new ArrayBuffer(46));
			entry.setUint32(0, 0x02014b50, true);
			entry.setUint16(4, 20, true);
			entry.setUint16(6, 20, true);
			entry.setUint16(8, 0x0800, true);
			entry.setUint16(10, 0, true);
			entry.setUint16(12, time, true);
			entry.setUint16(14, date, true);
			entry.setUint32(16, crc, true);
			entry.setUint32(20, f.bytes.length, true);
			entry.setUint32(24, f.bytes.length, true);
			entry.setUint16(28, name.length, true);
			entry.setUint32(42, offset, true);
			central.push(new Uint8Array(entry.buffer), name);
			offset += 30 + name.length + f.bytes.length;
		}
		let centralSize = central.reduce((s, p) => s + p.length, 0);
		// past these a zip needs ZIP64, which this writer doesn't write: refused rather than written wrong
		if (files.length > 0xffff || offset + centralSize > 0xffffffff)
			throw new Error(t('exportTooBig'));
		let end = new DataView(new ArrayBuffer(22));
		end.setUint32(0, 0x06054b50, true);
		end.setUint16(8, files.length, true);
		end.setUint16(10, files.length, true);
		end.setUint32(12, centralSize, true);
		end.setUint32(16, offset, true);
		let all = parts.concat(central, [new Uint8Array(end.buffer)]);
		let out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
		let at = 0;
		for (let p of all) {
			out.set(p, at);
			at += p.length;
		}
		return out;
	}

	// ------------------------------------------------------------ Bitwarden JSON

	// What an import brings: folders by id, collections by id, items, and attachments {itemId, fileName, bytes}
	// that point at items by the id they have in the file. Folders from a CSV come as names (folderName on items).
	function emptyIncoming() {
		return {folders: [], collections: [], items: [], attachments: [], unmatched: [], missing: []};
	}

	// Bitwarden's plain JSON export, individual or organisation. Absent and null are the same throughout, and
	// every key is kept, the ones this app doesn't know included.
	function readBitwardenJson(text) {
		let doc;
		try {
			doc = JSON.parse(text.charCodeAt(0) == 0xfeff ? text.substring(1) : text);
		} catch (e) {
			throw new Error(t('notBitwarden'));
		}
		// a password-protected export has no items, only its encrypted data, so it is told apart first
		if (doc != null && doc.encrypted === true)
			throw new Error(doc.passwordProtected ? t('protectedUnsupported') : t('accountEncryptedExport'));
		if (doc == null || typeof doc != 'object' || ! Array.isArray(doc.items))
			throw new Error(t('notBitwarden'));
		let incoming = emptyIncoming();
		incoming.folders = (doc.folders || []).filter(f => f && f.id != null && typeof f.name == 'string');
		incoming.collections = (doc.collections || doc[KEPT_COLLECTIONS] || []).filter(c => c && c.id != null);
		incoming.items = doc.items.filter(wellFormed);
		let dropped = doc.items.filter(i => ! wellFormed(i));
		incoming.dropped = dropped.length;
		incoming.droppedNames = dropped.map(i => i != null && typeof i.name == 'string' && i.name.trim() ? i.name : null).filter(Boolean);
		return incoming;
	}

	// Bitwarden reads a file's collections and then ignores its folders, so this app's export of a vault that has both
	// gives Bitwarden the folders and keeps the collections under a name Bitwarden doesn't read, for this app to read
	const KEPT_COLLECTIONS = 'peergosCollections';

	// An item is taken only if its parts are of the kinds Bitwarden writes, as the app reads them so: a name that
	// isn't text, or a list that isn't one, would stop the whole list showing; an id that isn't text could match
	// another item's
	function wellFormed(i) {
		let list = v => v == null || Array.isArray(v) && v.every(x => x != null && typeof x == 'object');
		let ty = i && Types.byType(i.type);
		let data = ty ? i[ty.key] : null;
		return i != null && typeof i == 'object' && typeof i.type == 'number' && (i.id == null || typeof i.id == 'string')
			&& (i.name == null || typeof i.name == 'string') && list(i.fields) && list(i.passwordHistory)
			&& (i.collectionIds == null || Array.isArray(i.collectionIds))
			&& (data == null || typeof data == 'object' && (ty.key != 'login' || list(data.uris) && list(data.fido2Credentials)));
	}

	// Bitwarden writes an attachment's folder and file names like this (individual-vault-export.service.ts), so
	// the same rules find which item a folder in its .zip belongs to
	function sanitizeFolder(name) {
		return String(name).replace(/[/\\><:"|?*]/g, '_').replace(/__+/g, '_');
	}

	function sanitizeFile(fileName) {
		let parts = fileName.split('.');
		let base = fileName, suffix = '';
		if (parts.length > 1) {
			base = parts.slice(0, -1).join('');
			suffix = '.' + parts[parts.length - 1];
		}
		return base.replace(/[/\\><:"|?*.]/g, '_').replace(/__+/g, '_') + suffix;
	}

	// The file this app writes beside data.json in its own .zip, saying which item each attachment belongs to.
	// Bitwarden ignores it; without it, items are found by name as Bitwarden named their folders.
	const MANIFEST = 'peergos-passwords.json';

	async function readBitwardenZip(buffer) {
		let files = await readZip(buffer);
		let data = files.find(f => f.name == 'data.json');
		if (data == null)
			throw new Error(t('noDataJson'));
		let incoming = readBitwardenJson(utf8(data.bytes));
		// an item with no id, or with one another item has too, gets one of its own, so that no file goes to the wrong
		// item: one listed for such an id can't be told whose it is, and is kept in the note with the others
		let ids = new Map();
		for (let item of incoming.items)
			ids.set(item.id, (ids.get(item.id) || 0) + 1);
		for (let item of incoming.items)
			if (item.id == null || ids.get(item.id) > 1)
				item.id = crypto.randomUUID();
		let manifest = files.find(f => f.name == MANIFEST);
		let byPath = new Map();
		if (manifest != null) {
			try {
				for (let a of JSON.parse(new TextDecoder().decode(manifest.bytes)).attachments || [])
					byPath.set(a.path, a);
			} catch (e) {}
		}
		// Bitwarden names an item's folder after the item. When names repeat it adds _1, _2, counting only items
		// that have attachments, which data.json doesn't say - so a folder is only matched to an item whose name no
		// other item shares, and anything else is kept apart rather than guessed.
		let byName = new Map();
		for (let item of incoming.items) {
			let folder = sanitizeFolder(item.name || '');
			byName.set(folder, (byName.get(folder) || []).concat([item]));
		}
		let itemForFolder = folder => {
			let numbered = folder.match(/^(.*)_(\d+)$/);
			if (numbered && (byName.get(numbered[1]) || []).length > 1)
				return null;
			let candidates = byName.get(folder) || [];
			return candidates.length == 1 ? candidates[0] : null;
		};
		// a file the manifest lists that the zip doesn't hold: the zip was changed or cut short, and the user is told which
		let present = new Set(files.map(f => f.name.includes('/') ? f.name : f.name.replace(/\\/g, '/')));
		incoming.missing = [...byPath.values()].filter(a => ! present.has(a.path)).map(a => typeof a.fileName == 'string' && a.fileName ? a.fileName : String(a.path));
		// every file but data.json and the manifest comes in: on its item when it can be told whose it is, otherwise in
		// the note for files no item could be found for
		for (let f of files) {
			// macOS' own re-zip adds a copy of each file's Finder metadata under __MACOSX/, which isn't the file
			if (f.name == 'data.json' || f.name == MANIFEST || f.name.startsWith('__MACOSX/'))
				continue;
			// a re-zip that puts \ between folders (Windows PowerShell 5.1's Compress-Archive) is read the same way
			let path = f.name.includes('/') ? f.name : f.name.replace(/\\/g, '/');
			let rest = path.startsWith('attachments/') ? path.substring('attachments/'.length) : null;
			let slash = rest == null ? -1 : rest.indexOf('/');
			let listed = byPath.get(path) || byPath.get(f.name);
			let fileName = listed && typeof listed.fileName == 'string' && listed.fileName ? listed.fileName : path.split('/').pop() || path;
			let item = listed ? incoming.items.find(i => i.id === listed.itemId) : null;
			if (item == null && ! listed && slash > 0)
				item = itemForFolder(rest.substring(0, slash));
			if (item == null)
				incoming.unmatched.push({path: f.name, fileName: fileName, bytes: f.bytes});
			else
				incoming.attachments.push({itemId: item.id, fileName: fileName, bytes: f.bytes});
		}
		return incoming;
	}

	// Text an import holds is UTF-8, as Bitwarden, KeePassXC and Aegis write it. Anything else is refused rather than
	// read with its letters changed: a CSV re-saved by Excel is in the computer's own code page.
	function utf8(bytes) {
		try {
			return new TextDecoder('utf-8', {fatal: true}).decode(bytes);
		} catch (e) {
			throw new Error(t('notUtf8'));
		}
	}

	// ------------------------------------------------------------ CSV from Bitwarden or KeePassXC

	function rowsToObjects(rows) {
		let header = rows[0].map(h => h.trim());
		return rows.slice(1).map(r => {
			let o = {};
			header.forEach((h, i) => o[h] = r[i] == null ? '' : r[i]);
			return o;
		});
	}

	function isoOrNull(text) {
		if (! text)
			return null;
		let d = new Date(text);
		return isNaN(d.getTime()) ? null : d.toISOString();
	}

	function csvItem(type, name, now) {
		return Object.assign(Types.blank(type), {name: name, creationDate: now, revisionDate: now});
	}

	function setIf(o, key, value) {
		if (value != null && value !== '')
			o[key] = value;
	}

	// Bitwarden's CSV, read as its own importer reads it (bitwarden-csv-importer.ts): "note" is a secure note and
	// anything else a login; fields are "name: value" lines, all text; URIs are comma separated.
	function bitwardenCsvItems(objects) {
		let now = new Date().toISOString();
		let items = [];
		for (let o of objects) {
			let type = (o.type || '').trim().toLowerCase() == 'note' ? 2 : 1;
			let item = csvItem(type, o.name || '', now);
			setIf(item, 'notes', o.notes);
			item.favorite = (o.favorite || '') != '' && o.favorite != '0';
			item.reprompt = parseInt(o.reprompt, 10) == 1 ? 1 : 0;
			setIf(item, 'archivedDate', isoOrNull(o.archivedDate));
			// Bitwarden joins its "name: value" lines with \n and writes a value of several lines as it is, so a line
			// without ": " goes on the value before it (its own importer leaves such lines out)
			let field = null;
			for (let line of (o.fields || '').split(/\r?\n/)) {
				let at = line.lastIndexOf(': ');
				if (at < 0 && field != null) {
					field.value += '\n' + line;
					continue;
				}
				if (at < 0 && line.trim() == '')
					continue;
				field = at < 0 ? {name: '', value: line, type: 0} : {name: line.substring(0, at), value: line.substring(at + 2), type: 0};
				item.fields.push(field);
			}
			let folder = o.folder != null ? o.folder : (o.collections || '').split(',')[0];
			folder = (folder || '').replace(/\\/g, '/').replace(/^\/+/, '').trim();
			if (folder)
				item.folderName = folder;
			if (type == 1) {
				let uris = o.login_uri != null ? o.login_uri : o.uri;
				for (let uri of uris ? parseCsv(uris)[0] || [] : [])
					if (uri.trim())
						item.login.uris.push({uri: uri.trim()});
				setIf(item.login, 'username', o.login_username != null ? o.login_username : o.username);
				setIf(item.login, 'password', o.login_password != null ? o.login_password : o.password);
				setIf(item.login, 'totp', o.login_totp != null ? o.login_totp : o.totp);
			}
			items.push(item);
		}
		return items;
	}

	// KeePassXC's CSV (CsvExporter.cpp): Group is the whole path from its root group, whose own name is left off
	function keepassCsvItems(objects) {
		let now = new Date().toISOString();
		return objects.map(o => {
			let item = csvItem(1, o.Title || '', now);
			setIf(item.login, 'username', o.Username);
			setIf(item.login, 'password', o.Password);
			setIf(item.login, 'totp', o.TOTP ? storedCode(o.TOTP) || o.TOTP : '');
			if (o.URL)
				item.login.uris.push({uri: o.URL});
			setIf(item, 'notes', o.Notes);
			item.creationDate = isoOrNull(o.Created) || now;
			item.revisionDate = isoOrNull(o['Last Modified']) || now;
			let folder = (o.Group || '').split('/').slice(1).join('/');
			if (folder)
				item.folderName = folder;
			return item;
		});
	}

	function readCsvFile(text) {
		let rows = parseCsv(text);
		if (rows.length == 0)
			throw new Error(t('csvEmpty'));
		let header = rows[0].map(h => h.trim());
		let incoming = emptyIncoming();
		// a row with more values than the header has names for: those can't be put anywhere, and the user is told
		incoming.extraCells = rows.slice(1).filter(r => r.slice(header.length).some(c => c != null && c !== '')).length;
		if (header.includes('Title') && header.includes('Password') && header.includes('Group'))
			incoming.items = keepassCsvItems(rowsToObjects(rows));
		// Bitwarden's own CSVs always have type and notes; a browser's, LastPass' or NordPass' (name, url, password, note
		// or extra, NordPass' with a type) would lose its websites and notes here, so it isn't taken for one
		else if (header.includes('name') && (header.includes('login_password') || header.includes('type') && header.includes('notes')))
			incoming.items = bitwardenCsvItems(rowsToObjects(rows));
		else
			throw new Error(t('csvUnknown'));
		return incoming;
	}

	// ------------------------------------------------------------ one-time code lists

	// What a scanned or listed otpauth:// link is stored as, the way Bitwarden keeps it: the link itself, or for a
	// Steam code (Aegis writes otpauth://steam/) Bitwarden's steam://<key>, so the codes come out right. Null for
	// anything that isn't a time-based code: counter-based (hotp) codes aren't supported.
	function storedCode(link) {
		let text = String(link).trim();
		let steam = text.match(/^otpauth:\/\/steam\/[^?]*\?(.*)$/i);
		if (steam) {
			let secret = new URLSearchParams(steam[1]).get('secret');
			return secret && Totp.base32Decode(secret) ? 'steam://' + secret.toUpperCase().replace(/[\s=-]/g, '') : null;
		}
		if (! /^otpauth:\/\/totp\//i.test(text))
			return null;
		let p = Totp.parse(text);
		if (p == null)
			return null;
		// KeePassXC writes a Steam key as a totp link with encoder=steam, which Bitwarden would read as a plain code
		return p.steam ? 'steam://' + Totp.base32Encode(p.secret) : text;
	}

	// the issuer and account an otpauth:// link names, from its "Issuer:account" label and issuer parameter
	function labelOf(link) {
		try {
			let url = new URL(link);
			// Key URI Format: "issuer:account", each part URL-encoded, so a ":" in a name is %3A; the colon between them
			// may be encoded too, which is taken only when there is no plain one
			let label = url.pathname.replace(/^\/+/, '');
			let colon = label.indexOf(':');
			let sep = 1;
			if (colon < 0) {
				colon = label.toUpperCase().indexOf('%3A');
				sep = 3;
			}
			let decode = s => {
				try {
					return decodeURIComponent(s);
				} catch (e) {
					return s;
				}
			};
			let issuer = url.searchParams.get('issuer') || (colon >= 0 ? decode(label.substring(0, colon)) : '');
			return {issuer: issuer.trim(), account: decode(colon >= 0 ? label.substring(colon + sep) : label).trim()};
		} catch (e) {
			return {issuer: '', account: ''};
		}
	}

	// A list of otpauth:// links, one a line, as Aegis and other authenticator apps export and import. Each becomes
	// a login holding only its code, named after the code's issuer.
	function readCodesList(text) {
		let incoming = emptyIncoming();
		incoming.unreadable = 0;
		incoming.migration = 0;
		let now = new Date().toISOString();
		for (let line of text.split(/\r\n|\r|\n/)) {
			line = line.trim();
			if (line == '')
				continue;
			let code = storedCode(line);
			let label = null;
			// a Steam code as Bitwarden itself keeps one
			let steam = code == null && /^steam:\/\//i.test(line) ? Totp.parse(line) : null;
			if (steam != null) {
				code = 'steam://' + Totp.base32Encode(steam.secret);
				label = {issuer: 'Steam', account: ''};
			}
			if (code == null) {
				// Google Authenticator's export packs several codes in one line, which this app can't read yet
				if (/^otpauth-migration:/i.test(line))
					incoming.migration++;
				else
					incoming.unreadable++;
				continue;
			}
			label = label || labelOf(line);
			let item = csvItem(1, label.issuer || label.account || t('oneTimeCode'), now);
			if (label.account)
				item.login.username = label.account;
			item.login.totp = code;
			incoming.items.push(item);
		}
		return incoming;
	}

	// The one-time codes of a vault as a list of otpauth:// links, for Aegis and other authenticator apps. A bare key
	// becomes a link named after its item; a Steam key is written as Aegis writes one.
	function codesList(vault) {
		let lines = [];
		for (let item of vault.items) {
			let login = item.type == 1 && item.login ? item.login : null;
			if (login == null || ! login.totp)
				continue;
			let p = Totp.parse(login.totp);
			if (p == null)
				continue;
			if (p.steam) {
				let label = encodeURIComponent('Steam') + ':' + encodeURIComponent(login.username || item.name || 'account');
				lines.push('otpauth://steam/' + label + '?secret=' + Totp.base32Encode(p.secret) + '&digits=5&issuer=Steam');
			} else {
				lines.push(Totp.toUri(login.totp, item.name, login.username));
			}
		}
		return lines.join('\n') + (lines.length ? '\n' : '');
	}

	// ------------------------------------------------------------ adding an import to the vault

	// the parts of an item that aren't its type's own, as Bitwarden's export writes them (CipherWithIdExport), and the
	// list of attachments this app keeps on an item
	const SHARED = new Set(['id', 'type', 'folderId', 'organizationId', 'collectionIds', 'name', 'notes', 'favorite', 'fields',
		'reprompt', 'passwordHistory', 'revisionDate', 'creationDate', 'deletedDate', 'archivedDate', 'key', 'attachments']);

	// What makes two items the same: their type and what they hold, earlier passwords and the re-prompt setting
	// included, so a copy that holds more than the item here isn't skipped. Ids, dates, folders and favourites are
	// left out, and absent, null, "", 0 for re-prompt and [] count as one.
	function fingerprint(item) {
		let clean = value => {
			if (value == null || value === '')
				return undefined;
			if (Array.isArray(value)) {
				let a = value.map(clean).filter(v => v !== undefined);
				return a.length ? a : undefined;
			}
			if (typeof value == 'object') {
				let o = {};
				for (let k of Object.keys(value).sort()) {
					let v = clean(value[k]);
					if (v !== undefined)
						o[k] = v;
				}
				return Object.keys(o).length ? o : undefined;
			}
			return value;
		};
		let ty = Types.of(item);
		// for a type this app doesn't know, every part that isn't shared: two passports of one name aren't one
		let data = ty.key != 'unknown' ? item[ty.key] : Object.fromEntries(Object.entries(item).filter(([k]) => ! SHARED.has(k)));
		return JSON.stringify(clean({type: item.type, name: item.name, notes: item.notes, fields: item.fields, data: data,
			history: item.passwordHistory, reprompt: item.reprompt || null}));
	}

	// Adds what an import brings to a vault, changing nothing already there: an item the vault already holds is
	// skipped, a folder of the same name is reused, and anything whose id is taken gets a new one. Returns what was
	// done, with the attachments to write under the ids their items got.
	function addToVault(vault, incoming) {
		let result = {added: 0, skipped: 0, folders: 0, attachments: []};
		let folderIds = new Map();
		// of two folders of one name here, the first is the one reused, as the list shows it first
		let folderByName = new Map();
		for (let f of vault.folders)
			if (! folderByName.has(f.name))
				folderByName.set(f.name, f);
		let takenFolderIds = new Set(vault.folders.map(f => f.id));
		let folderFor = name => {
			let f = folderByName.get(name);
			if (f == null) {
				f = {id: crypto.randomUUID(), name: name};
				vault.folders.push(f);
				folderByName.set(name, f);
				takenFolderIds.add(f.id);
				result.folders++;
			}
			return f.id;
		};
		for (let f of incoming.folders) {
			// the very folder when it is still here (a backup put back), else the first of its name
			let existing = vault.folders.find(x => x.id === f.id && x.name === f.name) || folderByName.get(f.name);
			if (existing != null) {
				folderIds.set(f.id, existing.id);
				continue;
			}
			let copy = Object.assign({}, f);
			if (takenFolderIds.has(copy.id))
				copy.id = crypto.randomUUID();
			// only the vault's own folders are reused by name: two of one name in the file stay two, as in Bitwarden
			vault.folders.push(copy);
			takenFolderIds.add(copy.id);
			folderIds.set(f.id, copy.id);
			result.folders++;
		}
		if (incoming.collections.length > 0) {
			vault.collections = vault.collections || [];
			let have = new Set(vault.collections.map(c => c.id));
			for (let c of incoming.collections)
				if (! have.has(c.id))
					vault.collections.push(c);
		}
		let known = new Map();
		for (let i of vault.items) {
			let f = fingerprint(i);
			if (! known.has(f))
				known.set(f, i);
		}
		let takenIds = new Set(vault.items.map(i => i.id));
		let newIds = new Map();
		for (let original of incoming.items) {
			let same = known.get(fingerprint(original));
			if (same != null) {
				result.skipped++;
				// the item is here already, but files it brings that this one lacks are still added to it below
				newIds.set(original.id, same.id);
				continue;
			}
			let item = JSON.parse(JSON.stringify(original));
			if (item.id == null || takenIds.has(item.id))
				item.id = crypto.randomUUID();
			takenIds.add(item.id);
			newIds.set(original.id, item.id);
			if (item.folderName != null) {
				item.folderId = folderFor(item.folderName);
				delete item.folderName;
			} else if (item.folderId != null) {
				item.folderId = folderIds.has(item.folderId) ? folderIds.get(item.folderId) : null;
			}
			// attachments are this vault's own files, so only those the import brings belong to the item
			delete item.attachments;
			vault.items.push(item);
			result.added++;
		}
		// the input stays as it came: a change is applied again when its write is refused
		let unmatched = incoming.unmatched.slice();
		for (let a of incoming.attachments) {
			let itemId = newIds.get(a.itemId);
			if (itemId == null) {
				unmatched.push({path: a.fileName, fileName: a.fileName, bytes: a.bytes});
				continue;
			}
			// one this import brings twice is the same only if its bytes are, as two files of one name can be; a file of
			// the same name and size as files the item lists is compared with each of them before it is written (check),
			// and is written unless one has its bytes
			let listed = (vault.items.find(i => i.id === itemId).attachments || []).filter(x => x.fileName == a.fileName && x.size == a.bytes.length);
			let twice = result.attachments.some(r => r.itemId === itemId && r.fileName == a.fileName && sameBytes(r.bytes, a.bytes));
			if (! twice)
				result.attachments.push({itemId: itemId, id: crypto.randomUUID(), fileName: a.fileName, bytes: a.bytes, check: listed.length ? listed.map(x => x.id) : null});
		}
		// attachments no item could be found for are kept in a note of their own, so nothing is dropped. The note
		// lists each file with its CRC-32, so the same files imported again make the same note, which is skipped.
		let files = unmatched.map(u => u.path + '  ' + crc32(u.bytes).toString(16).padStart(8, '0'));
		let notes = t('unmatchedNotes') + '\n\n' + files.join('\n');
		// within Bitwarden's length for notes: the files are on the note as attachments, the list only names them
		if (Types.utf8Length(notes) > Types.LIMIT.notes) {
			let kept = [];
			let text = more => t('unmatchedNotes') + '\n\n' + kept.join('\n') + '\n' + t('andMore', more);
			while (kept.length < files.length && Types.utf8Length(text(files.length - kept.length) + '\n' + files[kept.length]) <= Types.LIMIT.notes)
				kept.push(files[kept.length]);
			notes = text(files.length - kept.length);
		}
		let note = unmatched.length > 0 ? known.get(fingerprint({type: 2, name: t('unmatchedName'), notes: notes, secureNote: {type: 0}})) : null;
		if (note != null)
			result.skipped++;
		else if (unmatched.length > 0) {
			note = Object.assign(Types.blank(2), {name: t('unmatchedName'), notes: notes});
			vault.items.push(note);
			result.added++;
		}
		// the files the note doesn't list yet, as for any other item: one an import cut short is added again
		for (let u of note ? unmatched : []) {
			let listed = (note.attachments || []).filter(x => x.fileName == u.fileName && x.size == u.bytes.length);
			result.attachments.push({itemId: note.id, id: crypto.randomUUID(), fileName: u.fileName, bytes: u.bytes, check: listed.length ? listed.map(x => x.id) : null});
		}
		result.unmatched = unmatched.length;
		return result;
	}

	// The files an import brought, listed on their items once written: an item never lists a file that isn't there, so
	// an import cut short leaves its items without them, and the same file imported again adds what is missing
	// Returns those listed now, this time or by a try reported as failed that landed: not one whose item has gone.
	function listAttachments(vault, written) {
		let listed = [];
		for (let a of written) {
			let item = vault.items.find(i => i.id == a.itemId);
			if (item == null)
				continue;
			if (! (item.attachments || []).some(x => x.id == a.id))
				item.attachments = (item.attachments || []).concat([{id: a.id, fileName: a.fileName, size: a.bytes.length}]);
			listed.push(a);
		}
		return listed;
	}

	// a plain loop: every() with a function per byte takes seconds on a large file
	function sameBytes(x, y) {
		if (x.length != y.length)
			return false;
		for (let i = 0; i < x.length; i++)
			if (x[i] !== y[i])
				return false;
		return true;
	}

	// ------------------------------------------------------------ export

	// The vault as Bitwarden's plain JSON export: folders, or for organisation data with no folders its collections
	// (Bitwarden ignores folders in a file that has collections, so a vault with both keeps its collections where
	// only this app reads them), and every item as it is, without this app's own list of attachments
	function bitwardenDoc(vault) {
		let doc = {encrypted: false};
		let collections = vault.collections && vault.collections.length > 0 ? vault.collections : null;
		if (vault.folders.length == 0 && collections)
			doc.collections = collections;
		else {
			doc.folders = vault.folders.map(f => Object.assign({}, f));
			if (collections)
				doc[KEPT_COLLECTIONS] = collections;
		}
		doc.items = vault.items.map(i => {
			let copy = Object.assign({}, i);
			delete copy.attachments;
			return copy;
		});
		return doc;
	}

	function bitwardenJson(vault) {
		return JSON.stringify(bitwardenDoc(vault), null, 2);
	}

	// The vault and its attachments as Bitwarden's own .zip lays them out: data.json, then
	// attachments/<item name>/<file>, named by Bitwarden's rules, plus this app's manifest of which file is whose
	async function bitwardenZip(vault, readAttachment) {
		let doc = bitwardenDoc(vault);
		let files = [{name: 'data.json', bytes: new TextEncoder().encode(JSON.stringify(doc, null, 2))}];
		let manifest = [];
		let skipped = [];
		let seen = new Map();
		let paths = new Set();
		for (let item of vault.items) {
			let list = item.attachments || [];
			if (list.length == 0)
				continue;
			// an item with no name still gets a folder of its own
			let folder = sanitizeFolder(item.name || '') || '_';
			let n = seen.get(item.name);
			seen.set(item.name, n == null ? 1 : n + 1);
			if (n != null)
				folder += '_' + n;
			let names = new Map();
			for (let a of list) {
				let full = sanitizeFile(a.fileName);
				let c = names.get(full);
				names.set(full, c == null ? 1 : c + 1);
				if (c != null) {
					let dot = full.lastIndexOf('.');
					full = dot > 0 ? full.substring(0, dot) + '_' + c + full.substring(dot) : full + '_' + c;
				}
				let path = 'attachments/' + folder + '/' + full;
				// where Bitwarden would write two files at one path and lose one, the second gets a number
				for (let k = 1; paths.has(path); k++)
					path = 'attachments/' + folder + '/' + k + '_' + full;
				paths.add(path);
				let bytes;
				try {
					bytes = await readAttachment(item.id, a.id, a.size);
				} catch (e) {
					skipped.push({item: item, fileName: a.fileName});
					continue;
				}
				files.push({name: path, bytes: bytes});
				manifest.push({path: path, itemId: item.id, fileName: a.fileName});
			}
		}
		files.splice(1, 0, {name: MANIFEST, bytes: new TextEncoder().encode(JSON.stringify({version: 1, attachments: manifest}, null, 2))});
		return {bytes: writeZip(files), skipped: skipped};
	}

	// The logins whose one-time code a list of otpauth:// links can't hold: a key this app can't read, such as a
	// counter-based (hotp) one
	function codesLeftOut(vault) {
		return vault.items.filter(i => i.type == 1 && i.login && i.login.totp && Totp.parse(i.login.totp) == null);
	}

	// What Bitwarden would do with this vault's export that the user should know first: its server refuses a whole
	// import when one value is longer than it takes (EncryptedStringLength on its request models, as Types.LIMIT
	// works out, notes 10,000 like URIs), its importer one with an SSH key without a private key, and it keeps only an
	// item's 5 latest earlier passwords (its PasswordHistory limit). Items of types this app doesn't know aren't checked.
	function bitwardenProblems(vault) {
		let over = (v, limit) => typeof v == 'string' && Types.utf8Length(v) > limit;
		let out = {tooLong: [], noPrivateKey: [], longHistory: []};
		for (let item of vault.items) {
			let ty = Types.of(item);
			let d = item[ty.key] && typeof item[ty.key] == 'object' ? item[ty.key] : {};
			if (over(item.name, Types.LIMIT.short) || over(item.notes, Types.LIMIT.uri)
					|| ty.fields.some(f => over(d[f.name], f.limit))
					|| (item.fields || []).some(f => f && (over(f.name, Types.LIMIT.short) || over(f.value, Types.LIMIT.long)))
					|| (item.passwordHistory || []).some(h => h && over(h.password, Types.LIMIT.long))
					|| ty.key == 'login' && (over(d.totp, Types.LIMIT.short) || (d.uris || []).some(u => u && over(u.uri, Types.LIMIT.uri))))
				out.tooLong.push(item);
			if (ty.key == 'sshKey' && ! d.privateKey)
				out.noPrivateKey.push(item);
			if ((item.passwordHistory || []).length > 5)
				out.longHistory.push(item);
		}
		out.longFolders = vault.folders.filter(f => over(f.name, Types.LIMIT.short));
		return out;
	}

	return {parseCsv, crc32, readZip, writeZip, readBitwardenJson, readBitwardenZip, readCsvFile, fingerprint, addToVault, listAttachments,
		bitwardenJson, bitwardenZip, storedCode, labelOf, readCodesList, codesList, codesLeftOut, bitwardenProblems, utf8, sameBytes};
})();
