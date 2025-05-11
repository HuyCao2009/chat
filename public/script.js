const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username');

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messages = document.getElementById('messages');
const friendSelect = document.getElementById('friendSelect');

fetch(`/friends/${username}`)
  .then(res => res.json())
  .then(friends => {
    friends.forEach(friend => {
      const opt = document.createElement('option');
      opt.value = friend;
      opt.innerText = friend;
      friendSelect.appendChild(opt);
    });
  });

sendBtn.onclick = () => {
  const to = friendSelect.value;
  const msg = messageInput.value;
  if (!to || !msg) return;
  socket.emit('private message', { from: username, to, message: msg });
  messageInput.value = '';
};

socket.on('private message', ({ from, to, message }) => {
  if (to === username || from === username) {
    const div = document.createElement('div');
    div.textContent = `${from}: ${message}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
});
