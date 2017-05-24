var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');
var handleError = require('hapi-error').handleError;

function sanitise (text) {
  var sanitised_text = text;

  if (text.indexOf('<') > -1 || text.indexOf('>') > -1) {
    sanitised_text = text.replace(/</g, '&lt').replace(/>/g, '&gt');
  }

  return sanitised_text;
}

exports.chatHandler =function(socket) {
  
  pub.hkeys('manager', function(err, result){

    var relationship = {
      'yourID': socket.client.conn.id,
      'mngID' : result[0]
    }
    socket.emit('io:welcome', relationship, function(data){
      console.log(data); 
    });
  });

  // welcome new clients 
  //socket.emit('io:welcome', socket.client.conn.id);
  
  socket.on('io:name', function (name) {
    if(name == 'DuyCuong'){

      console.log(socket.client.conn.id + " >Manager<  " + name + ' joined chat!');  

      pub.hset('manager', socket.client.conn.id, name);
      //pub.set('manager', socket.client.conn.id);
    }else{

      pub.hset('people', socket.client.conn.id, name);

      var userInfo = {'userID':socket.client.conn.id, 'name':name};
      //console.log('#__Server >>>>>>> ' + userInfo + ' -- ');
      
      console.log(socket.client.conn.id + " > " + name + ' joined chat!');  

      pub.hkeys('manager', function(err,rs){

        socket.to(rs[0]).emit('newuser', userInfo);
      });
    }

    //pub.publish('chat:people:new', name);
  });

  socket.on('io:message', function (msg) {

    //console.log('#_Server >>>>> msg:' , msg);

    //var sanitised_message = sanitise(msg);
    var sanitised_message = msg;
    var str;

    pub.hget('people', socket.client.conn.id, function (error, name) {
                            
      handleError(error, 'Error retrieving ' + socket.client.conn.id + ' from Redis :-( for: ' + sanitised_message);
      
      console.log("io:message received: " + msg + " | from: " + name);
      str = JSON.stringify({ 
        m: sanitised_message,
        t: new Date().getTime(),
        n: name
      });
      
      //pub.rpush('chat:messages', str); // chat history  
      pub.publish('chat:messages:latest', str); // latest message
    });
  });

  socket.on('error', function (error) {
    handleError(error, error.stack);
  });
}

