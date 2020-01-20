"use strict";

const { JSDOM } = require('jsdom');
const router = require('express').Router(); // eslint-disable-line new-cap
const Formidable = require('formidable');
const path = require('path');

module.exports = (function() {
	router.get('/set', (req, res) => {
		if (Object.keys(req.query).length > 0) {
			for (const setting in req.query) {
				if (req.query.hasOwnProperty(setting)) {
					const value = req.query[setting];
					router.set(setting, value);
					res.end(`<h1>${setting} set to ${value}</h1>`);
				}
			}
		} else {
			// set page
			res.status(501).sendFile(path.join(global.mainDir, '501.html'));
		}
	});
	router.route('/set/:setting')
		.get((req, res) => {
			const { setting } = req.params;
			const { document } = new JSDOM().window;
			document.title = setting;
			document.body.innerHTML = `<form action="/set/${setting}"enctype="multipart/form-data"method="POST"><input type="text"name="value"id="value"><input type="submit"value="Upload"id="submit"></form>`;
			res.send(document.documentElement.outerHTML);
		})
		.post((req, res) => {
			const { setting } = req.params;
			const form = new Formidable();
			form.keepExtensions = true;
			form.multiples = true;

			form.parse(req, (err, fields) => {
				res.redirect(`/set?${setting}=${fields.value}`);
			});
		});

	return router;
})();
