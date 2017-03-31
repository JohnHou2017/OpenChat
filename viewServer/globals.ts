'use strict';

export var chatdb;

var config = require('../config/serverConfig.json');
export var CHAT_COLLECTION = config.chatCollection;
export var SESSION_COLLECTION = config.chatSessionCollection;
export var AGENCY_COLLECTION = config.agencyCollection;

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/viewServer.log'), 'viewlog');
export var viewLogger = log4js.getLogger('viewlog');

// not in use
// insert document with an Auto-Incrementing Sequence Field
export function insertDocument(doc, targetCollection) {

    while (1) {

        var cursor = targetCollection.find({}, { _id: 1 }).sort({ _id: -1 }).limit(1);

        var seq = cursor.hasNext() ? cursor.next()._id + 1 : 1;

        doc._id = seq;

        var results = targetCollection.insert(doc);

        if (results.hasWriteError()) {
            if (results.writeError.code == 11000 /* dup key */)
                continue;
            else
                viewLogger.error("unexpected error inserting data: " + results.writeError.code); //tojson(results));
        }

        break;
    }
}

