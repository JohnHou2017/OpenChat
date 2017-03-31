"use strict";
var config = require('../../config/serverConfig.json');
var SESSION_COLLECTION = config.chatSessionCollection;
var log4js = require('log4js');
//log4js.loadAppender('console');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('logs/mylog1.log'), 'mylog1');
var logger = log4js.getLogger('mylog1');
var globals = require('../globals');
var dbsession = (function () {
    function dbsession() {
    }
    Object.defineProperty(dbsession.prototype, "sessionId", {
        get: function () {
            if (this._agentId && this._clientId)
                return this.GetSessionId(this._agentId, this._clientId);
            else
                return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "agentId", {
        get: function () { return this._agentId; },
        set: function (value) { this._agentId = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "clientId", {
        get: function () { return this._clientId; },
        set: function (value) { this._clientId = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "agencyid", {
        get: function () { return this._agencyid; },
        set: function (value) { this._agencyid = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "agentname", {
        get: function () { return this._agentname; },
        set: function (value) { this._agentname = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "clientname", {
        get: function () { return this._clientname; },
        set: function (value) { this._clientname = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "starttime", {
        get: function () { return this._starttime; },
        set: function (value) { this._starttime = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "endtime", {
        get: function () { return this._endtime; },
        set: function (value) { this._endtime = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbsession.prototype, "sessiondoc", {
        get: function () {
            return {
                sessionId: this.sessionId,
                agentId: this._agentId,
                clientId: this._clientId,
                agencyid: this._agencyid,
                agentname: this._agentname,
                clientname: this._clientname,
                starttime: this._starttime,
                endtime: this._endtime
            };
        },
        enumerable: true,
        configurable: true
    });
    dbsession.prototype.GetSessionId = function (agentSocketId, clientSocketId) {
        return encodeURIComponent(agentSocketId) + "_" + encodeURIComponent(clientSocketId);
    };
    // create a new session database record when agent pop up chat window to setup chat channel with client in chat server
    dbsession.prototype.dbSaveSessionStart = function (chatdb) {
        logger.info('dbSaveSessionStart:' + this.sessionId);
        this._starttime = new Date();
        this._endtime = null;
        chatdb.collection(SESSION_COLLECTION).insert(this.sessiondoc, function (err, o) {
            if (err) {
                logger.info('dbSaveSessionStart:' + err.message);
            }
        });
        //var newid = globals.insertDocument(chatdb, this.sessiondoc, globals.SESSION_COLLECTION);
        //this._id = newid;
    };
    // update session record end time when client or agent disconnect with chat server
    dbsession.prototype.dbSaveSessionEnd = function (chatdb) {
        logger.info('dbSaveSessionEnd:' + this.sessionId);
        var query = { sessionId: this.sessionId };
        var docFields = {
            $set: { endtime: new Date() }
        };
        chatdb.collection(SESSION_COLLECTION).update(query, docFields, function (err, o) {
            if (err) {
                logger.info('dbSaveSessionEnd fail:' + err.message);
            }
            else {
            }
        });
    };
    // async get session from session id
    dbsession.prototype.GetSession = function (chatdb, searchSessionId, data, callbackfunc) {
        var queryDoc = {
            sessionId: searchSessionId
        };
        chatdb.collection(SESSION_COLLECTION).find(queryDoc).toArray(function (err, resultDocs) {
            if (err) {
                logger.error(err);
                callbackfunc(null, data);
            }
            else {
                if (resultDocs.length > 0) {
                    callbackfunc(resultDocs[0], data);
                }
                else
                    callbackfunc(null, data);
            }
        });
    };
    return dbsession;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbsession;
//# sourceMappingURL=dbsession.js.map