"use strict";

import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';

export default (function() {
    /**
     * Generate a stringified HTML file listing the contents of the directory
     *
     * @param dirPath Path to directory
     * @param title Title of page
     * @returns Stringified HTML
     */
    function directory(dirPath: string, title: string = null): string {
        title = title || path.basename(dirPath);

        const { document } = new JSDOM().window;

        // Head
        document.title = title;
        const icon = document.createElement('link');
        icon.href = "favicon/favicon.ico";
        icon.rel = "shortcut icon";
        document.head.appendChild(icon);

        // Title
        const h1 = document.createElement('h1');
        h1.innerHTML = title;
        document.body.appendChild(h1);

        // Directories and files
        const ul = document.createElement('ul');
        document.body.appendChild(ul);
        fs.readdirSync(dirPath).forEach((d) => {
            const li = document.createElement('li');
            const urlServe = dirPath.replace(global.serveDirectory, '');
            li.innerHTML = `<a href="${path.join(urlServe, d)}">${d}</a>`;
            ul.appendChild(li);
        });

        // Upload
        const div = document.createElement('div');
        div.innerHTML = `<form action="/upload"enctype="multipart/form-data"method="POST"><input type="file"name="upload"multiple="multiple"oninput="if(this.value)submit.disabled=false;else submit.disabled=true;"><input type="submit"value="Upload"id="submit"></form>`;
        document.body.appendChild(div);

        return document.documentElement.outerHTML;
    }

    /**
     * Wraps HTML body string with HTML document
     *
     * @param content HTML string of the body
     * @param title Title of document
     * @returns HTML string
     */
    function wrap(content = 'Home Server', title = 'Home Server'): string {
        const { document } = new JSDOM().window;
        document.title = title;
        document.body.innerHTML = content;
        return document.documentElement.outerHTML;
    }

    return {
        directory,
        wrap
    };
})();
