//各种接口的url地址
var url = {
	//手机端调试接口
	mobileTestLoginUrl:'http://192.168.0.102:5000'+'/wxApp/wxLogin',
	//测试服务器接口,生产环境需要修改前半部分，换成https
	loginUrl:'http://localhost:5000'+'/wxApp/wxLogin',
	//验证是否登录的接口
	checkLoginUrl:'http://localhost:5000'+'/wxApp/checkLogin'

};
module.exports = url;