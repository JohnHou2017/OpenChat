'use strict';

export var chatdb;

var config = require('../config/serverConfig.json');

export var agentServerIP = config.agentServerIP;
export var agentServerPort = config.agentServerPort;
export var chatServerIP = config.chatServerIP;
export var chatServerPort = config.chatServerPort;
export var viewServerIP = config.viewServerIP;
export var viewServerPort = config.viewServerPort;
export var dbUrl = config.dbUrl;

export var CHAT_COLLECTION = config.chatCollection;
export var SESSION_COLLECTION = config.chatSessionCollection;
export var AGENCY_COLLECTION = config.agencyCollection;

export var agencyHttpServer = "http://" + config.agentServerIP + ":" + config.agentServerPort;
export var chatHttpsServer = "https://" + config.chatServerIP + ":" + config.chatServerPort;
export var viewHttpServer = "http://" + config.viewServerIP + ":" + config.viewServerPort;

var log4js = require('log4js');

log4js.loadAppender('file');
log4js.addAppender(log4js.appenders.file('logs/agentServer.log'), 'agentlog');
log4js.addAppender(log4js.appenders.file('logs/chatServer.log'), 'chatlog');
log4js.addAppender(log4js.appenders.file('logs/viewServer.log'), 'viewlog');

export var agentLogger = log4js.getLogger('agentlog');
export var chatLogger = log4js.getLogger('chatlog');
export var viewLogger = log4js.getLogger('viewlog');
