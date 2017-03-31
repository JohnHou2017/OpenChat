'use strict';
var config = require('../config/serverConfig.json');
exports.CHAT_COLLECTION = config.chatCollection;
exports.SESSION_COLLECTION = config.chatSessionCollection;
exports.AGENCY_COLLECTION = config.agencyCollection;
var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/viewServer.log'), 'viewlog');
exports.viewLogger = log4js.getLogger('viewlog');
// not in use
// insert document with an Auto-Incrementing Sequence Field
function insertDocument(doc, targetCollection) {
    while (1) {
        var cursor = targetCollection.find({}, { _id: 1 }).sort({ _id: -1 }).limit(1);
        var seq = cursor.hasNext() ? cursor.next()._id + 1 : 1;
        doc._id = seq;
        var results = targetCollection.insert(doc);
        if (results.hasWriteError()) {
            if (results.writeError.code == 11000 /* dup key */)
                continue;
            else
                exports.viewLogger.error("unexpected error inserting data: " + results.writeError.code); //tojson(results));
        }
        break;
    }
}
exports.insertDocument = insertDocument;
//# sourceMappingURL=globals.js.map