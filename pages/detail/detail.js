// pages/detail/detail.js
//配置信息
var config = require('./../../config/config');
//sdk
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqMapSDK;
//util
var formatTime = require('../../utils/util').formatTime;
var getDetailInfoOfEstate = require('../../api/detail').getDetailInfoOfEstate;
var submitFeedbackRequest = require('../../api/detail').submitFeedbackRequest;
//工具函数
var formatQueryString = require('./../../utils/util').formatQueryString;
//请求
var checkFormDataExist = require('./../../api/detail').checkFormDataExists;
var updatePictureTypeUrl = require('./../../api/detail').updatePictureType;
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
			//必须6位，否则安卓机显示颜色异常
      color:'#ffffff',
      fontSize:10,
			borderRadius:13,
			//必须设置，否则安卓机一片黑色
			bgColor:'#ff4e3f',
			padding:3,
			display:'ALWAYS',
			textAlign:'center'
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
		defaultTextareaValue:'',
		//是否正在检查表单存在
		isCheckingFormDataExist:false,
		//看房时间:hh-mm
		visitTime:'',
		//看房时间字符串前缀(和visitTime组成字符串)
		visitTimePrefix:'看房时间',
		//没有选择时间的反馈内容
		unselectTimeContent:'未约定看房时间',

		//照片类型
		pictureType:''
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
				//初始情况下textareaValue为空字符串,输入框的值是split后数组的最后一个值
				var splittedArray = textareaValue.split(self.data.delimeter);
				var realValue = textareaValue?splittedArray[splittedArray.length-1]:'';
				//计算看房时间是否合法(hh:mm)
				let rawTime = splittedArray[0].slice(4);
				let isValidVisitTime = /^\d\d:\d\d$/.test(rawTime);
				self.setData({
					estateDetailObj:res.data.estateDetail,
					feedbackSwitch:res.data.estateDetail.isVisit,
					visitTime:isValidVisitTime?rawTime:'',
					defaultTextareaValue:realValue,
					otherReason:realValue,
					pictureType:res.data.estateDetail.pictureType
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
		var estateIndex = parseInt(options.estateindex,10),
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
		//如果未看且未写原因，禁止提交
		if(!this.data.feedbackSwitch
				&& !this.data.reasonForRadioBtn
				&& !this.data.otherReason
				&& !this.data.visitTime){
			wx.showToast({
				title: '请填写原因!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
			return
		}
		//如果正在反馈中
		if(this.data.isInFeedbacking){
			return
		}
		//检测当前时间和已缓存的时间是否小于15分钟,只有已看状态才进行检测
		let timeNow = +new Date();
		if(wx.getStorageSync('submitTime')
				&& self.data.feedbackSwitch
				&& (self.data.estateDetailObj.roadNumber !== wx.getStorageSync('roadNumber'))
			  && (timeNow - parseInt(wx.getStorageSync('submitTime'),10) < config.submitInterval)){
				wx.showToast({
					title: '提交最小间隔15分钟!',
					icon:'none',
					duration: 2000
				})
			  return;
		}
		this.setData({
			isInFeedbacking:true
		});
		//原因中包含了分隔符,网站显示时需要处理,注意这里是2个分隔符
		var reason = (this.data.visitTime?(this.data.visitTimePrefix + this.data.visitTime):this.data.unselectTimeContent)
				+ this.data.delimeter
				+ this.data.reasonForRadioBtn.replace(this.data.delimeter,'')
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
				//已看状态才记录时间
				if(self.data.feedbackSwitch){
					//记录提交时间以及街道号到storage中，下次提交比对时间
					let roadNumber = self.data.estateDetailObj.roadNumber;
					//提交时间是服务端时间，防止修改本地时间
					let submitTime = res.data.submitTime;
					//存入缓存中
					wx.setStorageSync('submitTime',submitTime);
					wx.setStorageSync('roadNumber',roadNumber);
				}
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

	//去往填写表单页面
	goToFormPage: function(){
		if(this.data.isCheckingFormDataExist)return
		let self = this;
		self.setData({
			isCheckingFormDataExist:true
		});
		//首先判断该单是否存在formData字段,如果不存在则返回
		checkFormDataExist(this.data.latestDate,this.data.estateIndex,function(resp){
				if(resp.data.status===-1){
					wx.showToast({
						title: '网络错误!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					});
				}else{
					if(resp.data.isExist === '1'){
						//如果存在表单项则进入表单页
						//本单的日期和序号，唯一确定这个单
						let queryObj = {
							estateIndex:self.data.estateIndex,
							estateDate:self.data.latestDate,
							estateArea:self.data.estateDetailObj.area,
							estateRoadNumber:self.data.estateDetailObj.roadNumber,
							estatePosition:self.data.estateDetailObj.roadNumber+self.data.estateDetailObj.detailPosition
						};
						let queryStr = formatQueryString(queryObj);
						wx.navigateTo({
							url:'/pages/form/form?'+queryStr
						})
					}else{
						wx.showToast({
							title:'表单不存在!',
							icon:'none',
							duration: 2000
						});
					}
				}
		},function(){
			wx.showToast({
				title:'表单不存在!',
				icon:'none',
				duration: 2000
			});
		},function(){
			self.setData({
				isCheckingFormDataExist:false
			});
		});
	},

	// 去往照片上传页面,传入房屋信息
	goToPictureUploadPage: function(){
		let self = this;
    wx.showActionSheet({
      itemList: ['普通住宅/办公', '别墅', '商业'],
      success(res) {
        // 选择照片上传模板类型
        let typeArray = ['普通住宅/办公', '别墅', '商业'];
        let type = typeArray[res.tapIndex];
      	// 判断当前用户所选择的照片类型是否和之前的一样
				// 不一样或者初始状态: 提示操作会删除所有已传照片
				if((self.data.pictureType !== '' && self.data.pictureType !== type)||(self.data.pictureType === '')){
          wx.showModal({
            title: '提示',
            content: '更改类型将会清空已有的照片,当前类型: '+self.data.pictureType,
            success(resp) {
              if (resp.confirm) {
              	var promiseList = [];
								// 更新照片类型,删除操作放在照片上传页面内，由参数传递进去
								var updateTypePromise = new Promise((resolve,reject)=>{
                  updatePictureTypeUrl(type,self.data.latestDate,self.data.estateIndex,function(res){
										if(res.data.status === 1){
											resolve()
										}else{
											reject()
										}
									})
								});

								promiseList.push(updateTypePromise)
								Promise.all([promiseList]).then((result)=>{
									//更新照片类型
									self.setData({
										pictureType:type
									})
									// 页面跳转
                  self.switchToPictureUploadPage(type,true)
								},()=>{
                  wx.showToast({
                    title:'操作出错!',
                    icon:'none',
                    duration: 2000
                  });
								})

              } else if (resp.cancel) {}
            }
          })
				}else{
					//类型一样,直接跳转到照片页面内
          self.switchToPictureUploadPage(type,false)
				}
      }
    })
	},

	// 前往照片页面,第二个参数是是否删除已有照片
	switchToPictureUploadPage: function(type,isDelete){
    let queryObj = {
    	isDelete:isDelete,
      type:type,
      estateIndex:this.data.estateIndex,
      estateDate:this.data.latestDate,
      estateArea:this.data.estateDetailObj.area,
      estateRoadNumber:this.data.estateDetailObj.roadNumber,
      estatePosition:this.data.estateDetailObj.roadNumber+this.data.estateDetailObj.detailPosition
    };
    let queryStr = formatQueryString(queryObj);
    wx.navigateTo({
      url:'/pages/pictureUpload/pictureUpload?'+queryStr
    })
	},

	// 看房时间选择
	bindVisitTimeChange: function(e){
		this.setData({
			visitTime:e.detail.value
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
			key: config.qqMapKey
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