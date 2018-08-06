// pages/admin/index/index.js
var adminGetEstateList = require('./../../../api/admin/index').adminGetEstateList;
var searchEstateList = require('./../../../api/admin/index').searchEstateList;
var logoutInterface = require('./../../../api/mine').logout;
Page({

  /**
   * 页面的初始数据
   */
  data: {
		//选项卡数据
		tabs: ["全部", "已看", "未看"],
		activeIndex: 0,
		sliderOffset: 0,
		sliderLeft: 0,
		//页面下半部分scoll-view的高度(页面剩下的高度,需动态计算)
		scrollViewHeight:0,
		//当日看房数据
		totalNum:'',
		visitedNum:'',
		unvisitedNum:'',
		estateListData:[],
		latestDate:'',
		//scroll-view内容是否在加载
		isScrollViewLoading:false,
		//返回的数据房屋数据是否为空
		isEstateListEmpty:false,
		//输入框的值
		searchKeywords:''
  },
	//计算页面剩下的高度，用于scroll-view
	caculateLeftHeightForScrollView(){
		var that = this;
		// 获取系统信息
		wx.getSystemInfo({
			success: function (res) {
				var query = wx.createSelectorQuery();
				//获取搜索栏的实际高度(像素单位)
				query.select('#weui-search-bar').boundingClientRect();
				query.exec(function (queryRes) {
					var barHeight = queryRes[0].height;
					// 计算主体部分高度,单位为px,不是rpx
					that.setData({
						// second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px，所有利用比例将310rpx转换为px）
						scrollViewHeight: res.windowHeight - res.windowWidth / 750 * 320 - barHeight
					})
				})
			}
		})


	},
	//搜索按钮
	search: function(){
		var self = this;
		self.setData({
			isEstateListEmpty:false
		})
		if(!this.data.searchKeywords || this.data.isScrollViewLoading){
			wx.showToast({
				title: '搜索失败!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
			return
		}
		//搜索中
		wx.showLoading({
			title:'搜索中',
			mask:true
		});
		searchEstateList(this.data.searchKeywords,this.data.latestDate,function(res){
			let status = res.data.status;
			if(status === -1){
				wx.showToast({
					title: '查询错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}else if(status === 0){
				//未找到数据
				wx.showToast({
					title: '没有查询到记录!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
				self.setData({
					isEstateListEmpty:true
				})
			}else if(status === 1){
				//搜索成功
				self.setData({
					estateListData:res.data.estateData,
				})
			}
		},function(){
			wx.showToast({
				title: '网络错误!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		},function(){
			wx.hideLoading();
		})
	},
	//输入框
	searchInput: function(e){
		this.setData({
			searchKeywords:e.detail.value
		})
	},
	//选项卡点击
	tabClick: function (e) {
		//如果正在加载数据时返回，防止出错
		if(this.data.isScrollViewLoading){
			return
		}
		var id = e.currentTarget.id;
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			isEstateListEmpty:false,
			activeIndex: parseInt(id,10)
		});
		//根据id来加载数据，0是全部，1是已看，2是未看，每次都要从服务器拉数据
		this.getLatestEstateData(id)
  },
	//初始化数据
	initData: function(){
		this.caculateLeftHeightForScrollView();
		this.getLatestEstateData(0);
	},
	//获取当日的所有看房数据
	getLatestEstateData: function(type){
		var self = this;
		this.setData({
			isScrollViewLoading:true
		});
		adminGetEstateList(type,function(res){
			let data = res.data;
			if(res.data.status === 1){
				self.setData({
					totalNum:data.totalNum,
					visitedNum:data.visitedNum,
					unvisitedNum:data.unvisitedNum,
					estateListData:data.estateData,
					latestDate:data.latestDate
				})
			}else if(res.data.status === -1){
				wx.showToast({
					title: '数据读取失败!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}else if(res.data.status === 0){
				//数据为空
				wx.showToast({
					title: '没有查询到记录!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
				self.setData({
					isEstateListEmpty:true
				})
			}

		},function(){
			//失败
			wx.showToast({
				title: '数据读取失败!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		},function(){
			self.setData({
				isScrollViewLoading:false
			});
		})
	},
	//清空输入框
	clearSearchInput: function(){
		this.setData({
			searchKeywords:''
		})
	},
	//去往数据统计页面
	goToStatisticPage: function(){
		wx.navigateTo({
			url:'/pages/admin/history/history'
		})
	},
	//登出
	adminLogout: function(){
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
  	this.initData()
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