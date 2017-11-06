const express = require('express'),
      router = express.Router(),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;

let User = require('../models/User');

// home
router.get('/', ensureAuthenticated, (req, res, next) => {
  res.render('index');
});

// login
router.get('/login', (req, res, next) => {
  res.render('login');
});

// logout
router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success_msg', 'You are logged out, brah');
  res.redirect('/login');
});

// register
router.get('/register', (req, res, next) => {
  res.render('register');
});

// process registration
router.post('/register', (req, res, next) => {
  const name = req.body.name,
        username = req.body.username,
        email = req.body.username,
        password = req.body.password,
        passwordconfirmation = req.body.passwordconfirmation;

  req.checkBody('name', 'Name field is required, brah').notEmpty();
  req.checkBody('username', 'Username field is required, brah').notEmpty();
  req.checkBody('email', 'Email must be a valid email address, brah').isEmail();
  req.checkBody('password', 'Password field is required, brah').notEmpty();
  req.checkBody('passwordconfirmation', 'Passwords don\'t match, brah').equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    const newUser = new User({
      name: name,
      username: username,
      email: email,
      password: password
    });

    User.registerUser(newUser, (err, user) => {
      if (err) throw err;
      req.flash('success_msg', 'You\'re registered and can now login, brah!');
      res.redirect('/login');
    })
  }
});

// local strategy
passport.use(new LocalStrategy((username, password, done) => {
  User.getUserByUsername(username, (err, user) => {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'No user found, brah' });
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err) throw err;

      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Passwords don\'t match, brah' });
      }
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    done(null, user.id);
  });
});

// login processing
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('error_msg', 'Denied, brah.')
    res.redirect('/login');
  }
}

module.exports = router;