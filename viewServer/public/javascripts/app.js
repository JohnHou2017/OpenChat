'use strict';

//var app = angular.module('chatApp', ['ngRoute', 'infinite-scroll', 'smart-table']);
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

app.controller('IndexCtrl', function ($scope, chatService) {
    $scope.chats = null;
    $scope.sessions = null;
});

app.controller('ChatsCtrl', function ($scope, chatService) {

    loadAllChats();

    function loadAllChats() {
        var promiseGet = chatService.loadAllChats();
        promiseGet.then(function (result) {
            var chats = []; 
            
            if (result.length > 0) {
                
                // copy over dbchat record
                for (var i = 0; i < result.length; i++) {
                    var chat = {};                    
                    chat.sessionStartTime = result[i].sessionStartTime;
                    chat.agencyid = result[i].agencyid;
                    chat.agentname = result[i].agentname;
                    chat.clientname = result[i].clientname;
                    chat.message = result[i].message;
                    chat.msgtime = result[i].msgtime;
                    chat.idx = i;
                    chats.push(chat);
                }

                // set first row value additional column num
                chats[0].sessionNum = 1;

                // set rest row value for additional colimn num
                for (var i = 1; i < chats.length; i++) {
                    
                    if (chats[i].sessionStartTime != chats[i - 1].sessionStartTime) {

                        chats[i].sessionNum = chats[i - 1].sessionNum + 1;
                        
                    }
                    else {
                        chats[i].sessionNum = chats[i - 1].sessionNum
                    }

                   
                }

                $scope.chats = chats;
                $scope.$apply();

                
            }
        },
            function (err) {
            });
    }             

});

app.controller('SessionsCtrl', function ($scope, chatService) {

    loadAllSessions();

    function loadAllSessions() {
        var promiseGet = chatService.loadAllSessions();
        promiseGet.then(function (result) {
            $scope.sessions = result;
        },
            function (err) {
            });
    }

});

app.controller('AgenciesCtrl', function ($scope, chatService) {

    loadAllAgencies();

    function loadAllAgencies() {
        var promiseGet = chatService.loadAllAgencies();
        promiseGet.then(function (result) {
            $scope.agencies = result;
        },
            function (err) {
            });
    }

});

app.service('chatService', function ($http) {

    this.loadAllChats = function () {
        var url = 'api/chat/AllChat';
        return $http.get(url).then(function (response) {
            return response.data;
        });
    }

    this.loadAllSessions = function () {
        var url = 'api/chat/AllSession';
        return $http.get(url).then(function (response) {
            return response.data;
        });
    }

    this.loadAllAgencies = function () {
        var url = 'api/chat/AllAgency';
        return $http.get(url).then(function (response) {
            return response.data;
        });
    }

});