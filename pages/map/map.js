// pages/map/map.js
//拉去首页房屋列表数据的url
var getEstateDataList = require('./../../api/index').getEstateDataList;
//拉去首页其他信息的url
var getOtherInfo = require('./../../api/index').getOtherInfo;
//配置信息
var config = require('./../../config/config');
//腾讯地图的sdk
var QQMapWX = require('../../lib/qqmap-wx-jssdk.min.js');
var qqMapSDK;
//高德地图
var amapFile = require('../../lib/amap-wx.js');
var myAmapFun;
//util
var secondToHourMinute = require('../../utils/util').secondToHourMinute;
var meterToKM = require('../../utils/util').meterToKM;
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
		unvisitedNum:'',
		//自己当前位置
		selfPosition:{lat:'',lng:''},
		//地图上所有marker的坐标信息对象,key为房屋index，value为经纬度对象
		totalMarkersPositionObj:{},




		/** 智能路线计算相关数据结构 **/

		/**
		 * 邻接矩阵和房屋index的对应关系,注意邻接矩阵的下标0是看房人员当前位置
		 * key:矩阵下标(字符串) value:房屋index(数字)
		 */
		adjacentMatrixToIndexMap:{},
		/**
		 * 当前位置和未看房屋间的邻接矩阵，注意0是当前位置,距离需要通过高德地图api算出
		 * 每个值是[distance,[path]]这样一个数组，第一个值是距离，第二个值是路径数组
		 */
		adjacentMatrix:[],
		//地图上的polyline
		polyline:[],
		//是否开启最佳路线遮罩
		isShowBestRouteOverlay:false,
		//路线详情的数据结构
		pathDetailInfo:[],
		//总路程
		bestDistance:'',
		//总耗时
		pathDuration:''


  },
  //初始化地图数据
  initMapData(){
  	//进入loading
		wx.showLoading({
			title:'数据加载中',
			mask:true
		});
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
			adjacentMatrixToIndexMap:{},
			totalMarkersPositionObj:{},
			polyline:[],
			pathDuration:'',
			bestDistance:'',
			isShowBestRouteOverlay:false
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
			//此处如果房屋数量超过20个(腾讯api的qps上限)则提示用户
			if(res.length>config.tencentQPS){
				wx.showToast({
					title: '房屋数量过多!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
				return
			}
			//初始化邻接矩阵和房屋index的对应关系map
			self.initAdjacentMatrixToIndexMap(res);
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
			var visitedNum = 0 ,unvisitedNum = 0, posObj = {};
      Promise.all(promiseList).then((result)=>{
				wx.hideLoading();
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
          markerList.push(marker);
					posObj[item.index] = {
						lat:item.targetLatitude,
						lng:item.targetLongitude
					};
        });
        self.setData({
					estateMarkers:self.data.estateMarkers.concat(markerList),
					visitedNum:visitedNum,
					unvisitedNum:unvisitedNum,
					totalMarkersPositionObj:posObj
        })
      })
    },function(status){
    	wx.hideLoading();
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
	//初始化邻接矩阵和房屋index的对应关系map
	initAdjacentMatrixToIndexMap: function(res){
  	var tempMap = {},cnt=1;
  	res.forEach((item)=>{
  		//只计算未看房屋
  		if(!item.isVisit){
  			tempMap[cnt++]=item.estateIndex
			}
		});
  	//保存看房人员自己的对应关系
  	tempMap[0] = 0;
		//初始化
		this.setData({
			adjacentMatrixToIndexMap:tempMap
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
					estateMarkers:self.data.estateMarkers.concat([selfMarker]),
					selfPosition:{lat:latitude,lng:longitude}
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
		//缩放视野包含所有点
		let points = [];
		if(this.mapCtx){
			this.data.estateMarkers.forEach((item)=>{
				points.push({
					latitude:item.latitude,
					longitude:item.longitude
				})
			});
			this.mapCtx.includePoints({
				padding:[20],
				points:points
			})
		}
	},

	//智能路线按钮
	showSmartRouteStrategy :function(){
		var self = this,
				len = 0;
		//如果房屋数量过多则提示用户
		if(this.data.estateListData.length>config.tencentQPS){
			wx.showToast({
				title: '房屋数量过多!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
			return
		}
		//只计算未看房屋
		this.data.estateListData.forEach((item)=>{
			if(!item.isVisit){
				len++;
			}
		});
		//判断[未看]房屋个数是否太少，太少则不计算
		if(len < 2){
			wx.showToast({
				title: '房屋数量过少!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
			return
		}
		//判断房屋个数是否大于10个
		if(len>10){
			wx.showToast({
				title: '房屋数量过多!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			});
			return
		}
		wx.showActionSheet({
			itemList: ['计算驾车看房最短路径', '计算骑行看房最短路径'],
			success: function(res) {
				self.caculateSmartRouting(res.tapIndex);
			},
			fail: function(res) {
				//wx.showActionSheet 点击取消或蒙层时，回调 fail
			}
		})
	},
	//旅行商问题动态规划算法
	travelingProblemSolver(adjMatrix){
		//dp表行数
		var houseCount = adjMatrix.length;
		//dp表总列数
		var totalCols = 1<<(houseCount-1);
		//二维dp表，每一项是数组:第一项是距离，第二项是数组，表示经过的路径(起点，终点)
		var dp = [];
		for(let i=0;i<houseCount;i++){
			let temp = [];
			for(let j=0;j<totalCols;j++){
				temp.push([Infinity,[]])
			}
			dp.push(temp)
		}
		//dp第一列初始化
		for(let i=0;i<houseCount;i++){
			//dp[i][0][0] = adjMatrix[i][0][0];
			//由于不需要回到出发点，因此第一列都是0
			dp[i][0][0] = 0;
			dp[i][0][1].push([0,i]);
		}
		//求dp表剩下的列，由第一列递推
		for(var j=1;j<totalCols;j++){
			for(var i=0;i<houseCount;i++){
				//如果已经到过了j，则continue
				if(((j>>(i-1)) & 1) === 1){
					continue;
				}
				//依次遍历k个城市搜寻最短
				for(var k=1;k<houseCount;k++){
					//如果不能到k城市则continue
					if(((j>>(k-1))&1)===0){
						continue;
					}
					if(dp[i][j][0]>adjMatrix[i][k][0]+dp[k][j^(1<<(k-1))][0]){
						dp[i][j][0]=adjMatrix[i][k][0]+dp[k][j^(1<<(k-1))][0];
						//必须slice创建副本,temp是原来已有的路径数组
						let temp = dp[k][j^(1<<(k-1))][1].slice();
						//此处k是起点，i是终点
						temp.push([k,i]);
						dp[i][j][1]=temp;
					}
				}
			}
		}
		var bestPath = dp[0][totalCols-1][1];
		var pathPointsArray = [];
		//此时由于不需要返回出发点，因此需要计算顺时针逆时针看完房屋的总路程，取最短的一个
		//首先顺时针计算路程
		var clockwisePath = [],clockwiseDistance = 0,clockwiseDuration = 0;
		for(let i=0;i<bestPath.length-1;i++){
			let path = bestPath[i];
			clockwiseDistance += this.data.adjacentMatrix[path[0]][path[1]][0];
			clockwiseDuration += this.data.adjacentMatrix[path[0]][path[1]][1];
			clockwisePath.push([path[0],path[1]]);
		}
		//逆时针计算路程
		var antiClockwisePath = [], antiClockwiseDistance = 0, antiClockwiseDurantion = 0;
		for(let i=1;i<bestPath.length;i++){
			let path = bestPath[i];
			antiClockwiseDistance += this.data.adjacentMatrix[path[0]][path[1]][0];
			antiClockwiseDurantion += this.data.adjacentMatrix[path[0]][path[1]][1];
			antiClockwisePath.push([path[0],path[1]]);
		}
		//最佳路径
		var finalBestPath = clockwiseDistance > antiClockwiseDistance ? antiClockwisePath : clockwisePath;
		//耗时计算
		var pathDuration = clockwiseDistance > antiClockwiseDistance ? antiClockwiseDurantion : clockwiseDuration;
		//最短距离
		var bestDistance = clockwiseDistance > antiClockwiseDistance ?antiClockwiseDistance:clockwiseDistance;
		var tempPathDetailInfo = [];
		finalBestPath.forEach((path,index)=>{
			pathPointsArray.push({
				points: this.data.adjacentMatrix[path[0]][path[1]][2],
				color: "#39ac6a",
				width: 7,
				borderColor:'#5b5b5b',
				borderWidth:3
			})
			//路线详情数据结构,用于具体信息展示
			tempPathDetailInfo.push({
				start:this.data.adjacentMatrixToIndexMap[path[1]],
				end:this.data.adjacentMatrixToIndexMap[path[0]],
				duration:secondToHourMinute(this.data.adjacentMatrix[path[0]][path[1]][1]),
				distance:meterToKM(this.data.adjacentMatrix[path[0]][path[1]][0])
			})
		});
		this.setData({
			polyline:pathPointsArray,
			pathDetailInfo:tempPathDetailInfo.reverse(),
			pathDuration:secondToHourMinute(pathDuration),
			bestDistance:meterToKM(bestDistance)
		});
		//隐藏loading
		wx.hideLoading();
	},
	//处理智能路线计算,每次点击都重新计算
	caculateSmartRouting: function(index){
		//进入loading
		wx.showLoading({
			title:'计算中',
			mask:true
		});
		//首先计算出已看房屋和自己位置的邻接矩阵，此处并发调用高德地图的路径服务(分种类)
		var promise = this.initAdjacentMatrix(index);
		promise.then(()=>{
			//通过算法算出最短路径
			this.travelingProblemSolver(this.data.adjacentMatrix)
		});
	},
	//初始化邻接矩阵,只计算未看的房屋
	initAdjacentMatrix(type){
		var self = this;
		return new Promise((resolve,reject)=>{
			//promise的数组
			var promiseList = [];
			//邻接矩阵大小
			var	adjMatrixSize = Object.keys(this.data.adjacentMatrixToIndexMap).length;
			//初始化邻接矩阵，初始值为[Infinity,[]],第二个参数是polyline的points数组(2个点间的实际路径数组)
			var tempMatrix = Array(adjMatrixSize).fill(Infinity).map(()=>Array(adjMatrixSize).fill(Infinity).map(()=>[Infinity,[]]));
			//缓存数组，防止多次请求{i,j},{j,i}
			var cache = {};
			var posObj = this.data.totalMarkersPositionObj;
			//加入自己当前的位置
			posObj[0] = {lat:this.data.selfPosition.lat, lng:this.data.selfPosition.lng};
			for(let i=0;i<adjMatrixSize;i++){
				for(let j=0;j<adjMatrixSize;j++){
					//获取到每2个点间的坐标,且2点不能相同
					if(!cache[i+'-'+j] && i!==j){
						//获取邻接矩阵{i,j}对应的2个点的经纬度
						let origin = posObj[this.data.adjacentMatrixToIndexMap[i]].lng+','+posObj[this.data.adjacentMatrixToIndexMap[i]].lat,
								dest = posObj[this.data.adjacentMatrixToIndexMap[j]].lng+','+posObj[this.data.adjacentMatrixToIndexMap[j]].lat;
						cache[i+'-'+j] = true;
						cache[j+'-'+i] = true;
						//生成promise,计算2点间实际距离和路径数组
						promiseList.push(this.getRouteByType(i,j,type,origin,dest))
					}
				}
			}
			Promise.all(promiseList).then(function(result){
				//填充邻接矩阵
				result.forEach((item)=>{
					//注意矩阵是对称的
					tempMatrix[parseInt(item.i,10)][parseInt(item.j,10)] = [parseInt(item.distance,10),parseInt(item.duration,10),item.path];
					tempMatrix[parseInt(item.j,10)][parseInt(item.i,10)] = [parseInt(item.distance,10),parseInt(item.duration,10),item.path];
				});
				self.setData({
					adjacentMatrix:tempMatrix,
					polyline:[]
				})
				resolve()
			}).catch((error) => {
				wx.hideLoading();
				wx.showToast({
					title: '地址解析出错!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				});
			})
		});
	},

	//不同策略的路径计算
	getRouteByType(row,col,type,origin,dest){
		if(type === 0){
			//驾车
			return new Promise(function(resolve,reject){
				let distance = 1,duration = 0;
				myAmapFun.getDrivingRoute({
					origin: origin,
					destination: dest,
					//策略:距离最短
					strategy:2,
					success: function(data){
						var points = [];
						if(data.paths && data.paths[0] && data.paths[0].steps){
							var steps = data.paths[0].steps;
							for(var i = 0; i < steps.length; i++){
								var poLen = steps[i].polyline.split(';');
								for(var j = 0;j < poLen.length; j++){
									points.push({
										longitude: parseFloat(poLen[j].split(',')[0]),
										latitude: parseFloat(poLen[j].split(',')[1])
									})
								}
							}
						}
						if(data.paths[0] && data.paths[0].distance){
							distance = data.paths[0].distance;
						}
						if(data.paths[0] && data.paths[0].duration){
							duration = data.paths[0].duration;
						}
						resolve({
							i:row,
							j:col,
							distance:distance,
							duration:duration,
							path:points
						})
					},
					fail: function(info){
						reject()
					}
				})
			})
		}else if(type === 1){
			//骑行
			return new Promise(function(resolve,reject){
				let distance = 1,duration = 0;
				myAmapFun.getRidingRoute({
					origin: origin,
					destination: dest,
					success: function(data){
						var points = [];
						//此处官网有误，官网是data.paths[0].rides,其实应该是steps
						if(data.paths && data.paths[0] && data.paths[0].steps){
							var steps = data.paths[0].steps;
							for(var i = 0; i < steps.length; i++){
								var poLen = steps[i].polyline.split(';');
								for(var j = 0;j < poLen.length; j++){
									points.push({
										longitude: parseFloat(poLen[j].split(',')[0]),
										latitude: parseFloat(poLen[j].split(',')[1])
									})
								}
							}
						}
						if(data.paths[0] && data.paths[0].distance){
							distance = data.paths[0].distance;
						}
						if(data.paths[0] && data.paths[0].duration){
							duration = data.paths[0].duration;
						}
						resolve({
							i:row,
							j:col,
							distance:distance,
							duration:duration,
							path:points
						})
					},
					fail: function(info){reject()}
				})
			})
		}
	},

	//展示最佳路径的详情
	showSmartRouteDetail(){
		if(!this.data.bestDistance){
			wx.showModal({
				title:'注意',
				content:'请先计算最短看房路线，再查看具体信息',
				showCancel:false,
				confirmColor:'#39ac6a'
			})
			return
		}
		this.setData({
			isShowBestRouteOverlay:true,
		})
	},
	//关闭最佳路线详情
	closeBestRoute(){
		this.setData({
			isShowBestRouteOverlay:false
		})
	},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		//初始化地图sdk
		qqMapSDK = new QQMapWX({
			key: config.qqMapKey
		});
		myAmapFun = new amapFile.AMapWX({key:config.AMapKey});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
		this.mapCtx = wx.createMapContext('map')
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