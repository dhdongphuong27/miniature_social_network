var express = require('express');
const { route } = require('.');
var router = express.Router();
var postsController = require('../controllers/PostsController')


router.post('/create', function (req, res) {
    postsController.create(req, res)
});

router.get('/list/page/:page/limit/:limit', postsController.list); 
router.get('/list/userid/:userid/page/:page/limit/:limit', postsController.userPostList);

router.put('/addcomment', function (req, res) {
    postsController.addcomment(req, res)
})
router.put('/editpost', function (req, res) {
    postsController.editpost(req, res)
})
router.delete('/deletepost', function (req, res) {
    postsController.deletepost(req, res)
})

module.exports = router;