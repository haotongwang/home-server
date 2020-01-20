"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap

module.exports = (function() {
	router.get('/redirect', (req, res) => {
		typeof router.get('redirect') === 'string' && router.get('redirect')
			? res.redirect(router.get('redirect'))
			: res.send('<h1>No redirect set</h1>');
	});

	return router;
})();
