const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

// Kết nối MongoDB Atlas
mongoose.connect('mongodb://huydeptrainhungkhongpd:Huysenpai2009@ac-2ujrbot-shard-00-01.70ylm6f.mongodb.net:27017,ac-2ujrbot-shard-00-02.70ylm6f.mongodb.net:27017,ac-2ujrbot-shard-00-00.70ylm6f.mongodb.net:27017/?authSource=admin&replicaSet=atlas-bxw8e0-shard-0&retryWrites=true&w=majority&appName=Cluster0&ssl=true')
  .then(() => console.log('Connected to MongoDB Atlas!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Cấu hình public folder cho file tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// === ROUTES ===
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

// Trang chat (nếu có)
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

// Bắt mọi route không xác định → báo lỗi 404 hoặc redirect
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
