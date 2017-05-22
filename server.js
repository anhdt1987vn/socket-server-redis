var Hapi = require('hapi');

var server = new Hapi.Server();

server.connection({ port: 4000, labels: ['api'] });
server.connection({ port: 4001, labels: ['chat'] });

server.register(require('./chat'), function (err) {

  if (err) {
    throw err;
  }

  server.start();
});



