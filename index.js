'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const express = require('express');

const app = express();

const staticDirectories = ['file'];
const { document } = new JSDOM(fs.readFileSync(path.join(__dirname, 'index.html'))).window;

/* ------------------------------- functions ------------------------------- */


/* ---------------------------------- code ---------------------------------- */

const ul = document.createElement('ul');
document.body.appendChild(ul);

staticDirectories.forEach((dir) => {
	app.use(`/${dir}`, express.static(dir));
	const li = document.createElement('li');
	li.innerHTML = `<a href="${dir}/${dir}.html">${dir}</a>`;
	ul.appendChild(li);
});

/* --------------------------------- routes --------------------------------- */

app.get(['/', '/index.html'], (req, res) => {
	res.send(document.documentElement.outerHTML);
});

/* ---------------------------------- 404 ---------------------------------- */

app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, '404.html'));
});

/* --------------------------------- server --------------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
