const mongoose = require("mongoose");

let postSchema = new mongoose.Schema({
    ownerId: String,
    created_at: Date,
    updated_at: Date,
    ownerName: String,
    ownerAvatar: String,
    content: String,
    imageSrc: String,
    videoSrc: String
});

let Post = mongoose.model("Post", postSchema, "posts");

module.exports = Post;
