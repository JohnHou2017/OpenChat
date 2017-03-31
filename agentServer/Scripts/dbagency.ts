var config = require('../../config/serverConfig.json');

var AGENCY_COLLECTION = config.agencyCollection;

export default class dbagency {

    constructor(){}

    private _username: string;
    get _id(): string { return this._username; }
    set _id(value: string) { this._username = value; }

    private _hashpassword: string;
    get hashpassword(): string { return this._hashpassword; }
    set hashpassword(value: string) { this._hashpassword = value; }

    private _agencyname: string;
    get agencyname(): string { return this._agencyname; }
    set agencyname(value: string) { this._agencyname = value; }

    private _createdtime: Date;
    get createdtime(): Date { return this._createdtime; }
    set createdtime(value: Date) { this._createdtime = value; }

    get agencydoc(): Object {
        return {
            _id: this._username,            
            hashpassword: this._hashpassword,
            agencyname: this._agencyname,
            createdtime: this._createdtime
        };
    }
    
    // save agency to database chatdb and check register result to update error message
    public dbSaveAgency(chatdb, socket, callbackfunc) {
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
    }

    // query chatdb to check login credential and check login result to update error message
    public dbCheckLogin(chatdb, socket, username, plainPassword, callbackfunc) {

        var searchDoc = { '_id': username };

        // mongodb insert is async operation without blocking
        chatdb.collection(AGENCY_COLLECTION).findOne(searchDoc, function (err, result) {
            if (err) {
                console.warn(err.message);
                callbackfunc(socket, plainPassword, null, null, false);
            }
            else {
                if(result != null)
                    callbackfunc(socket, plainPassword, result.hashpassword, result.agencyname, true);
                else
                    callbackfunc(socket, plainPassword, null, null, false);
            }
        });
    }
    

}
