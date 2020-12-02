/* eslint-env node */
"use strict";

import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';
import yargs from 'yargs';
import htmlGen from './lib/htmlGen';

const app = express();

const options = {
    key: fs.readFileSync("certs/selfsigned.key"),
    cert: fs.readFileSync("certs/selfsigned.crt")
};

/* --------------------------------- params --------------------------------- */

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
            default: '',
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

{
    // Config
    const configPath = 'config.json';
    global.config = JSON.parse(fs.readFileSync(configPath).toString());

    // Serve directory
    const def = global.config.default;
    global.serveDirectory = args.d || def.serveDirectory;
    if (!fs.statSync(global.serveDirectory).isDirectory()) {
        console.log(`Invalid path: ${args.d}, serve directory set to ${def.serveDirectory}`);
        global.serveDirectory = def.serveDirectory;
    }
    global.serveDirectory = global.serveDirectory.replace(/\/|\\/g, '\\');

    // Port
    global.PORT = args.p >= 0
        ? args.p as Port : args.r
            ? def.PORT_run : def.PORT_dev;

    // Main directory
    global.mainDir = path.resolve(__dirname, '..');

    // Action
    const actionPath = 'action.json';
    global.action = fs.existsSync(actionPath)
        ? JSON.parse(fs.readFileSync(actionPath).toString())
        : {};
}

/* ------------------------------- functions ------------------------------- */


/* ------------------------------ core routes ------------------------------ */

// home page
app.get(['/', '/index.html'], (req, res) => {
    res.send(htmlGen.directory(global.serveDirectory, 'Home Server'));
});

// favicon
app.get('/favicon.ico', (req, res) => {
    res.send('favicon/favicon.ico');
});

/* ----------------------------- import routes ----------------------------- */

app.use(require('./routes/upload'));

app.use(require('./routes/redirect'));

app.use(require('./routes/set'));

app.use(require('./routes/reader'));

app.use('/open', require('./routes/open'));

/* ------------------------------ catch routes ------------------------------ */

// testing new features
app.get('/test', (req, res) => {
    res.sendFile('test.html');
});

// generalised page generation
app.get('*', (req, res, next) => {
    const abs = path.join(global.serveDirectory, req.url);
    if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
        res.send(htmlGen.directory(abs));
    } else {
        next();
    }
});

// Styles
app.use('/styles', express.static(path.join(global.mainDir, 'styles')));

// static files
app.use(express.static(global.serveDirectory));

// 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(global.mainDir, 'pages/404.html'));
});

/* --------------------------------- server --------------------------------- */

const server = https.createServer(options, app);

server.listen(global.PORT, () => {
    console.log(`Server started on port ${global.PORT}...`);
});

/* ----------------------------- http -> https ----------------------------- */

if (args['run']) {
    const app = express();
    app.get('*', (req, res) => {
        res.redirect(301, `https://${req.hostname}${req.url}`);
    });
    http.createServer(app).listen(80);
}
