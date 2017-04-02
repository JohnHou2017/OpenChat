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
4. Database Server: a Mongodb server, listen at default port: 27017.
```
## Chat Server
```
This is main server, a proxy server to serve client login and process communication request between a client or visitor and an agent.

Source Folder: OpenChat\chatServer
Main Program: app.ts
Build: Run "Build" in Visual Studio 2015.
Start: Run "Node app.js" in DOS cmd console.
Listen: https://localhost
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
#### Client Side js
```
Source: chatServer\public\javascripts\chat.js
This client side javascript is the "code behind" of the chat page "chat.jade". It sends out client message, receives agent's message and updates chat page accordingly.

1. Get chat server listen address for chat server Socket IO connection.

Source:
$.get('/config/getone', parameters, function (data) {

The ajax request's repsonse function is defined in app.ts:
...
app.get('/config/getone', function (req, res) {
    if (req.query.id == 'chatserver') {
        res.send(globals.chatHttpsServer);
    }    
});
...

This is done by sending an ajax request to chat server, then return the listen address from a global config file in server side. By this way there is no need to hardcode a Socket IO connection address and maintain consistency between server side and client side from same config source "OpenChat\config\serverConfig.json". Another reason is that there is no build-in module import feature for javascript as server side Typescripts app.ts does like "var globals = require('./globals');".

2. Connect to chat server Socke IO.
Source:
var socket = io.connect(chatHttpsServer); 

3. Send out message when "Send" button is clicked.
Source:
$("#sendBtn").click(function () {
...
socket.emit("ClientToAgent", msg);
...

4. Receive Agent's message.
Source:
socket.on('AgentToClient', function (msg) {

```
#### Workflow

##### 1. Start Chat Server
```
Open DOS cmd
Run "Node app.js"
Source:
httpsServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
```
##### 2. Client Login Page
```
Client or visitor open "https://localhost" to enter Chat Server login page. 
Source flow:
1. app.ts: app.get('/', routesLogin.login); => 
2. login.ts: res.render('login', { title: 'Client Login' }); =>
3. login.jade: button(type='submit' value='Login').btn.btn-primary Start Chat
```
##### 3. Client Chat Page
```
Click "Star Chat" button to navigate to client chat page "https://localhost/chat".
Source flow:
1. app.ts: app.post('/chat', routesLogin.chat); =>
2. chat.ts: res.render('chat', { title: 'Client Chat', message: sendMsg }); =>
3. chat.jade: button#sendBtn.btn.btn-success.btn-lg Send 
```
##### 3. Client Send Message
```
Click "Send" button to send message.
Source:
chatServer\public\javascripts\chat.js: socket.emit("ClientToAgent", msg);
```
##### 5. Client Receive Message
```
Client receive Agent's message.
Source:
chatServer\public\javascripts\chat.js: socket.on('AgentToClient', function (msg) {            
```

## Agent Server
```
This is an Express server to serve Agent register, login and choose client to chat with. It is also the gateway to communicate with backend Mongodb database.

Source Folder: OpenChat\agentServer
Main Program: app.ts
Build: Run "Build" in Visual Studio 2015.
Start: Run "Node app.js" in DOS cmd console.
Listen: http://localhost:7000

Main Scenario:

A Client sends a message to an Agent:
Client (message) -> Chat Server (message) -> Agent (Display "message")
Client (message) -> Chat Server (message) -> Agent Server (message) -> Mongodb (message)

An Agent sends a message to a Client:
Agent (message) -> Chat Server (message) -> Client (Display "message")
Agent (message) -> Agent Server (message) -> Mongodb (message)

There is another scenario is for chat session, which creates a chat session record when an chat channel is setup and update the session when the client or the agent close their chat window, which is emitted in socket io "disconnect" event in Chat Server and received in Agent Server to complete corresponding database operation.
```
#### HTTP Express Server
```
httpServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
```
#### Mongodb Server Connection
```
// db instance
var dbInst = require('mongodb').MongoClient;
...     
// db connection
dbInst.connect(globals.dbUrl, function (err, dbConnected) {
...
// assign connected db instance to global variable once connected
globals.chatdb = dbConnected;
```
#### Mongodb Async Callback
```
Mongodb query is async operation, a callback funtion must be provided in the query request if a function needs to be run after the query completes.

Example: Save message to database:

app.ts:

// create the chat message document object
let dc = new dbchat();
// create the session document object
var ds = new dbsession();
// async get session, set sessionStartTime and save msg in callback after GetSession completes
ds.GetSession(dc.sessionId, data, SaveMsgCallback);  
...
function SaveMsgCallback(sessionObj, data) {
...
    // save msg
    data.chatobj.dbSaveMsg();
...

dbsession.ts:

public GetSession(searchSessionId, data, callbackfunc) {
      ...
      globals.chatdb.collection(globals.SESSION_COLLECTION).find(queryDoc).toArray(function (err, resultDocs) {
            ...
            callbackfunc(resultDocs[0], data);
            
```
#### Client Side js
```
Source: agentServer\public\javascripts\chat.js
This client side javascript is the "code behind" of the chat page "chat.jade". It sends out agent message, receives client's message and updates chat page accordingly.
1. Get chat server and agent addresses with sending an ajax request to chat server app.ts.
Source:
$.get('/config/getone', parameters, function (data) {
2. Connect to chat server and agent server Socke IO.
Source:
var dbSocket = io.connect(agencyHttpServer);
var socket = io.connect(chatHttpsServer); 
3. Send out message when "Send" button is clicked.
Source:
$("#sendBtn").click(function () {
4. Receive Client's message:
Source:
socket.on('ClientToAgent', function (msg) {
```
#### Workflow

##### 1. Create Mongodb collections
```
This only needs to run once.

1. Start Mongodb Server
Run "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" --dbpath ".\data"
2. Start Mongodb Shell
Run "C:\Program Files\MongoDB\Server\3.4\bin\mongo.exe"
3. Create 1 database and 3 collections in Mongodb Shell
>use chatdb
>db.createCollection("agencyDocs")
>db.createCollection("chatDocs")
>db.createCollection("chatSessionDocs")
```
##### 2. Start Mongodb Server
```
Run "C:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" --dbpath ".\data"
```
##### 3. Start Agent Server
```
Open DOS cmd
Run "Node app.js"
Source:
httpsServer.listen(parseInt(app.get('port')), app.get('hostname'), function () {
```
##### 4. Agent Login Page
```
Agent open "http://localhost:7000" to enter Agent Server login page. 
Source flow:
1. app.ts: app.get('/', routesLogin.login); => 
2. login.ts: res.render('login', { title: 'Agency Login' }); =>
3. login.jade: button(type='submit' value='Login' name='logreg').btn.btn-primary Sign In 
4. login.jade: button(type='submit' value='Register' name='logreg' style='margin-left: 10px;').btn.btn-primary Register
To Register, click Register button in this page.
```
##### 5. Agency User Page
```
Click "Sign In" button to navigate to Agency Page "http://localhost:7000/user".
Source flow:
1. app.ts: app.post('/user', routesUser.user); =>
2. user.ts: res.render('chat', { title: 'Client Chat', message: sendMsg }); =>
3. user.jade: ul#users.list-unstyled

The users list will show all online clients, these clients login the Chat Server at https://localhost.

```
##### 6. Agent Chat Page
```
Click a user in the list to choose an online client to chat with. This will open a popup window which is the Agent Chat Page.
The popup window url looks like: 
http://localhost:7000/chat?agencyid=JohnHou&agentname=John&clientname=James&clientsocketid=Qoj6uEDn_mPffFhTAAAB

Source flow:

agentServer\public\javascripts\user.js: 
var item = "<li onclick=\"popChat('" + agencyid + "','" + agentname + "','" + name + "','" + id + "')\" id=\"" + id + "\">" + "<a href=\"#\">" + users[i].name + "</a>" + " " + users[i].status + " " + users[i].servedCount + "</li
...
var url = "/chat?agencyid=" + agencyid + "&agentname=" + agentname + "&clientname=" + clientName + "&clientsocketid=" + clientId;
window.open(url, "_blank", "height=600,width=700,modal=yes,alwaysRaised=yes", false);
=>

app.ts: app.get('/chat', routesChat.chat);
=>

chat.ts: res.render('chat', { title: 'Agent Chat', agencyId: agency, agentName: agtname, clientName: cname, clientSocketId: csocketid });
=>

chat.jade: render the page and reference the agent's client side js with script(src="/javascripts/chat.js") to accommdate chat behaviors when document is ready.
=>

client side js: agentServer\public\javascripts\chat.js

Once the agent window is popped up for the chosen client, a chat channel will setup between them, then a chat session record will be created in database, the session record will be updated when the chat channel is unavailable, which means client or agent close their chat window.

```
##### 7. Agent Send Message
```
Click "Send" button to send message.
Source:
agentServer\public\javascripts\chat.js: socket.emit("AgentToClient", msg);
```
##### 8. Agent Receive Message
```
Agent receives Client's message.
Source:
agentServer\public\javascripts\chat.js: socket.on('ClientToAgent', function (msg) {            
```

## View Server
```
This is an Express server to serve customer service to view chat records. It gets records from Mongodb database and uses Angular JS to display chat, session and agency records.

Source Folder: OpenChat\viewServer
Main Program: app.ts
Build: Run "Build" in Visual Studio 2015.
Start: Run "Node app.js" in DOS cmd console.
Listen: http://localhost:3000
```
#### HTTP Express Server
```
http.createServer(app).listen(app.get('port'), function () {
```
#### Mongodb Connection
```
dbClient.connect(config.dbUrl, function (err, db) {
```
#### Index Page
```
1. app.ts: app.get('/', routes.index); =>
2. index.ts: res.render('index'); =>
3. inde.jade: 
extends layout
block content
  h3 Chat List
  table
    tr        
      ul.nav.navbar-nav
        li
          a(href='/') Home
        li
          a(href="/showchats") Chats
        li
          a(href='/showsessions') Sessions
        li
          a(href='/showagencies') Agencies      
    tr
      div(ng-view)
block scripts  
  script(src='javascripts/app.js')      
```
#### Angular Controller
```
Source: viewServer\public\javascripts\app.js

var app = angular.module('chatApp',['ngRoute']);
app.config(function ($routeProvider, $locationProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/partials/index',
                controller: 'IndexCtrl'
            }).    
            when('/showchats', {
                templateUrl: '/partials/chatsview',
                controller: 'ChatsCtrl'
            }). 
            when('/showsessions', {
                templateUrl: '/partials/sessionsview',
                controller: 'SessionsCtrl'
            }). 
            when('/showagencies', {
                templateUrl: '/partials/agenciesview',
                controller: 'AgenciesCtrl'
            }).                 
            otherwise({
                redirectTo: '/'
        });       
        $locationProvider.html5Mode(true);
    });
```
#### Chat Page
```
1. app.ts: app.get('/partials/:name', routes.partials) =>
2. app.js: templateUrl: '/partials/chatsview' =>
3. view/partials/chatview.jade: 
   update the partial view part "div(ng-view)" in Single Page index.jade with "tbody(ng-repeat='chat in chats')"
```
#### Session Page
```
1. app.ts: app.get('/partials/:name', routes.partials) =>
2. app.js: templateUrl: '/partials/sessionsview' =>
3. view/partials/sessionsview.jade: 
   update the partial view part "div(ng-view)" in Single Page index.jade with "tbody(ng-repeat='session in sessions')"
```
#### Agency Page
```
1. app.ts: app.get('/partials/:name', routes.partials) =>
2. app.js: templateUrl: '/partials/agenciesview' =>
3. view/partials/agenciesview.jade: 
   update the partial view part "div(ng-view)" in Single Page index.jade with "tbody(ng-repeat='agency in agencies')"
```
