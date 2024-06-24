const mongoose = require("mongoose");

async function connectDB() {
  return mongoose.connect(process.env.mongoDB);
}

module.exports = connectDB;
