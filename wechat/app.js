'use strict'

var Koa = require('koa');  /*获取koa框架*/
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var config=require('./config')
var weixin=require('./wechat/weixin')
var wechat_file = path.join('./config/wechat.txt')

var app = new Koa()

app.use(wechat(config.wechats,weixin.reply))

app.listen(3100)    /*监听你映射的内网端口1234*/
console.log(' Listening: 3100')