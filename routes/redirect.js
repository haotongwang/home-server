"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap
const path = require('path');
const htmlGen = require(path.join(global.mainDir, 'lib/htmlGen'));

module.exports = (function() {
	router.get('/redirect', (req, res) => {
		typeof global.config.action['redirect'] === 'string'
			? res.redirect(global.config.action['redirect'])
			: res.send(htmlGen.wrap('Redirect error', '<h1>No redirect set</h1>'));
	});

	return router;
})();
