const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const app = express();
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
  password: String,
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Danh sách bạn bè
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // Danh sách yêu cầu kết bạn
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

// Tìm kiếm bạn bè
app.get('/search', async (req, res) => {
  const { username } = req.query;
  try {
    const users = await User.find({ username: { $regex: username, $options: 'i' } }).limit(10);
    res.json(users);
  } catch (err) {
    res.status(500).send('Lỗi khi tìm kiếm');
  }
});

// Gửi yêu cầu kết bạn
app.post('/send-friend-request', async (req, res) => {
  const { senderId, receiverId } = req.body;
  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);
    if (!receiver || !sender) return res.status(400).send('Người dùng không tồn tại.');

    if (receiver.friendRequests.includes(senderId)) {
      return res.status(400).send('Bạn đã gửi yêu cầu kết bạn cho người này rồi.');
    }

    receiver.friendRequests.push(senderId);
    await receiver.save();
    res.send('Yêu cầu kết bạn đã được gửi.');
  } catch (err) {
    res.status(500).send('Lỗi khi gửi yêu cầu kết bạn');
  }
});

// Chấp nhận yêu cầu kết bạn
app.post('/accept-friend-request', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) return res.status(400).send('Người dùng không tồn tại.');

    user.friends.push(friendId);
    friend.friends.push(userId);

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId.toString());

    await user.save();
    await friend.save();

    res.send('Bạn đã chấp nhận yêu cầu kết bạn!');
  } catch (err) {
    res.status(500).send('Lỗi khi chấp nhận yêu cầu kết bạn');
  }
});

// Hủy yêu cầu kết bạn
app.post('/cancel-friend-request', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).send('Người dùng không tồn tại.');

    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId.toString());
    await user.save();

    res.send('Yêu cầu kết bạn đã bị hủy.');
  } catch (err) {
    res.status(500).send('Lỗi khi hủy yêu cầu kết bạn');
  }
});

// Xử lý socket
io.on('connection', (socket) => {
  console.log('🟢 A user connected');

  // Nhận tin nhắn từ client và gửi đến user đã kết bạn
  socket.on('chat message', async (msg) => {
    const { senderId, receiverId, message } = msg;
    
    // Kiểm tra xem người gửi và người nhận có phải là bạn bè không
    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (sender && receiver && sender.friends.includes(receiverId)) {
      io.to(receiverId).emit('chat message', { senderId, message });  // Gửi tin nhắn cho người nhận
    } else {
      socket.emit('error', 'Bạn chưa kết bạn với người này!');
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 A user disconnected');
  });
});

// Khởi động server
http.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
