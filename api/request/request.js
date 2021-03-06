/**
 * 通用请求接口，里面设置了cookie
 */
const baseRequest = (type,data,url,successHandler,failHandler,completeHandler)=>{
	var cookie = wx.getStorageSync('user-cookie');
	var requestTask = wx.request({
		url:url,
		method:type,
		data:data,
		//把cookie存在header中发送给后台
		header:{'cookie':cookie},
		success:function(res){
			//重新登录,这里做统一拦截,后台也有统一拦截
			if(res.data.status === -2){
				//清除掉所有缓存
				wx.clearStorageSync();
				wx.redirectTo({
					url:'/pages/login/login'
				})
			}else{
				successHandler(res)
			}
		},
		fail:failHandler,
		complete:completeHandler
	});
	return requestTask
}

module.exports = baseRequest