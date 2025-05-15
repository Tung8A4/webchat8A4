const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  pingInterval: 10000, // Tối ưu kết nối
  pingTimeout: 5000,
  maxHttpBufferSize: 2e6 // Giới hạn file 2MB
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const CHAT_PASSWORD = 'sigma123';
let messageIdCounter = 0;

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('checkPassword', (password) => {
    socket.emit('passwordResult', password === CHAT_PASSWORD);
  });

  socket.on('join', (username) => {
    socket.username = username || 'Ẩn danh';
    io.emit('userJoined', `${socket.username} vừa vào chat! 🔥`);
  });

  socket.on('chatMessage', (msg) => {
    if (msg.length > 200) msg = msg.substring(0, 200) + '...';
    const messageId = `msg-${messageIdCounter++}`;
    io.emit('chatMessage', {
      username: socket.username,
      message: msg,
      time: new Date().toLocaleTimeString('vi-VN'),
      messageId
    });
  });

  socket.on('fileMessage', (data) => {
    const messageId = `msg-${messageIdCounter++}`;
    io.emit('fileMessage', {
      username: socket.username,
      file: data.file,
      fileType: data.fileType,
      time: data.time,
      messageId
    });
  });

  socket.on('likeMessage', (data) => {
    io.emit('likeMessage', data);
  });

  socket.on('typing', () => {
    socket.broadcast.emit('typing', socket.username);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTyping', socket.username);
  });

  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userLeft', `${socket.username} đã rời chat! 😢`);
    }
  });
});

http.listen(process.env.PORT || 3000, () => {
  console.log('Server running at http://localhost:3000');
});