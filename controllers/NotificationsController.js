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
            }).save(function (err) {
                if (err) {
                    console.log(err);
                    res.json({ success: 'false' });
                } else {
                    res.json({ success: 'true'  });
                }
            })
        } else{
            res.json({success: 'false', err: 'You dont have permission to post notification'});
        }
    }
    async list(req, res) {
        let page = parseInt(req.params.page);
        let limit = parseInt(req.params.limit);
        let skip = (page - 1) * limit;
        let notifications = await Notification.find().skip(skip).limit(limit).sort([['created_at', -1]]);
        res.json(notifications);
    }
}

module.exports = new NotificationsController()