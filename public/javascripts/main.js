const socket = io.connect('http://localhost:3000');
socket.on('RefreshPage', function (data) {
  location.reload();
});

const submitBtn = document.getElementById('submit-btn');
submitBtn.addEventListener('click', (e) => {
  socket.emit('UpdateOnDatabase');
});

const messageContainer = document.getElementById('message-container');
messageContainer.scrollTop = messageContainer.scrollHeight;
