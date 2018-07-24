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
    estateMarkers:[]
    //需要缓存房屋坐标，防止多次请求腾讯api

  },
  //初始化地图数据
  initMapData(){
    var username = wx.getStorageSync('username');
		var self = this;
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
                  index:item.estateIndex
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
      Promise.all(promiseList).then((result)=>{
        var markerList = [];
        result.forEach((item,index)=>{
          var marker = {
						iconPath: "/assets/images/icon/estate_marker.png",
						id: index,
						latitude: item.targetLatitude,
						longitude: item.targetLongitude,
						width: 45,
						height: 45
          }
          markerList.push(marker)
        });
        self.setData({
					estateMarkers:markerList
        })
      }).catch((error) => {
				wx.showToast({
					title: '地址解析错误!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('mappage onload')
		//初始化地图sdk
		qqMapSDK = new QQMapWX({
			key: '5RQBZ-3YO6I-HAGGQ-5T5BU-5RNHK-NIF3N'
		});
    this.initMapData()
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
		console.log('mappage onshow')
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