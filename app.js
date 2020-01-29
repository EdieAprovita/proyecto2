require('dotenv').config();

const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser'); 
const express      = require('express');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const session      = require("express-session");
const MongoStore   = require("connect-mongo")(session);
const passport     = require("./config/passport");


mongoose
  .connect(process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//Passport 

app.use(
  session({
    secret: process.env.SECRET,
    cookie: { maxAge: 3600000 },
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60 
    })
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));



const auth = require("./routes/auth");
const index = require('./routes/index');

app.use('/', index);
app.use("/", auth);



module.exports = app;
