//用户登录，注意没有使用微信登录，只是和自己的服务器交互，因为只需要特定的人员登录
const login = (username,password,successHandler,failHanlder,completeHandler)=>{
		//手机端测试改为require('./url').mobileTestLoginUrl
		var loginUrl = require('./url').loginUrl;

		var data = {
			username:username,
			password:password
		};
		wx.request({
			url:loginUrl,
			data:data,
			method:'POST',
			success:successHandler,
			fail:failHanlder,
			complete:completeHandler
		})
};

//检查是否登录:这里只在要获取用户信息时进行验证，页面跳转不用验证啦
const checkLogin = (successHandler,failHanlder)=>{
	//这里由于微信小程序没有cookie机制，所以得从缓存中获取cookie，然后放入header中传递给后台
	var cookie = wx.getStorageSync('user-cookie');
	//先测试无cookie
	var checkLoginUrl = require('./url').checkLoginUrl;
	wx.request({
		url:checkLoginUrl,
		method:'GET',
		//把cookie存在header中发送给后台
		header:{'cookie':cookie},
		success:successHandler,
		fail:failHanlder
	})
}


//通用请求接口，里面设置了cookie




module.exports = {
	login:login,
	checkLogin:checkLogin
};