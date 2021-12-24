const Notification = require('../models/Notification');

function getUserfromSession(req) {
    if (req.user) {
        return req.user
    }
    else {
        return JSON.parse(req.session.user);
    }
}
function isFaculty(req) {
    if (getUserfromSession(req).role === 'faculty') {
        return true;
    }
    return false
}
class NotificationsController {
    create(req, res) {
        const user = getUserfromSession(req);
        if (isFaculty(req)){
            new Notification({
                ownerId: user._id,
                created_at: new Date(),
                ownerName: user.name,
                ownerAvatar: user.ownerAvatar,
                categoryName: req.body.categoryName,
                categoryId: req.body.categoryId,
                title: req.body.title,
                content: req.body.content
            }).save(function (err, noti) {
                if (err) {
                    res.json({ success: 'false' });
                } else {
                    res.json({ success: 'true' , noti: noti});
                }
            })
        } else{
            res.json({success: 'false', err: 'You dont have permission to post notification'});
        }
    }
    edit(req, res) {
        Notification.updateOne(
            { "_id": req.body.notiid },
            {
                $set: {
                    title: req.body.editNotiTitle,
                    content: req.body.editNotiContent
                }
            }
        ).then((obj) =>{
            res.json({success: 'true'})
        }).catch((e) => {
            console.log(e)
            res.json({success: 'false'})
        });
    }
    delete(req, res) {
        var ObjectID = require('mongodb').ObjectID;
        Notification.deleteOne(
            { _id: ObjectID(req.body.notiid) },
        ).then((obj) => {
            res.json({ success: 'true' });
        }).catch((err) => {
            res.json({ success: 'false' });
        })
    }
    async list(req, res) {
        let page = parseInt(req.params.page);
        let limit = parseInt(req.params.limit);
        let skip = (page - 1) * limit;
        let notifications = await Notification.find().skip(skip).limit(limit).sort([['created_at', -1]]);
        res.json(notifications);
    }
    async slist(req, res) {
        let page = parseInt(req.params.page);
        let limit = parseInt(req.params.limit);
        let skip = (page - 1) * limit;

        let query = {};
        if (!(req.params.facultyid === "-")){
            query.categoryId = req.params.facultyid
        }
        if (!(req.params.title === "-")){
            query.title = { "$regex": req.params.title, "$options": "i" }
        }
        if (!(req.params.ownerId === "-")) {
            query.ownerId = req.params.ownerId
        }
        if (!(req.params.content === "-")){
            query.content = { "$regex": req.params.content, "$options": "i" }
        }

        let notifications = await Notification.find(query).skip(skip).limit(limit).sort([['created_at', -1]]);
        res.json(notifications);
    }
    async numpage(req, res){
        let query = {};
        if (!(req.params.facultyid === "-")) {
            query.categoryId = req.params.facultyid
        }
        if (!(req.params.title === "-")) {
            query.title = { "$regex": req.params.title, "$options": "i" }
        }
        if (!(req.params.ownerId === "-")) {
            query.ownerId = req.params.ownerId
        }
        if (!(req.params.content === "-")) {
            query.content = { "$regex": req.params.content, "$options": "i" }
        }
        const num = await Notification.countDocuments(query);
        res.json(num);
    }
    async getOne(req, res){
        Notification.findById(req.params.notificationid, function (err, noti) {
            res.json(noti);
        });
    }
}

module.exports = new NotificationsController()