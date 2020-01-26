"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap
const Formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const htmlGen = require(path.join(global.mainDir, 'lib/htmlGen'));

module.exports = (function() {
	router.get('/set', (req, res) => {
		if (Object.keys(req.query).length > 0) {
			for (const action in req.query) {
				if (req.query.hasOwnProperty(action)) {
					const value = req.query[action];
					global.action[action] = value;
					const content = `<h1>${action} set to ${value}</h1>`;
					fs.writeFile(
						path.join(global.mainDir, 'action.json'),
						JSON.stringify(global.action, null, '\t'),
						(err) => err && console.error(err)
					);
					res.send(htmlGen.wrap('Set successful', content));
				}
			}
		} else {
			// set page
			res.status(501).sendFile(path.join(global.mainDir, '501.html'));
		}
	});
	router.route('/set/:action')
		.get((req, res) => {
			const { action } = req.params;
			const content = `<form action="/set/${action}"enctype="multipart/form-data"method="POST"><input type="text"name="value"id="value"><input type="submit"value="Upload"id="submit"></form>`;
			res.send(htmlGen.wrap(`Set ${action}`, content));
		})
		.post((req, res) => {
			const { action } = req.params;
			const form = new Formidable();
			form.keepExtensions = true;
			form.multiples = true;

			form.parse(req, (err, fields) => {
				res.redirect(`/set?${action}=${fields.value}`);
			});
		});

	return router;
})();
