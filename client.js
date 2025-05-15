const socket = io();

const passwordSection = document.getElementById('password-section');
const passwordInput = document.getElementById('password-input');
const passwordButton = document.getElementById('password-button');
const usernameSection = document.getElementById('username-section');
const usernameInput = document.getElementById('username-input');
const joinButton = document.getElementById('join-button');
const chatSection = document.getElementById('chat-section');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messages = document.getElementById('messages');
const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.getElementById('emoji-picker');
const fileInput = document.getElementById('file-input');
const fileButton = document.getElementById('file-button');

passwordButton.addEventListener('click', () => {
  const password = passwordInput.value.trim();
  if (password) {
    socket.emit('checkPassword', password);
  } else {
    alert('Nhập mật khẩu....! 👈');
  }
});

socket.on('passwordResult', (isValid) => {
  if (isValid) {
    passwordSection.classList.add('hidden');
    usernameSection.classList.remove('hidden');
  } else {
    alert('Sai mật khẩu rồi bro! 🥶');
    passwordInput.value = '';
  }
});

joinButton.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    socket.emit('join', username);
    usernameSection.classList.add('hidden');
    chatSection.classList.remove('hidden');
  } else {
    alert('Nhập tên đi bro! 😎');
  }
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

emojiButton.addEventListener('click', () => {
  emojiPicker.style.display = emojiPicker.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.emoji').forEach(emoji => {
  emoji.addEventListener('click', () => {
    messageInput.value += emoji.textContent;
    emojiPicker.style.display = 'none';
    messageInput.focus();
  });
});

fileButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      socket.emit('fileMessage', {
        username: socket.username,
        file: reader.result,
        fileType: file.type,
        time: new Date().toLocaleTimeString('vi-VN')
      });
      fileInput.value = '';
    };
    reader.readAsDataURL(file);
  }
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('chatMessage', msg);
    messageInput.value = '';
    emojiPicker.style.display = 'none';
  }
}

socket.on('userJoined', (msg) => {
  addMessage(msg, 'text-orange-400 italic');
});

socket.on('userLeft', (msg) => {
  addMessage(msg, 'text-gray-400 italic');
});

socket.on('chatMessage', (data) => {
  addMessage(
    `<span class="font-bold text-orange-500">${data.username}</span> (${data.time}): ${data.message}`,
    'text-white'
  );
});

socket.on('fileMessage', (data) => {
  const content = data.fileType.startsWith('image/')
    ? `<img src="${data.file}" alt="Hình ảnh">`
    : `<video controls src="${data.file}" alt="Video"></video>`;
  addMessage(
    `<span class="font-bold text-orange-500">${data.username}</span> (${data.time}):<br>${content}`,
    'text-white'
  );
});

function addMessage(content, className) {
  const div = document.createElement('div');
  div.innerHTML = content;
  div.className = `mb-2 ${className}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}