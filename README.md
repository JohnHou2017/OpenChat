# OpenChat

## Outline

A online chat application for customer support.
This application uses Typescripts, Socket IO, Node.js, Express, Jade and Angular JS.

## Design

Architecture:

![alt tag](https://github.com/JohnHou2017/OpenChat/blob/master/doc/OpenChatArchitecture.png)

## Dev Environment
```
1. Install Visual Studio 2015.
2. Install Node.js.
3. Install Mongodb.
4. Install Robomongo.
```
## Servers
```
1. Chat Server: an Express server for client and agency communicationmain, listen at https://localhost:443.
2. Agency Server: an Express server for an agency to login and serve client, listen at http://localhost:7000.
3. View Server:an Express server for customer service to login to view chats, listen at http://localhost:3000.
4. Database Server: an Mongodb server, listen at default port: 27017.
```
## Chat Server
```
This is main server, a proxy server to server communication request between a client or visitor and a agent.
Source Folder: OpenChat\chatServer
Main Program: app.ts
Build: Run "Build" in Visual Studio 2015.
Start: Run "Node app.js" in DOS cmd console.
```
#### HTTPS Express Server
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
#### Socket IO Events
```
// socket io module object
var httpsio = require('socket.io')(httpsServer);
...
// socket io events
io.on('connection', function (socket) {
```
#### Data Sturcture
```
// a client is a visitor object connected to chat server
var clients = [];

// a chat channel is an object with two socket IDs from agent and client to the chat server
// a chat channel must have two side valid connections to chat server, 
// a chat channel will be deleted if any party leave the chat session(i.e. close chat window)  
var channels = [];

// an agency is a connection socket id to agent server
// an agent has two connection socket IDs to agent server and chat server
// an agent is created when a agency click user to open a chat window
var agencies = [];
```
#### Global Module
```
// global variables
var globals = require('./globals');
```
##### globals.ts:
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
#### Workflow

##### 1. Start Chat Server
```
Open DOS cmd
Run "Node app.js"
httpsServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
```
##### 2. Client Login Page
```
Client or visitor open https://localhost to enter Chat Server login page. 
1. app.ts: app.get('/', routesLogin.login); => 
2. login.ts: res.render('login', { title: 'Client Login' }); =>
3. login.jade: button(type='submit' value='Login').btn.btn-primary Start Chat
```
##### 3. Client Chat Page
```
Click Star Chat button to navigate to client chat page https://localhost/chat.
1. app.ts: app.set('port', globals.chatServerPort); =>
2. chat.ts: res.render('chat', { title: 'Client Chat', message: sendMsg }); =>
3. chat.jade: button#sendBtn.btn.btn-success.btn-lg Send 
```
##### 3. Client Send Message
```
Click Send button to send message.
chatServer\public\javascripts\chat.js: socket.emit("ClientToAgent", msg);
```
##### 5. Client Receive Message
```
Client receive Agent message.
chatServer\public\javascripts\chat.js: socket.on('AgentToClient', function (msg) { ...           
```

## Agent Server

## View Server

