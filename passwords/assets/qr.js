// Reading the QR code a site shows when one-time codes are turned on, from a photo or screenshot of it. Apps get
// no camera in Peergos, so it is a picture: picked, taken with the phone's camera app, or pasted.
'use strict';

const Qr = (() => {
	// Opening the picture is the one step that can hang (a damaged file): given up after a minute, so Save, which waits
	// for the read, can't turn for good. Finding the code always ends, however slow the phone.
	async function pixels(blob, max) {
		let bitmap = await Promise.race([createImageBitmap(blob), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 60000))]);
		let scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
		let w = Math.max(1, Math.round(bitmap.width * scale));
		let h = Math.max(1, Math.round(bitmap.height * scale));
		let canvas = document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		let ctx = canvas.getContext('2d', {willReadFrequently: true});
		ctx.drawImage(bitmap, 0, 0, w, h);
		if (bitmap.close)
			bitmap.close();
		return {image: ctx.getImageData(0, 0, w, h), full: scale == 1};
	}

	// jsQR takes seconds over a large photo, tens of seconds on a slow phone, and nothing on the page answers while it
	// runs: it runs in a worker. Where one can't be started, or isn't ready within 3 s, it runs here. A worker is ready
	// in a fraction of a second, or never: in Firefox, Peergos doesn't answer the worker's own request for jsQR.
	let noWorker = false;
	function startWorker() {
		return new Promise(resolve => {
			let worker, timer;
			if (noWorker) {
				resolve(null);
				return;
			}
			try {
				worker = new Worker('qr-worker.js');
			} catch (e) {
				noWorker = true;
				resolve(null);
				return;
			}
			// one that didn't start isn't waited for again: the rest of this visit's pictures are searched here
			let done = ready => {
				clearTimeout(timer);
				worker.onmessage = worker.onerror = null;
				if (! ready) {
					worker.terminate();
					noWorker = true;
				}
				resolve(ready ? worker : null);
			};
			timer = setTimeout(() => done(false), 3000);
			worker.onmessage = e => done(e.data === 'ready');
			worker.onerror = e => {
				e.preventDefault();
				done(false);
			};
		});
	}

	// the QR code's text in some pixels, or null
	function search(worker, image) {
		if (worker == null) {
			let found = jsQR(image.data, image.width, image.height, {inversionAttempts: 'attemptBoth'});
			return Promise.resolve(found && found.data ? found.data : null);
		}
		return new Promise((resolve, reject) => {
			// far longer than the largest try takes on a slow phone: one that stops answering is given up
			let timer = setTimeout(() => reject(new Error('QR search stalled')), 120000);
			worker.onmessage = e => {
				clearTimeout(timer);
				resolve(e.data);
			};
			worker.onerror = e => {
				clearTimeout(timer);
				e.preventDefault();
				reject(new Error('QR search failed'));
			};
			worker.postMessage({data: image.data, width: image.width, height: image.height}, [image.data.buffer]);
		});
	}

	// The text of the QR code in a picture, or null if none is found. A large photo is tried smaller first, which is
	// quicker and often reads better, then larger. Throws if the picture can't be read at all.
	async function read(blob) {
		let worker = await startWorker();
		try {
			for (let max of [1000, 2000, 4000]) {
				let p = await pixels(blob, max);
				let found;
				try {
					found = await search(worker, p.image);
				} catch (e) {
					if (worker == null)
						throw e;
					// the worker failed or stalled partway, its pixels gone with it: this try and the rest, and later
					// pictures', are made here
					worker.terminate();
					worker = null;
					noWorker = true;
					found = await search(null, (await pixels(blob, max)).image);
				}
				if (found)
					return found;
				if (p.full)
					break;
			}
			return null;
		} finally {
			if (worker)
				worker.terminate();
		}
	}

	return {read};
})();
