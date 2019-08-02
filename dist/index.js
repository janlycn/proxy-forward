"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const scheduler_1 = require("./scheduler");
const valid_proxy_1 = require("./cache/valid-proxy");
const extract_proxy_1 = require("./cache/extract-proxy");
const app = express();
const s = new scheduler_1.Scheduler();
app.get('/start', function (_, res) {
    s.start();
    res.send('ok!');
});
app.get('/stop', function (_, res) {
    s.stop();
    res.send('ok!');
});
app.get('/proxys', function (_, res) {
    const keys = valid_proxy_1.default.keys();
    if (keys && keys.length) {
        res.send(keys.join(','));
    }
    else {
        res.send('nothing!');
    }
});
app.get('/extract', function (_, res) {
    const keys = extract_proxy_1.default.keys();
    if (keys && keys.length) {
        res.send(keys.join(','));
    }
    else {
        res.send('nothing!');
    }
});
app.listen(3009, '0.0.0.0');
//# sourceMappingURL=index.js.map