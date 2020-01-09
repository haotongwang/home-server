'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
	let filePath = '.' + decodeURI(req.url);
	if (filePath == './') {
		filePath = './index.html';
	} else if (path.extname(req.url) === '') {
		const [folder] = filePath.match('[^\\/]+(?=\\/$)|[^\\/]+$');
		filePath = path.join(filePath, folder + '.html');
	}

	console.log(filePath);

	const extname = path.extname(filePath);
	let contentType = 'document';
	switch (extname) {
		case '.html':
			contentType = 'text/html';
			break;
		case '.txt':
			contentType = 'text/plain';
			break;
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
		case '.json':
			contentType = 'application/json';
			break;
		case '.png':
			contentType = 'image/png';
			break;
		case '.jpg':
			contentType = 'image/jpg';
			break;
		case '.wav':
			contentType = 'audio/wav';
			break;
		case '.pdf':
			contentType = 'application/pdf';
			break;
		case '.mp4':
			contentType = 'video/mp4';
			break;
	}

	fs.readFile(filePath, function(err, data) {
		if (err) {
			if (err.code == 'ENOENT') {
				fs.readFile('./404.html', function(err, data) {
					res.writeHead(200, { 'Content-Type': contentType });
					res.end(data, 'utf-8');
				});
			} else {
				res.writeHead(500);
				res.end(`Unkown error (${err.code})`);
			}
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(data);
		}
	});
}).listen(PORT, () => console.log(`Server running on port ${PORT}`));

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.on('line', (input) => {
	if (input === '.close' || input === '.quit' || input === '.exit') {
		server.close();
		process.exit();
	};
});
