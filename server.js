const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const CHAT_PASSWORD = '8A4'; // Đổi mật khẩu nếu muốn

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('checkPassword', (password) => {
    socket.emit('passwordResult', password === CHAT_PASSWORD);
  });

  socket.on('join', (username) => {
    socket.username = username;
    io.emit('userJoined', `${username} vừa vào chat! 🗣`);
  });

  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', {
      username: socket.username,
      message: msg,
      time: new Date().toLocaleTimeString('vi-VN')
    });
  });

  socket.on('fileMessage', (data) => {
    io.emit('fileMessage', {
      username: socket.username,
      file: data.file,
      fileType: data.fileType,
      time: data.time
    });
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userLeft', `${socket.username} đã rời chat! 💀`);
    }
  });
});

http.listen(3000, () => {
  console.log('Server running at http:/localhost:3000');
});