import express = require('express');

export function chat(req: express.Request, res: express.Response) {

    var agency = req.query.agencyid;
    var agtname = req.query.agentname;
    var cname = req.query.clientname;
    var csocketid = req.query.clientsocketid;
    
    res.render('chat', { title: 'Agent Chat', agencyId: agency, agentName: agtname, clientName: cname, clientSocketId: csocketid });
};