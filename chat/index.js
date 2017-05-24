var Handlers = require('./handlers');
var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');


exports.register = function (server, options, next) {

  pub.on('ready', function(){
    console.log("PUB Ready!");

    sub.on('ready', function(){
      sub.subscribe('chat:messages:latest', 'chat:people:new');

      var io = require('socket.io')(server.select('chat').listener);
      io.on('connection', Handlers.chatHandler);

      sub.on('message', function (channel, message){
        console.log('#___________________Into Sub.on message');
        console.log(channel + ' : ' + message);
        //io.emit(channel, message);
        //console.log(typeof(message)); 
        var message = JSON.parse(message);
        //console.log(message); 
        io.to(message.m.did).emit(channel, { 'myid': message.m.myid, 'did':message.m.did,'t':message.m.t});   
        //io.to(message.m.did).emit(channel, message.m.t);   
      });
    });

  });

  next();
};

exports.register.attributes = {
      name: 'hapi-chat'
};
