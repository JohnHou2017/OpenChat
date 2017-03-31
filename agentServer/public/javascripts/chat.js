$(document).ready(function () {

    // agent socket to agent server for database crud
    var dbSocket = io.connect("http://localhost:7000");
   
    // agent socket to chat server
    //var socket = io.connect("https://localhost:5001");
    var socket = io.connect("https://localhost:443");

    // client socket to chat server
    var toidVal = $("#pClientSocketId").val();
    var clientname = $("#pClientName").val();
    var agencyid = $("#pAgencyId").val();
    var agentname = $("#pAgentName").val();

    // chat channel is set up in chat server between agent and client: socket.id, toidVal
   
    var agentid = socket.id;
    var clientid = toidVal;
    dbSocket.emit('Log', 'agentid: ' + agentid);

    var user = { type: 'agent', id: agentid, toid: clientid, name: agentname, agency: agencyid, status: 'ready' };

    // send user info to chat server
    socket.emit("joinChat", user);

    dbSocket.emit('Log', 'agentid: ' + user.id);
       
    // create a new session record in database when receive valid socket id with async    
    socket.on('ConnectionSocketId', function (agentSocketid) {
        dbSocket.emit('Log', 'agentSocketid: ' + agentSocketid);
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
            dbSocket.emit('Log', 'ChatServerToAgent: ' + command + ',' + data.agentid + ',' + data.clientid);
            if (command == 'UpdateSessionEnd') {
                dbSocket.emit("SaveSessionEnd", data.agentid, data.clientid);
            }
        });

    });
    

});