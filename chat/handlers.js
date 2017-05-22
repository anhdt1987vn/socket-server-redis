var pub = require('redis-connection')();
var sub = require('redis-connection')('subscriber');
var handleError = require('hapi-error').handleError;

//var SocketIO = require('socket.io');
//var io;


function sanitise (text) {
  var sanitised_text = text;

  if (text.indexOf('<') > -1 || text.indexOf('>') > -1) {
    sanitised_text = text.replace(/</g, '&lt').replace(/>/g, '&gt');
  }

  return sanitised_text;
}


exports.chatHandler =function(socket) {
  
  var mngID;
  //pub.hset('manager', socket.client.conn.id, 'QuanLy');
  pub.hkeys('manager', function(err, result){
    console.log(result);
    socket.emit('io:welcome', result);
  });
  // welcome new clients 
  //socket.emit('io:welcome', socket.client.conn.id);
  //socket.emit('io:welcome', mngID);
  
  socket.on('io:name', function (name) {
    console.log(name);
    if(name == 'DuyCuong'){
      console.log('I am here');
      //mngID = socket.client.conn.id;
      pub.hset('manager', socket.client.conn.id, name);
    }else{
    /*pub.hget('people', socket.client.conn.id, function(error, name){
      //console.log('#Debug: ' + name);
      //console.log(typeof(name));
      if(name === null){
        console.log('Null cmnr');
        pub.hset('people', socket.client.conn.id, name);
      }
      if(name === 'DuyCuong'){
        console.log('DuyCuong');
      }else{
        console.log('Khac DuyCuong');
      }
    });*/
      pub.hset('people', socket.client.conn.id, name);
      //socket.emit('io:welcome', s);
      //pub.hgetall
      console.log(socket.client.conn.id + " > " + name + ' joined chat!');  
    }
    //pub.publish('chat:people:new', name);
  });

  socket.on('io:message', function (msg) {

    console.log('msg:' , msg);

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
      
      console.log('#_Str before rpush to chat history: ' + str);
      //pub.rpush('chat:messages', str); // chat history  
      pub.publish('chat:messages:latest', str); // latest message
    });
  });

  socket.on('error', function (error) {
    handleError(error, error.stack);
  });
}

