var express = require('express');
const { route } = require('.');
var router = express.Router();
var notificationsController = require('../controllers/NotificationsController')


router.post('/create', function (req, res) {
    console.log("reach here")
    notificationsController.create(req, res)
});

router.get('/list/page/:page/limit/:limit', notificationsController.list); 


module.exports = router;