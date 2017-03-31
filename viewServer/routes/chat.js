"use strict";
var globals = require('../globals');
function AllChat(req, res) {
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
exports.AllChat = AllChat;
function AllSession(req, res) {
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
exports.AllSession = AllSession;
function AllAgency(req, res) {
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
exports.AllAgency = AllAgency;
//# sourceMappingURL=chat.js.map