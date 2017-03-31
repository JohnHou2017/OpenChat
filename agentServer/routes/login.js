"use strict";
function login(req, res) {
    res.render('login', { title: 'Agency Login' });
}
exports.login = login;
;
function chat(req, res) {
    var name = req.body.name;
    if (name) {
        res.render('chat', { title: 'Chat', username: name });
    }
    else {
        res.render('login', { title: 'Login', error: 'Please input your name.' });
    }
}
exports.chat = chat;
;
//# sourceMappingURL=login.js.map