/**
 *	小程序中请求url
 * */

//本地调试的ip端口
var localHost = 'http://localhost:5000';
//生产环境的地址
var productionHost  = '';
//手机端调试ip端口
var mobileTestHost = 'http://192.168.0.102:5000';
//各种接口的url地址
var url = {
	//测试服务器接口,生产环境需要修改前半部分，换成https
	loginUrl:localHost+'/wxApp/wxLogin',
	//验证是否登录的接口
	checkLoginUrl:localHost+'/wxApp/checkLogin',
	/** 首页 **/
	//获取首页看房列表
	getEstateListUrl:localHost+'/wxApp/getEstateList',
	//获取首页其他信息的url
	otherInfoUrl:localHost+'/wxApp/getOtherInfo'

};
//移动端测试的url
var mobileTestUrl = {
	//测试服务器接口,生产环境需要修改前半部分，换成https
	loginUrl:mobileTestHost+'/wxApp/wxLogin',
	//验证是否登录的接口
	checkLoginUrl:mobileTestHost+'/wxApp/checkLogin',
	/** 首页 **/
	//获取首页看房列表
	getEstateListUrl:mobileTestHost+'/wxApp/getEstateList',
	//获取首页其他信息的url
	otherInfoUrl:mobileTestHost+'/wxApp/getOtherInfo'
};
module.exports = url;