const mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
    authId: String,
    name: String,
    email: String,
    password: String,
    phone: String,
    class: String,
    faculty: String,
    avatar: String,
    role: String,
    permission: [{ categoryId: String, categoryName: String}]
});

let User = mongoose.model("User", userSchema, "users");

module.exports = User;
