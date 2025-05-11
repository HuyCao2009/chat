const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const http = require('http');  // Đảm bảo khai báo 'http' trước

const app = express();  // Khai báo 'app' trước khi sử dụng
const PORT = process.env.PORT || 10000;

// Kết nối MongoDB Atlas
mongoose.connect('mongodb://huydeptrainhungkhongpd:Huysenpai2009@ac-2ujrbot-shard-00-01.70ylm6f.mongodb.net:27017,ac-2ujrbot-shard-00-02.70ylm6f.mongodb.net:27017,ac-2ujrbot-shard-00-00.70ylm6f.mongodb.net:27017/?authSource=admin&replicaSet=atlas-bxw8e0-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cấu hình thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// ====== MODEL ======
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const User = mongoose.model('User', userSchema);

// ====== ROUTES ======

// Trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Trang đăng nhập
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Trang đăng ký
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Trang chat
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Xử lý đăng ký
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Tên người dùng đã tồn tại!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, password: hashedPassword });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi đăng ký');
  }
});

// Xử lý đăng nhập
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).send('Không tìm thấy người dùng!');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send('Sai mật khẩu!');
    }
    res.redirect('/chat');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi đăng nhập');
  }
});

// Route không xác định → 404
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Đảm bảo rằng bạn tạo server HTTP sau khi khai báo 'app'
const server = http.createServer(app); // Tạo server sau khi khai báo 'app'

const io = require('socket.io')(server);

// Xử lý socket
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Gửi lại cho tất cả client
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// Chạy server HTTP
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
