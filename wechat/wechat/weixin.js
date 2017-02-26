/**
 * Created by Administrator on 2017/2/19.
 */
'use strict'

var config=require('../config')
var Wechat=require('./wechat')

var wechatApi=new Wechat(config.wechats)

exports.reply= function* (next) {
    var message=global.weixin

    if(message.MsgType==='event'){
        if(message.Event==='subscribe'){
            if(message.Eventkey){
                console.log('扫二维码进来'+message.Eventkey+' '+message.ticket)
            }
            console.log('关注了，自动回复',this.body)
            this.body='感谢订阅我的公众号,回复1-7返回对应消息，搜某首歌以音乐+的关键字，百科就是百科+关键字，其余关键字会自动返回百度搜索结果'
        }
        else if(message.Event==='unsubscribe'){
            console.log('取消关注了')
            this.body=''
        }
        else if(message.Event==='LOCATION'){
            this.body='您的位置是:经度'+message.Longitude+'，纬度'+message.Latitude+'，精度'+message.Precision
        }
        else if(message.Event==='CLICK'){
            this.body='您点击了菜单'+message.EventKey
        }
        else if(message.Event==='SCAN'){
            console.log('关注后扫二维码',message.EventKey+','+message.Ticket)
            this.body='扫一扫'
        }
        else if(message.Event==='VIEW'){
            this.body='你点击了菜单中的链接'+message.EventKey
        }
    }
    else if(message.MsgType==='text'){
        var content=message.Content
        if (content==='1'){
            this.body='天下第一'
        }
        else if (content==='2'){
            this.body='我第二'
        }
        else if (content==='3'){
            this.body='你第三'
        }
        else if (content==='4'){
            this.body=[{
                title:'我的博客地址',
                PicUrl:'http://b.hiphotos.baidu.com/baike/w%3D268%3Bg%3D0/sign=7ce29d8990ef76c6d0d2fc2da52d9ac7/2f738bd4b31c870138b4fd4e277f9e2f0708ff1c.jpg',
                Url:'http://bxu2359170468.my3w.com/'
                },{
                title:'我的技术文章',
                Url:'http://bxu2359170468.my3w.com/2017/02/07/nodejs%E4%B8%ADexports%E4%B8%8Emodule-exports%E7%9A%84%E5%8C%BA%E5%88%AB/'
            }]
        }
        else if (content==='5'){
            var data=yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg')
            this.body={
                type:'image',
                mediaId:data.media_id
            }
        }
        else if (content==='6'){
            var data=yield wechatApi.uploadMaterial('video',__dirname+'/3.mp4')
            this.body={
                type:'video',
                title:'小视频',
                description:'小视频',
                mediaId:data.media_id
            }
        }
        else if (content==='7'){
            var data=yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg')
            this.body={
                type:'music',
                title:'音乐',
                description:'音乐',
                musicUrl:'http://win.web.ra01.sycdn.kuwo.cn/resource/n3/128/45/3/3440765633.mp3',
                thumbMediaId:data.media_id
            }
        }
        else if (content==='8'){
            var data=yield wechatApi.uploadMaterial('image',__dirname+'/2.jpg',{type:'image'})
            this.body={
                type:'image',
                mediaId:data.media_id
            }
        }
        else if (content==='9'){
            var data=yield wechatApi.uploadMaterial('video',__dirname+'/3.mp4',{type:'video',description:'{"title":"movie","introduction":"intr"}'})
            console.log(data)
            this.body={
                type:'video',
                title:'小视频',
                description:'小视频',
                mediaId:data.media_id
            }
        }
        else if (content==='10') {
            var picData = yield wechatApi.uploadMaterial('image', __dirname + '/2.jpg', {})
            var media = {
                articles: [{
                    title: '12234345',
                    thumb_media_id: picData.media_id,
                    author: 'su yong',
                    digest: '没有摘要',
                    show_cover_pic: 1,
                    content: 'none',
                    content_source_url: 'http://m.baidu.com/'
                }]
            }
            data = yield wechatApi.uploadMaterial('news', media, {})
            data = yield wechatApi.fetchMaterial(data.media_id,'news',{})
            console.log(data)

            var item = data.news_item
            var news = []
            item.forEach(function (item) {
                news.push({
                    title: item.title,
                    description: item.digest,
                    picUrl: picData.url,
                    url: item.url
                })
            })
            this.body=news
        }
        else if (content==='11') {
            var counts=yield wechatApi.countMaterial()
            console.log(JSON.stringify(counts))

            var results=yield[
            wechatApi.batchMaterial({
                type:'image',
                offset:0,
                count:10
            }),
            wechatApi.batchMaterial({
                type:'video',
                offset:0,
                count:10
            }),
            wechatApi.batchMaterial({
                type:'voice',
                offset:0,
                count:10
            }),
            wechatApi.batchMaterial({
                type:'news',
                offset:0,
                count:10
            })
            ]
            console.log(JSON.stringify(results))
            this.body=JSON.stringify(counts)
        }
        else if (content==='12') {
            var group=yield wechatApi.createGroup('ppp')
            console.log('新分组wechat')
            console.log(group)

            var groups=yield wechatApi.fetchGroups()
            console.log('加入wechat后的分组列表')
            console.log(groups)

            var group2=yield wechatApi.checkGroup(message.FromUserName)
            console.log('查看我的分组')
            console.log(group2)

            var group3=yield wechatApi.moveGroup(message.FromUserName,100)
            console.log('移动分组')
            console.log(group3)

            var group4=yield wechatApi.fetchGroups()
            console.log('移动到test后的分组列表')
            console.log(group4)

            var group5=yield wechatApi.moveGroup([message.FromUserName],107)
            console.log('批量移动分组')
            console.log(group5)

            var group6=yield wechatApi.fetchGroups()
            console.log('批量移动分组后的分组列表')
            console.log(group6)

            var group7=yield wechatApi.updateGroup(100,'suyongde')
            console.log('更名分组')
            console.log(group7)

            var group8=yield wechatApi.fetchGroups()
            console.log('更名分组后的分组列表')
            console.log(group8)

            var group9=yield wechatApi.deleteGroup(104)
            console.log('删除分组')
            console.log(group9)

            var group10=yield wechatApi.fetchGroups()
            console.log('删除分组后的分组列表')
            console.log(group10)

            this.body='分组操作完毕'
        }
        else if (content==='13') {
            var user=yield wechatApi.batchFetchusers(message.FromUserName)
            console.log(user)

            var openIds=[{
                openid:message.FromUserName
            }]
            var users=yield wechatApi.batchFetchusers(openIds)
            console.log(users)
            this.body=JSON.stringify(users)
        }
        else if (content==='14') {
            var userlist=yield wechatApi.listuser()
            console.log(userlist)
            this.body='该微信公众号共有'+userlist.total+'人关注'
        }
        else if (RegExp("^音乐").test(content)) {
            this.body = [{
                title: '搜索的音乐：'+content.slice(2),
                Url: 'http://music.baidu.com/search?key=' + content.slice(2)
            }]
        }
        else if (RegExp("^百科").test(content)) {
            this.body = [{
                title: '搜索的百科：'+content.slice(2),
                Url: 'https://wapbaike.baidu.com/item/' + content.slice(2)
            }]
        }
        else if (content==='简历') {
            this.body = [{
                title: '点击查看我的简历',
                Url: 'https://suyong1.github.io/myresume.github.io/'
            }]
        }
        else if (content==='理财宝') {
            this.body = [{
                title: '理财宝',
                Url: 'https://suyong1.github.io/licai.github.io/'
            }]
        }
        else if (content==='播放器') {
            this.body = [{
                title: '播放器',
                Url: 'https://suyong1.github.io/musicplayer.github.io/'
            }]
        }
        else if (content==='博客') {
            this.body = [{
                title: '博客',
                Url: 'http://bxu2359170468.my3w.com/'
            }]
        }
        else if (content==='github') {
            this.body = [{
                title: '苏勇的github仓库',
                Url: 'https://github.com/SuYong1'
            }]
        }
        else{
            this.body=[{
                title:'点击查看“'+content+'”的搜索结果',
                PicUrl:'https://www.baidu.com/img/baidu_jgylogo3.gif',
                Url:'http://m.baidu.com/s?word='+content
            }]
        }
    }
    else if(message.MsgType==='image'){

    }
    else if(message.MsgType==='voice'){

    }
    else if(message.MsgType==='video'){

    }
    else if(message.MsgType==='shortvideo'){

    }
    else if(message.MsgType==='location'){

    }
    else if(message.MsgType==='link'){

    }

    yield next
}