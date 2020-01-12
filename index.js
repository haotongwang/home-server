'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const express = require('express');
const Formidable = require('formidable');
const util = require('util');

const app = express();

const serveDirectory = fs.existsSync(process.argv[2])
	&& fs.statSync(process.argv[2]).isDirectory()
	? process.argv[2]
	: (() => {
		process.argv[2] && console.log(`Invalid path: ${process.argv[2]}`);
		return path.join(__dirname, 'public');
	})();
/* ------------------------------- functions ------------------------------- */

/**
 * Generate a stringified HTML file listing the contents of the directory
 * @param {String} dirPath Path to directory
 * @param {String} title Title of page
 * @return {String} Stringified HTML
 */
function generateHTML(dirPath, title=null) {
	title = title || path.basename(dirPath);

	const { document } = new JSDOM().window;
	document.title = title;

	const h1 = document.createElement('h1');
	h1.innerText = title;
	document.body.appendChild(h1);

	const ul = document.createElement('ul');
	document.body.appendChild(ul);

	fs.readdirSync(dirPath).forEach((d) => {
		const li = document.createElement('li');
		li.innerHTML = `<a href="${d}">${d}</a>`;
		ul.appendChild(li);
	});

	const div = document.createElement('div');
	div.innerHTML=`<form action="/upload"enctype="multipart/form-data"method="POST"><input type="file"name="upload"multiple="multiple"><input type="submit"value="Upload"></form>`;
	document.body.appendChild(div);

	return document.documentElement.outerHTML;
}

/* --------------------------------- routes --------------------------------- */

// home page
app.get(['/', '/index.html'], (req, res) => {
	res.send(generateHTML(path.join(__dirname, 'public'), 'Home Server'));
});

// upload page
app.get('/upload.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'upload.html'));
});

// upload POST method
app.post('/upload', (req, res) => {
	const form = new Formidable();
	form.uploadDir = path.join(__dirname, 'temp');
	form.keepExtensions = true;
	form.multiples = true;

	form.parse(req, (err, fields, files) => {
		if (err) console.error(err);
		const { upload } = files;

		upload.forEach((file) => {
			fs.renameSync(file.path, path.join(path.dirname(file.path), file.name));
		});

		res.end(util.inspect(req));
	});
});

// generalised page generation
app.get('*', (req, res, next) => {
	const abs = path.join(__dirname, 'public', req.url);
	if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
		res.send(generateHTML(abs));
	} else {
		next();
	}
});

// static files
app.use(express.static(serveDirectory));

// 404
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, '404.html'));
});

/* --------------------------------- server --------------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
