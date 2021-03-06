﻿
import express = require('express');

var globals = require('../globals');

export function user(req: express.Request, res: express.Response) {
    var username = req.body.name;
    var password = req.body.password;
    var agtname = req.body.agentname;    
    var inputValue = req.body.logreg; 
   
    var socket = require('socket.io-client').connect(globals.agencyHttpServer);

    if (inputValue == "Login") {

        socket.emit('CheckLogin', username, password);
               
        socket.on('LoginResult', function (success, dbAgencyName) {
            if (success == true) {
                if (req.body.agentname) {
                    agtname = req.body.agentname;
                }
                else {
                    agtname = dbAgencyName;
                }
                res.render('user', { title: 'Agency Clients', agencyid: username, agentname: agtname });
            }
            else {
                res.render('login', { title: 'Login', error: 'Incorrect user name or password.' });
            }
        });  
        
    }
    else if (inputValue == 'Register') {
        
        socket.emit('SaveRegister', username, password, agtname);

        socket.on('RegisterResult', function (errorMsg) {
            res.render('login', { title: 'Login', error: errorMsg });
        });       
        
    }
    
};