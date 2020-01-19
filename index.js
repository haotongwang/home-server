'use strict';

const util = require('util'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const express = require('express');
const Formidable = require('formidable');
// const url = require('url');
const yargs = require('yargs');

const app = express();

const args = yargs
	.options({
		'p': {
			alias: ['P', '-port', '-PORT'],
			default: -1,
			describe: 'port of server',
			type: 'number'
		},
		'd': {
			alias: ['-path', '-dir'],
			default: path.join(__dirname, 'public'),
			describe: 'path to directory for serving static files',
			type: 'string'
		},
		'r': {
			alias: ['-run'],
			default: false,
			describe: 'server running in mode run or dev',
			type: 'boolean'
		}
	})
	.help()
	.argv;

const serveDirectory = fs.statSync(args['dir']).isDirectory()
	? args['dir']
	: (() => {
		console.log(`Invalid path: ${args['dir']}`);
		return path.join(__dirname, 'public');
	})();

const PORT = args['port'] >= 0
	? args['port']
	: args['run'] ? 8080 : 5000; // 5000 dev, 8080 run

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
	h1.innerHTML = title;
	document.body.appendChild(h1);

	const ul = document.createElement('ul');
	document.body.appendChild(ul);

	fs.readdirSync(dirPath).forEach((d) => {
		const li = document.createElement('li');
		li.innerHTML = `<a href="${d}">${d}</a>`;
		ul.appendChild(li);
	});

	const div = document.createElement('div');
	div.innerHTML = `<form action="/upload"enctype="multipart/form-data"method="POST"><input type="file"name="upload"multiple="multiple"oninput="if(this.value)submit.disabled=false;else submit.disabled=true;"><input type="submit"value="Upload"id="submit"disabled></form>`;
	document.body.appendChild(div);

	return document.documentElement.outerHTML;
}

/* ------------------------------ core routes ------------------------------ */

// home page
app.get(['/', '/index.html'], (req, res) => {
	res.send(generateHTML(serveDirectory, 'Home Server'));
});

/* ----------------------------- import routes ----------------------------- */

app.use(require('./routes/server_actions')({ PORT, serveDirectory }));

// redirect
app.get('/redirect', (req, res) => {
	typeof app.get('redirect') === 'string' && app.get('redirect')
		? res.redirect(app.get('redirect'))
		: res.send('<h1>No redirect set</h1>');
});

// set
app.get('/set', (req, res) => {
	if (Object.keys(req.query).length > 0) {
		app.set('redirect', req.query['redirect']);
		res.end(`<h1>redirect set to ${app.get('redirect')}</h1>`);
	} else {
		// set page
		res.status(501).sendFile(path.join(__dirname, '501.html'));
	}
});
app.get('/set/:setting', (req, res) => {
	const { setting } = req.params;
	const { document } = new JSDOM().window;
	document.title = setting;
	document.body.innerHTML = `<form action="/set/${setting}"enctype="multipart/form-data"method="POST"><input type="text"name="url"id="url"><input type="submit"value="Upload"id="submit"></form>`;
	res.end(document.documentElement.outerHTML);
});
app.post('/set/:setting', (req, res) => {
	const { setting } = req.params;
	const { document } = new JSDOM().window;
	document.title = setting;
	const form = new Formidable();
	form.keepExtensions = true;
	form.multiples = true;

	form.parse(req, (err, fields) => {
		app.set(setting, fields.url);
		document.body.innerHTML = `<h1>${setting} set to ${app.get(setting)}</h1>`;
		res.end(document.documentElement.outerHTML);
	});
});

/* ------------------------------ catch routes ------------------------------ */

// generalised page generation
app.get('*', (req, res, next) => {
	const abs = path.join(serveDirectory, req.url);
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

app.listen(PORT, () => console.log(`Server started on port ${PORT}...`));
