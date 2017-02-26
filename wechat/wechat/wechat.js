/**
 * Created by Administrator on 2017/2/12.
 */
'use strict'

var Promise = require('bluebird')
var _=require('lodash')
var request = Promise.promisify(require('request'))
var util=require('./util')
var fs=require('fs')

var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
    accessToken:prefix + 'token?grant_type=client_credential',
    temporary:{
        upload:prefix+'media/upload?',
        fetch:prefix+'media/get?'
    },
    permanent:{
        upload:prefix+'material/add_material?',
        fetch:prefix+'material/get_material?',
        uploadNews:prefix+'material/add_news?',
        uploadNewsPic:prefix+'media/uploadimg?',
        del:prefix+'material/del_material?',
        update:prefix+'material/update_news?',
        count:prefix+'material/get_materialcount?',
        batch:prefix+'material/batchget_material?'
    }

}

function Wechat(opts) {
    var that = this
    this.appID = opts.appID
    this.appsecret = opts.appsecret
    this.getAccessToken = opts.getAccessToken
    this.saveAccessToken = opts.saveAccessToken

    this.fetchAccessToken()
}

Wechat.prototype.fetchAccessToken = function (data) {
    var that=this
    if(this.access_token&&this.expires_in){
        if(this.isValidAccessToken(this)){
            return Promise.resolve(this)
        }
    }
    this.getAccessToken()
        .then(function(data) {
            try {
                data = JSON.parse(data)
            }
            catch(e) {
                return that.updateAccessToken()
            }

            if (that.isValidAccessToken(data)) {
                return Promise.resolve(data)
            }
            else {
                return that.updateAccessToken()
            }
        })
        .then(function (data) {
            that.access_token = data.access_token
            that.expires_in = data.expires_in
            that.saveAccessToken(data)

            return Promise.resolve(data)
        })
}

Wechat.prototype.isValidAccessToken = function (data) {
    if (!data || !data.access_token || !data.expires_in) {
        return false
    }

    var access_token = data.access_token
    var expires_in = data.expires_in
    var now = (new Date().getTime())

    if (now <expires_in) {
        return true
    }
    else {
        return false
    }
}

Wechat.prototype.updateAccessToken = function (data) {
    var appID = this.appID
    var appsecret = this.appsecret
    var url = api.accessToken + '&appid=' + appID + '&secret=' +appsecret
    return new Promise(function (resolve,reject) {
        request({url:url,json:true}).then(function (response) {
            var data = response.body
            var now = (new Date().getTime())
            var expires_in = now + (data.expires_in - 20)* 1000
            data.expires_in = expires_in
            resolve(data)
        })
    })
}

Wechat.prototype.uploadMaterial = function (type,material,permanent) {
    var that=this
    var form={}
    var uploadUrl=api.temporary.upload
    if (permanent){
        uploadUrl=api.permanent.upload

        _.extend(form,permanent)
    }

    if (type==='pic'){
        uploadUrl=api.permanent.uploadNewsPic
    }
    if (type==='news'){
        uploadUrl=api.permanent.uploadNews
        form=material
    }
    else{
        form.media=fs.createReadStream(material)
    }

    var appID = this.appID
    var appsecret = this.appsecret

    return new Promise(function (resolve,reject) {
        that
        .fetchAccessToken()
        .then(function(data){


            var url = uploadUrl + 'access_token=' + data.access_token
            if(!permanent){
                url+='&type='+type
            }
            else{
                form.access_token=data.access_token
            }

            var options={
                method:'POST',
                url:url,
                json:true
            }

            if(type==='news'){
                options.body=form
            }
            else{
                options.formData=form
            }
            request(options).then(function (response) {
                var _data = response.body
                if(_data){
                    resolve(_data)
                }
                else{
                    throw new Error('upload material fail')
                }
            })
            .catch(function(err){
                reject(err)
            })
        })
    })
}


Wechat.prototype.fetchMaterial = function (mediaId,type,permanent) {
    var that=this
    var fetchUrl=api.temporary.fetch
    if (permanent){
        fetchUrl=api.permanent.fetch
    }

    return new Promise(function (resolve,reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = fetchUrl + 'access_token=' + data.access_token+'&media_id'+mediaId

                var form={}
                var options={method:'POST',url:url,json:true}

                if(permanent){
                    form.media_id=mediaId
                    form.access_token=data.access_token
                    options.body=form
                }
                else{
                    if(type==='video'){
                        url=url.replace('https://','https://')
                    }
                    url+='&media_id='+mediaId
                }

                if(type==='news'||type==='video') {
                request(options).then(function (response) {
                    var _data=response.body
                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('fetch material fail')
                    }
                })
                .catch(function(err){
                    reject(err)
                })
            }
                else {
                    resolve(url)
                }
    })
})
}


Wechat.prototype.deleteMaterial = function (mediaId) {
    var that=this
    var form={
        media_id:mediaId
    }
    return new Promise(function (resolve,reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.del + 'access_token=' + data.access_token+'&media_id'+mediaId

                request({method:'POST',url:url,body:form,json:true}).then(function (response) {
                        var _data = response.body
                        if(_data){
                            resolve(_data)
                        }
                        else{
                            throw new Error('delete material fail')
                        }
                    })
            })
    })
}



Wechat.prototype.updateMaterial = function (mediaId,news) {
    var that=this
    var form={
        media_id:mediaId
    }

    _.extend(form,news)

    return new Promise(function (resolve,reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.update + 'access_token=' + data.access_token+'&media_id'+mediaId

                request({method:'POST',url:url,body:form,json:true}).then(function (response) {
                        var _data = response.body
                        if(_data){
                            resolve(_data)
                        }
                        else{
                            throw new Error('update material fail')
                        }
                    })
            })
    })
}


Wechat.prototype.countMaterial = function () {
    var that=this

    return new Promise(function (resolve,reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.count + 'access_token=' + data.access_token

                request({method:'GET',url:url,json:true}).then(function (response) {
                    var _data = response.body
                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('count material fail')
                    }
                })
            })
    })
}



Wechat.prototype.batchMaterial = function (options) {
    var that=this

    options.type=options.type||'image'
    options.offset=options.offset|| 0
    options.count=options.count|| 1

    return new Promise(function (resolve,reject) {
        that
            .fetchAccessToken()
            .then(function(data){
                var url = api.permanent.batch + 'access_token=' + data.access_token

                request({method:'POST',url:url,body:options,json:true}).then(function (response) {
                    var _data = response.body
                    if(_data){
                        resolve(_data)
                    }
                    else{
                        throw new Error('batch material fail')
                    }
                })
            })
    })
}




Wechat.prototype.reply= function () {
    var content=this.body
    var message=global.weixin

    var xml=util.tpl(content,message)

    this.status=200
    this.type='application/xml'
    global.xml=xml
}

module.exports = Wechat