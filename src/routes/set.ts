"use strict";

import express from 'express';
import formidable from 'formidable';
import path from 'path';
import htmlGen from '../lib/htmlGen';
// eslint-disable-next-line new-cap
const router = express.Router();

module.exports = (function() {
    router.get('/set', (req, res) => {
        if (Object.keys(req.query).length > 0) {
            // Set properties
            let content = '';
            Object.entries(req.query).forEach(([action, value]) => {
                if (global.action.hasOwnProperty(action)) {
                    global.action[action] = value;
                    content += `<h1>${action} set to ${value}</h1>`;
                } else {
                    content += `<h1>${action} not found</h1>`;
                }
            });
            global.update.action();
            res.send(htmlGen.wrap(content));
            return;
        }
        // Set page
        res.status(501).sendFile(path.join(global.mainDir, 'pages/501.html'));
    });

    router.route('/set/:action')
        .get((req, res) => {
            res.sendFile(path.join(global.mainDir, 'pages/set.html'));
        })
        .post((req, res) => {
            const { action } = req.params;
            const form = formidable({ keepExtensions: true, multiples: true });

            form.parse(req, (err, fields) => {
                res.redirect(`/set?${action}=${fields.value}`);
            });
        });

    return router;
})();
