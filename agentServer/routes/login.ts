import express = require('express');

export function login(req: express.Request, res: express.Response) {
    res.render('login', { title: 'Agency Login' });
};

export function chat(req: express.Request, res: express.Response) {
    var name = req.body.name;
    if (name) {
        res.render('chat', { title: 'Chat', username: name });
    }
    else {
        res.render('login', { title: 'Login', error: 'Please input your name.' });
    }
};