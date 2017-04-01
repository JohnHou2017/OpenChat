"use strict";
var express = require('express');
var routesLogin = require('./routes/login');
var routesUser = require('./routes/user');
var routesChat = require('./routes/chat');
var dbsession_1 = require('./Scripts/dbsession');
var dbchat_1 = require('./Scripts/dbchat');
var dbagency_1 = require('./Scripts/dbagency');
var http = require('http');
var path = require('path');
var stylus = require('stylus');
// global variables
var globals = require('./globals');
// express 
var app = express();
// environment
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
// listen parameter
app.set('hostname', globals.agentServerIP);
app.set('port', globals.agentServerPort);
// route
app.get('/', routesLogin.login);
app.post('/user', routesUser.user);
app.get('/chat', routesChat.chat);
// client js ajax call
app.get('/config/getone', function (req, res) {
    if (req.query.id == 'chatserver') {
        res.send(globals.chatHttpsServer);
    }
    else if (req.query.id == 'chatagentserver') {
        var retobj = {
            agencyHttpServer: globals.agencyHttpServer,
            chatHttpsServer: globals.chatHttpsServer
        };
        res.send(retobj);
    }
});
// server
var httpServer = http.createServer(app);
// socket io
var io = require('socket.io')(httpServer);
// hash password
var passwordHash = require('password-hash');
// io events
io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);
    // serve client js log socket io event with log4js 
    socket.on('ProxyLogInfo', function (msg) {
        globals.agentLogger.info(msg);
    });
    socket.on('joinAgent', function (user) {
        user.id = socket.id;
        console.log('User join chat:' + user.name + ',' + user.type + ',' + user.id + ',' + user.toid);
    });
    socket.on('SaveSessionStart', function (agentid, clientid, agencyid, agentname, clientname) {
        console.log("SaveSessionStart:" + agentid + ", " + clientid);
        var ds = new dbsession_1.default();
        ds.agentId = agentid;
        ds.clientId = clientid;
        ds.agencyid = agencyid;
        ds.agentname = agentname;
        ds.clientname = clientname;
        ds.dbSaveSessionStart();
    });
    socket.on('SaveSessionEnd', function (agentId, clientId) {
        console.log("SaveSessionEnd:" + agentId + ", " + clientId);
        var ds = new dbsession_1.default();
        ds.agentId = agentId;
        ds.clientId = clientId;
        ds.dbSaveSessionEnd();
    });
    socket.on('SaveChatMsg', function (msg, agentid, clientid, agencyid, agentname, clientname) {
        var dc = new dbchat_1.default();
        dc.message = msg;
        dc.agencyid = agencyid;
        dc.agentname = agentname;
        dc.clientname = clientname;
        var ds = new dbsession_1.default();
        dc.sessionId = ds.GetSessionId(agentid, clientid);
        var data = { chatobj: dc };
        // async get session, set sessionStartTime and save msg in callback
        ds.GetSession(dc.sessionId, data, SaveMsgCallback);
    });
    socket.on('SaveRegister', function (username, plainPassword, agencyname) {
        var da = new dbagency_1.default();
        da._id = username;
        da.hashpassword = passwordHash.generate(plainPassword);
        da.agencyname = agencyname;
        // mongo db query is async, use callback to wait it finish and return 
        da.dbSaveAgency(socket, SaveRegisterCallback);
    });
    socket.on('CheckLogin', function (username, plainPassword) {
        var da = new dbagency_1.default();
        da.dbCheckLogin(socket, username, plainPassword, CheckLoginCallback);
    });
});
// start express listen
httpServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
    console.log('Express server listening on ' + globals.agencyHttpServer);
    // db instance
    var dbInst = require('mongodb').MongoClient;
    // db connection
    dbInst.connect(globals.dbUrl, function (err, dbConnected) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Connected to mongodb.');
            // assign connected db instance to global variable once connected
            globals.chatdb = dbConnected;
        }
    });
});
// update error message in callback after mongo db query return
function SaveRegisterCallback(socket, success) {
    if (success) {
        socket.emit('RegisterResult', 'Success Register.');
    }
    else {
        socket.emit('RegisterResult', 'Fail Register. Try another Username or contact technical support.');
    }
}
// update error message in callback after mongo db query return
function CheckLoginCallback(socket, inputPlainPassword, dbHashPassword, dbAgencyName, success) {
    var successLogin = (success == true) && (passwordHash.verify(inputPlainPassword, dbHashPassword) == true);
    socket.emit('LoginResult', successLogin, dbAgencyName);
}
function SaveMsgCallback(sessionObj, data) {
    if (sessionObj) {
        // update sessionStartTime
        data.chatobj.sessionStartTime = sessionObj.starttime;
    }
    else {
    }
    // save msg
    data.chatobj.dbSaveMsg();
}
//# sourceMappingURL=app.js.map