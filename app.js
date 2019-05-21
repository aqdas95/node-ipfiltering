var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const ipfilter = require('express-ipfilter').IpFilter
const IpDeniedError = require('express-ipfilter').IpDeniedError
const requestIp = require('request-ip');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();


app.use(requestIp.mw());
const ips = ['119.63.130.91', '72.255.1.17'];

const customDetection = req => {
    let ipAddress = req.clientIp;
    console.log(`ipAddress: ${ipAddress}`);
    console.log(`header: ${req.header('Postman-Token')}`)
    return ipAddress;
}

app.use(ipfilter(ips, { mode: 'allow', detectIp: customDetection }));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

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
    let message = err.message;
    if (err instanceof IpDeniedError) {
        message = 'You are not authorize to perform this action';
        res.status(401);
    } else {
        res.status(err.status || 500)
    }

    // render the error page
    res.render('error', {
        message: message,
        error: err
    });
});

module.exports = app;