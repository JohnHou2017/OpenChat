﻿import express = require('express');
import routesLogin = require('./routes/login');
import routesChat = require('./routes/chat');
import path = require('path');
import stylus = require('stylus');
var fs = require('fs');

var https = require('https');

// global variables
var globals = require('./globals');

// express
var app = express();

// ssl certificate

var sslOptions = {
    key: fs.readFileSync('sslcert/key.pem'),
    cert: fs.readFileSync('sslcert/cert.pem'),
    passphrase: 'J2iIYDRXqi2b1ihb'
};

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
app.set('hostname', globals.chatServerIP);
app.set('port', globals.chatServerPort);

// url page route
app.get('/', routesLogin.login);
app.post('/chat', routesLogin.chat);

// client js ajax call
app.get('/config/getone', function (req, res) {
    if (req.query.id == 'chatserver') {
        res.send(globals.chatHttpsServer);
    }    
});

// a client is a visitor object connected to chat server
var clients = [];

// a chat channel is an object with two socket IDs from agent and client to the chat server
// a chat channel must have two side valid connections to chat server, 
// a chat channel will be deleted if any party leave the chat session(i.e. close chat window) will 
var channels = [];

// a agency is a connection socket id to agent server
// a agent has two connection socket IDs to agent server and chat server
// a agent is created when a agency click user to open a chat window
var agencies = [];

// https
var httpsServer = https.createServer(sslOptions, app);

// socket io
var httpsio = require('socket.io')(httpsServer);

var io = httpsio;

var dbSocket;

// socket io events
io.on('connection', function (socket) {
    console.log('A user connected: ' + socket.id);

    socket.emit('ConnectionSocketId', socket.id);

    socket.on('joinChat', function (user) {

        // ensure user.id is socket.id 
        user.id = socket.id;

        console.log('user join chat:' + user.name + ',' + user.type + ',' + user.id + ',' + user.toid + ',' + user.agencyid);

        if (user.type == 'client') {
            // initial number of services a agent provided to the client to be 0.
            user.servedCount = 0;

            clients.push(user);
        }
        else if (user.type == 'agent') {
            console.log('agent join :' + socket.id +","+ user.toid);
            
            var existClient = 0;
            for (var i = 0; i < channels.length; i++) {
                if (channels[i].ClientSocketId == user.toid) {
                    // update existing channel with overwriting existing agent id if client socket is online
                    channels[i].AgentSocketId = socket.id;
                    existClient = 1;
                    break;
                }
            }
            if (existClient == 0) {
                var channel = { AgentSocketId: socket.id, ClientSocketId: user.toid };
                channels.push(channel);
            }

            // increase server count of the client
            // chanage client status to be 'chatting'
            for (var i = 0; i < clients.length; i++) {
                if (clients[i].id == user.toid) {
                    clients[i].servedCount = clients[i].servedCount + 1;
                    clients[i].status = "chatting";
                    break;
                }
            }

            // notify client an agent is ready
            io.sockets.connected[user.toid].emit("AgentToClient", user.name + " is ready to chat with you.");
           
        }
        else if (user.type == 'agency') {
            agencies.push(user.id);
        }

        // notify all agencies with latest client list
        for (var i = 0; i < agencies.length; i++) {            
            io.sockets.connected[agencies[i]].emit("UpdateAgencyUsers", clients);
        }

    });

    socket.on('Broadcast', function (msg) {
        io.sockets.emit('Broadcast', msg);
    });

    socket.on('AgentToClient', function (msg) {        
        for (var i = 0; i < channels.length; i++) {  
            if (channels[i].AgentSocketId == socket.id) {
                console.log('AgentToClient:' + msg);
                console.log('client socket:' + channels[i].ClientSocketId);
                if (channels[i].ClientSocketId != null) {
                    io.sockets.connected[channels[i].ClientSocketId].emit("AgentToClient", msg);
                    break;
                }                               
            }
        }        
    });

    socket.on('ClientToAgent', function (msg) {              
        for (var i = 0; i < channels.length; i++) {
            if (channels[i].ClientSocketId == socket.id) {
                console.log('ClientToAgent:' + msg);
                console.log('agent socket:' + channels[i].AgentSocketId);
                if (channels[i].AgentSocketId != null) {
                    io.sockets.connected[channels[i].AgentSocketId].emit("ClientToAgent", msg);
                    break;
                }                
            }
        }
    });

    socket.on('disconnect', function () {
        console.log('Disconnect:' + socket.id);

        // remove the client if there is no chat channel
        if (channels.length == 0) {
            for (var j = 0; j < clients.length; j++) {
                if (clients[j].id == socket.id) {
                    clients.splice(j, 1);

                    // notify all agencies with latest client list
                    for (var j = 0; j < agencies.length; j++) {
                        io.sockets.connected[agencies[j]].emit("UpdateAgencyUsers", clients);
                    }

                    break;
                }
            }
        }

        // process agent or client disconnection
        for (var i = 0; i < channels.length; i++) {
            
            if (channels[i].AgentSocketId == socket.id) { // agent disconnection in channels
                console.log('Agent disconnect:' + socket.id);
                console.log('client: ' + channels[i].ClientSocketId);           
                
                if (channels[i].ClientSocketId != null) { // if client is still online
                    // notify client the agent is left 
                    io.sockets.connected[channels[i].ClientSocketId].emit("AgentToClient", "Agent is left.");
                    // update client status to be waiting                 
                    for (var j = 0; j < clients.length; j++) {
                        if (clients[j].id == channels[i].ClientSocketId) {
                            clients[j].status = "waitting";
                            break;
                        }
                    }

                    // update session record end time in database
                    dbSocket.emit("SaveSessionEnd", channels[i].AgentSocketId, channels[i].ClientSocketId);

                    // keep the channel but empty the agent socket id
                    channels[i].AgentSocketId = null;
                }
                else { // if client is offline as well
                    // remove the chat channel
                    channels.splice(i, 1);
                }
                                                
                // notify all agencies with latest client list
                for (var j = 0; j < agencies.length; j++) {
                    io.sockets.connected[agencies[j]].emit("UpdateAgencyUsers", clients);
                }
                                                           
                break;
            }
            else if (channels[i].ClientSocketId == socket.id) { // if client disconnection in chat channel
                console.log('Client disconnect:' + socket.id);
                console.log('agent socket:' + channels[i].AgentSocketId);

                if (channels[i].AgentSocketId != null) { // if agent is still online
                    // notify agent the client is left
                    io.sockets.connected[channels[i].AgentSocketId].emit("ClientToAgent", "Client is left.");
                                              
                    // update session record end time in database
                    dbSocket.emit("SaveSessionEnd", channels[i].AgentSocketId, channels[i].ClientSocketId);

                    // keep the channel but empty the client socket id
                    channels[i].ClientSocketId = null;
                }
                else { // if agent is offline as well
                    
                    // remove the chat channel
                    channels.splice(i, 1);
                }

                // remove the client
                for (var j = 0; j < clients.length; j++) {
                    if (clients[j].id == socket.id) {
                        clients.splice(j, 1);
                        break;
                    }
                }

                // notify all agencies with latest client list
                for (var j = 0; j < agencies.length; j++) {                    
                    io.sockets.connected[agencies[j]].emit("UpdateAgencyUsers", clients);
                }                
               
                break;
            }
        }

        
        for (var i = 0; i < agencies.length; i++) {
            if (agencies[i] == socket.id) { // if agency disconnection
                console.log("Agency disconnection:" + socket.id);
               
                // remove agency from agencies array
                agencies.splice(i, 1);

                break;
            }
        }
        
    });

    
});

// start express listen
httpsServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {

    console.log('Express server listening on ' + globals.chatHttpsServer); 
    
    // get agency io for direct database access
    dbSocket = require('socket.io-client')(globals.agencyHttpServer);
});
