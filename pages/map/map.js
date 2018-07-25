// pages/map/map.js
//拉去首页房屋列表数据的url
var getEstateDataList = require('./../../api/index').getEstateDataList;
//拉去首页其他信息的url
var getOtherInfo = require('./../../api/index').getOtherInfo;
//map的sdk
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqMapSDK;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //地图默认纬度
		latitude:30.658292,
		//地图默认经度
		longitude:104.066448,
    //地图默认缩放等级
    mapScale:12,
    //个人信息
    userInfo:{},
    //房屋列表数据
		estateListData:[],
    //地图markers
    estateMarkers:[],
		//当前点击的房屋序号
		currentTapIndex:'',
		//当前点击的房屋地址
		currentTapPosition:'',
		//当前房屋是否访问
		currentIsVisit:false,
		//是否是初始状态
		isInitialState:true,
		//是否处于地址获取中
		isInLocationSearching:false,
		//已看数量
		visitedNum:'',
		unvisitedNum:''
    //需要缓存房屋坐标，防止多次请求腾讯api

  },
  //初始化地图数据
  initMapData(){
    var username = wx.getStorageSync('username');
		var self = this;
    //数据初始化
		self.setData({
			isInitialState:true,
			currentTapIndex:'',
			//当前点击的房屋地址
			currentTapPosition:'',
			//当前房屋是否访问
			currentIsVisit:false,
			visitedNum:'',
			unvisitedNum:'',
			//这里得重置数组，否则数组会数据叠加
			estateListData:[],
			//地图markers
			estateMarkers:[],
		});
		var promise = new Promise(function(resolve,reject){
			getOtherInfo(username,function(res){
				let status = res.data.status;
				if(status === 1){
					var data = res.data;
					resolve(data);
				}else if(status===-1){
				  reject();
				}
			},function(){
				reject();
			})
    });
		promise.then(function(data){
		  self.setData({
        userInfo:data
      });
      //获取房屋列表
      return new Promise(function(resolve,reject){
				getEstateDataList(0,username,function(res2){
					var status = res2.data.status;
					if(status === -2){
					  reject(-2);
					}else if(status === -1){
						reject(-1);
					}else if(status === 0){
						reject(0);
					}else{
						//数据获取成功
            resolve(res2.data.estateData.estateData)
					}
				},function(err){
				  reject(-1)
				},function(){
					//complete
				})
      })
    },function(){
			wx.showToast({
				title: '数据读取错误!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
    }).then(function(res){
			self.setData({
				estateListData:res
			})
      //根据房屋列表获取每个房屋的经纬度信息,此处并发量5次/秒,需要特殊处理
      var promiseList = [];
			res.forEach(function(item){
			  var positionPromise = new Promise(function(resolve,reject){
					qqMapSDK.geocoder({
						address: '成都市'+item.estateRoadNumber,
						success: function(res) {
							//调用成功
							if(res.status===0){
                var lat = res.result.location.lat,
                    lng = res.result.location.lng;
                resolve({
                  targetLatitude:lat,
                  targetLongitude:lng,
                  index:item.estateIndex,
									isVisit:item.isVisit,
									roadNumber:item.estateRoadNumber
                })
							}else{
								wx.showToast({
									title: '地址解析错误!',
									image:'/assets/images/icon/toast_warning.png',
									duration: 2000
								})
							}
						},
						fail: function() {reject()},
						complete: function(res) {}
					});
        })
        promiseList.push(positionPromise)
      });
			//全部地址解析完成,如果调用超出5次/秒，返回undefined
			var visitedNum = 0 ,unvisitedNum = 0;
      Promise.all(promiseList).then((result)=>{
        var markerList = [];
        result.forEach((item,index)=>{
        	item.isVisit?visitedNum++:unvisitedNum++;
          var marker = {
						iconPath: item.isVisit?"/assets/images/icon/estate_visited_marker.png":'/assets/images/icon/estate_marker.png',
						id: item.index,
						latitude: item.targetLatitude,
						longitude: item.targetLongitude,
						width: 45,
						height: 45,
						alpha:1
          };
          markerList.push(marker)
        });
        self.setData({
					estateMarkers:self.data.estateMarkers.concat(markerList),
					visitedNum:visitedNum,
					unvisitedNum:unvisitedNum
        })
      })

    },function(status){
      if(status===-2){
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
      }else if(status ===0){
				//数据为空
				wx.showToast({
					title: '没有查询到记录!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
      }

    })

  },
	//地图上marker点击回调
	markerTap: function(e){
		var markerId = e.markerId;
		//如果点击到自己位置的marker
		if(markerId==-1){
			return
		}
		this.setData({
			isInitialState:false
		});
		//根据markerId找到对应的房屋数据
		this.data.estateListData.forEach((item)=>{
			//可以隐式转换字符串为数字
			if(item.estateIndex == markerId){
				this.setData({
					currentIsVisit:item.isVisit,
					currentTapIndex:item.estateIndex,
					currentTapPosition:item.estateRoadNumber
				})
			}
		});
	},
	//地图被点击
	mapOnTap: function(){
		this.setData({
			isInitialState:true,
		})
	},

	//点击导航
	navigate: function(e){
		if(this.data.isInLocationSearching){
			return;
		}
		var self = this;
		this.setData({
			isInLocationSearching:true
		});
		var estateIndex = e.currentTarget.dataset.index;
		//根据index获取目标地址
		var targetPos = '';
		this.data.estateListData.forEach((item)=>{
			if(item.estateIndex == estateIndex){
				targetPos = item.estateRoadNumber;
			}
		});
		var lat,lng;
		qqMapSDK.geocoder({
			address: '成都市'+targetPos,
			success: function(res) {
				//调用成功
				if(res.status===0){
					lat = res.result.location.lat;
					lng = res.result.location.lng;
					//调用微信内置地图进行导航
					wx.openLocation({
						latitude:lat,
						longitude:lng
					})
				}else{
					wx.showToast({
						title: '地址解析错误!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					})
				}
			},
			fail: function() {},
			complete: function(res) {
				self.setData({
					isInLocationSearching:false
				});
			}
		});
	},
	//获取自己的当前位置
	getOwnPosition(){
		var self = this;
		wx.getLocation({
			type:'gcj02',
			success:function(res){
				var latitude = res.latitude;
				var longitude = res.longitude;
				//id为特殊值-1代表自己
				var selfMarker = {
					iconPath: "/assets/images/icon/my-pos.png",
					id: -1,
					latitude: latitude,
					longitude: longitude,
					width: 30,
					height:30,
					alpha:1
				};
				self.setData({
					estateMarkers:self.data.estateMarkers.concat([selfMarker])
				})
			},
			fail:function(){
				wx.showToast({
					title: '位置获取失败!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
			}
		})
	},

	//位置复位按钮
	resetPosition: function(){
		this.setData({
			//地图默认纬度
			latitude:30.658292,
			//地图默认经度
			longitude:104.066448,
			scale:16
		})
	},

	//智能路线按钮
	showSmartRouteStrategy :function(){
		var self = this;
		//判断房屋个数是否大于10个
		if(this.data.estateListData.length>10){
			wx.showToast({
				title: '房屋数量过多!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
			return
		}
		wx.showActionSheet({
			itemList: ['计算公交看房最短路径', '计算骑行看房最短路径', '计算驾车看房最短路径'],
			success: function(res) {
				self.caculateSmartRouting(res.tapIndex);
			},
			fail: function(res) {
				//wx.showActionSheet 点击取消或蒙层时，回调 fail
			}
		})
	},
	//处理智能路线计算
	caculateSmartRouting: function(index){
		//加上toast表明正在计算中

	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		//初始化地图sdk
		qqMapSDK = new QQMapWX({
			key: '5RQBZ-3YO6I-HAGGQ-5T5BU-5RNHK-NIF3N'
		});
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
		this.initMapData();
		this.getOwnPosition();
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