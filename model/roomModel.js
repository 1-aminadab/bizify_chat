const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const message = {
  senderId: { type: String },
  message: { type: String },
  date: { type: Date, default: Date.now },
  exist: { type: Boolean },
  recieverId: { type: String },
  viewed: { type: Boolean },
};

const merchantInfo = new Schema({
  merchantId: { type: String, required: true },
  firstname: { type: String, required: true },
  type: {
    type: String,
    enum: ["customer", "merchant"],
    required: true,
  },
});

const adminInfo = new Schema({
  adminId: { type: String, required: true },
  firstname: { type: String, default: "Admin", required: true },
});

const roomSchema = new Schema(
  {
    merchant: merchantInfo,
    admin: adminInfo,
    messages: [message],
  },
  {
    timestamps: true,
  }
);

const roomModel = mongoose.model("rooms", roomSchema);

module.exports = roomModel;
