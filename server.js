const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Phục vụ file tĩnh (index.html, client.js)
app.use(express.static(__dirname));

// Route chính
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Mật khẩu chat
const CHAT_PASSWORD = 'sigma123'; // Đổi nếu muốn
let messageIdCounter = 0; // ID cho tin nhắn/thích

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Xác thực mật khẩu
  socket.on('checkPassword', (password) => {
    socket.emit('passwordResult', password === CHAT_PASSWORD);
  });

  // Người dùng join
  socket.on('join', (username) => {
    socket.username = username;
    io.emit('userJoined', `${username} vừa vào chat! 🔥`);
  });

  // Tin nhắn (text/emoji)
  socket.on('chatMessage', (msg) => {
    const messageId = `msg-${messageIdCounter++}`;
    io.emit('chatMessage', {
      username: socket.username,
      message: msg,
      time: new Date().toLocaleTimeString('vi-VN'),
      messageId
    });
  });

  // Hình/video
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

  // Thích tin nhắn
  socket.on('likeMessage', (data) => {
    io.emit('likeMessage', data);
  });

  // Người dùng rời
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('userLeft', `${socket.username} đã rời chat! 😢`);
    }
  });
});

// Khởi động server
http.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});