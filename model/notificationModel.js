const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    date: { type: Number, required: true },
    recieverId: { type: String, required: true },
    read: { type: Boolean, required: true },
    link: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("notifications", notificationSchema);
