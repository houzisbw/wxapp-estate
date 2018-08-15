// pages/mine/mine.js
var saveAvatar = require('./../../api/mine').saveAvatar;
var getPersonalInfo = require('./../../api/mine').getPersonalInfo;
var logoutInterface = require('./../../api/mine').logout;
//上传图片的url
var uploadUrl = require('./../../api/url').imageUploadUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
  	username:'没有名字啦',
		avatarUrl:'/assets/images/icon/avatar.png',
		realname:'无名氏'
  },
	//预览头像
	previewAvatar:function(){
  	wx.previewImage({
			urls:[this.data.avatarUrl]
		})
	},
  //修改头像
	modifyImage: function(){
		if(this.data.username === '没有名字啦'){
			return
		}
  	let self = this;
		wx.chooseImage({
			count: 1, // 默认9
			sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			success: function (res) {
				wx.showLoading({
					title:'上传中',
					mask:true
				});
				// 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
				var tempFilePath = res.tempFilePaths[0];
				//必须设置cookie防止后端拦截为未登录
				var cookie = wx.getStorageSync('user-cookie');
        //上传图片到服务端
				wx.uploadFile({
          url:uploadUrl,
					filePath:tempFilePath,
          name:self.data.username,
					//cookie必须添加
					header:{'cookie':cookie},
					formData:{
          	username:self.data.username
					},
					complete: function(){
          	wx.hideLoading();
					},
					success: function(res){
						wx.showToast({
							title: '更新成功!',
							duration: 2000
						});
						var data = JSON.parse(res.data)
						if(data.status === 1){
							if(data.avatarUrl){
								self.setData({
									avatarUrl:data.avatarUrl
								})
								self.initData()
							}
						}else{
							wx.showToast({
								title: '读取信息失败!',
								image:'/assets/images/icon/toast_warning.png',
								duration: 2000
							})
						}
					}
        })
			}
		})
  },

	//拉取数据
	initData(){
		var self = this;
		var username = wx.getStorageSync('username');
		getPersonalInfo(username,function(res){
			if(res.data.status === 1){
				let avatarUrl = res.data.info.avatar,
						realname = res.data.info.realname;
				self.setData({
					username:username,
					avatarUrl:avatarUrl?avatarUrl:'/assets/images/icon/avatar.png',
					realname:realname
				});
			}else{
				wx.showToast({
					title: '读取信息失败!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}
		},function(){
			wx.showToast({
				title: '读取信息失败!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		})
	},

	//跳转到历史数据
	goToHistoryPage: function(){
		wx.showToast({
			title: '该功能日后开发!',
			image:'/assets/images/icon/toast_warning.png',
			duration: 2000
		})
		// wx.navigateTo({
		// 	url:"/pages/history/history"
		// })
	},

	//退出登录
	logout: function(){
		let self = this;
		wx.showModal({
			content:'确定退出登录?',
			title:'提示',
			success: function(res) {
				//确定退出
				if (res.confirm) {
					//清除storage相关内容
					logoutInterface(self.data.username,function(res){
						//必须在后台清除完session后才能清除本机缓存，否则cookie无法传达给后台
						wx.clearStorageSync();
						//退出成功,跳转登录页
						wx.redirectTo({
							url:'/pages/login/login'
						})
					},function(){
						//退出失败
					})
				}
			}
		})
	},
  onLoad: function (options) {
		//数据只在onload里更新一次，不在onshow里更新，否则页面频繁闪烁
		this.initData();
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
  
  }
})