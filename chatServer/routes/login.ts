import express = require('express');

export function login(req: express.Request, res: express.Response) {
    res.render('login', { title: 'Client Login' });
};

export function chat(req: express.Request, res: express.Response) {
    var name = req.body.name;
    if (name) {
        res.render('chat', { title: 'Client Chat', username: name });
    }
    else {
        res.render('login', { title: 'Client Login', error: 'Please input your name.' });
    }
};