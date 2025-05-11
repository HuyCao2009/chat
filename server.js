const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const session = require('express-session');
const fs = require('fs');
const http = require('http');
const socketIO = require('socket.io');

const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = process.env.PORT || 10000;

mongoose.connect('mongodb+srv://...your_connection_string...', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(session({ secret: 'chatapp', resave: false, saveUninitialized: true }));

// Multer setup for avatar upload
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==== Routes ====
app.get('/', (req, res) => res.redirect('/login'));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/chat', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'views', 'chat.html'));
});
app.get('/profile/:username', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/search', (req, res) => res.sendFile(path.join(__dirname, 'views', 'search.html')));

// Auth
app.post('/register', upload.single('avatar'), async (req, res) => {
  const { username, password } = req.body;
  const avatar = req.file ? '/uploads/' + req.file.filename : '';
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, avatar });
  await user.save();
  res.redirect('/login');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.send('Login failed');
  req.session.user = user;
  res.redirect('/chat');
});

app.post('/search-user', async (req, res) => {
  const { query } = req.body;
  const users = await User.find({ username: { $regex: query, $options: 'i' } });
  res.json(users);
});

app.post('/send-friend-request', async (req, res) => {
  const { toUsername } = req.body;
  const from = await User.findById(req.session.user._id);
  const to = await User.findOne({ username: toUsername });
  if (!to || from.friends.includes(to._id)) return res.send('Invalid');
  to.friendRequests.push(from._id);
  await to.save();
  res.send('Request sent');
});

app.post('/accept-friend', async (req, res) => {
  const fromId = req.body.fromId;
  const user = await User.findById(req.session.user._id);
  if (!user.friendRequests.includes(fromId)) return res.send('No request');
  user.friends.push(fromId);
  user.friendRequests = user.friendRequests.filter(id => id != fromId);
  await user.save();
  const from = await User.findById(fromId);
  from.friends.push(user._id);
  await from.save();
  res.send('Friend added');
});

// Socket chat riêng
io.on('connection', (socket) => {
  socket.on('private message', async ({ from, to, text }) => {
    const msg = new Message({ from, to, text });
    await msg.save();
    io.emit('private message', { from, to, text });
  });
});

server.listen(PORT, () => console.log(`🚀 Server on ${PORT}`));
