"use strict";
var globals = require('../globals');
function chat(req, res) {
    var agency = req.query.agencyid;
    var agtname = req.query.agentname;
    var cname = req.query.clientname;
    var csocketid = req.query.clientsocketid;
    res.render('chat', { title: 'Agent Chat', agencyId: agency, agentName: agtname, clientName: cname, clientSocketId: csocketid });
}
exports.chat = chat;
;
//# sourceMappingURL=chat.js.map