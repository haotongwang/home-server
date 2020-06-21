/* eslint-env node */

const https = require('https');
const router = require('express').Router(); // eslint-disable-line new-cap
const htmlGen = require('../lib/htmlGen');

module.exports = (function() {
	router.get('/reader', (req, res) => {
		https.get('https://novelfull.com/martial-world/chapter-1068-marriage.html', (r) => {
			let data = '';

			// A chunk of data has been received.
			r.on('data', (chunk) => {
				data += chunk;
			});

			// The whole response has been received. Print out the result.
			r.on('end', () => {
				res.send(data);
			});
		});
	});

	return router;
})();
