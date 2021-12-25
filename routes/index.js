var express = require('express');
var router = express.Router();
var User = require('../models/User');

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated() || req.session.user) {
    return next();
  }
  res.redirect('/login');
}
function getUserfromSession(req){
  if (req.user) {
    return req.user
  }
  else if (req.session.user){
    return JSON.parse(req.session.user);
  }
}
function isAdminMiddleware(req, res, next) {
  if (getUserfromSession(req).role === 'admin') {
    return next();
  }
  res.redirect('/');
}
function isAdmin(req) {
  if (getUserfromSession(req).role === 'admin'){
    return true;
  }
  return false;
}
function isFaculty(req){
  if (getUserfromSession(req).role === 'faculty'){
    return true;
  }
  return false
}

router.post('/login', function(req, res, next){

  User.findOne({ email: req.body.email }, function (err, user) {
    if (req.body.password == user.password)
    {
      req.session.user = JSON.stringify(user);
      res.redirect('/');
    }
  }).catch((err) => {
    console.log(err)
    res.redirect('/login')
  })
  
})

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/createacc', isLoggedIn, isAdminMiddleware, function(req, res, next) {
  res.render('createacc', { user: getUserfromSession(req) });
})
router.get('/faculty', isLoggedIn, isAdminMiddleware, function (req, res, next) {
  res.render('listfaculty', { user: getUserfromSession(req) });
})
router.get('/student', isLoggedIn, isAdminMiddleware, function (req, res, next) {
  res.render('liststudent', { user: getUserfromSession(req) });
})
router.get('/settings', isLoggedIn, function(req, res, next) {
  res.render('settings', { user: getUserfromSession(req)})
})

router.get('/', isLoggedIn, function(req, res, next) {
  if (isAdmin(req)){
    res.render('admin', { user: getUserfromSession(req) })
  } else if (isFaculty(req)){
    res.render('faculty', { user: getUserfromSession(req) });
  }
  else{
    res.render('index', { user: getUserfromSession(req)});
  }
});

module.exports = router;
