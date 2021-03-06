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

//提交反馈
var submitFeedbackUrl = require('./url').submitFeedbackUrl;
const submitFeedbackRequest = (submitIsVisit,submitReason,submitTime,latestDate,estateIndex,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		isVisit:submitIsVisit,
		estateIndex:estateIndex,
		latestDate:latestDate,
		submitReason:submitReason,
		submitTime:submitTime
	},submitFeedbackUrl,successHandler,failHandler,completeHandler)
};

//检查该单的formData是否存在(以前很早的单不存在)
var checkFormDataExistsUrl = require('./url').checkFormDataExistsUrl;
const checkFormDataExists = (date,index,successHandler,failHandler,completeHandler)=>{
	baseRequest('POST',{
		date:date,
		index:index
	},checkFormDataExistsUrl,successHandler,failHandler,completeHandler)
};

//更新照片类型
var updatePictureTypeUrl = require('./url').updatePictureTypeUrl
const updatePictureType = (newType,date,index,successHandler,failHandler,completeHandler)=>{
  baseRequest('POST',{
    date:date,
    index:index,
		pictureType:newType,
  },updatePictureTypeUrl,successHandler,failHandler,completeHandler)
}


module.exports = {
	getDetailInfoOfEstate,
	submitFeedbackRequest,
	checkFormDataExists,
  updatePictureType
}