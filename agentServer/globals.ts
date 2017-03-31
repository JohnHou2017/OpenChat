'use strict';

export var chatdb;

var config = require('../config/serverConfig.json');
export var CHAT_COLLECTION = config.chatCollection;
export var SESSION_COLLECTION = config.chatSessionCollection;

var log4js = require('log4js');
log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/viewServer.log'), 'viewlog');
export var viewLogger = log4js.getLogger('viewlog');

// Insert document with an Auto-Incrementing Sequence Field
export function insertDocument(db, doc, targetCollection): number {

    let retid: number = 0;

    while (1) {

        var cursor = db.collection(targetCollection).find({}, { _id: 1 }).sort({ _id: -1 }).limit(1);

        var seq = cursor.hasNext() ? cursor.next()._id + 1 : 1;

        viewLogger.error("bbbnewid : " + seq);

        if (isNaN(seq))
            seq = 1;

        doc._id = seq;

        viewLogger.error("newid : " + seq);
        viewLogger.error("targetCollection : " + targetCollection);

        var results = db.collection(targetCollection).insert(doc);

        if (results) {
           viewLogger.error("successnewid : " + seq);
        }

        viewLogger.error(results.writeError);

        //viewLogger.error(results.writeError.code);

        viewLogger.error(results.nInserted);

        //chatdb.collection(SESSION_COLLECTION).insert(this.sessiondoc, function (err, o) {
        //    if (err) {

        //        logger.info('dbSaveSessionStart:' + err.message);
        //    }
        //});

        //if (results.hasWriteError()) {
        //    if (results.writeError.code == 11000) // dup key 
        //        continue;
        //    else
        //        viewLogger.error("unexpected error inserting data: " + results.writeError.code); //tojson(results));
        //}

        retid = seq;

        break;
    }

    return retid;
}

