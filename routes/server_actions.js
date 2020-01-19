module.exports = (global) => {
	const router = require('express').Router(); // eslint-disable-line new-cap
	router.get('*', (req, res, next) => {
		console.log('router');
		next();
	});
	return router;
};
