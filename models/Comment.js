const mongoose = require("mongoose");

let commentSchema = new mongoose.Schema({
    ownerId: String,
    created_at: Date,
    ownerName: String,
    ownerAvatar: String,
    postid: String,
    content: String
});

let Comment = mongoose.model("Comment", commentSchema, "comments");

module.exports = Comment;
