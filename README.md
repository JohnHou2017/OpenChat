# OpenChat
A online chat application for customer support with Socket IO.

This application is based on Socket IO, it also combined with Node JS, Express, Jade and Angular JS.

There are 3 Express servers:

1. Chat Server: This is main server for company web site visitor (client) and company customer service to login, it listens at https://localhost:443
2. Agency Server: This is for customer service to login to serve client chat request, it listens at http://localhost:7000.
3. View Server: This is for customer service to login to view chat records, it listens at http://localhost:3000

There is 1 Mongodb database server: listen at Mongodb standard port.

Archtecture:

![alt tag](https://github.com/JohnHou2017/OpenChat/blob/master/doc/OpenChatArchitecture.png)

1. Chat Server:
