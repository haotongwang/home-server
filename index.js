'use strict';

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const express = require('express');

const app = express();

const staticDirectories = ['file'];

/* ------------------------------- functions ------------------------------- */

/**
 * Set a directory to serve static files
 * @param {String} dirName Name of directory
 */
function setStatic(dirName) {
	app.use(`/${dirName}`, express.static(dirName));
	app.get(`/${dirName}`, (req, res) => {
		res.sendFile(path.join(__dirname, dirName, `${dirName}.html`));
	});
}

/* --------------------------------- routes --------------------------------- */

staticDirectories.forEach((dir) => setStatic(dir));

app.get(['/', '/index.html'], (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

/* ---------------------------------- 404 ---------------------------------- */

app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, '404.html'));
});

/* --------------------------------- server --------------------------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
