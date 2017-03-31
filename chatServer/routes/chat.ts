import express = require('express');

export function send(req: express.Request, res: express.Response) {
    var sendMsg = req.body.sendMsg;
    res.render('chat', { title: 'Client Chat', message: sendMsg });
};