const socket = io();
const chatContainer = document.getElementById('chat-container');
const passwordContainer = document.getElementById('password-container');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const typingDiv = document.getElementById('typing');
let username = localStorage.getItem('username') || prompt('Nhập tên của bạn:');
localStorage.setItem('username', username);

function checkPassword() {
  const password = document.getElementById('password-input').value;
  socket.emit('checkPassword', password);
}

socket.on('passwordResult', (isCorrect) => {
  if (isCorrect) {
    passwordContainer.style.display = 'none';
    chatContainer.style.display = 'block';
    socket.emit('join', username);
  } else {
    alert('Sai mật khẩu!');
  }
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('chatMessage', msg);
    messageInput.value = '';
    emojiPicker.style.display = 'none';
    socket.emit('stopTyping');
  }
}

messageInput.addEventListener('input', () => {
  socket.emit('typing');
  clearTimeout(messageInput.timeout);
  messageInput.timeout = setTimeout(() => socket.emit('stopTyping'), 1000);
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

sendBtn.addEventListener('click', sendMessage);

emojiBtn.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.emoji').forEach(emoji => {
  emoji.addEventListener('click', (e) => {
    if (e.ctrlKey) {
      socket.emit('chatMessage', emoji.textContent);
    } else {
      messageInput.value += emoji.textContent;
      messageInput.focus();
    }
    emojiPicker.style.display = 'none';
  });
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file && file.size <= 2 * 1024 * 1024) { // Giới hạn 2MB
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('fileMessage', {
        file: reader.result,
        fileType: file.type,
        time: new Date().toLocaleTimeString('vi-VN')
      });
    };
    reader.readAsDataURL(file);
  } else {
    alert('File quá lớn! Tối đa 2MB.');
  }
  fileInput.value = '';
});

socket.on('userJoined', (msg) => {
  const item = document.createElement('div');
  item.textContent = msg;
  item.style.color = '#0f0';
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('userLeft', (msg) => {
  const item = document.createElement('div');
  item.textContent = msg;
  item.style.color = '#f00';
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('chatMessage', (data) => {
  const item = document.createElement('div');
  item.className = 'message';
  item.innerHTML = `<strong>${data.username}</strong> (${data.time}): ${data.message} <button onclick="likeMessage('${data.messageId}')">👍 <span id="likes-${data.messageId}">0</span></button>`;
  item.id = data.messageId;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('fileMessage', (data) => {
  const item = document.createElement('div');
  item.className = 'message';
  const media = data.fileType.startsWith('image') ? `<img src="${data.file}" alt="image">` : `<video src="${data.file}" controls></video>`;
  item.innerHTML = `<strong>${data.username}</strong> (${data.time}): ${media} <button onclick="likeMessage('${data.messageId}')">👍 <span id="likes-${data.messageId}">0</span></button>`;
  item.id = data.messageId;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('likeMessage', (data) => {
  const likeSpan = document.getElementById(`likes-${data.messageId}`);
  if (likeSpan) {
    likeSpan.textContent = parseInt(likeSpan.textContent) + 1;
  }
});

socket.on('typing', (username) => {
  typingDiv.textContent = `${username} đang gõ...`;
});

socket.on('stopTyping', () => {
  typingDiv.textContent = '';
});

function likeMessage(messageId) {
  socket.emit('likeMessage', { messageId });
}