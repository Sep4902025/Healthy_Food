const mongoose = require("mongoose");
async function connectDB(params) {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const connection = mongoose.connection;
    connection.on("connect", () => {
      console.log("Connect to DB");
    });
    connection.on("error", (error) => {
      console.log("Something is wrong in mongoDB ", error);
    });
  } catch (error) {
    console.log("Something is wrong ", error);
  }
}
module.exports = connectDB;
