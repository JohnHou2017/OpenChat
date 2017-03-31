import express = require('express');
import routes = require('./routes');
import chat = require('./routes/chat');
import http = require('http');
import path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

import stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var config = require('../config/serverConfig.json');

var dbClient = require('mongodb').MongoClient;

var globals = require('./globals');

// angular controller method
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// angular service method
app.get('/api/chat/AllChat', chat.AllChat);
app.get('/api/chat/AllSession', chat.AllSession);
app.get('/api/chat/AllAgency', chat.AllAgency);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
    dbClient.connect(config.dbUrl, function (err, db) {
        if (err) {
            console.log(err);
        }
        else {
            globals.chatdb = db;
            console.log('Connected to mongodb.');
        }
    });
});
