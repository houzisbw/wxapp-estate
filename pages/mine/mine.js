// pages/mine/mine.js
var saveAvatar = require('./../../api/mine').saveAvatar;
var getPersonalInfo = require('./../../api/mine').getPersonalInfo;
var logoutInterface = require('./../../api/mine').logout;
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
        //上传图片到第三方图床网站
				wx.uploadFile({
          url:'https://sm.ms/api/upload',
					filePath:tempFilePath,
          name:'smfile',
					complete: function(){
          	wx.hideLoading();
					},
					success: function(res){
						var data = JSON.parse(res.data);
						var code = data.code;
						if(code === 'success'){
						  var url = data.data.url;
						  var username = wx.getStorageSync('username');
              //保存数据库
							saveAvatar(url,username,function(res){
								if(res.data.status === 1){
									wx.showToast({
										title: '修改成功!',
										duration: 2000
									})
									//刷新
									self.initData();
								}else{
									wx.showToast({
										title: '上传失败!',
										image:'/assets/images/icon/toast_warning.png',
										duration: 2000
									})
								}
							},function(){
								//上传失败
								wx.showToast({
									title: '上传失败!',
									image:'/assets/images/icon/toast_warning.png',
									duration: 2000
								})
							})
            }else{
              //上传失败
							wx.showToast({
								title: '上传失败!',
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
					avatarUrl:avatarUrl,
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
		this.initData();
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