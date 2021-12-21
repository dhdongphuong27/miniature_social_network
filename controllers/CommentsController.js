const Comment = require('../models/Comment');

function getUserfromSession(req) {
    if (req.user) {
        return req.user
    }
    else {
        return JSON.parse(req.session.user);
    }
}

class CommentsController{
    create(req, res) {
        var user = getUserfromSession(req)
        new Comment({
            ownerId: user._id,
            ownerName: user.name,
            ownerAvatar: user.avatar,
            postid: req.body.postid,
            content: req.body.commentcontent
            
        }).save(function (err, cmt) {
            if (err) {
                console.log(err);
                res.json({ success: 'false' });
            } else {
                res.json({ success: 'true', commentid: cmt._id});
            }
        })
    }
    async getComments(req, res) {
        let comments = await Comment.find({ postid: req.params.postid });
        res.json(comments);
    }
    deletecomment(req, res) {
        Comment.findById(req.body.commentid, function (err, cmt) {
            if (JSON.stringify(cmt.ownerId) === JSON.stringify(getUserfromSession(req)._id) || getUserfromSession(req).role === "admin") {
                var ObjectID = require('mongodb').ObjectID;
                Comment.deleteOne(
                    { _id: ObjectID(req.body.commentid) },
                ).then((obj) => {
                    res.json({ success: 'true' });
                }).catch((err) => {
                    res.json({ success: 'false' });
                })
            } else {
                res.json({ success: 'false', err: "You dont have permission to delete this comment" });
            }
        });
    }
}

module.exports = new CommentsController()