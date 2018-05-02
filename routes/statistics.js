var express = require('express');
var mongoose = require('mongoose');//导入mongoose模块

var Statistics = require('../modules/statistics');//导入模型数据模块
var router = express.Router();
var crypto = require('crypto');
function md5(userId){
    //生成口令的散列值
    var md5 = crypto.createHash('md5');   //crypto模块功能是加密并生成各种散列,此处所示为MD5方式加密
    var end_paw= md5.update(userId.toString()).digest('hex');//加密后的密码
    return end_paw;
};
/* GET users listing. */
// 统计网站访问人数接口
router.get('/peopleCounting', function(req, res, next) {
    Statistics.findPeopleCounting(req.query.peopleCountingSetting,function(err, doc) {
        if(err) {
            console.log(err);
            // res.send(504);
            // res.render('data',{message: '服务器错误'})
        }
        if(doc){

            let peopleCountingId =  {_id:doc._id},
                updatePeopleCounting = {$set: {
                    peopleCounting: doc.peopleCounting + 1
                }
                };
            Statistics.update(peopleCountingId, updatePeopleCounting,function(err, result) {
                if(err) {
                    console.log(err)
                }
                res.json({data:
                    {
                        code:'Update PeopleCounting success',
                        message: doc.peopleCounting,
                        msgcode:'Update PeopleCounting success',
                        state:'200',
                        type:'success'
                    }
                })
            })
        }else{

            let CreatePeopleCounting = [{
                peopleCountingSetting: 'peopleCountingSetting',
                peopleCounting: 0
            }]
            Statistics.create(CreatePeopleCounting,function(err) {
                if(err) {
                    console.log(err)
                }
                // res.send("")
                res.json({data:
                    {
                        code:'Create PeopleCounting success',
                        message: 0,
                        msgcode:'Create PeopleCounting success',
                        state:'200',
                        type:'success'
                    }
                })
            })

        }
    });
});
module.exports = router;
