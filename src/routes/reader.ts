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
                global.action.reader.replace[q] = req.query[q] as string;
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
        global.action.reader.replace = {};
        global.action.reader.url = '';
        fs.writeFile(
            path.join(global.mainDir, 'action.json'),
            JSON.stringify(global.action, null, '\t'),
            (err) => err && console.error(err)
        );
        res.send(htmlGen.wrap("Reader cleared"));
    });

    router.get('/reader/url', (req, res) => {
        res.send(htmlGen.wrap(`Reader URL: ${global.action.reader.url}`));
    });

    router.get('/reader', (req, res) => {
        if (req.query['url']) {
            // set new last url
            global.action.reader.url = req.query['url'] as string;
            fs.writeFile(
                path.join(global.mainDir, 'action.json'),
                JSON.stringify(global.action, null, '\t'),
                (err) => err && console.error(err)
            );
            res.redirect('/reader');
            return;
        }

        const u = global.action.reader.url;
        if (!u) res.send(htmlGen.wrap('No url'));

        JSDOM.fromURL(u)
            .then((source) => {
                const url = new URL(u);
                const j = new JSDOM(fs.readFileSync("pages/reader.html"));
                const document = j.window.document;

                // Targets for reader
                const whitelist = global.config.reader.whitelist;
                const target = global.config.reader.targets[url.hostname];
                const title = source.window.document.querySelector(target.title);
                const content = source.window.document.querySelector(target.content);
                const next = source.window.document.querySelector<HTMLAnchorElement>(target.next);
                const prev = source.window.document.querySelector<HTMLAnchorElement>(target.prev);

                // Clean content
                Object.values(content.children).forEach((child) => {
                    if (!whitelist.includes(child.nodeName.toLowerCase())) child.remove();
                });
                content.removeAttribute('style');
                content.removeAttribute('class');
                content.setAttribute('id', 'chapter-content');

                // Add parts
                document.querySelector('title').innerText = title.innerHTML;
                document.querySelector<HTMLAnchorElement>('#next_chap').href
                    += `${next.href.startsWith('https://') ? '' : url.origin}${next.href}`;
                document.querySelector<HTMLAnchorElement>('#prev_chap').href
                    += `${prev.href.startsWith('https://') ? '' : url.origin}${prev.href}`;
                const c = document.querySelector('#chapter-content');
                c.parentNode.replaceChild(content, c);

                let page = j.serialize();

                // Replace specified strings
                const replace = global.action.reader.replace;
                Object.entries(replace).forEach(([str, rep]) => {
                    page = page.replace(new RegExp(str, 'g'), rep);
                });

                res.send(page);
            }).catch((e) => console.log(e));
    });

    return router;
})();
