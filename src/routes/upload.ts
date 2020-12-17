"use strict";

import express from 'express';
import { IncomingForm as Formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
// eslint-disable-next-line new-cap
const router = express.Router();

module.exports = (function() {
    router.post('/upload', (req, res) => {
        const form = new Formidable();
        form.keepExtensions = true;
        form.multiples = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(err);
                return;
            }

            const upload = files.upload instanceof Array
                ? files.upload
                : [files.upload];

            // Ignore empty upload
            if (upload[0].size !== 0) {
                const urlPath = new URL(req.get('referer')).pathname;
                const fileDir = urlPath === "index.html"
                    ? global.serveDirectory
                    : path.join(global.serveDirectory, urlPath);

                upload.forEach((file) => fs.rename(
                    file.path,
                    path.join(fileDir, file.name),
                    (err) => console.error(err)
                ));
            }

            res.redirect(req.get('referer'));
        });
    });

    return router;
})();
