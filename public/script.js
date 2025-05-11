// Gửi yêu cầu kết bạn
function sendFriendRequest(toUsername) {
  fetch('/send-friend-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ toUsername })
  })
  .then(res => res.text())
  .then(response => alert(response));
}

// Chấp nhận yêu cầu kết bạn
function acceptFriend(fromId) {
  fetch('/accept-friend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fromId })
  })
  .then(res => res.text())
  .then(response => alert(response));
}

// Tìm kiếm người dùng
document.getElementById('searchBox').addEventListener('input', async (e) => {
  const query = e.target.value;
  const res = await fetch('/search-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const users = await res.json();
  const results = document.getElementById('results');
  results.innerHTML = users.map(u => `
    <div>
      ${u.username} 
      <button onclick="sendFriendRequest('${u.username}')">Add Friend</button>
    </div>
  `).join('');
});

// Gửi tin nhắn
const socket = io(); // Kết nối đến socket.io

function sendMessage() {
  const to = document.getElementById('to').value;
  const text = document.getElementById('text').value;
  if (!to || !text) {
    alert('Please enter a username and a message.');
    return;
  }
  socket.emit('private message', { from: 'me', to, text });
  document.getElementById('text').value = ''; // Reset input field
}

// Lắng nghe tin nhắn và hiển thị
socket.on('private message', (msg) => {
  const chat = document.getElementById('chat');
  chat.innerHTML += `<div><b>${msg.from}</b>: ${msg.text}</div>`;
  chat.scrollTop = chat.scrollHeight; // Tự động cuộn xuống dưới khi có tin nhắn mới
});
