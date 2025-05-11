const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Cấu hình cổng
const PORT = process.env.PORT || 3000;

// Cung cấp các tệp tĩnh từ thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Xử lý kết nối Socket.io
io.on('connection', (socket) => {
  console.log('🔌 Người dùng đã kết nối');

  // Lắng nghe sự kiện 'chat message' từ client
  socket.on('chat message', (msg) => {
    // Phát lại tin nhắn đến tất cả các client
    io.emit('chat message', msg);
  });

  // Xử lý khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    console.log('❌ Người dùng đã ngắt kết nối');
  });
});

// Khởi động máy chủ
server.listen(PORT, () => {
  console.log(`🚀 Máy chủ đang chạy tại http://localhost:${PORT}`);
});
