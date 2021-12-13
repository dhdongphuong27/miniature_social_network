var express = require('express');
var router = express.Router();
var usersController = require('../controllers/UsersController')

function getUserfromSession(req) {
  if (req.user) {
    return req.user
  }
  else {
    return JSON.parse(req.session.user);
  }
}
function isAdmin(req) {
  if (getUserfromSession(req).role === 'admin') {
    return true;
  }
  return false;
}
router.get('/userid/:userid/', function(req, res, next) {
  res.render('profile', { user: getUserfromSession(req) });
});

router.post('/createfacultyacc', function(req, res, next) {
  if (isAdmin(req))
  {
    usersController.create(req, res)
  }
  else
  {
    res.json({ success: 'false' });
  }
})

router.get('/signout', function(req, res, next) {
  req.session.destroy();
  res.redirect('/login');
})

module.exports = router;
