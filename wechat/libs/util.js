/**
 * Created by Administrator on 2017/2/12.
 * 此文件存放公用的异步方法
 */
'use strict'

var fs = require('fs')  //引入文件操作模块
var Promise = require('bluebird')   //bluebird引入Promise方法

exports.readFileAsync = function (fpath,encoding) {     //异步读取文件函数
    return new Promise(function (resolve,reject) {
        fs.readFile(fpath,encoding, function (err,content) {
            if (err) reject(err)
            else resolve(content)
        })
    })
}

exports.writeFileAsync = function (fpath,content) {     //异步写入文件函数
    return new Promise(function (resolve,reject) {
        fs.writeFile(fpath,content, function (err) {
            if (err) reject(err)
            else resolve(content)
        })
    })
}