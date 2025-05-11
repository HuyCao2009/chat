const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const http = require('http'); // Để dùng socket.io
const socketIo = require('socket.io');

// Khởi tạo Express trước khi dùng
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Cổng
const PORT = process.env.PORT || 10000;

// Kết nối MongoDB Atlas
mongoose.connect('your_mongo_uri_here', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mongoose Model
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String
}));

// ROUTES
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Xử lý đăng ký
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.findOne({ username });
  if (exists) return res.status(400).send('Tên người dùng đã tồn tại');
  const hashed = await bcrypt.hash(password, 10);
  await User.create({ username, password: hashed });
  res.redirect('/login');
});

// Xử lý đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('Không tìm thấy người dùng');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send('Sai mật khẩu');
  res.redirect('/chat');
});

// Socket.io
io.on('connection', (socket) => {
  console.log('🟢 Người dùng đã kết nối');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Người dùng đã ngắt kết nối');
  });
});

// 404
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
