/**
 * 房屋详情页相关api
 */

//请求基类
var baseRequest = require('./request/request');
//获取房屋详细信息
var getDetailInfoOfEstateUrl = require('./url').getDetailInfoOfEstateUrl;
const getDetailInfoOfEstate = (estateIndex,latestDate,successHandler,failHandler)=>{
		baseRequest('POST',{
			estateIndex:estateIndex,
			latestDate:latestDate
		},getDetailInfoOfEstateUrl,successHandler,failHandler)
};
module.exports = {
	getDetailInfoOfEstate
}