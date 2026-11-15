// The vault: one vault.json in the app's own data folder (/peergos-api/v0/data/, permission STORE_APP_DATA),
// holding a plain Bitwarden export as Bitwarden writes it - folders, items and, from an organisation, collections -
// so every item keeps every field, the ones this app doesn't show included. Attachments are files beside it, in
// attachments/<item id>/<attachment id>. Nothing secret is kept anywhere else: not in localStorage, which lives
// outside Peergos.
'use strict';

const Vault = (() => {
	const DATA = '/peergos-api/v0/data/';
	const FILE = 'vault.json';
	let doc = null;
	let queue = Promise.resolve();
	let seenItems = false;

	function empty() {
		return {encrypted: false, folders: [], items: []};
	}

	// The vault's own reads and writes give up after five minutes, so a save Peergos never answers doesn't hold the
	// editor for good; a save also waits behind this device's other writes, such as a large attachment going up, so the
	// limit is generous. An attachment gets as long again for every 64 KB/s of its size on top: slow, but never for good.
	const PATIENCE = 5 * 60000;

	function patienceFor(size) {
		return PATIENCE + Math.ceil((size || 0) / 64);
	}

	class NoAnswer extends Error {}

	// The browser says when it has no network. Peergos' client then keeps trying, so a write is refused at once, as
	// familiar apps refuse it, and anything still waiting when the network goes is given up. Reads of the vault aren't
	// refused: the Peergos Android app serves them from its own copy. An attachment isn't sent for offline at all.
	function offline() {
		return navigator.onLine === false;
	}

	// a request given up after the patience given, or at once when the network goes. One for a file isn't even made
	// while the network is gone: Peergos would keep trying it.
	async function within(request, patience = PATIENCE, file = false) {
		if (file && offline())
			throw new NoAnswer(t('offline'));
		// AbortSignal.timeout would do this, but Safari has it only from 16 and Chrome from 103
		let stop = new AbortController();
		let timer = setTimeout(() => stop.abort(), patience);
		let gone = () => stop.abort();
		addEventListener('offline', gone);
		try {
			return await request(stop.signal);
		} catch (e) {
			if (e.name == 'TimeoutError' || e.name == 'AbortError')
				throw new NoAnswer(t(offline() ? 'offline' : 'noAnswer'));
			throw e;
		} finally {
			clearTimeout(timer);
			removeEventListener('offline', gone);
		}
	}

	async function expect(response, ...statuses) {
		if (! statuses.includes(response.status))
			throw new Error(t('serverAnswered', response.status));
		return response;
	}

	// Only "not found" means there is no vault yet, and only before this session has seen one with items in it and
	// when the data folder doesn't list it either: the next save would write an empty vault over one that is there.
	// Any other failure stops here, so a vault that could not be read is never replaced by an empty one. A read made
	// while a save is being written can find the file part-written, cut short or padded to its old length: it is read
	// once more, a moment later, before it is called unreadable.
	async function read(again) {
		let r = await within(signal => fetch(DATA + FILE, {signal}));
		if (r.status == 404 && ! seenItems && ! await listed())
			return empty();
		await expect(r, 200);
		let text = new TextDecoder().decode(await r.arrayBuffer());
		let d;
		try {
			d = JSON.parse(text);
		} catch (e) {
			if (! again) {
				await new Promise(resolve => setTimeout(resolve, 1500));
				// as change() does after its own wait: the network may have gone meanwhile
				if (offline())
					throw new NoAnswer(t('offline'));
				return read(true);
			}
			throw new Error(t('vaultUnreadable'));
		}
		if (d == null || typeof d != 'object' || ! Array.isArray(d.items))
			throw new Error(t('vaultUnreadable'));
		if (! Array.isArray(d.folders))
			d.folders = [];
		if (d.items.length > 0)
			seenItems = true;
		return d;
	}

	// whether the data folder's listing has the vault in it; a folder that isn't there yet has nothing in it
	async function listed() {
		let r = await within(signal => fetch(DATA, {signal}));
		if (r.status == 404)
			return false;
		await expect(r, 200);
		let list = JSON.parse(new TextDecoder().decode(await r.arrayBuffer()));
		return (list.files || []).some(f => (typeof f == 'string' ? f : f.name) == FILE);
	}

	async function write(d) {
		await expect(await within(signal => fetch(DATA + FILE, {method: 'PUT', body: new TextEncoder().encode(JSON.stringify(d)), signal})), 200, 201);
	}

	// a load waits for any change under way, so it never shows the vault from before that change. One asked for only
	// while online isn't made if the network has gone meanwhile: in a browser Peergos wouldn't answer it, and the
	// changes after it would wait
	function load(onlineOnly) {
		let result = queue.then(() => {
			if (onlineOnly && offline())
				throw new NoAnswer(t('offline'));
			return read();
		}).then(d => {
			doc = d;
			return d;
		});
		queue = result.catch(() => {});
		return result;
	}

	// A change is a function applied to a fresh copy of the vault: before each save the file is read again and only
	// this change goes onto it, so what another device saved meanwhile is kept. Changes run one at a time. The data
	// API has no conditional write, so a save on another device in the moment between this read and write is lost.
	// Peergos refuses a write made from a state another device has since moved on from, and its client sees that
	// other save only some seconds later, so a refused write is tried once more, after that, from what is read then.
	function change(apply) {
		let result = queue.then(async () => {
			for (let attempt = 1; ; attempt++) {
				// the retry too: the network may have gone while it waited
				if (offline())
					throw new NoAnswer(t('offline'));
				let fresh = await read();
				let out = apply(fresh);
				try {
					await write(fresh);
				} catch (e) {
					// a write Peergos refused is tried again, however long the refusal took: on a slow uplink one
					// refused for a save from another device comes only after the upload; one it never answered isn't
					// waited for twice
					if (attempt > 1 || e instanceof NoAnswer)
						throw e;
					await new Promise(resolve => setTimeout(resolve, 8000));
					continue;
				}
				doc = fresh;
				return out;
			}
		});
		queue = result.catch(() => {});
		return result;
	}

	// ------------------------------------------------------------ attachments

	function attachmentPath(itemId, attachmentId) {
		return DATA + 'attachments/' + encodeURIComponent(itemId) + '/' + encodeURIComponent(attachmentId);
	}

	// size: what the file is listed as, for how long to wait for it
	async function readAttachment(itemId, attachmentId, size) {
		return within(async signal => {
			let r = await expect(await fetch(attachmentPath(itemId, attachmentId), {signal}), 200);
			return new Uint8Array(await r.arrayBuffer());
		}, patienceFor(size), true);
	}

	async function writeAttachment(itemId, attachmentId, bytes) {
		await within(async signal => expect(await fetch(attachmentPath(itemId, attachmentId), {method: 'PUT', body: bytes, signal}), 200, 201),
			patienceFor(bytes.length), true);
	}

	async function deleteAttachment(itemId, attachmentId) {
		await within(async signal => {
			let r = await fetch(attachmentPath(itemId, attachmentId), {method: 'DELETE', signal});
			// already gone is as good as deleted
			if (r.status != 404)
				await expect(r, 200, 204);
		}, PATIENCE, true);
	}

	return {load, change, get: () => doc, idle: () => queue, offline, readAttachment, writeAttachment, deleteAttachment};
})();
