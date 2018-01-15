var mongoose = require('mongoose');

//申明一个mongoons对象
var UsersSchema = new mongoose.Schema({
    username: String,
    password: String,
    securityCode: String,
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
})

//每次执行都会调用,时间更新操作
UsersSchema.pre('save', function(next) {
    if(this.isNew) {
        this.meta.createAt = this.meta.updateAt = Date.now();
    }else {
        this.meta.updateAt = Date.now();
    }

    next();
})

//查询的静态方法
UsersSchema.statics = {
    fetch: function(cb) { //查询所有数据
        return this
            .find()
            .sort('meta.updateAt') //排序
            .exec(cb) //回调
    },
    findById: function(id, cb) { //根据id查询单条数据
        return this
            .findOne({_id: id})
            .exec(cb)
    },
    findByUserName: function (username, cb) { //根据username查询单条数据
        return this
            .findOne({username: username})
            .exec(cb)
    },
    addUser: function (username, password, cb) { // 创建一组user对象置入model
        return this
            .create({username: username,password: password})
    }
};

//暴露出去的方法
module.exports = UsersSchema