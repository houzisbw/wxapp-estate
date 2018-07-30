/**
 * 我的页面
 */
//请求基类
var baseRequest = require('./request/request');
var saveAvatarUrl = require('./url').saveAvatarUrl;
var getPersonalInfoUrl = require('./url').getPersonalInfoUrl;
var logoutUrl = require('./url').logoutUrl;
//保存用户头像
const saveAvatar = (avatarHttpsUrl,username,successHandler,failHandler)=>{
	baseRequest('POST',{
		username:username,
		avatarUrl:avatarHttpsUrl
	},saveAvatarUrl,successHandler,failHandler)
};
//获取用户信息
const getPersonalInfo = (username,successHandler,failHandler)=>{
	baseRequest('POST',{
		username:username
	},getPersonalInfoUrl,successHandler,failHandler)
};
//退出登录
const logout = (username,successHandler,failHandler)=>{
	baseRequest('POST',{
		username:username
	},logoutUrl,successHandler,failHandler)
};
module.exports = {
	saveAvatar,
	getPersonalInfo,
	logout
};
