var express = require('express');
const { route } = require('.');
var router = express.Router();
var notificationsController = require('../controllers/NotificationsController')

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

router.get('/', isLoggedIn,function (req, res) {
    res.render('notification', { user: getUserfromSession(req) })
})

router.get('/details/:notificationid', isLoggedIn, function (req, res) {
    res.render('notidetail', { user: getUserfromSession(req) })
})

router.get('/list/page/:page/limit/:limit', notificationsController.list); 
router.get('/slist/facultyid/:facultyid/title/:title/content/:content/page/:page/limit/:limit', notificationsController.slist); 
router.get('/numpage', notificationsController.numpage);
router.get('/notificationid/:notificationid', notificationsController.getOne);
module.exports = router;