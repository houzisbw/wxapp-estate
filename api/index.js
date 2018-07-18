/**
 * 首页相关api
 */
//请求基类
var baseRequest = require('./request/request');
//获取excel看房信息里列表，type表示获取种类，0全部，1已看，2未看
var getEstateListUrl = require('./url').getEstateListUrl;
const getEstateDataList = (type,username,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		username:username,
		type:type
	},getEstateListUrl,successHandler,failHandler,completeHandler);
};

//获取首页其他信息的url
var otherInfoUrl = require('./url').otherInfoUrl;
const getOtherInfo = (username,successHandler,failHandler)=>{
	baseRequest('POST',{username:username},otherInfoUrl,successHandler,failHandler);
};

module.exports = {
	getEstateDataList,
	getOtherInfo
}
