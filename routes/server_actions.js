"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap
const path = require('path');
const Formidable = require('formidable');
const url = require('url');
const fs = require('fs');

module.exports = function(main) {
	// upload POST method
	router.post('/upload', (req, res) => {
		const form = new Formidable();
		form.keepExtensions = true;
		form.multiples = true;

		form.parse(req, (err, fields, files) => {
			if (err) console.error(err);
			console.log(files.upload);
			if (files.upload) {
				const upload = files.upload instanceof Array
					? files.upload
					: [files.upload];

				const urlBase = path.basename(req.get('referer'));
				const urlPath = url.parse(req.get('referer')).pathname;
				const fileDir = urlBase === `localhost:${main.PORT}`
					|| urlBase === 'index.html'
					? main.serveDirectory
					: path.join(main.serveDirectory, urlPath);

				upload.forEach((file) => {
					fs.renameSync(file.path, path.join(fileDir, file.name));
				});
			}

			res.redirect(req.get('referer'));
		});
	});

	return router;
};
