var express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
app.use(express.static("public"))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/ledis.html');
});
io.on('connection', (socket) => {
  socket.on('output msg', msg => {
    io.emit('output msg', msg);
  });
});
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});