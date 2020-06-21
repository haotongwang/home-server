/* eslint-env node */

const router = require('express').Router(); // eslint-disable-line new-cap
const { JSDOM } = require('jsdom');

module.exports = (function() {
	router.get('/reader', (req, res) => {
		const u = req.query['url'];
		JSDOM.fromURL(u)
			.then((dom) => {
				const j = new JSDOM(`<html><body></body></html>`);
				const url = new URL(u);

				const window = j.window;
				const document = window.document;
				const $ = (s) => document.querySelector(s);

				document.body.appendChild(dom.window.document.querySelector('#chapter'));

				$('body').style = 'background-color:#232323;color:rgba(255,255,255,0.6);';
				$('.col-xs-12').style = `padding-left:90px;padding-right:90px;`;
				$('#chapter-content').style = `font-family:'Times New Roman';`;

				document.querySelectorAll('a').forEach((h) => {
					h.style = 'color:#82A82D';
				});

				document.querySelectorAll('p').forEach((h) => {
					h.style = `font-size:32px;`;
				});

				document.querySelectorAll('a').forEach((h) => {
					h.href = `/reader?url=${url.origin}${h.href}`;
				});

				document.querySelectorAll('script').forEach((h) => {
					h.parentElement.removeChild(h);
				});

				const script = document.createElement('script');
				script.innerHTML = `
					document.addEventListener('keydown', (event) => {
					console.log(event.keyCode);
					switch (event.keyCode) {
						case 39:
							// next page
							document.querySelector('#next_chap').click();
							break;
						case 37:
							// previous page
							document.querySelector('#prev_chap').click();
							break;
						}
					});
				`;
				document.head.appendChild(script);

				res.send(j.serialize());
			});
	});

	return router;
})();
