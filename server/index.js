var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

io.on('connection', function (socket) {

  socket.on('user connected', function (data) {
    console.log(data.user + ' connected');
    socket.user = data.user;
    io.sockets.emit('new user', data);
  })

  socket.on('message', function (data) {
    socket.broadcast.emit('new message', data);
  });

  socket.on('disconnect', function () {
    socket.broadcast.emit('user disconnected', { user: socket.user });
  });
});

server.listen(2424, function () {
  console.log('listening at port 2424');
});