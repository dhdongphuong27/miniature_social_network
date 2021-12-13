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

class PostsController {
    create(req, res) {
        var path = "";
        const form = new multiparty.Form()
        form.parse(req, (err, fields, files) => {
            if (files.image)
            {
                files.image.forEach(file => {
                    const uploadImageDir = './public/uploads';
                    if (!fs.existsSync(uploadImageDir)) {
                        fs.mkdirSync(uploadImageDir)
                    }
                    const dir = uploadImageDir + '/' + Date.now();
                    path = dir + '/' + file.originalFilename;
                    fs.mkdirSync(dir);
                    mv(file.path, path, function (err) {

                    });
                })
            }
            var user = getUserfromSession(req);
            new Post({
                ownerId: user._id,
                ownerName: user.name,
                ownerAvatar: user.avatar,
                created_at: new Date(),
                updated_at: new Date(),
                content: fields.content[0],
                imageSrc: path,
                videoSrc: fields.videoSrc[0]
            }).save(function (err, p) {
                if (err) {
                    console.log(err);
                    res.json({ success: 'false'});
                } else {
                    res.json({ success: 'true', postid: p._id});
                }
            })
        })
        
    }
    async list(req, res) {
        let page =  parseInt(req.params.page);
        let limit = parseInt(req.params.limit);
        let skip = (page-1)*limit;
        let posts = await Post.find().skip(skip).limit(limit).sort([['created_at', -1]]);
        res.json(posts);
    }
    async userPostList(req, res) {
        let page = parseInt(req.params.page);
        let limit = parseInt(req.params.limit);
        let skip = (page - 1) * limit;
        let posts = await Post.find({ownerId: req.params.userid}).skip(skip).limit(limit).sort([['created_at', -1]]);
        res.json(posts);
    }
    editpost(req, res) {
        Post.findById(req.body.postid, function (err, post) {
            if (JSON.stringify(post.ownerId) === JSON.stringify(getUserfromSession(req)._id)){
                var ObjectID = require('mongodb').ObjectID;
                Post.updateOne(
                    { "_id": ObjectID(req.body.postid) },
                    { $set: { "content": req.body.editcontent } },
                    { $currentDate: { updated_at: true } }
                ).then((obj) => {
                    res.json({ success: 'true' });
                }).catch((err) => {
                    res.json({ success: 'false' });
                })
            }else{
                res.json({ success: 'false', err: "You dont have permission to edit this post"});
            }
        });
        
        
    }
    deletepost(req, res) {
        Post.findById(req.body.postid, function (err, post) {
            if (JSON.stringify(post.ownerId) === JSON.stringify(getUserfromSession(req)._id)) {
                var ObjectID = require('mongodb').ObjectID;
                Post.deleteOne(
                    { _id: ObjectID(req.body.postid) },
                ).then((obj) => {
                    res.json({ success: 'true' });
                }).catch((err) => {
                    res.json({ success: 'false' });
                })
            } else {
                res.json({ success: 'false', err: "You dont have permission to delete this post" });
            }
        });
    }
}

module.exports = new PostsController()