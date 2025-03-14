const mongoose = require("mongoose");

async function connectDB() {
  try {
    console.log("Waiting...connect to DB");

    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Đã kết nối thành công với MongoDB");
    const connection = mongoose.connection;

    connection.on("connected", () => {
      console.log("Connected to DB");
    });

    connection.on("error", (error) => {
      console.log("Something is wrong in MongoDB:", error);
    });
  } catch (error) {
    console.log("Something is wrong:", error);
  }
}

module.exports = connectDB;
