// Bitwarden's password-protected export: a .json whose data is encrypted with a key made from the password chosen when
// exporting. Opened as Bitwarden's importer opens it (bitwarden/clients libs/importer/src/importers/bitwarden/
// bitwarden-password-protected-importer.ts; the key from libs/legacy-crypto/src/services/default-key-generation.service.ts
// and sdk-internal crates/bitwarden-crypto/src/keys/kdf.rs):
//   key  = PBKDF2-SHA256(password, salt, iterations), or Argon2id(password, SHA-256(salt), ...), 32 bytes; the salt is
//          the file's salt text as UTF-8, not decoded from base64
//   enc  = HKDF-Expand-SHA256(key, "enc", 32) and mac = HKDF-Expand-SHA256(key, "mac", 32)
//   data = "2.iv|ciphertext|mac" in base64: AES-256-CBC with PKCS#7 padding, MACed with HMAC-SHA256(mac, iv + ciphertext)
// PBKDF2, HMAC and AES are the browser's own (WebCrypto); Argon2id is hash-wasm's.
'use strict';

const Protected = (() => {
	// The KDF settings come in the file, so they are held to the bounds Bitwarden's importer accepts before anything is
	// derived (password-protected-kdf-config.ts): Argon2id takes all its memory up front.
	const PBKDF2_ITERATIONS = [5000, 2000000];
	const ARGON2 = {iterations: [2, 10], memory: [16, 1024], parallelism: [1, 16]};

	const within = (v, [min, max]) => Number.isInteger(v) && v >= min && v <= max;
	const utf8 = text => new TextEncoder().encode(text);
	// a damaged file says so, not the browser's own words
	const fromBase64 = text => {
		try {
			return Uint8Array.from(atob(text), c => c.charCodeAt(0));
		} catch (e) {
			throw new Error(t('notBitwarden'));
		}
	};

	function isProtected(doc) {
		return doc != null && doc.encrypted === true && doc.passwordProtected === true;
	}

	// the key derivation the file asks for, or null if Bitwarden wouldn't open it either
	function kdf(doc) {
		if (! [doc.salt, doc.encKeyValidation_DO_NOT_EDIT, doc.data].every(v => typeof v == 'string' && v != ''))
			return null;
		if (doc.kdfType === 0 && within(doc.kdfIterations, PBKDF2_ITERATIONS))
			return {type: 'pbkdf2', iterations: doc.kdfIterations};
		if (doc.kdfType === 1 && within(doc.kdfIterations, ARGON2.iterations) && within(doc.kdfMemory, ARGON2.memory)
				&& within(doc.kdfParallelism, ARGON2.parallelism))
			return {type: 'argon2id', iterations: doc.kdfIterations, memory: doc.kdfMemory, parallelism: doc.kdfParallelism};
		return null;
	}

	async function derive(password, salt, k) {
		if (k.type == 'pbkdf2') {
			let base = await crypto.subtle.importKey('raw', utf8(password), 'PBKDF2', false, ['deriveBits']);
			let bits = await crypto.subtle.deriveBits({name: 'PBKDF2', hash: 'SHA-256', salt: utf8(salt), iterations: k.iterations}, base, 256);
			return new Uint8Array(bits);
		}
		let saltHash = new Uint8Array(await crypto.subtle.digest('SHA-256', utf8(salt)));
		return hashwasm.argon2id({password: utf8(password), salt: saltHash, iterations: k.iterations, memorySize: k.memory * 1024,
			parallelism: k.parallelism, hashLength: 32, outputType: 'binary'});
	}

	// HKDF's expand step for one 32-byte block: HMAC-SHA256(key, info + 0x01)
	async function expand(key, info) {
		let hmac = await crypto.subtle.importKey('raw', key, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
		return new Uint8Array(await crypto.subtle.sign('HMAC', hmac, new Uint8Array([...utf8(info), 1])));
	}

	// the text of an encrypted string, or null if these keys don't open it: its MAC doesn't match
	async function decrypt(encString, keys) {
		let m = /^2\.([^|]+)\|([^|]+)\|([^|]+)$/.exec(encString);
		if (m == null)
			throw new Error(t('notBitwarden'));
		let iv = fromBase64(m[1]), data = fromBase64(m[2]), mac = fromBase64(m[3]);
		let signed = new Uint8Array(iv.length + data.length);
		signed.set(iv);
		signed.set(data, iv.length);
		let macKey = await crypto.subtle.importKey('raw', keys.mac, {name: 'HMAC', hash: 'SHA-256'}, false, ['verify']);
		if (! await crypto.subtle.verify('HMAC', macKey, mac, signed))
			return null;
		let encKey = await crypto.subtle.importKey('raw', keys.enc, 'AES-CBC', false, ['decrypt']);
		return new TextDecoder().decode(await crypto.subtle.decrypt({name: 'AES-CBC', iv: iv}, encKey, data));
	}

	// The export's plain JSON, as text, or null if the password is wrong. kdf(doc) must have accepted the file.
	async function open(doc, password) {
		let key = await derive(password, doc.salt, kdf(doc));
		let keys = {enc: await expand(key, 'enc'), mac: await expand(key, 'mac')};
		if (await decrypt(doc.encKeyValidation_DO_NOT_EDIT, keys) == null)
			return null;
		// the password opened the check value: data that doesn't open is damaged, not a wrong password
		let text = await decrypt(doc.data, keys);
		if (text == null)
			throw new Error(t('notBitwarden'));
		return text;
	}

	return {isProtected, kdf, open};
})();
