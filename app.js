const express = require('express'),
      session = require('express-session'),
      path = require('path'),
      bodyParser = require('body-parser'),
      exphbs = require('express-handlebars'),
      expressValidator = require('express-validator'),
      flash = require('connect-flash'),
      passport = require('passport'),
      mongoose = require('mongoose');
process.env.PWD
// app init
const app = express(),
      port = 31337,
      router = express.Router();

// routes
const index = require('./routes/index');

// view engine
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, 'public')));

// body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

// express session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// passport init
app.use(passport.initialize());
app.use(passport.session());

// express msgs
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

app.use('/', index);

app.listen(port, () => {
  console.log('Login Authentication has started on port: ' + port);
});