# OpenChat

## Outline

A online chat application for customer support.
This application uses Typescripts, Socket IO, Node JS, Express, Jade and Angular JS.

## Design

Architecture:

![alt tag](https://github.com/JohnHou2017/OpenChat/blob/master/doc/OpenChatArchitecture.png)

## Servers
```
1. Chat Server: an Express server for client and agency communicationmain, listen at https://localhost:443
2. Agency Server: an Express server for an agency to login to serve client chat request, listen at http://localhost:7000.
3. View Server:an Express server for customer service to login to view chat records, listen at http://localhost:3000
4. Database Server: an Mongodb server, listen at default port: 27017.
```
## Chat Server
```
This is main server, a proxy server to server communication request between a client or visitor and a agent.
```
### HTTPS Express Server
```
// import https module
var https = require('https');
...
// ssl certificate
var sslOptions = {
    key: fs.readFileSync('sslcert/key.pem'),
    cert: fs.readFileSync('sslcert/cert.pem'),
    passphrase: 'J2iIYDRXqi2b1ihb'
};
...
// https server
var httpsServer = https.createServer(sslOptions, app);
...
// start listen
httpsServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
....
``` 
### Socket IO Events
```
// socket io module object
var httpsio = require('socket.io')(httpsServer);
...
// socket io events
io.on('connection', function (socket) {
```
### Data Sturcture
```
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
```
### Global Module
```
// global variables
var globals = require('./globals');
```
#### globals.ts:
```
// database module variable
export var chatdb;
// import server config json file
var config = require('../config/serverConfig.json');
// server addresses
export var agentServerIP = config.agentServerIP;
...
// log4js module variable
var log4js = require('log4js');
...
// agent logger
export var agentLogger = log4js.getLogger('agentlog');
...
```
## Agent Server

## View Server

