// Import các thư viện cần thiết
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config(); // Để lấy thông tin từ file .env

// Khởi tạo ứng dụng Express
const app = express();

// Middleware để phân tích JSON từ request body
app.use(express.json());

// Lấy thông tin kết nối MongoDB từ biến môi trường
const dbUri = process.env.DB_URI;

// Kết nối tới MongoDB Atlas
mongoose
  .connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB Atlas!");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB: ", err);
  });

// Định nghĩa Schema và Model cho User
const userSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);

// Định nghĩa một route đơn giản để kiểm tra server
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Định nghĩa một route để thêm dữ liệu vào MongoDB
app.post("/add", async (req, res) => {
  const { name, age } = req.body;

  try {
    const newUser = new User({ name, age });
    await newUser.save();
    res.status(201).json({ message: "User added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Định nghĩa một route để lấy dữ liệu từ MongoDB
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Đảm bảo rằng server có thể phục vụ tệp tĩnh
app.use(express.static(path.join(__dirname, "public")));

// Cấu hình server lắng nghe tại port 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
