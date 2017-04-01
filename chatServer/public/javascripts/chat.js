// client js

$(document).ready(function () {

    var parameters = { id: 'chatserver' };

    $.get('/config/getone', parameters, function (data) {

        var chatHttpsServer = data;

        // connect to chat server   
        var socket = io.connect(chatHttpsServer);

        var username = $("#pUserName").val();

        var user = { type: 'client', id: socket.id, toid: '', name: username, status: 'waiting' };

        // send user info to chat server
        socket.emit("joinChat", user);

        $("#sendBtn").click(function () {
            var msg = $("#sendMsg").val();

            $("#msgs").append("<li>I say: " + msg + "</li>");

            socket.emit("ClientToAgent", msg);

            $("#sendMsg").val("");
        });

        socket.on('AgentToClient', function (msg) {
            $("#msgs").append("<li>" + msg + "</li>");
        });

    });
   
});