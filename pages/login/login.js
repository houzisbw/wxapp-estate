// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  	password:'',
		username:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  //登录
  login:function(e){
  	var login = require('./../../api/login').login;
    var password = e.detail.value.password;
    var username = e.detail.value.username;
    //校验用户名和密码
    if(!password||!username){
    	wx.showToast({
				title:'用户名或密码为空!',
				icon:'none',
				mask:true
			});
			return
		}
		//展示loading
		wx.showLoading({
			title:'登录中',
			mask:true
		});
		//登录
		login(username,password,function(res){
			wx.hideLoading();
			if(res.data.status === -1){
				wx.showToast({
					title:'网络错误!',
					icon:'none',
					mask:true
				});
			}else if(res.data.status === 0){
				wx.showToast({
					title:'用户名或密码错误!',
					icon:'none',
					mask:true
				});
			}else{

				//保存header中的cookie字段到缓存
				wx.setStorageSync('user-cookie',res.header['set-cookie']);
				console.log(res.header['set-cookie'])
				//登录成功,保存sessionid和expires到缓存
				wx.showToast({
					title:'登录成功!',
					icon:'none',
					mask:true,
					duration:1000
				});
				//跳转到首页
				wx.switchTab({
					url: '/pages/index/index'
				})


			}
		},function(err){
			console.log(err)
			wx.hideLoading();
			//登录失败
			wx.showToast({
				title:'网络错误!!',
				icon:'none',
				mask:true
			});
		})


  },
  //清空输入
	clearInput:function(){
		this.setData({
			password:'',
			username:''
		})
	},


})