var mongoose = require('mongoose')
var StatisticsSchema = require('../schemas/statistics') //拿到导出的数据集模块
var Statistics = mongoose.model('Statistics', StatisticsSchema) // 编译生成Movie 模型

module.exports = Statistics