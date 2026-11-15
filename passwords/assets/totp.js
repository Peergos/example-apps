// One-time codes: TOTP (RFC 6238) on HOTP (RFC 4226), with the secret in base32 (RFC 4648) as authenticator apps
// show it, and otpauth:// links in Google's Key URI format, which Bitwarden, KeePassXC and Aegis all read. The HMAC
// is the browser's own (WebCrypto), so no library is needed.
'use strict';

const Totp = (() => {
	const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
	const ALGORITHMS = {'SHA1': 'SHA-1', 'SHA256': 'SHA-256', 'SHA512': 'SHA-512'};

	// Spaces, dashes and padding are left out and case is ignored, as sites print keys in groups. Null for anything
	// that is not base32.
	function base32Decode(text) {
		let clean = text.toUpperCase().replace(/[\s-]/g, '').replace(/=+$/, '');
		if (clean.length < 2 || /[^A-Z2-7]/.test(clean))
			return null;
		let out = new Uint8Array(Math.floor(clean.length * 5 / 8));
		let bits = 0, value = 0, at = 0;
		for (let c of clean) {
			value = (value << 5) | ALPHABET.indexOf(c);
			bits += 5;
			if (bits >= 8) {
				out[at++] = (value >>> (bits - 8)) & 0xff;
				bits -= 8;
			}
		}
		return out;
	}

	function base32Encode(bytes) {
		let out = '', bits = 0, value = 0;
		for (let b of bytes) {
			value = (value << 8) | b;
			bits += 8;
			while (bits >= 5) {
				out += ALPHABET[(value >>> (bits - 5)) & 31];
				bits -= 5;
			}
		}
		if (bits > 0)
			out += ALPHABET[(value << (5 - bits)) & 31];
		return out;
	}

	// What is stored in an item's totp, as Bitwarden keeps it: a bare base32 key, a full otpauth:// link, or a
	// steam:// key. Returns {secret, algorithm, digits, period, steam} or null if it isn't usable.
	function parse(value) {
		if (value == null)
			return null;
		let text = String(value).trim();
		if (text == '')
			return null;
		if (/^steam:\/\//i.test(text)) {
			let secret = base32Decode(text.substring(8));
			return secret == null ? null : {secret: secret, algorithm: 'SHA1', digits: 5, period: 30, steam: true};
		}
		if (/^otpauth:\/\//i.test(text)) {
			let url;
			try {
				url = new URL(text);
			} catch (e) {
				return null;
			}
			if (url.host.toLowerCase() != 'totp')
				return null;
			let q = url.searchParams;
			let secret = base32Decode(q.get('secret') || '');
			if (secret == null)
				return null;
			// KeePassXC writes a Steam key as a totp link with encoder=steam
			if ((q.get('encoder') || '').toLowerCase() == 'steam')
				return {secret: secret, algorithm: 'SHA1', digits: 5, period: 30, steam: true};
			let algorithm = (q.get('algorithm') || 'SHA1').toUpperCase().replace('-', '');
			let digits = parseInt(q.get('digits') || '6', 10);
			let period = parseInt(q.get('period') || '30', 10);
			if (! ALGORITHMS[algorithm] || ! (digits >= 6 && digits <= 10) || ! (period > 0))
				return null;
			return {secret: secret, algorithm: algorithm, digits: digits, period: period, steam: false};
		}
		let secret = base32Decode(text);
		return secret == null ? null : {secret: secret, algorithm: 'SHA1', digits: 6, period: 30, steam: false};
	}

	// An otpauth:// link for a key, so a code moves to another app with its settings. The label is "Issuer:account"
	// with each part percent-encoded, and the issuer is repeated as a parameter, as the Key URI format recommends.
	function toUri(value, issuer, account) {
		let p = parse(value);
		if (p == null)
			return null;
		if (/^otpauth:\/\//i.test(String(value).trim()))
			return String(value).trim();
		let name = issuer || '';
		let who = account || '';
		let label = (name ? encodeURIComponent(name) + ':' : '') + encodeURIComponent(who || name || 'account');
		let q = 'secret=' + base32Encode(p.secret);
		if (name)
			q += '&issuer=' + encodeURIComponent(name);
		if (p.algorithm != 'SHA1')
			q += '&algorithm=' + p.algorithm;
		if (p.digits != 6)
			q += '&digits=' + p.digits;
		if (p.period != 30)
			q += '&period=' + p.period;
		return 'otpauth://totp/' + label + '?' + q;
	}

	async function hotp(secret, counter, algorithm) {
		let key = await crypto.subtle.importKey('raw', secret, {name: 'HMAC', hash: ALGORITHMS[algorithm]}, false, ['sign']);
		let message = new ArrayBuffer(8);
		let view = new DataView(message);
		view.setUint32(0, Math.floor(counter / 0x100000000));
		view.setUint32(4, counter >>> 0);
		let mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
		let offset = mac[mac.length - 1] & 0x0f;
		let binary = ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
		return binary;
	}

	const STEAM_CHARS = '23456789BCDFGHJKMNPQRTVWXY';

	// The code for a parsed key at a time in milliseconds, and how many seconds it has left
	async function code(p, now) {
		let seconds = Math.floor(now / 1000);
		let counter = Math.floor(seconds / p.period);
		let binary = await hotp(p.secret, counter, p.algorithm);
		let text;
		if (p.steam) {
			text = '';
			for (let i = 0; i < 5; i++) {
				text += STEAM_CHARS[binary % STEAM_CHARS.length];
				binary = Math.floor(binary / STEAM_CHARS.length);
			}
		} else {
			text = String(binary % Math.pow(10, p.digits)).padStart(p.digits, '0');
		}
		return {code: text, left: p.period - (seconds % p.period), period: p.period};
	}

	return {base32Decode, base32Encode, parse, toUri, code};
})();
