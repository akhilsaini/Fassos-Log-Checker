var config = require('config');
var EE = require('eventemitter3');
var eventEmitter = new EE();

var express = require('express');
var path = require('path');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var multer  = require('multer');

var middlewares = require('./modules/middlewares');

var app = express();
app.em = eventEmitter;
app.helper = new(require('./modules/helper'))(app.em);
app.middlewares = middlewares;

var routes = require('./routes/index');
var DB = new(require('./modules/db'))(app);

var File = new(require('./routes/files'))(app);

app.use(app.middlewares.log_api);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logdir.logmsg);
app.use(DB.get_connection);
app.use(DB.req_connect);
app.use(express.static('media'));

app.use(logger('dev'));

//app.use(multer({ dest: './uploads/'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '50mb',extended: true }));

app.use(app.middlewares.log_api_lateral);

app.use(routes);
//app.use('/users', users);
File.resource({ 'mp': '/api' });

// catch 404 and forward to error handler
//app.use(app.middlewares.route_404);
/* Redirects to the to do list if the page requested is not found */
app.use(function (req, res, next) {
	res.redirect('/home');
});


// error handlers

// development error handler
// will print stacktrace
app.use(app.middlewares.dev_error_handler);

// production error handler
// no stacktraces leaked to user
app.use(app.middlewares.prod_error_handler);

module.exports = app;
