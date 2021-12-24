const User = require('../models/User');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
var multiparty = require('multiparty');
var fs = require('fs');
var mv = require('mv');
function getUserfromSession(req) {
    if (req.user) {
        return req.user
    }
    else {
        return JSON.parse(req.session.user);
    }
}

class UsersController {
    create(req, res) {
        if (getUserfromSession(req).role==="admin")
        {
            var userid;
            new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password,
                avatar: "/images/facultydefaultavt.png",
                role: "faculty",

            }).save(function (err, user) {
                if (err) {
                    console.log(err);
                    res.json({ success: 'false' });
                } else {
                    userid = user._id;
                    for (var i = 0; i < req.body.categories.length; i++) {
                        User.updateOne(
                            { "_id": userid },
                            {
                                $push: { "permission": { categoryId: req.body.categories[i][0], categoryName: req.body.categories[i][1] } }
                            }
                        ).then((obj) => {
                            
                        }).catch((err) => {
                            console.log(err)
                        })
                    }
                    res.json({ success: 'true' });
                }
            })
        }else{
            res.json({ success: 'false', message: 'You dont have permission to create account'})
        }
    }
    settings(req, res){
        var path = "";
        const form = new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (files.avatar) {
                files.avatar.forEach(file => {
                    const uploadImageDir = './public/uploads';
                    if (!fs.existsSync(uploadImageDir)) {
                        fs.mkdirSync(uploadImageDir)
                    }
                    const dir = uploadImageDir + '/' + Date.now();
                    path = dir + '/' + file.originalFilename;
                    fs.mkdirSync(dir);
                    mv(file.path, path, function () {

                    });
                })
            }else {
                path = getUserfromSession(req).avatar
            }
            var ObjectID = require('mongodb').ObjectID;
            path = path.replace("./public", "")
            if (typeof fields.name === 'undefined'){
                User.updateOne(
                    { "_id": ObjectID(getUserfromSession(req)._id) },
                    {
                        $set: {
                            password: fields.password[0],
                        }
                    }
                ).then((obj) => {
                    res.json({ success: 'true' });
                })
            }else{
                User.updateOne(
                    { "_id": ObjectID(getUserfromSession(req)._id) },
                    {
                        $set: {
                            name: fields.name[0],
                            class: fields.class[0],
                            faculty: fields.faculty[0],
                            phone: fields.phone[0],
                            password: fields.password[0],
                            avatar: path
                        }
                    }
                ).then((obj) => {
                    User.findById(ObjectID(getUserfromSession(req)._id), function (err, user) {

                        req.session.user = JSON.stringify(user);
                        req.session.save();
                        Post.updateMany(
                            { "ownerId": ObjectID(user._id) },
                            {
                                "$set": { "ownerName": user.name, "ownerAvatar": user.avatar }
                            }, function (err) {
                            })
                        Comment.updateMany(
                            { "ownerId": ObjectID(user._id) },
                            {
                                "$set": { "ownerName": user.name, "ownerAvatar": user.avatar }
                            }, function (err) {
                            })
                    })
                    res.json({ success: 'true' });
                }).catch((err) => {
                    res.json({ success: 'false' });
                })
            }
            
        })
    }
    resetAvt(req, res){
        var ObjectID = require('mongodb').ObjectID;
        User.updateOne(
            { "_id": ObjectID(getUserfromSession(req)._id) },
            {
                $set: {
                    avatar: "/images/defaultavt.png"
                }
            }
        ).then((obj) => {
            var user = getUserfromSession(req)
            user.avatar = "/images/defaultavt.png";
            req.session.user = JSON.stringify(user);
            req.session.save();
            Post.updateMany(
                { "ownerId": ObjectID(user._id) },
                {
                    "$set": {"ownerAvatar": user.avatar }
                }, function (err) {
                })
            Comment.updateMany(
                { "ownerId": ObjectID(user._id) },
                {
                    "$set": {"ownerAvatar": user.avatar }
                }, function (err) {
                })
            res.json({ success: 'true' });
        }).catch((err) => {
            console.log("odnaslkdn")
            res.json({ success: 'false' });
        })
    }
    getUserInfo(req,res){
        User.findById(req.params.userid, function (err, user) {
            res.json(user);
        });
    }
}
module.exports = new UsersController()