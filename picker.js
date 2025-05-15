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