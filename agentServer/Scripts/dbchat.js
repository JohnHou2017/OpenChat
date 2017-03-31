"use strict";
var config = require('../../config/serverConfig.json');
var CHAT_COLLECTION = config.chatCollection;
var dbchat = (function () {
    function dbchat() {
    }
    Object.defineProperty(dbchat.prototype, "sessionId", {
        get: function () { return this._sessionId; },
        set: function (value) { this._sessionId = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "message", {
        get: function () { return this._message; },
        set: function (value) { this._message = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "msgtime", {
        get: function () { return this._msgtime; },
        set: function (value) { this._msgtime = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "agencyid", {
        get: function () { return this._agencyid; },
        set: function (value) { this._agencyid = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "agentname", {
        get: function () { return this._agentname; },
        set: function (value) { this._agentname = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "clientname", {
        get: function () { return this._clientname; },
        set: function (value) { this._clientname = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "sessionStartTime", {
        get: function () { return this._sessionStartTime; },
        set: function (value) { this._sessionStartTime = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbchat.prototype, "chatdoc", {
        get: function () {
            return {
                sessionId: this._sessionId,
                message: this._message,
                msgtime: this._msgtime,
                agencyid: this._agencyid,
                agentname: this._agentname,
                clientname: this._clientname,
                sessionStartTime: this._sessionStartTime
            };
        },
        enumerable: true,
        configurable: true
    });
    // save agent or client message to database chatdb
    dbchat.prototype.dbSaveMsg = function (chatdb) {
        this._msgtime = new Date();
        chatdb.collection(CHAT_COLLECTION).insert(this.chatdoc, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
        });
    };
    return dbchat;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbchat;
//# sourceMappingURL=dbchat.js.map