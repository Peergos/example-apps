// Bitwarden's item types and their fields, as its plain JSON export writes them (bitwarden/clients
// libs/common/src/models/export/*.export.ts). The app shows and edits these; anything else an item holds is kept
// as it came and written back. Only the types Bitwarden's apps offer are here: its bank account, driver's licence
// and passport (6-8) are still behind its feature flag pm-32009-new-item-types, so they are among the types this
// app doesn't know.
'use strict';

const Types = (() => {
	// Bitwarden's server limits the encrypted string, not the text: for its usual encryption (AES-CBC + HMAC,
	// "2.iv|data|mac") an encrypted length of 1,000 holds 687 bytes of UTF-8, 5,000 holds 3,695 and 10,000 holds
	// 7,439. Notes stop at 7,000, under that, so they fit the newer encryption too.
	const LIMIT = {short: 687, long: 3695, uri: 7439, notes: 7000};

	// kind: text, secret (hidden until shown, never searched), multiline, secretMultiline, select, month
	// options for a select, written as they are stored; a value the list doesn't know is offered too
	const CARD_BRANDS = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Diners Club', 'JCB', 'Maestro', 'UnionPay', 'RuPay', 'Other'];
	const TITLES = ['Mr', 'Mrs', 'Ms', 'Mx', 'Dr'];

	const LIST = [
		{type: 1, key: 'login', icon: 'key', fields: [
			{name: 'username', kind: 'text', limit: LIMIT.short, linked: 100},
			{name: 'password', kind: 'secret', limit: LIMIT.long, linked: 101},
		]},
		{type: 2, key: 'secureNote', icon: 'note', fields: []},
		{type: 3, key: 'card', icon: 'card', fields: [
			{name: 'cardholderName', kind: 'text', linked: 300},
			{name: 'brand', kind: 'select', options: CARD_BRANDS, linked: 304},
			{name: 'number', kind: 'secret', mono: true, linked: 305},
			{name: 'expMonth', kind: 'month', linked: 301},
			{name: 'expYear', kind: 'text', inputmode: 'numeric', placeholder: 'yyyy', linked: 302},
			{name: 'code', kind: 'secret', mono: true, linked: 303},
		]},
		{type: 4, key: 'identity', icon: 'id', fields: [
			{name: 'title', kind: 'select', options: TITLES, linked: 400},
			{name: 'firstName', kind: 'text', linked: 416},
			{name: 'middleName', kind: 'text', linked: 401},
			{name: 'lastName', kind: 'text', linked: 417},
			{name: 'username', kind: 'text', linked: 413},
			{name: 'company', kind: 'text', linked: 409},
			{name: 'email', kind: 'text', inputmode: 'email', linked: 410},
			{name: 'phone', kind: 'text', inputmode: 'tel', linked: 411},
			{name: 'ssn', kind: 'secret', linked: 412},
			{name: 'passportNumber', kind: 'secret', linked: 414},
			{name: 'licenseNumber', kind: 'secret', linked: 415},
			{name: 'address1', kind: 'text', wide: true, linked: 402},
			{name: 'address2', kind: 'text', wide: true, linked: 403},
			{name: 'address3', kind: 'text', wide: true, linked: 404},
			{name: 'city', kind: 'text', linked: 405},
			{name: 'state', kind: 'text', linked: 406},
			{name: 'postalCode', kind: 'text', linked: 407},
			{name: 'country', kind: 'text', linked: 408},
		]},
		{type: 5, key: 'sshKey', icon: 'terminal', fields: [
			// Bitwarden refuses a whole import if one SSH key has no private key
			{name: 'privateKey', kind: 'secretMultiline', mono: true, limit: LIMIT.long, required: true, wide: true},
			{name: 'publicKey', kind: 'multiline', mono: true, limit: LIMIT.long, wide: true},
			{name: 'keyFingerprint', kind: 'text', mono: true, wide: true},
		]},
	];
	for (let ty of LIST)
		for (let f of ty.fields)
			f.limit = f.limit || LIMIT.short;

	const BY_TYPE = new Map(LIST.map(ty => [ty.type, ty]));

	// an item of a type this app doesn't know shows what any item has (name, custom fields, notes, attachments); the
	// rest is kept as it came, and a note says so
	const UNKNOWN = {type: 0, key: 'unknown', icon: 'note', fields: []};

	function of(item) {
		return BY_TYPE.get(item.type) || UNKNOWN;
	}

	// what a linked custom field can point at, for the item's type: Bitwarden's LinkedIdType
	function linkable(item) {
		let ty = of(item);
		let out = ty.fields.filter(f => f.linked).map(f => ({id: f.linked, field: f.name}));
		if (ty.key == 'identity')
			out.push({id: 418, field: 'fullName'});
		return out;
	}

	function utf8Length(text) {
		return text == null ? 0 : new TextEncoder().encode(String(text)).length;
	}

	// a new item as Bitwarden's export writes one: empty strings are left out, lists are empty
	function blank(type, folderId) {
		let ty = BY_TYPE.get(type);
		let now = new Date().toISOString();
		let item = {id: crypto.randomUUID(), organizationId: null, folderId: folderId || null, type: type, reprompt: 0,
			name: '', favorite: false, fields: [], passwordHistory: [], creationDate: now, revisionDate: now, collectionIds: null};
		if (ty.key == 'login')
			item.login = {uris: [], fido2Credentials: []};
		else if (ty.key == 'secureNote')
			item.secureNote = {type: 0};
		else if (ty.key == 'sshKey')
			item.sshKey = {privateKey: '', publicKey: '', keyFingerprint: ''};
		else
			item[ty.key] = {};
		return item;
	}

	return {LIST, LIMIT, of, byType: t => BY_TYPE.get(t), linkable, utf8Length, blank};
})();
