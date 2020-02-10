"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap
const path = require('path');
const Formidable = require('formidable');
const url = require('url');
const fs = require('fs');

module.exports = (function() {
	router.post('/upload', (req, res) => {
		const form = new Formidable();
		form.keepExtensions = true;
		form.multiples = true;

		form.parse(req, (err, fields, files) => {
			if (err) console.error(err);
			const upload = files.upload instanceof Array
				? files.upload
				: [files.upload];

			if (upload[0].size !== 0) {
				const urlBase = path.basename(req.get('referer'));
				const urlPath = url.parse(req.get('referer')).pathname;
				const fileDir = urlBase === `localhost:${global.PORT}`
					|| urlBase === 'index.html'
					? global.serveDirectory
					: path.join(global.serveDirectory, urlPath);

				upload.forEach((file) => {
					fs.rename(
						file.path,
						path.join(fileDir, file.name),
						(err) => console.error(err)
					);
				});
			}

			res.redirect(req.get('referer'));
		});
	});

	return router;
})();
