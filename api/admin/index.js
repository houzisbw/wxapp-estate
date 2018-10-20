/**
 * 管理员首页
 */
//请求基类
var baseRequest = require('../request/request');
//获取excel看房信息里列表
var adminGetEstateListUrl = require('../url').adminGetEstateDataUrl;
//type:0全部，1已看，2未看
const adminGetEstateList = (type,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{type:type},adminGetEstateListUrl,successHandler,failHandler,completeHandler);
};
//搜索
var searchUrl = require('../url').searchUrl;
const searchEstateList = (keyword,latestDate,currentPage,pageSize,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		keyword:keyword,
		latestDate:latestDate,
		currentPage:currentPage,
		pageSize:pageSize,
	},searchUrl,successHandler,failHandler,completeHandler);
}
//获取看房人员列表
var staffListUrl = require('../url').getStaffNameListUrl;
const getStaffList = (successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{},staffListUrl,successHandler,failHandler,completeHandler);
}
//从服务器获取时间
var getTimeFromServerUrl = require('../url').getTimeFromServerUrl;
const getTimeFromServer = (successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{},getTimeFromServerUrl,successHandler,failHandler,completeHandler);
}
//获取图表数据
var getEstateGraphDataUrl = require('../url').getEstateGraphDataUrl;
const getEstateGraphData = (chartType,startTimeStr,endTimeStr,staffName,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		chartType:chartType,
		startTimeStr:startTimeStr,
		endTimeStr:endTimeStr,
		staffName:staffName
	},getEstateGraphDataUrl,successHandler,failHandler,completeHandler);
}

module.exports = {
	adminGetEstateList,
	searchEstateList,
	getStaffList,
	getTimeFromServer,
	getEstateGraphData
}
