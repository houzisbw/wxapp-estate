/**
 * Created by Administrator on 2018/9/2.
 */
/**
 * 表单页面相关api
 */
//请求基类
var baseRequest = require('./request/request');
//获取表单结构数据
var getFormStructureDataUrL = require('./url').getFormStructureDataUrL;
const getFormStructureData = (successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{},getFormStructureDataUrL,successHandler,failHandler,completeHandler);
};
//获取某一单的表单数据
var getFormDataFromCorrespondingListUrl = require('./url').getFormDataFromCorrespondingListUrl;
const getFormDataFromCorrespondingList = (index,date,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		estateIndex:index,
		estateDate:date
	},getFormDataFromCorrespondingListUrl,successHandler,failHandler,completeHandler);
};
//保存填写的表单项到数据库
var saveFormDataToDBUrl = require('./url').saveFormDataUrl;
const saveFormDataToDB = (index,date,formData,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		estateIndex:index,
		estateDate:date,
		formData:formData
	},saveFormDataToDBUrl,successHandler,failHandler,completeHandler);
}

module.exports = {
	getFormStructureData,
	getFormDataFromCorrespondingList,
	saveFormDataToDB
}
