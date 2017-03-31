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
var app = express();
// all environments
//app.set('port', process.env.PORT || 5002);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
//app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
var stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
// development only
//if ('development' == app.get('env')) {
//   app.use(express.errorHandler());
//}
app.get('/', routesLogin.login);
app.post('/user', routesUser.user);
app.get('/chat', routesChat.chat);
var dbClient = require('mongodb').MongoClient;
var chatdb;
var users = [];
var channels = [];
var httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);
var log4js = require('log4js');
//log4js.loadAppender('console');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('logs/mylog1.log'), 'mylog1');
var logger = log4js.getLogger('mylog1');
var passwordHash = require('password-hash');
io.on('connection', function (socket) {
    console.log('A Agency connected: ' + socket.id);
    socket.on('Log', function (msg) {
        logger.info(msg);
    });
    socket.on('joinAgent', function (user) {
        user.id = socket.id;
        console.log('user join chat:' + user.name + ',' + user.type + ',' + user.id + ',' + user.toid);
    });
    socket.on('SaveSessionStart', function (agentid, clientid, agencyid, agentname, clientname) {
        console.log("SaveSessionStart:" + agentid + ", " + clientid);
        var ds = new dbsession_1.default();
        ds.agentId = agentid;
        ds.clientId = clientid;
        ds.agencyid = agencyid;
        ds.agentname = agentname;
        ds.clientname = clientname;
        ds.dbSaveSessionStart(chatdb);
    });
    socket.on('SaveSessionEnd', function (agentId, clientId) {
        console.log("SaveSessionEnd:" + agentId + ", " + clientId);
        var ds = new dbsession_1.default();
        ds.agentId = agentId;
        ds.clientId = clientId;
        ds.dbSaveSessionEnd(chatdb);
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
        // async get session, set sessionStartTime in callback
        ds.GetSession(chatdb, dc.sessionId, data, SaveMsgCallback);
        //dc.dbSaveMsg(chatdb);        
    });
    socket.on('SaveRegister', function (username, plainPassword, agencyname) {
        var da = new dbagency_1.default();
        da._id = username;
        da.hashpassword = passwordHash.generate(plainPassword);
        da.agencyname = agencyname;
        // mongo db query is async, use callback to wait it finish and return 
        da.dbSaveAgency(chatdb, socket, SaveRegisterCallback);
    });
    socket.on('CheckLogin', function (username, plainPassword) {
        var da = new dbagency_1.default();
        da.dbCheckLogin(chatdb, socket, username, plainPassword, CheckLoginCallback);
    });
});
var config = require('../config/serverConfig.json');
app.set('hostname', config.agentServerIP);
app.set('port', config.agentServerPort);
httpServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
    //httpServer.listen(app.get('port'), function () {
    console.log('Express server listening on http://' + app.get('hostname') + ':' + app.get('port'));
    dbClient.connect(config.dbUrl, function (err, db) {
        if (err) {
            console.log(err);
        }
        else {
            chatdb = db;
            console.log('Connected to mongodb.');
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
    //console.log('dbhas:' + dbHashPassword);    
    var successLogin = (success == true) && (passwordHash.verify(inputPlainPassword, dbHashPassword) == true);
    socket.emit('LoginResult', successLogin, dbAgencyName);
}
function SaveMsgCallback(sessionObj, data) {
    if (sessionObj) {
        data.chatobj.sessionStartTime = sessionObj.starttime;
    }
    else {
    }
    data.chatobj.dbSaveMsg(chatdb);
}
//# sourceMappingURL=app.js.map