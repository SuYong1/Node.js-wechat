/**
 * Created by Administrator on 2017/2/19.
 */

var path = require('path')
var util = require('./libs/util')
var wechat_file = path.join('./config/wechat.txt')

var config = {
    wechats: {  /*本地服务器存储的你的公众号信息*/
        appID:'wx9c87d4de513c08ea',
        appsecret: '0ba2184be1acb68f789e0718e033703d',
        Token:'QiOkGmNk4QabGJfQ',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data)
            return util.writeFileAsync(wechat_file,data)
        }
    }
}

module.exports=config