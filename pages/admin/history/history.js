// pages/admin/history/history.js
var getStaffList = require('./../../../api/admin/index').getStaffList;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //底部3个选择器的数据结构
		timeSelectorArray:['自选','本周','本月'],
    chartTypeArray:['看房数量','接单数量'],
    staffNameList:['-全部-'],
    //3个选择器选中的结果index
    timeSelectedIndex:1,
    chartSelectedIndex:0,
    staffSelectedIndex:0,
    //起始日期选择器的年月日
    startTimeYears:[2000,2001,2002,2003],
		startTimeMonth:[1,2,3,4,5],
    startTimeDay:[1,2,3,4,5,6,7,8,9,10]
  },
  //日期选择器change
	bindTimeSelectorChange: function(e){
    this.setData({
			timeSelectedIndex:e.detail.value
    })
    //如果选择的是自选(对应0)则弹框指引用户先选择起始日期，再选择结束日期
    //起始日期从
  },
  //图表选择器change
	bindChartSelectorChange: function(e){
		this.setData({
			chartSelectedIndex:e.detail.value
		})
  },
  //人员选择器change
	bindStaffSelectorChange: function(e){
		this.setData({
			staffSelectedIndex:e.detail.value
		})
  },
  //获取看房人员列表
  getStaffNameList: function(){
	  var self = this;
		getStaffList(function(res){
      let status = res.data.status;
      if(status === 1){
        self.setData({
					staffNameList:['- 全部人员 -'].concat(res.data.staffList)
        })
      }else{
				//失败
				wx.showToast({
					title: '数据读取失败!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
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
		this.getStaffNameList()
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