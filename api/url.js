/**
 *	小程序中请求url
 * */

//本地调试的ip端口
var localHost = 'http://localhost:5000';
//生产环境的地址
var productionHost  = 'https://estate.sunbowei.cn';
//手机端调试ip端口
var mobileTestHost = 'http://192.168.0.100:5000';
//根据环境参数获取url对象
function getUrl(envType){
	return {
		/** 上传图片 **/
		imageUploadUrl:envType+'/wxApp/imageUpload',
		/** 登录 **/
		//测试服务器接口,生产环境需要修改前半部分，换成https
		loginUrl:envType+'/wxApp/wxLogin',
		//验证是否登录的接口
		checkLoginUrl:envType+'/wxApp/checkLogin',
		/** 首页 **/
		//获取首页看房列表
		getEstateListUrl:envType+'/wxApp/getEstateList',
		//获取首页其他信息的url
		otherInfoUrl:envType+'/wxApp/getOtherInfo',
		/** 详情页 **/
		getDetailInfoOfEstateUrl:envType+'/wxApp/getDetailInfoOfEstate',
		submitFeedbackUrl:envType+'/wxApp/submitFeedback',
		/** 我的页面 **/
		saveAvatarUrl:envType+'/wxApp/saveAvatar',
		getPersonalInfoUrl:envType+'/wxApp/getPersonalInfo',
		logoutUrl:envType+'/wxApp/logout',
		/** 管理员首页 **/
		adminGetEstateDataUrl:envType+'/wxApp/adminGetEstateData',
		searchUrl:envType+'/wxApp/search',
		getStaffNameListUrl:envType+'/wxApp/getStaffList',
		getTimeFromServerUrl:envType+'/wxApp/getTimeFromServer',
		getEstateGraphDataUrl:envType+'/wxApp/getEstateGraphDataUrl',
		/** 表单填写页 **/
		getFormStructureDataUrL:envType+'/wxApp/getFormStructureDataUrL',
		getFormDataFromCorrespondingListUrl:envType+'/wxApp/getFormDataFromCorrespondingList',
		saveFormDataUrl:envType+'/wxApp/saveFormDataToDB'
	}
}

module.exports = getUrl(mobileTestHost);