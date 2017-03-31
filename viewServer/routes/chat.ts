import express = require('express');

var globals = require('../globals');

export function AllChat(req: express.Request, res: express.Response) {
    var sortCol = { sessionStartTime: 1, msgtime: 1 };
    globals.chatdb.collection(globals.CHAT_COLLECTION).find({}).sort(sortCol).toArray(function (err, resultDocs) {
        if (err) {
            globals.viewLogger.error(err);
        }
        else {
            globals.viewLogger.info("all chat:" + resultDocs.length);
            res.status(200).json(resultDocs);
        }
    });
}

export function AllSession(req: express.Request, res: express.Response) {
    globals.chatdb.collection(globals.SESSION_COLLECTION).find({}).toArray(function (err, resultDocs) {
        if (err) {
            globals.viewLogger.error(err);
        }
        else {
            globals.viewLogger.info("all session:" + resultDocs.length);
            res.status(200).json(resultDocs);
        }
    });
}

export function AllAgency(req: express.Request, res: express.Response) {
    globals.chatdb.collection(globals.AGENCY_COLLECTION).find({}).toArray(function (err, resultDocs) {
        if (err) {
            globals.viewLogger.error(err);
        }
        else {
            globals.viewLogger.info("all agency:" + resultDocs.length);
            res.status(200).json(resultDocs);
        }
    });
}