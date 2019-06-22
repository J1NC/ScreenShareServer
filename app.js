var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var randomString = require('randomstring');
var server = require('net');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
var appServer = app.listen(3000);
var io = require('socket.io').listen(appServer);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

let hostIp = new Array();
let hostId = new Array();
let guests = new Array(new Array(), new Array());

app.use('/host/getId', (req, res, next) => {
  let id = randomString.generate(5);
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  hostIp.push(ip);
  hostId.push(id);

  res.send(id);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


io.on('connection', (socket) => {
  let roomIdx;
  socket.on('joinRoom', (data) => {
    roomIdx = hostId.indexOf(data);
    if(roomIdx == -1){
      socket.emit('err', 'Not exsist HostId');
    } else {
      console.log(hostIp);
      console.log(hostId);
      guests[roomIdx].push(socket.id);
      socket.emit('suc', 'Joined!');
    }
  });
  socket.on('disconnect', () => {
    guestsIdx = guests[roomIdx].indexOf(socket.id);
    guests[roomidx].splice(guestsIdx, 1);
  });
});

server.createServer( (client) => {
  console.log(client.remoteAddress);
  client.on('data', (data) => {
    let index = hostIp.indexOf(client.remoteAddress);
    if(guests[index] != null){
      guests[index].forEach(element => {
        io.to(element).emit('screen', data.toString());
      });
    }
  });

  client.on('end', () => {
    let index = hostIp.indexOf(client.remoteAddress);

    if(guests[index] != null){
      guests[index].forEach(element => {
        io.to(element).emit('exit', 'Host Exited');
      });
    }

    hostId.splice(index, 1);
    hostIp.splice(index, 1);
    guests.splice(index, 1);
  }); 

}).listen(3001);

module.exports = app;
