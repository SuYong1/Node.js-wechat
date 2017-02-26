/**
 * Created by Administrator on 2017/2/11.
 */
var sha1 = require('sha1')  /*获取sha1模块*/
var Wechat = require('./wechat')
var util = require('./util')
var getRawBody = require('raw-body')    //提取缓冲区的xml串（来自于微信官方服务器）

module.exports = function(opts,handler) {   /*中间件*/
    var wechat = new Wechat(opts)

    return function *(next) {   //生成器函数
        var that = this
        var token = opts.Token
        var signature = this.query.signature
        var nonce = this.query.nonce
        var timestamp = this.query.timestamp
        var echostr = this.query.echostr
        var str = [token,timestamp,nonce].sort().join('')   /*字典序排序*/
        var sha = sha1(str)     /*sha1加密*/

        if(this.method === 'GET') {     //确定是GET请求
            if (sha === signature){
                this.body = echostr + ''    /*而且验证到GET请求来自于微信官方服务器，就原样返回echostr*/
            }
            else {
                this.body = 'wrong'
            }
        }
        else if (this.method === 'POST') {      //确定是POST请求
            if (sha !== signature){
                this.body = 'wrong'/*验证到POST请求不是来自于微信官方服务器，返回false*/
                return false
            }
            var data = yield getRawBody(this.req,{  //验证到POST请求来自于微信官方服务器，就用getRawBody提取为xml到data里
                length: this.length,
                limit: '1mb',
                encoding: this.charset
            })

            var content = yield util.parseXMLAsync(data)    //异步执行将xml转为js对象content
            //console.log(content)
            var message = util.formatMessage(content.xml)   //去除输入对象中多层嵌套的情况
            console.log(message)

            global.weixin=message   //传递到全局对象上，作为其一个属性

            yield handler.call(this,next)   //控制已有的生成器函数执行下一段

            wechat.reply.call(this)     //调用tpl模板生成回复消息
            this.body=global.xml    //发送给微信服务器
            console.log('',global.xml)
        }
    }
}