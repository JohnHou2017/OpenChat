var config = require('../../config/serverConfig.json');

var SESSION_COLLECTION = config.chatSessionCollection;

var log4js = require('log4js');
//log4js.loadAppender('console');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('logs/mylog1.log'), 'mylog1');

var logger = log4js.getLogger('mylog1');

var globals = require('../globals');

export default class dbsession
{    
    constructor() { }    

    get sessionId(): string {
        if (this._agentId && this._clientId)
            return this.GetSessionId(this._agentId, this._clientId);
        else
            return null;
    }    

    private _agentId: string;
    get agentId(): string { return this._agentId; }
    set agentId(value: string) { this._agentId = value; }

    private _clientId: string;
    get clientId(): string { return this._clientId; }
    set clientId(value: string) { this._clientId = value; }

    private _agencyid: string;
    get agencyid(): string { return this._agencyid; }
    set agencyid(value: string) { this._agencyid = value; }

    private _agentname: string;
    get agentname(): string { return this._agentname; }
    set agentname(value: string) { this._agentname = value; }

    private _clientname: string;
    get clientname(): string { return this._clientname; }
    set clientname(value: string) { this._clientname = value; }

    private _starttime: Date;
    get starttime(): Date { return this._starttime; }
    set starttime(value: Date) { this._starttime = value; }

    private _endtime: Date;
    get endtime(): Date { return this._endtime; }
    set endtime(value: Date) { this._endtime = value; }    

    get sessiondoc(): Object {
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
    }

    public GetSessionId(agentSocketId: string, clientSocketId: string): string {
        return encodeURIComponent(agentSocketId) + "_" + encodeURIComponent(clientSocketId);
    }

    // create a new session database record when agent pop up chat window to setup chat channel with client in chat server
    public dbSaveSessionStart(chatdb) {
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
    }

    // update session record end time when client or agent disconnect with chat server
    public dbSaveSessionEnd(chatdb) {
        
        logger.info('dbSaveSessionEnd:' + this.sessionId);

        var query = { sessionId: this.sessionId }
       
        var docFields = {
            $set: { endtime: new Date() }
        };  
        
        chatdb.collection(SESSION_COLLECTION).update(query, docFields, function (err, o) {
            if (err) {
                
                logger.info('dbSaveSessionEnd fail:' + err.message);
            }
            else {
                
                //logger.info('dbsession  success');
            }
        });
    }

    // async get session from session id
    public GetSession(chatdb, searchSessionId, data, callbackfunc) {
        
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
    }

}
