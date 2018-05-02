var express = require('express');
var mongoose = require('mongoose');//导入mongoose模块

var Users = require('../modules/users');//导入模型数据模块
var router = express.Router();
var crypto = require('crypto');
var cookieParser = require('cookie-parser');
function md5(userId){
    //生成口令的散列值
    var md5 = crypto.createHash('md5');   //crypto模块功能是加密并生成各种散列,此处所示为MD5方式加密
    var end_paw= md5.update(userId.toString()).digest('hex');//加密后的密码
    return end_paw;
};
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//验证session登录接口
router.get('/sessionCheckLogin', function(req, res, next){
    let sess = req.session;
    let loginUser = sess.loginUser;
    let isLogined = !!loginUser;
    let sessionID = sess.sessionID;
    res.json({data:
        {
            isLogined: isLogined,
            loginUser: loginUser || '',
            sessionID: sessionID || '',
            type:'success'
        }
    })
});
//登录接口
router.get('/users', function(req, res, next) {
    // console.log(req.session);
    // console.log(req.session.secret);
    // Users.fetch(function(err, users) {
    //     if(err) {
    //         console.log(err);
    //     }
    //     // res.render('users',{title: '用户列表', users: users})  //这里也可以json的格式直接返回数据res.json({data: users});
    //     res.json({data: users})
    // })
    if((req.query.phone == '' && req.query.password == '') || (req.query.phone != '' && req.query.password == '') ||(req.query.phone == '' && req.query.password != '')){
        res.json({data:
            {
                code:'login error',
                message:'登录名/密码不能为空',
                msgcode:'login error',
                state:'404',
                type:'login error'
            }
        })
    }else{
        // var userNames = req.query.phone;
        // var passWords = req.query.password;
        Users.findByUserName(req.query.phone,function(err, users) {
            if(err) {
                console.log(err);
                // res.send(504);
                // res.render('data',{message: '服务器错误'})
            }
            if(users){
                if(req.query.phone == users.username && req.query.password == users.password){
                    // let aresloongsecrt = md5(Math.random());
                    //获取sessionID
                    // let sessionID = req.sessionID;
                    let updateId =  {_id:users._id},
                        tokenSet = {$set: {
                            token:{
                                sessionId: req.sessionID,
                                sessionUpdateAt: Date.now()
                            }
                            }
                        };



                    Users.update(updateId, tokenSet, function(err, result) {
                        if(err) {
                            console.log(err)
                        }
                        console.log(result);
                        // req.session.sessionId = result.token.sessionId;
                        // res.cookie('aresloong-secrt',aresloongsecrt,{maxAge:15 * 60 * 1000,httpOnly:true});
                        // res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
                        req.session.regenerate(function(err) {
                            req.session.loginUser = users.username;
                            req.session.sessionID = req.sessionID;
                            console.log(req);
                            res.json({data:
                                {
                                    code:'login success',
                                    message:'登陆成功',
                                    msgcode:'login success',
                                    state:'200',
                                    type:'success',
                                    loginUser: req.session.loginUser,
                                    sessionID: req.sessionID
                                }
                        })

                    })
                })






                }else{
                    res.json({data:
                        {
                            code:'invalid user/password',
                            message:'登录名/密码错误',
                            msgcode:'invalid user/password',
                            state:'401',
                            type:'error'
                        }
                    })
                }
            }else{
                res.json({data:
                    {
                        code:'invalid user undefined',
                        message:'登录名不存在',
                        msgcode:'invalid user undefined',
                        state:'401',
                        type:'error'
                    }
                })
            }

            // res.render('users',{title: '用户列表', users: users})  //这里也可以json的格式直接返回数据res.json({data: users});
        })
    }

});
//注册接口入口,给前端的接口url从这里生成
router.get('/register', function(req, res, next) {
    Users.findByUserName(req.query.phone,function(err, doc) {
        if(err) {
            console.log(err);
            // res.send(504);
            // res.render('data',{message: '服务器错误'})
        }
        if(doc){
            if(req.query.phone == doc.username){
                res.json({data:
                    {
                        code:'register error',
                        message:'用户名已被注册',
                        msgcode:'register error',
                        state:'401',
                        type:'error'
                    }
                })
            }
        }else{


            let newStudent = [{
                username: req.query.phone,
                password: req.query.password,
                securityCode: req.query.securityCode
            }]
            Users.create(newStudent,function(err) {
                if(err) {
                    console.log(err)
                }
                // res.send("")
                res.json({data:
                {
                    code:'register success',
                    message:'注册成功',
                    msgcode:'register success',
                    state:'200',
                    type:'success'
                }
            })
        })


        }

        // res.render('users',{title: '用户列表', users: users})  //这里也可以json的格式直接返回数据res.json({data: users});
    })

});
// 忘记密码接口
router.get('/forget', function(req, res, next) {
    Users.findByUserName(req.query.phone,function(err, doc) {
        if(err) {
            console.log(err);
            // res.send(504);
            // res.render('data',{message: '服务器错误'})
        }
        if(doc){
            if(req.query.phone == doc.username && req.query.securityCode == doc.securityCode){
                let updateId =  {_id:doc._id},
                    updateStudent = {$set: {
                        password: req.query.password,
                        meta:{
                            createAt: doc.meta.createAt,
                            updateAt: Date.now()
                        }}
                };
                Users.update(updateId, updateStudent,function(err, result) {
                    if(err) {
                        console.log(err)
                    }
                    res.json({data:
                    {
                        code:'Get Back success',
                        message:'找回成功',
                        msgcode:'Get Back success',
                        state:'200',
                        type:'success'
                    }
                })
            })
            }else{
                res.json({data:
                    {
                        code:'securityCode error',
                        message:'安全码错误',
                        msgcode:'securityCode error',
                        state:'401',
                        type:'error'
                    }
                })
            }
        }else{
            res.json({data:
                {
                    code:'No Find User',
                    message:'用户名错误',
                    msgcode:'No Find User',
                    state:'401',
                    type:'error'
                }
            })
        }
    });
});
module.exports = router;
