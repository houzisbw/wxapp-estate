// 首页

//检查是否登录的接口
var checkLogin = require('./../../api/login').checkLogin;
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
    scrollViewHeight:0
  },
  //选项卡点击
	tabClick: function (e) {
		this.setData({
			sliderOffset: e.currentTarget.offsetLeft,
			activeIndex: e.currentTarget.id
		});
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //计算页面剩下的高度
    this.caculateLeftHeightForScrollView();
    //发送请求获取数据

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

  //获取用户信息:实际姓名，最近一次派单的单数，然后是所有的单的具体信息
  getUserInfo: function(){

  }
})