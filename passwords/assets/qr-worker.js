// Searches pictures for a QR code away from the page (see qr.js): says it is ready once jsQR is loaded, then answers
// the pixels of each try with the code's text, or null.
'use strict';

importScripts('lib/jsqr/dist/jsQR.js');

onmessage = e => {
	let found = jsQR(e.data.data, e.data.width, e.data.height, {inversionAttempts: 'attemptBoth'});
	postMessage(found && found.data ? found.data : null);
};

postMessage('ready');
