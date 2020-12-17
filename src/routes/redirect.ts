"use strict";

import express from 'express';
import fs from 'fs';
import path from 'path';
import htmlGen from '../lib/htmlGen';
// eslint-disable-next-line new-cap
const router = express.Router();

module.exports = (function() {
    router.get('/redirect', (req, res) => {
        if (req.query['url']) {
            // set new last url
            global.action.redirect = req.query['url'] as string;
            fs.writeFile(
                path.join(global.mainDir, 'action.json'),
                JSON.stringify(global.action, null, '\t'),
                (err) => err && console.error(err)
            );
            res.redirect('/redirect');
            return;
        }
        typeof global.action.redirect === 'string'
            ? res.redirect(global.action.redirect)
            : res.send(htmlGen.wrap('Redirect error', '<h1>No redirect set</h1>'));
    });

    return router;
})();
