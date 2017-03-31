"use strict";
var config = require('../../config/serverConfig.json');
var AGENCY_COLLECTION = config.agencyCollection;
var dbagency = (function () {
    function dbagency() {
    }
    Object.defineProperty(dbagency.prototype, "_id", {
        get: function () { return this._username; },
        set: function (value) { this._username = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbagency.prototype, "hashpassword", {
        get: function () { return this._hashpassword; },
        set: function (value) { this._hashpassword = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbagency.prototype, "agencyname", {
        get: function () { return this._agencyname; },
        set: function (value) { this._agencyname = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbagency.prototype, "createdtime", {
        get: function () { return this._createdtime; },
        set: function (value) { this._createdtime = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(dbagency.prototype, "agencydoc", {
        get: function () {
            return {
                _id: this._username,
                hashpassword: this._hashpassword,
                agencyname: this._agencyname,
                createdtime: this._createdtime
            };
        },
        enumerable: true,
        configurable: true
    });
    // save agency to database chatdb and check register result to update error message
    dbagency.prototype.dbSaveAgency = function (chatdb, socket, callbackfunc) {
        this._createdtime = new Date();
        // mongodb insert is async operation without blocking
        chatdb.collection(AGENCY_COLLECTION).insert(this.agencydoc, function (err, result) {
            if (err) {
                console.warn(err.message);
                callbackfunc(socket, false);
            }
            else
                callbackfunc(socket, true);
        });
    };
    // query chatdb to check login credential and check login result to update error message
    dbagency.prototype.dbCheckLogin = function (chatdb, socket, username, plainPassword, callbackfunc) {
        var searchDoc = { '_id': username };
        // mongodb insert is async operation without blocking
        chatdb.collection(AGENCY_COLLECTION).findOne(searchDoc, function (err, result) {
            if (err) {
                console.warn(err.message);
                callbackfunc(socket, plainPassword, null, null, false);
            }
            else {
                if (result != null)
                    callbackfunc(socket, plainPassword, result.hashpassword, result.agencyname, true);
                else
                    callbackfunc(socket, plainPassword, null, null, false);
            }
        });
    };
    return dbagency;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = dbagency;
//# sourceMappingURL=dbagency.js.map