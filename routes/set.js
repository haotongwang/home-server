"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap
const Formidable = require('formidable');
const path = require('path');
const htmlGen = require(path.join(global.mainDir, 'lib/htmlGen'));

module.exports = (function() {
	router.get('/set', (req, res) => {
		if (Object.keys(req.query).length > 0) {
			for (const setting in req.query) {
				if (req.query.hasOwnProperty(setting)) {
					const value = req.query[setting];
					router.set(setting, value);
					const content = `<h1>${setting} set to ${value}</h1>`;
					res.send(htmlGen.wrap('Set successful', content));
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
			const content = `<form action="/set/${setting}"enctype="multipart/form-data"method="POST"><input type="text"name="value"id="value"><input type="submit"value="Upload"id="submit"></form>`;
			res.send(htmlGen.wrap(`Set ${setting}`, content));
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
