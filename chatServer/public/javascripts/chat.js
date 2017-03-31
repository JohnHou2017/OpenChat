$(document).ready(function () {

    // connect to chat server
    //var socket = io.connect("http://localhost:5000");
    //var socket = io.connect("https://localhost:5001");
    var socket = io.connect("https://localhost:443");


    if (socket)
        console.log('client connected.');

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