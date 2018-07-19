// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
  	password:'',
		username:'',
		//是否在登录中
		isInLogin:false
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
  	if(this.data.isInLogin){
  		return
		}
  	var self = this;
  	var login = require('./../../api/login').login;
    var password = e.detail.value.password;
    var username = e.detail.value.username;
    //校验用户名和密码
    if(!password||!username){
    	wx.showToast({
				title:'输入不能为空!',
				image:'/assets/images/icon/toast_warning.png',
				mask:true
			});
			return
		}
		//展示loading
		wx.showLoading({
			title:'登录中',
			mask:true
		});
    this.setData({
			isInLogin:true
		});
		//登录
		login(username,password,function(res){
			wx.hideLoading();
			if(res.data.status === -1){
				wx.showToast({
					title:'网络错误!',
					image:'/assets/images/icon/toast_warning.png',
					mask:true
				});
			}else if(res.data.status === 0){
				wx.showToast({
					title:'输入有误!',
					image:'/assets/images/icon/toast_warning.png',
					mask:true
				});
			}else{
				//保存header中的cookie字段到缓存
				//这里Set-Cookie是手机上的格式，而set-cookie是pc上的格式,需要兼容下
				wx.setStorageSync('user-cookie',res.header['Set-Cookie']||res.header['set-cookie']);
				//保存用户名
				wx.setStorageSync('username',res.data.username);
				//跳转到首页
				wx.switchTab({
					url: '/pages/index/index'
				})
			}
		},function(err){
			wx.hideLoading();
			//登录失败
			wx.showToast({
				title:'网络错误!!',
				image:'/assets/images/icon/toast_warning.png',
				mask:true
			});
		},function(){
			//complete
			self.setData({
				isInLogin:false
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