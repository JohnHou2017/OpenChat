"use strict";
function send(req, res) {
    var sendMsg = req.body.sendMsg;
    res.render('chat', { title: 'Client Chat', message: sendMsg });
}
exports.send = send;
;
//# sourceMappingURL=chat.js.map