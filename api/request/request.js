/**
 * 通用请求接口，里面设置了cookie
 */
const baseRequest = (type,data,url,successHandler,failHandler,completeHandler)=>{
	var cookie = wx.getStorageSync('user-cookie');
	wx.request({
		url:url,
		method:type,
		data:data,
		//把cookie存在header中发送给后台
		header:{'cookie':cookie},
		success:successHandler,
		fail:failHandler,
		complete:completeHandler
	})
}

module.exports = baseRequest