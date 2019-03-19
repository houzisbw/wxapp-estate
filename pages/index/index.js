// 首页

//检查是否登录的接口
var checkLogin = require('./../../api/login').checkLogin;
//拉去首页房屋列表数据的url
var getEstateDataList = require('./../../api/index').getEstateDataList;
//拉去首页其他信息的url
var getOtherInfo = require('./../../api/index').getOtherInfo;
//工具函数
var formatQueryString = require('./../../utils/util').formatQueryString;
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
		//看房列表数据
		estateListData:[],
		//返回的数据房屋数据是否为空
		isEstateListEmpty:false,
		//scroll-view内容是否在加载
		isScrollViewLoading:false,
		//首页个人信息
		realname:'',
		latestDate:'',
		totalNum:0,
		visitedNum:0,
		unvisitedNum:0,
		avatarUrl:'/assets/images/icon/avatar.png',
		//请求
    estateRequest:null,
		infoRequest:null,
  },
  //选项卡点击
	tabClick: function (e) {
  	//如果正在加载数据时返回，防止出错
		if(this.data.isScrollViewLoading){
			return
		}
  	var id = e.currentTarget.id
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			activeIndex: parseInt(id,10)
		});
		//根据id来加载数据，0是全部，1是已看，2是未看，每次都要从服务器拉数据
		let username = wx.getStorageSync('username');
		this.fetchEstateDataList(id,username);
		//更新数据
		//this.getIndexPageOtherInfo(username);
	},
	//根据id来加载数据，0是全部，1是已看，2是未看，每次都要从服务器拉数据
	fetchEstateDataList: function(type,username){
  	//如果正在加载则不继续逻辑,防止多次点击造成服务器压力
		if(this.data.isScrollViewLoading){
			return
		}
  	var self = this;
  	this.setData({
			isScrollViewLoading:true
		});
		var estateRequest = getEstateDataList(type,username,function(res){
			var status = res.data.status;
			if(status === -2){
				wx.showToast({
					title: '请重新登录!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
				//重新登录逻辑,跳转到登录页面,redirectTo不保留当前页面,关闭该页面
				wx.redirectTo({
					url:'/pages/login/login'
				})
			}else if(status === -1){
				wx.showToast({
					title: '数据获取失败!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}else if(status === 0){
				//数据为空,且不是管理员
				if(wx.getStorageSync('auth')!=='0'){
					wx.showToast({
						title: '没有查询到记录!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					});
				}
				self.setData({
					isEstateListEmpty:true
				})
			}else{
				//数据获取成功
				self.setData({
					estateListData:res.data.estateData.estateData,
					isEstateListEmpty:false
				})
			}

		},function(err){
			// wx.showToast({
			// 	title: '网络错误!',
			// 	image:'/assets/images/icon/toast_warning.png',
			// 	duration: 2000
			// })
		},function(){
			//complete
			self.setData({
				isScrollViewLoading:false
			});
		});
		self.setData({
      estateRequest:estateRequest
		})
	},
	//获取首页其他信息
	getIndexPageOtherInfo(username){

		var self = this;
		var infoRequest = getOtherInfo(username,function(res){
			let status = res.data.status;
			if(status === 1){
				var data = res.data;
				self.setData({
					avatarUrl:data.avatarUrl?data.avatarUrl:'/assets/images/icon/avatar.png',
					realname:data.realname,
					latestDate:data.latestDate,
					totalNum:data.staffEstateTotalNum,
					visitedNum:data.staffEstateVisitedNum,
					unvisitedNum:data.staffEstateUnvisitedNum
				})
			}else if(status===-1){
				wx.showToast({
					title: '数据读取错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}
		},function(){
			// wx.showToast({
			// 	title: '数据读取错误!!',
			// 	image:'/assets/images/icon/toast_warning.png',
			// 	duration: 2000
			// })
		},function(){
      // self.setData({
      //   isScrollViewLoading:false
      // });
		})

    self.setData({
      infoRequest:infoRequest
    })
	},
  //计算页面剩下的高度，用于scroll-view
  caculateLeftHeightForScrollView(){
		var that = this;
		// 获取系统信息
		wx.getSystemInfo({
			success: function (res) {
				// 计算主体部分高度,单位为px,不是rpx
				that.setData({
					// second部分高度 = 利用窗口可使用高度 - first部分高度（这里的高度单位为px，所有利用比例将310rpx转换为px）
					scrollViewHeight: res.windowHeight - res.windowWidth / 750 * 320
				})
			}
		})
	},
	//初始化首页数据
	initData(){
  	//如果是管理员跳转管理员界面
		if(wx.getStorageSync('auth')==='0'){
			wx.redirectTo({	url:'/pages/admin/index/index'})
		}
		//计算页面剩下的高度
		this.caculateLeftHeightForScrollView();
		//获取用户登录名
		let username = wx.getStorageSync('username');
		//发送请求获取全部房屋列表数据
		this.fetchEstateDataList(0,username);
		//获取首页其他信息
		this.getIndexPageOtherInfo(username);
	},
	//跳转详情页
	switchToDetailPage(e){
		//获取详情页id,currentTarget指的是绑定事件的元素而不是触发事件的元素
		var estateIndex = e.currentTarget.dataset.id;
		var latestDate = e.currentTarget.dataset.date;
		var estatePosition = e.currentTarget.dataset.pos;
		var queryObj = {
			estateindex:estateIndex,
			latestdate:latestDate,
			estateposition:estatePosition
		};
		var queryString = formatQueryString(queryObj);
		wx.navigateTo({
			url:'/pages/detail/detail?'+queryString
		})
	},
	//拨号,此处是catchtap防止冒泡
	dialPhone(e){
		var phoneNumber = e.currentTarget.dataset.phone;
		wx.makePhoneCall({
			phoneNumber: phoneNumber?phoneNumber.toString():''
		})
	},
	//显示是上次排单
	showTipsOfLast: function(e){
		wx.showToast({
			title: '该单为上次所派单!',
			duration:2000,
			icon:'none'
		})
	},
	//显示反馈信息
	showFeedback: function(e){
		let info = e.currentTarget.dataset.feedback;
		wx.showModal({
			title:'反馈信息',
			content:info,
			showCancel:false
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
  	//本页面重新打开是也要初始化数据
		this.initData();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.estateRequest && this.data.estateRequest.abort();
    this.data.infoRequest &&this.data.infoRequest.abort();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.data.estateRequest && this.data.estateRequest.abort();
    this.data.infoRequest &&	this.data.infoRequest.abort();
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

  //获取用户信息:实际姓名，最近一次派单的单数，然后是所有的单的具体信息
  getUserInfo: function(){

  }
})