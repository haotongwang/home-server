/* eslint-env node */

const router = require('express').Router(); // eslint-disable-line new-cap
const { JSDOM } = require('jsdom');
const htmlGen = require('../lib/htmlGen');
const fs = require('fs');
const path = require('path');

module.exports = (function() {
	router.get('/reader', (req, res) => {
		const u = req.query['url'] || global.action['reader-url'];
		if (u == null) {
			res.send(htmlGen.wrap('No url'));
		};

		// set new last url
		global.action['reader-url'] = u;
		fs.writeFile(
			path.join(global.mainDir, 'action.json'),
			JSON.stringify(global.action, null, '\t'),
			(err) => err && console.error(err)
		);

		JSDOM.fromURL(u)
			.then((dom) => {
				const j = new JSDOM(`<html><body></body></html>`);
				const url = new URL(u);

				const window = j.window;
				const document = window.document;

				document.body.appendChild(dom.window.document.querySelector('#chapter'));

				document.querySelector('body').style = 'background-color:#232323;color:rgba(255,255,255,0.6);';
				document.querySelector('.col-xs-12').style = `padding-left:90px;padding-right:90px;`;
				document.querySelector('#chapter-content').style = `font-family:'Times New Roman';`;

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

				let page = j.serialize();

				const replace = global.action['reader-replace'];


				for (const str in replace) {
					if (
						replace.hasOwnProperty(str)
					) {
						page = page.replace(new RegExp(str, 'g'), replace[str]);
					}
				}

				res.send(page);
			}).catch((e) => console.log(e));
	});

	return router;
})();
