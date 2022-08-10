var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose');
const Pusher = require('pusher');

const pusher = new Pusher({
  appId: "1460506",
  key: "832e9dbd688fbc7eaf55",
  secret: "6a95795d7ff0fe833598",
  cluster: "us2",
  UseLTS  : true,
});
const channel = 'likes-app';


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
// below this line:
var app = express();
var server = require("http").Server(app);

require('dotenv').config();
    
// add this
require('mongoose').connect('mongodb+srv://kesalvador:kevin1234@cluster0.gdvfqvf.mongodb.net/likes2');

const db = mongoose.connection;
    // Socket Connection  
    db.on('error', console.error.bind(console, 'Connection Error:'));

db.once('open', () => {
  app.listen(9000, () => {
    console.log('Node server running on port 9000');
  });

  const taskCollection = db.collection('likes2');
  const changeStream = taskCollection.watch();
    
  changeStream.on('change', (change) => {
    console.log(change);
      
    if(change.operationType === 'insert') {
      const task = change.fullDocument;
      pusher.trigger(
        channel,
        'inserted', 
        {
          id: task._id,
          src: task.src,
          likes_count: task.likes_count
        }
      ); 
    } else if(change.operationType === 'delete') {
      pusher.trigger(
        channel,
        'deleted', 
        change.documentKey._id
      );
    }
  });
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
