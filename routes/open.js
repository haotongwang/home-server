"use strict";

const router = require('express').Router(); // eslint-disable-line new-cap
const htmlGen = require('../lib/htmlGen');

module.exports = (function() {
	router.get('/messages', (req, res) => {
		const messages = global.action.open['messages'];
		let script = `<script>`;
		for (let i = 1; i < messages.length; ++i) {
			const url = messages[i];
			script += `window.open('${url}');`;
		}
		script += `window.location.replace('${messages[0]}')`;
		script += `</script>`;
		res.send(htmlGen.wrap(script));
	});

	return router;
})();
