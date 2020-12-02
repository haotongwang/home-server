/* eslint-env node */

import express from 'express';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import path from 'path';
import htmlGen from '../lib/htmlGen';
// eslint-disable-next-line new-cap
const router = express.Router();

module.exports = (function() {
    router.get('/reader/replace', (req, res) => {
        let result = '';
        for (const q in req.query) {
            if (req.query.hasOwnProperty(q)) {
                global.action['reader-replace'][q] = req.query[q] as string;
                result += `${q} replaced with ${req.query[q]}<br>`;
            }
        }
        fs.writeFile(
            path.join(global.mainDir, 'action.json'),
            JSON.stringify(global.action, null, '\t'),
            (err) => err && console.error(err)
        );
        res.send(htmlGen.wrap(result));
    });

    router.get('/reader/clear', (req, res) => {
        global.action['reader-replace'] = {};
        global.action['reader-url'] = null;
        fs.writeFile(
            path.join(global.mainDir, 'action.json'),
            JSON.stringify(global.action, null, '\t'),
            (err) => err && console.error(err)
        );
        res.send(htmlGen.wrap("Reader cleared"));
    });

    router.get('/reader/url', (req, res) => {
        res.send(htmlGen.wrap(`Reader URL: ${global.action['reader-url']}`));
    });

    router.get('/reader', (req, res) => {
        if (req.query['url']) {
            // set new last url
            global.action['reader-url'] = new URL(req.query['url'] as string);
            fs.writeFile(
                path.join(global.mainDir, 'action.json'),
                JSON.stringify(global.action, null, '\t'),
                (err) => err && console.error(err)
            );
            res.redirect('/reader');
        }

        const url = global.action['reader-url'];

        if (url == null) {
            res.send(htmlGen.wrap('No url'));
        }

        JSDOM.fromURL(url.toString())
            .then((dom) => {
                const j = new JSDOM(fs.readFileSync("pages/reader.html"));

                const window = j.window;
                const document = window.document;

                document.body.appendChild(dom.window.document.querySelector('#chapter'));

                document.querySelectorAll('a').forEach((h) => {
                    h.href = `/reader?url=${url.origin}${h.href}`;
                });


                document.querySelectorAll('script').forEach((h) => {
                    h.parentElement.removeChild(h);
                });

                const script = document.createElement('script');
                script.innerHTML = `
                    document.addEventListener('keydown', (event) => {
                        switch (event.keyCode) {
                            case 39:
                                // next page
                                document.querySelector('#next_chap').click();
                                break;
                            case 37:
                                // previous page
                                document.querySelector('#prev_chap').click();
                                break;

                        }
                    });
                `;
                document.head.appendChild(script);

                let page = j.serialize();

                const replace = global.action['reader-replace'];


                for (const str in replace) {
                    if (replace.hasOwnProperty(str)) {
                        page = page.replace(new RegExp(str, 'g'), replace[str]);
                    }
                }

                res.send(page);
            }).catch((e) => console.log(e));
    });

    return router;
})();
