'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const express = require('express');

const app = express();

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

	return document.documentElement.outerHTML;
}

/* ---------------------------------- code ---------------------------------- */

app.get(['/', '/index.html'], (req, res) => {
	res.send(generateHTML(path.join(__dirname, 'public'), 'Home Server'));
});

app.get('*', (req, res, next) => {
	const abs = path.join(__dirname, 'public', req.url);
	if (fs.existsSync(abs)) {
		if (fs.statSync(abs).isDirectory()) {
			res.send(generateHTML(abs));
		} else {
			res.sendFile(abs);
		}
	} else {
		next();
	}
});

/* --------------------------------- routes --------------------------------- */

app.use(express.static('public'));

/* ---------------------------------- 404 ---------------------------------- */

app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, '404.html'));
});

/* --------------------------------- server --------------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
