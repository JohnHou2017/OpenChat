// client side js

$(document).ready(function () {

    var parameters = { id: 'chatagentserver' };

    // send ajax call to server
    $.get('/config/getone', parameters, function (data) {

        // get server addresses after ajax call return
        var agencyHttpServer = data.agencyHttpServer;
        var chatHttpsServer = data.chatHttpsServer;

        // agent socket to agent server for database crud
        var dbSocket = io.connect(agencyHttpServer); 

        // agent socket to chat server
        var socket = io.connect(chatHttpsServer); 

        // client socket to chat server
        var toidVal = $("#pClientSocketId").val();
        var clientname = $("#pClientName").val();
        var agencyid = $("#pAgencyId").val();
        var agentname = $("#pAgentName").val();

        // chat channel is set up in chat server between agent and client: socket.id, toidVal

        var agentid = socket.id;
        var clientid = toidVal;
       
        var user = { type: 'agent', id: agentid, toid: clientid, name: agentname, agency: agencyid, status: 'ready' };

        // send user info to chat server
        socket.emit("joinChat", user);

        dbSocket.emit('ProxyLogInfo', 'getone returned. agentid: ' + user.id);

        // create a new session record in database when receive valid socket id with async    
        socket.on('ConnectionSocketId', function (agentSocketid) {

            dbSocket.emit('ProxyLogInfo', 'ConnectionSocketId:  agentSocketid: ' + agentSocketid);

            dbSocket.emit('SaveSessionStart', agentSocketid, clientid, agencyid, agentname, clientname);

            $("#sendBtn").click(function () {
                var msg = $("#sendMsg").val();

                $("#msgs").append("<li>I say: " + msg + "</li>");

                // display agent message in client browse
                socket.emit("AgentToClient", msg);

                // save agent message to database. 
                // parameters: agent message, agent socket to chat server, client socket to chat server
                dbSocket.emit("SaveChatMsg", 'Agent: ' + msg, socket.id, toidVal, agencyid, agentname, clientname);

                $("#sendMsg").val("");
            });

            socket.on('ClientToAgent', function (msg) {
                $("#msgs").append("<li>" + msg + "</li>");
                // save client message to database
                dbSocket.emit("SaveChatMsg", 'Client: ' + msg, socket.id, toidVal, agencyid, agentname, clientname);
            });

            socket.on('ChatServerToAgent', function (command, data) {

                dbSocket.emit('ProxyLogInfo', 'ChatServerToAgent: ' + command + ',' + data.agentid + ',' + data.clientid);

                if (command == 'UpdateSessionEnd') {
                    dbSocket.emit("SaveSessionEnd", data.agentid, data.clientid);
                }
            });

        });

    });
    
});