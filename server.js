const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const PORT = process.env.PORT || 10000;

mongoose.connect('mongodb+srv://huydeptrainhungkhongpd:Huysenpai2009@cluster0.70ylm6f.mongodb.net/chatapp?retryWrites=true&w=majority&ssl=true')
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const User = require('./models/User');

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/chat', (req, res) => res.sendFile(path.join(__dirname, 'public', 'chat.html')));

// Đăng ký
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existing = await User.findOne({ username });
  if (existing) return res.status(400).send('User exists');
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.redirect('/login');
});

// Đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send('Wrong password');
  res.redirect(`/chat?username=${username}`);
});

// Gửi danh sách bạn bè (giả lập đơn giản)
app.get('/friends/:username', async (req, res) => {
  const allUsers = await User.find({ username: { $ne: req.params.username } });
  res.json(allUsers.map(u => u.username));
});

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('private message', ({ from, to, message }) => {
    io.emit('private message', { from, to, message });
  });

  socket.on('disconnect', () => console.log('🔴 A user disconnected'));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
