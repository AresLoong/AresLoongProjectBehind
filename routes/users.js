var express = require('express');
var mongoose = require('mongoose');//导入mongoose模块

var Users = require('../modules/users');//导入模型数据模块
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
//查询所有用户数据
router.get('/users', function(req, res, next) {
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
                    res.json({data:
                        {
                            code:'login success',
                            message:'登陆成功',
                            msgcode:'login success',
                            state:'200',
                            type:'success'
                        }
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
            Users.create(newStudent, (err) => {
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
                Users.update(updateId, updateStudent, (err, result) => {
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
