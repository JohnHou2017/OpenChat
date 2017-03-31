var config = require('../../config/serverConfig.json');

var CHAT_COLLECTION = config.chatCollection;

export default class dbchat {

    constructor(){}

    private _sessionId: string;
    get sessionId(): string { return this._sessionId; }
    set sessionId(value: string) { this._sessionId = value; }

    private _message: string;
    get message(): string { return this._message; }
    set message(value: string) { this._message = value; }

    private _msgtime: Date;
    get msgtime(): Date { return this._msgtime; }
    set msgtime(value: Date) { this._msgtime = value; }
   
    private _agencyid: string;
    get agencyid(): string { return this._agencyid; }
    set agencyid(value: string) { this._agencyid = value; }

    private _agentname: string;
    get agentname(): string { return this._agentname; }
    set agentname(value: string) { this._agentname = value; }

    private _clientname: string;
    get clientname(): string { return this._clientname; }
    set clientname(value: string) { this._clientname = value; }

    private _sessionStartTime: Date;
    get sessionStartTime(): Date { return this._sessionStartTime; }
    set sessionStartTime(value: Date) { this._sessionStartTime = value; }

    get chatdoc(): Object {
        return {
            sessionId: this._sessionId,            
            message: this._message,
            msgtime: this._msgtime,
            agencyid: this._agencyid,
            agentname: this._agentname,
            clientname: this._clientname,
            sessionStartTime: this._sessionStartTime
        };
    }
    
    // save agent or client message to database chatdb
    public dbSaveMsg(chatdb) {
        this._msgtime = new Date();
        chatdb.collection(CHAT_COLLECTION).insert(this.chatdoc, function (err, o) {
            if (err) {
                console.warn(err.message);
            }
        });
    }

    

}
