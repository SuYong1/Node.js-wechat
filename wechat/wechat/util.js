/**
 * Created by Administrator on 2017/2/12.
 */
'use strict'

var xml2js = require('xml2js')
var Promise = require('bluebird')
var tpl=require('./tpl')

exports.parseXMLAsync = function(xml) {     //xml转为js对象
    return new Promise(function(resolve,reject) {
        xml2js.parseString(xml,{trim: true},function(err,content) {
            if (err) reject(err)
            else resolve(content)
        })
    })
}

function formatMessage(result) {    //函数去除输入的js对象：result的层层嵌套，最后的message没有嵌套，所有属性值都在message数组的同一级里
    var message = {}
    if (typeof result === 'object') {
        var keys = Object.keys(result)  //返回对象的属性名组成的数组
        for (var i = 0; i < keys.length; i++) {     //按属性顺序来遍历
            var item = result[keys[i]]      //获取当前属性对应的属性值
            var key = keys[i]   //这里的key用作meaasge对象的属性名，存储对应的属性值

            if (!(item instanceof Array) || item.length === 0) {    //判断当前属性值不是一个数组或者是空数组，就跳过此次循环，不执行后面语句
                continue
            }
            if (item.length === 1) {    //当前数组（属性值）长度为1时（可以是一个纯粹的值，或者对象了）
                var val = item[0]

                if (typeof val === 'object') {      //判断这个属性值为一个对象时
                    message[key] = formatMessage(val)   //递归调用formatMessage
                }
                else {      //当前的属性值为一个纯粹的值时
                    message[key] = (val || '').trim()   //val转换布尔值为0时，赋值为空字符串，val转换的布尔值不为空时，赋值val，调用trim方法去除空格
                }
            }
            else {  //当前属性值数组长度不为1时
                message[key] = []   //建立一个空数组
                for (var j = 0, k = item.length; j < k; j++) {
                    message[key].push(formatMessage(item[j]))   //递归调用formatMessage，push进数组message[key]
                }
            }
        }
    }

    return message
}


exports.formatMessage = formatMessage

exports.tpl=function(content,message) {
    var info = {}
    var type = 'text'
    var fromUsername = message.ToUserName
    var toUsername = message.FromUserName

    if (Array.isArray(content)) {
        type = 'news'
    }
    type = content.type || type
    info.content = content
    info.createtime = new Date().getTime()
    info.msgType = type
    info.toUserName = toUsername
    info.fromUserName = fromUsername

    return tpl.compiled(info)
}