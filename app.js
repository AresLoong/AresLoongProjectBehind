var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');
var statistics = require('./routes/statistics');
//md5
var crypto = require('crypto');
//GY,导入mongoose连接mongodb数据库,开始
var mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/blog'); //连接本地数据库blog

var db = mongoose.connection;

// 连接成功
db.on('open', function(){
    console.log('MongoDB 数据库连接成功');
});
// 连接失败
db.on('error', function(){
    console.log('MongoDB 数据库连接失败');
});
//结束
var app = express();
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var identityKey = 'AresLoongKey';
// var cors = require('cors');
// app.use(cors({credentials: true, origin: '*'}));
//设置跨域访问
// app.all('*', function(req, res, next) {
//     console.log(req.headers.origin);
//     res.header("Access-Control-Allow-Origin", req.headers.origin);
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
//     res.header("X-Powered-By",' 3.2.1')
//     res.header("Content-Type", "application/json;charset=utf-8");
//     next();
// });
app.use("*", function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method === 'OPTIONS') {
        res.send(200)
    } else {
        next()
    }
});
// app.use(session({
//     secret: 'secret',
//     cookie:{
//         maxAge: 1000*60*30
// }
// }));
//
// app.use(function(req,res,next){
//     res.locals.user = req.session.user;   // 从session 获取 user对象
//     var err = req.session.error;   //获取错误信息
//     delete req.session.error;
//     res.locals.message = "";   // 展示的信息 message
//     if(err){
//         res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
//     }
//     next();  //中间件传递
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


//这里传入了一个密钥加session id
// app.use(cookieParser('secret'));
//使用就靠这个中间件
app.use(session({
    name: identityKey,
    secret: 'guoyu',  // 用来对session id相关的cookie进行签名
    store: new FileStore(),  // 本地存储session（文本文件，也可以选择其他store，比如redis的）
    saveUninitialized: false,  // 是否自动保存未初始化的会话，建议false
    resave: false,  // 是否每次都重新保存会话，建议false
    cookie: {
        maxAge: 60 * 1000,  // 有效期，单位是毫秒
        secure:false
    }
}));
// app.use(session({
//     secret: 'secret',
//     // name: 'connect.sid',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
//     cookie: {maxAge: 80000 }  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
//     // resave: false,
//     // saveUninitialized: true
// }));
// app.use(session({
//     secret :  'secret', // 对session id 相关的cookie 进行签名
//     resave : false,
//     saveUninitialized: true, // 是否保存未初始化的会话
//     cookie : {
//         maxAge : 1000 * 60 * 3 // 设置 session 的有效时间，单位毫秒
//     }
// }));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/statistics', statistics);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
