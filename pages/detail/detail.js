// pages/detail/detail.js
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqMapSDK;
var getDetailInfoOfEstate = require('../../api/detail').getDetailInfoOfEstate;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //纬度
    latitude:30.658292,
    //经度
    longitude:104.066448,
    originLat:30.658292,
    originLng:104.066448,
    //地图上标注点
		markers: [],
    //地图上marker的气泡
		callout:{
			content:'',
      color:'#fff',
      fontSize:10,
			borderRadius:13,
			bgColor:'#ff4e3f',
			padding:3,
			display:'ALWAYS',
      textAling:'center'
    },
		latestDate:'',
		estateIndex:'',
		//房屋详细信息
		estateDetailObj:{}
  },

  //初始化地图位置
  initMapPosition(pos){
    var self = this;
		qqMapSDK.geocoder({
			address: '成都市'+pos,
			success: function(res) {
			  //调用成功
				if(res.status===0){
				  if(res.result.reliability>=7){
				    var lat = res.result.location.lat,
                lng = res.result.location.lng;
            self.setData({
							latitude:lat,
              longitude:lng,
							originLat:lat,
							originLng:lng,
              markers:[
								{
									iconPath: "/assets/images/icon/marker.png",
									id: 0,
									latitude: lat,
									longitude: lng,
									width: 30,
									height: 30,
                  callout:self.data.callout
								}
              ]
            })
          }else{
						wx.showToast({
							title: '地址解析精度较低!',
							image:'/assets/images/icon/toast_warning.png',
							duration: 1000
						})
          }

        }else{
					wx.showToast({
						title: '地址解析错误!!!!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					})
        }
			},
			fail: function(res) {
				wx.showToast({
					title: '地址解析错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			},
			complete: function(res) {
			  if(res.status!==0){
					wx.showToast({
						title: '地址解析错误!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					})
        }
			}
		});
  },

  //重置地图位置
	resetPosition(){
    this.setData({
			latitude:this.data.originLat,
			longitude:this.data.originLng
    })
  },
	//查看详情
	showAddressInfo(e){
		wx.showModal({
			title: '房屋详细地址',
			confirmColor:'#39ac6a',
			content: e.currentTarget.dataset.addr,
			success: function(res) {}
		})
	},
	//根据房屋index获取房屋详细的信息
	thisGetDetailInfoOfEstate(estateIndex,latestDate){
		var self = this;
		//引入的api
		getDetailInfoOfEstate(estateIndex,latestDate,function(res){
			var status = res.data.status;
			if(status === -2){
				//重新登录逻辑,跳转到登录页面,redirectTo不保留当前页面,关闭该页面
				wx.redirectTo({
					url:'/pages/login/login'
				})
			}else if(status === -1){
				wx.showToast({
					title: '查询错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			}else if(status === 0){
				//数据为空,返回上一页
				wx.navigateBack({
					delta:1
				})
			}else{
				//查询成功
				self.setData({
					estateDetailObj:res.data.estateDetail
				})
			}

		},function(err){
			//错误
			wx.showToast({
				title: '查询错误!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		//初始化地图sdk
		qqMapSDK = new QQMapWX({
			key: '5RQBZ-3YO6I-HAGGQ-5T5BU-5RNHK-NIF3N'
		});
		//获取首页传过来的参数
		var estateIndex = options.estateindex,
				latestDate = options.latestdate,
				position = options.estateposition;
		//获取房屋在地图上的位置
		this.initMapPosition(position);
		this.setData({
      callout:Object.assign(this.data.callout,{content:position})
    });
		//拉去房屋详细数据
		this.thisGetDetailInfoOfEstate(estateIndex,latestDate)
	},


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //获取map上下文
		this.mapCtx = wx.createMapContext('map')
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