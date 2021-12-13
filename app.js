var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('./models/User');
var db = require('./db');
var utils = require('./utils');

var credentials = require('./credentials');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var postsRouter = require('./routes/posts');
var commentsRouter = require('./routes/comments');
var notificationsRouter = require('./routes/notifications');

const { createServer } = require("http");
const { Server } = require("socket.io");
const port = 3000



const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });
io.on("connection", (socket) => {
  console.log("Someone connected")
  socket.on("disconnect", function(){
    console.log(socket.id + " has disconnected")
  })
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(credentials.cookieSecret));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: credentials.cookieSecret
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new GoogleStrategy({
    clientID: credentials.clientID,
    clientSecret: credentials.clientSecret,
    callbackURL: credentials.callbackURL
  },
  function(accessToken, refreshToken, profile, done){
    const email = profile.emails[0].value;
    if (!(email.includes("@student.tdtu.edu.vn") || email.includes("@tdtu.edu.vn")))
    {
      return done(null, null);
    } else {
      const authId = "google:" + profile.id;
      User.findOne({ authId: authId })
        .then(user => {
          if (user) return done(null, user);
          new User({
            authId: authId,
            name: profile.displayName,
            email: email,
            avatar: "/images/defaultavt.png",
            password: utils.getRndInteger(100000, 999999),
            role: 'student'
          }).save()
            .then(user => done(null, user))
            .catch(err => done(err, null))
        })
        .catch(err => {
          if (err) return done(err, null);
        })
    }
  }
));
passport.serializeUser(function (user, done){
  done(null, user._id);
});
passport.deserializeUser(function (id, done){
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err, null));
})

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google',{successRedirect: '/',failureRedirect: '/login'}))


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/posts', postsRouter);
app.use('/comments', commentsRouter);
app.use('/notifications', notificationsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

httpServer.listen(process.env.PORT || 3000)

module.exports = app;
