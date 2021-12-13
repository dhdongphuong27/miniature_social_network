var express = require('express');
const { route } = require('.');
var router = express.Router();
var commentsController = require('../controllers/CommentsController')

router.post('/create', function (req, res) {
    commentsController.create(req, res)
});

router.delete('/deletecomment', function (req, res) {
    console.log("deleting : " + req.body.commentid)
    commentsController.deletecomment(req, res)
})

router.get('/list/postid/:postid', commentsController.getComments);

module.exports = router;