"use strict";

import express from 'express';
import htmlGen from '../lib/htmlGen';
// eslint-disable-next-line new-cap
const router = express.Router();

module.exports = (function() {
    router.get('/redirect', (req, res) => {
        if (req.query['url']) {
            // set new last url
            global.action.redirect = req.query['url'] as string;
            global.update.action();
            res.redirect('/redirect');
            return;
        }
        typeof global.action.redirect === 'string'
            ? res.redirect(global.action.redirect)
            : res.send(htmlGen.wrap('Redirect error', '<h1>No redirect set</h1>'));
    });

    return router;
})();
