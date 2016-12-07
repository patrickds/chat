var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var users = [];

io.on('connection', function (socket) {

  socket.on('message', function (data) {
    socket.broadcast.emit('new message', data);
  });

  socket.on('disconnect', function () {
    removeUser(socket.user);
    logRemainingUsers();
    socket.broadcast.emit('user disconnected', { user: socket.user });
  });

  socket.on('validate user', function (data) {

    var index = users.indexOf(data.user);

    if (!data.user.trim()) {
      socket.emit('empty user');
    }
    else if (index < 0) {
      socket.emit('valid user');

      console.log(data.user + ' connected\n');
      socket.user = data.user;
      addUser(data.user);
    }
    else {
      socket.emit('invalid user');
    }
  });
});

function addUser(user) {
  users.push(user);
}

function removeUser(user) {
  var index = users.indexOf(user);
  if (index > -1) {
    users.splice(index, 1);
  }

  console.log(user + ' disconnected\n');
};

function logRemainingUsers() {
  console.log('\n***************Remaining Users****************\n');
  users.forEach(function (element, index, array) { console.log(element); });
  console.log('\n*********************************************\n');
};

server.listen(2424, function () {
  console.log('listening at port 2424\n');
});