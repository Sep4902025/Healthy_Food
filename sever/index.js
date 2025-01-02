const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/connectDB");
const adminRouter = require("./routes/adminRouter");
const clientRouter = require("./routes/clientRouter");

const app = express();

// Danh sách các URL được phép truy cập
const allowedOrigins = [
  process.env.ADMIN_WEB_URL, // URL của Admin Web
  process.env.MOBILE_CLIENT_URL, // URL của Mobile Client
];

// Cấu hình CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Kiểm tra xem origin có nằm trong danh sách allowedOrigins hay không
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Cho phép
    } else {
      callback(new Error("Not allowed by CORS")); // Từ chối
    }
  },
  credentials: true, // Cho phép gửi cookie/authorization headers
};

// Áp dụng middleware CORS
app.use(cors(corsOptions));

// Các route khác
app.get("/", (req, res) => {
  res.send("Hello, CORS is working!");
});
// API Endpoint
app.use("/admin", adminRouter), app.use("/client", clientRouter);
// Khởi động server
const PORT = process.env.PORT || 8080;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
