// pages/admin/index/index.js
var adminGetEstateList = require('./../../../api/admin/index').adminGetEstateList;
var searchEstateList = require('./../../../api/admin/index').searchEstateList;
var logoutInterface = require('./../../../api/mine').logout;
var config = require('./../../../config/config')
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
		//是否显示scroll-view的加载中(下拉到底加载更多)
		isShowLoadMore:false,
		//返回的数据房屋数据是否为空
		isEstateListEmpty:false,
		//输入框的值
		searchKeywords:'',
		//当前页数
		currentPage:1,
		//每页容量
		pageSize:10,
		//是否是搜索状态
		isInSearchState:false,
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
	//搜索按钮事件方法
	handleSearch: function(){
		if(!this.data.searchKeywords || this.data.isScrollViewLoading){
			wx.showToast({
				title: '非法输入!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
			return
		}
		//清空已有的数据,重置页数为1
		this.setData({
			estateListData:[],
			currentPage:1
		});
		this.search();
	},
	//搜索按钮
	search: function(){
		var self = this;
		//进入搜索状态
		self.setData({
			isEstateListEmpty:false,
			isInSearchState:true
		});
		//搜索中(非下拉加载更多不显示)
		if(this.data.currentPage===1){
			wx.showLoading({
				title:'搜索中',
				mask:true
			});
		}
		//搜索改为搜索历史所有的数据
		searchEstateList(
				this.data.searchKeywords,
				this.data.latestDate,
				this.data.currentPage,
				this.data.pageSize,
				function(res){
			let status = res.data.status;
			if(status === -1){
				wx.showToast({
					title: '查询错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}else if(status === 0){
				//只有第一次搜索时(不触发下拉),搜不到数据才显示下面的提示
				if(self.data.estateListData.length === 0){
					//未找到数据
					wx.showToast({
						title: '没有查询到记录!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					});
					self.setData({
						isEstateListEmpty:true
					})
				}
			}else if(status === 1){
				//搜索成功,由于分页这里要concat
				self.setData({
					estateListData:self.data.estateListData.concat(res.data.estateData),
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
			self.setData({
				isShowLoadMore:false
			})
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
		if(this.data.isScrollViewLoading || this.data.isShowLoadMore){
			return
		}
		var id = e.currentTarget.id;
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			isEstateListEmpty:false,
			activeIndex: parseInt(id,10),
			//重置页数为1
			currentPage:1,
			//退出搜索状态
			isInSearchState:false
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

	//拨号
	dialPhone: function(e){
		var phoneNumber = e.currentTarget.dataset.phone;
		wx.makePhoneCall({
			phoneNumber: phoneNumber?phoneNumber.toString():''
		})
	},

	//点击条目显示反馈信息
	showFeedback: function(e){
		let feedback = e.currentTarget.dataset.feedback;
		wx.showModal({
			title:'反馈内容',
			content:feedback?feedback:'无',
			showCancel:false
		})
	},

	//scorll-view下拉到底加载更多
	handleLoadMore: function(){
		//如果正在加载更多或者处于非搜索状态，则返回不做处理
		if(!this.data.isInSearchState)return;
		if(this.data.isShowLoadMore)return;
		this.setData({
			isShowLoadMore:true,
			currentPage:this.data.currentPage+1
		});
		//继续搜索分页数据
		this.search();
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