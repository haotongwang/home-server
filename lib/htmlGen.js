"use strict";

const { JSDOM } = require('jsdom');
const path = require('path');
const fs = require('fs');

module.exports = (function() {
	/**
	 * Generate a stringified HTML file listing the contents of the directory
	 * @param {String} dirPath Path to directory
	 * @param {String} title Title of page
	 * @return {String} Stringified HTML
	 */
	function directory(dirPath, title = null) {
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

	return {
		directory
	};
})();