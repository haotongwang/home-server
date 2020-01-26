/* eslint-env node */
"use strict";

const util = require('util'); // eslint-disable-line no-unused-vars
const fs = require('fs');
const path = require('path');
// const { JSDOM } = require('jsdom');
const express = require('express');
// const Formidable = require('formidable');
// const url = require('url');
const yargs = require('yargs');

const app = express();

/* --------------------------------- config --------------------------------- */

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

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
			default: config.default.serveDirectory,
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

/* ------------------------------ app globals ------------------------------ */

global.serveDirectory = fs.statSync(args['dir']).isDirectory()
	? args['dir']
	: (() => {
		console.log(`Invalid path: ${args['dir']}, serve directory set to ${config.default.serveDirectory}`);
		return config.default.serveDirectory;
	})();

global.PORT = args['port'] >= 0
	? args['port']
	: args['run'] ? config.default.PORT_run : config.default.PORT_dev;

global.mainDir = __dirname;

global.setting = {};

/* ------------------------------- functions ------------------------------- */

const htmlGen = require('./lib/htmlGen');

/* ------------------------------ core routes ------------------------------ */

// home page
app.get(['/', '/index.html'], (req, res) => {
	res.send(htmlGen.directory(global.serveDirectory, 'Home Server'));
});

/* ----------------------------- import routes ----------------------------- */

app.use(require('./routes/upload'));

app.use(require('./routes/redirect'));

app.use(require('./routes/set'));

/* ------------------------------ catch routes ------------------------------ */

// generalised page generation
app.get('*', (req, res, next) => {
	const abs = path.join(global.serveDirectory, req.url);
	if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
		res.send(htmlGen.directory(abs));
	} else {
		next();
	}
});

// static files
app.use(express.static(global.serveDirectory));

// 404
app.use((req, res) => {
	res.status(404).sendFile(path.join(__dirname, '404.html'));
});

/* --------------------------------- server --------------------------------- */

app.listen(global.PORT, () => console.log(`Server started on port ${global.PORT}...`));
