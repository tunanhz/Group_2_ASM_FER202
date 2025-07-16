// Simple Node.js + Socket.IO group chat server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

let messages = [];

io.on('connection', (socket) => {
  // Gửi toàn bộ tin nhắn cũ cho client mới
  socket.emit('chat history', messages);

  // Khi nhận tin nhắn mới
  socket.on('chat message', (msg) => {
    const messageObj = {
      user: msg.user || 'Ẩn danh',
      text: msg.text,
      time: new Date().toLocaleTimeString('vi-VN')
    };
    messages.push(messageObj);
    // Gửi cho tất cả client
    io.emit('chat message', messageObj);
  });

  // (Tùy chọn) Xử lý ngắt kết nối
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || process.env.CHAT_PORT || 5000;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
}); 