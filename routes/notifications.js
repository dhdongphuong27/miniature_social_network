var express = require('express');
const { route } = require('.');
var router = express.Router();
var notificationsController = require('../controllers/NotificationsController')
const Notification = require('../models/Notification');

function getUserfromSession(req) {
    if (req.user) {
        return req.user
    }
    else if (req.session.user) {
        return JSON.parse(req.session.user);
    }
}
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated() || req.session.user) {
        return next();
    }
    res.redirect('/login');
}

router.post('/create', function (req, res) {
    notificationsController.create(req, res)
});

router.put('/edit', function (req, res) {
    console.log(req.body.notiid)
    console.log(req.body.editNotiTitle)
    console.log(req.body.editNotiContent)
    notificationsController.edit(req, res)
})
router.delete('/delete', function (req, res) {
    notificationsController.delete(req, res)
})

router.get('/', isLoggedIn,function (req, res) {
    res.render('notification', { user: getUserfromSession(req) })
})

router.get('/details/:notificationid', isLoggedIn, function (req, res) {
    Notification.findById(req.params.notificationid, function (err, noti) {
        if (noti.ownerId === getUserfromSession(req)._id){
            res.render('notidetail', { user: getUserfromSession(req), owned: true })
        }
        else{
            res.render('notidetail', { user: getUserfromSession(req), owned: false })
        }
    });
    
})

router.get('/list/page/:page/limit/:limit', notificationsController.list); 
router.get('/slist/facultyid/:facultyid/title/:title/content/:content/page/:page/ownerId/:ownerId/limit/:limit', notificationsController.slist); 
router.get('/numpage/facultyid/:facultyid/title/:title/content/:content/ownerId/:ownerId', notificationsController.numpage);
router.get('/notificationid/:notificationid', notificationsController.getOne);
module.exports = router;