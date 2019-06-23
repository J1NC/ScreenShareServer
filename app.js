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
var WebSocketServer = require('ws').Server

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


// io.on('connection', (socket) => {
//   let roomIdx;
//   socket.on('joinRoom', (data) => {
//     roomIdx = hostId.indexOf(data);
//     if(roomIdx == -1){
//       socket.emit('err', 'Not exsist HostId');
//     } else {
//       console.log(hostIp);
//       console.log(hostId);
//       guests[roomIdx].push(socket.id);
//       socket.emit('suc', 'Joined!');
//       guests[roomIdx].forEach(element => {
//         io.to(element).emit('headcount', guests[roomIdx].length);
//       });
//     }
//   });

//   socket.on('disconnect', () => {
//     if(guests[roomIdx] != null){
//       guestsIdx = guests[roomIdx].indexOf(socket.id);
//       if(guestsIdx != -1)
//         guests[roomIdx].splice(guestsIdx, 1);
//     }  
//   });
  
// });

server.createServer( (client) => {
  console.log(client.remoteAddress);
  client.on('data', (data) => {
    let index = hostIp.indexOf(client.remoteAddress);
    if(guests[index] != null){
      let res = {event: 'screen', message: data.toString()}
      guests[index].forEach(element => {
        element.send(JSON.stringify(res));
      });
    }
  });

  client.on('end', () => {
    let index = hostIp.indexOf(client.remoteAddress);

    if(guests[index] != null){
      let res = {event: 'exit', message: 'Host Exited'};
      guests[index].forEach(element => {
        element.send(JSON.stringify(res));
      });
    }

    hostId.splice(index, 1);
    hostIp.splice(index, 1);
    guests.splice(index, 1);
  }); 

}).listen(3001);

var wss = new WebSocketServer({port: 3100});

wss.on('connection', (ws) => {
  let roomIdx;
  ws.on('message', (request) => {
    let req = JSON.parse(request);
    let event = req.event;
    let data = req.data;
    switch(event){
      case 'joinRoom' : 
        roomIdx = hostId.indexOf(data);
        let res;
        if(roomIdx == -1){
          res = {event: 'err', message: 'Not exsist HostId'};
          ws.send(JSON.stringify(res));
        } else {
          console.log(hostIp);
          console.log(hostId);
          guests[roomIdx].push(ws);

          res = {event: 'suc', message: 'Joined!'};
          ws.send(JSON.stringify(res));
          res = {event: 'headcount', message: guests[roomIdx].length};
          res = JSON.stringify(res);
          guests[roomIdx].forEach(element => {
            element.send(res);
          });
        }
      break;
    }
  });

  ws.on('close', () => {
    if(guests[roomIdx] != null){
      let guestsIdx = guests[roomIdx].indexOf(ws);
      if(guestsIdx != -1)
        guests[roomIdx].splice(guestsIdx, 1);
    }
  })
});

module.exports = app;
