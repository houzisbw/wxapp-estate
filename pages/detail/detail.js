// pages/detail/detail.js
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqMapSDK;
//util
var formatTime = require('../../utils/util').formatTime;
var getDetailInfoOfEstate = require('../../api/detail').getDetailInfoOfEstate;
var submitFeedbackRequest = require('../../api/detail').submitFeedbackRequest;
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
		estateDetailObj:{},
		//自己当前的坐标经纬度
		selfCurrentLng:'',
		selfCurrentLat:'',
		//地图缩放值，默认16,18最详细
		scale:16,
		/** 反馈弹出页面相关 **/
		isFeedbackLayerVisible:false,
		//面板动画
		feedbackPanelAnimationData:{},
		//遮罩动画
		modalLayerAnimationData:{},
		//屏幕高度
		screenHeight:0,
		//反馈页面的switch值
		feedbackSwitch:false,
		//复选框激活选项
		activeRadioIndex:0,
		//是否激活输入面板
		isInInputMode:false,
		//未看房屋的复选框原因
		reasonForRadioBtn:'',
		//其他原因(输入框)
		otherReason:'',
		//上述2个原因的分隔符
		delimeter:'*##*',
		//是否处于提交中
		isInFeedbacking:false,
		//textarea默认值
		defaultTextareaValue:''
  },

  //初始化地图位置
  initMapPosition(pos){
    var self = this;
    return new Promise(function(resolve,reject){
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
								//此处必须concat，否则覆盖数据
								markers:self.data.markers.concat(
									[
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
								)
							});
							resolve({
								targetLatitude:lat,
								targetLongitude:lng
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
		});

  },

  //重置地图位置
	resetPosition(){
    this.setData({
			latitude:this.data.originLat,
			longitude:this.data.originLng,
			scale:16
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
	//拨打电话
	dialPhone(e){
		var phoneNumber = e.currentTarget.dataset.telephone;
		wx.makePhoneCall({
			phoneNumber: phoneNumber?phoneNumber.toString():''
		})
	},
	//根据房屋index获取房屋详细的信息
	thisGetDetailInfoOfEstate(estateIndex,latestDate){
		var self = this;
		//引入的api
		getDetailInfoOfEstate(estateIndex,latestDate,function(res){
			wx.hideLoading();
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
				//获取输入框的值
				var textareaValue = res.data.estateDetail.feedback;
				var realValue = textareaValue.split(self.data.delimeter)[1];
				self.setData({
					estateDetailObj:res.data.estateDetail,
					feedbackSwitch:res.data.estateDetail.isVisit,
					defaultTextareaValue:realValue
				})
			}

		},function(err){
			wx.hideLoading();
			//错误
			wx.showToast({
				title: '查询错误!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		})
	},
	//获取当前自己的坐标
	getCurrentPosition(){
		var self = this;
		return new Promise(function(resolve,reject){
			//获取自己当前的位置
			wx.getLocation({
				type: 'gcj02', //返回可以用于wx.openLocation的经纬度
				success: function(res) {
					var latitude = res.latitude;
					var longitude = res.longitude;
					self.setData({
						selfCurrentLng:longitude,
						selfCurrentLat:latitude,
						markers:self.data.markers.concat([{
							iconPath: "/assets/images/icon/current_pos.png",
							id: 1,
							latitude: latitude,
							longitude: longitude,
							width: 35,
							height: 35
						}])
					});
					resolve({
						selfCurrentLng:longitude,
						selfCurrentLat:latitude,
					});
				},
				fail: function(){
					wx.showToast({
						title: '地图查询错误!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					});
					reject(-1)
				}
			});
		});
	},
	//页面初始化
	pageInit(options){
		var self = this;
		//获取首页传过来的参数
		var estateIndex = options.estateindex,
				latestDate = options.latestdate,
				position = options.estateposition;
		//获取房屋在地图上的位置
		var promiseOne = this.initMapPosition(position);
		//获取当前位置坐标
		var promiseTwo = this.getCurrentPosition();
		Promise.all([promiseOne,promiseTwo]).then((result)=>{
			//缩放地图包含当前点和目标点
			var targetPoint = result[0],
					selfPoint = result[1];
			self.mapCtx && self.mapCtx.includePoints({
				//必须设置4个值，表示上右下左距离屏幕边缘的距离(像素)
				padding: [100,100,100,100],
				points: [{
					latitude:targetPoint.targetLatitude,
					longitude:targetPoint.targetLongitude,
				}, {
					latitude:selfPoint.selfCurrentLat,
					longitude:selfPoint.selfCurrentLng,
				}]
			})
		});
		this.setData({
			callout:Object.assign(this.data.callout,{content:position}),
			estateIndex:estateIndex,
			latestDate:latestDate
		});
		//拉去房屋详细数据
		this.thisGetDetailInfoOfEstate(estateIndex,latestDate);
		//获取屏幕高度
		this.getScreenHeight();
	},
	//获取屏幕高度
	getScreenHeight(){
		var that = this;
		wx.getSystemInfo({
			success: function (res) {
				// 计算主体部分高度,单位为px,不是rpx
				that.setData({
					screenHeight: res.windowHeight
				})
			}
		})
	},

	//关闭反馈弹出的页面以及遮罩
	closeFeedbackLayer(){
		//面板动画
		var panelAnimation = wx.createAnimation({
			duration: 300,
			timingFunction: "ease",
			delay: 0
		});
		//这里bottom参数是px，所以得获取屏幕高度的像素值
		panelAnimation.bottom(-this.data.screenHeight/2).step();
		this.setData({
			isFeedbackLayerVisible:false,
			feedbackPanelAnimationData:panelAnimation.export()
		})
	},
	//弹出反馈面板
	showFeedbackLayer(){
		//面板动画
		var animation = wx.createAnimation({
			duration: 300,
			timingFunction: "ease",
			delay: 0
		});
		animation.bottom(0).step();
		this.setData({
			isFeedbackLayerVisible:true,
			feedbackPanelAnimationData:animation.export()
		})
	},
	//是否看房的switch选择器
	switchChange(e){
		var value = e.detail.value;
		this.setData({
			feedbackSwitch:value
		});
		//如果处于已看状态，则禁止选择复选框
		if(value){
			this.setData({
				activeRadioIndex:0,
				reasonForRadioBtn:''
			});
		}
	},
	//复选框选择
	selectRadioBtn(e){
		if(this.data.feedbackSwitch){
			this.setData({
				activeRadioIndex:0,
				reasonForRadioBtn:''
			});
			return
		}
		var index = e.target.dataset.index.toString();
		//如果点击目标不是复选框内元素则返回undefined
		if(index!==undefined){
			//如果在选中情况下点击了自己,则取消选中该项
			if(this.data.activeRadioIndex === index){
				this.setData({
					activeRadioIndex:0,
					reasonForRadioBtn:''
				})
			}else{
				this.setData({
					activeRadioIndex:index,
					reasonForRadioBtn:e.target.dataset.reason
				})
			}

		}
	},
	//激活输入面板页面
	goToInputPage(){
		this.setData({
			isInInputMode:true
		})
	},
	closeInputPage(){
		this.setData({
			isInInputMode:false
		})
	},
	//textarea绑定bindinput获取输入框的值
	textareaInputChange(e){
		this.setData({
			otherReason:e.detail.value
		})
	},
	//提交反馈
	submitFeedback(){
		var self = this;
		if(this.data.isInFeedbacking){
			return
		}
		this.setData({
			isInFeedbacking:true
		});
		//原因中包含了分隔符,网站显示时需要处理
		var reason = this.data.reasonForRadioBtn.replace(this.data.delimeter,'')
				+ this.data.delimeter
				+ this.data.otherReason.replace(this.data.delimeter,'');
		//发送后台
		var feedbackTime = formatTime(new Date());
		submitFeedbackRequest(this.data.feedbackSwitch?'1':'0',reason,feedbackTime,this.data.latestDate,this.data.estateIndex,function(res){
			//请求成功
			var status = res.data.status;
			if(status === 1){
				wx.showToast({
					title: '反馈提交成功!',
					icon:'success',
					duration: 2000
				});
			}else if(status === -2){
				//重新登录逻辑,跳转到登录页面,redirectTo不保留当前页面,关闭该页面
				wx.redirectTo({
					url:'/pages/login/login'
				})
			}else {
				wx.showToast({
					title: '保存错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
			}
		},function(err){
			wx.showToast({
				title: '网络错误!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
		},function(){
			//complete,关闭反馈页面
			self.setData({
				isInFeedbacking:false,
			});
			self.closeFeedbackLayer();
			self.thisGetDetailInfoOfEstate(self.data.estateIndex,self.data.latestDate);
		})
	},



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  	//展示加载界面，防止乱点击
		wx.showLoading({
			title:'努力加载中',
			mask:true
		});
		//初始化地图sdk
		qqMapSDK = new QQMapWX({
			key: '5RQBZ-3YO6I-HAGGQ-5T5BU-5RNHK-NIF3N'
		});
		this.pageInit(options);


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