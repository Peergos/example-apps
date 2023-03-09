function printPreview(text, filename) {				
	const iframeElement = document.querySelector( '#print-data-container' );
	iframeElement.srcdoc = '<html><head><title>' + encodeURIComponent(filename) + '</title>' + 
		'<style>@page {margin-bottom: 0pt;} *{-webkit-print-color-adjust: exact;color-adjust: exact;}</style></head>' +
		`<body class="ck-content">${ text }` +
		'<script>window.addEventListener("DOMContentLoaded", () => { window.print()} );</script></body></html>';
}
