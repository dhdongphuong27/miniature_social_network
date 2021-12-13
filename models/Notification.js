const mongoose = require("mongoose");

let notificationSchema = new mongoose.Schema({
    ownerId: String,
    created_at: Date,
    ownerName: String,
    ownerAvatar: String,
    categoryName: String,
    categoryId: String,
    title: String,
    content: String
});

let Notification = mongoose.model("Notification", notificationSchema, "notifications");

module.exports = Notification;
