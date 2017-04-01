// client side js

$(document).ready(function () {
    
    var parameters = { id: 'chatserver'};

    $.get('/config/getone', parameters, function (data) {
   
        var chatHttpsServer = data;

        // connect to https chat server
        var socket = io.connect(chatHttpsServer); 

        var agencyid = $("#pAgencyId").val();

        var agentname = $("#pAgentName").val();

        var user = { type: 'agency', id: socket.id, toid: '', name: agentname, agency: agencyid, status: 'ready' };

        // send user info to chat server
        socket.emit("joinChat", user);

        socket.on('UpdateAgencyUsers', function (users) {
            $("#users").empty();
            if (users.length > 0) {
                var item = "<li>Name   Status  Served</li>";
                $("#users").append(item);
            }

            for (var i = 0; i < users.length; i++) {
                var id = users[i].id;
                var name = users[i].name;
                var item = "<li onclick=\"popChat('" + agencyid + "','" + agentname + "','" + name + "','" + id + "')\" id=\"" + id + "\">" + "<a href=\"#\">" + users[i].name + "</a>" + " " + users[i].status + " " + users[i].servedCount + "</li>";

                $("#users").append(item);
            }
        });
    });
   
});

function popChat(agencyid, agentname, clientName, clientId) {

    var url = "/chat?agencyid=" + agencyid + "&agentname=" + agentname + "&clientname=" + clientName + "&clientsocketid=" + clientId;

    // popup chat window, "_blank" ensure open new window for each popup, or use unique window name
    window.open(url, "_blank", "height=600,width=700,modal=yes,alwaysRaised=yes", false);
}