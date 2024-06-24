const Notification = require("../model/notificationModel");

// a function to save  notifications to the database
async function saveNotification(notification) {
  try {
    console.log(notification);
    let savedNotification = await Notification.create(notification);
    return savedNotification;
  } catch (error) {
    console.log(error);
    throw new Error(error.message);
  }
}

module.exports = { saveNotification };
