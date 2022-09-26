if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const passport = require('passport');
const LocalStrategy = require('passport-local');

const app = express();
const expressLayouts = require('express-ejs-layouts');
const indexRouter = require('./routes/index');
const signUpRouter = require('./routes/signUp');
const logInRouter = require('./routes/logIn');
const messageRouter = require('./routes/message');

const User = require('./models/users');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(express.urlencoded({ limit: '10mb', extended: false }));

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

const mongoose = require('mongoose');
const mongoDb = process.env.DATABASE_URL;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to mongoose'));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log('wrong');
        return done(null, false, { message: 'Incorrect username' });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          console.log('wrong');
          return done(null, user);
        } else {
          console.log('wrong else compare');
          return done(null, false, { message: 'Incorrect password' });
        }
      });
      console.log('wrong out');
    });
  })
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

app.post(
  '/log-in',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-in',
  })
);

app.get('/log-out', (req, res, next) => {
  {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect('/log-in');
    });
  }
});

app.use('/', indexRouter);

app.use('/sign-up', signUpRouter);

app.use('/log-in', logInRouter);

app.use('/message', messageRouter);

app.listen(process.env.PORT || 3000);
