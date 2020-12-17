/* eslint-env node */

import express from 'express';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import htmlGen from '../lib/htmlGen';
// eslint-disable-next-line new-cap
const router = express.Router();

module.exports = (function() {
    router.get('/reader/replace', (req, res) => {
        let result = '';
        Object.entries(req.query).forEach(([q, v]) => {
            global.action.reader.replace[q] = v as string;
            result += `${q} replaced with ${v}<br>`;
        });
        global.update.action();
        res.send(htmlGen.wrap(result));
    });

    router.get('/reader/clear', (req, res) => {
        global.action.reader.replace = {};
        global.action.reader.url = '';
        global.update.action();
        res.send(htmlGen.wrap("Reader cleared"));
    });

    router.get('/reader/url', (req, res) => {
        const { url } = global.action.reader;
        res.send(htmlGen.wrap(`
            Reader URL: <a href="${url}">${url}</a>
        `));
    });

    router.get('/reader', (req, res) => {
        if (req.query['url']) {
            // set new last url
            global.action.reader.url = req.query['url'] as string;
            global.update.action();
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

                // Title
                document.querySelector('title').innerHTML = title.innerHTML;
                document.querySelector('#chapter-title').innerHTML = title.innerHTML;

                // Add parts
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
