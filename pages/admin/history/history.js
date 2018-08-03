// pages/admin/history/history.js
var getStaffList = require('./../../../api/admin/index').getStaffList;
var getTimeFromServer = require('./../../../api/admin/index').getTimeFromServer;
var getEstateGraphData = require('./../../../api/admin/index').getEstateGraphData;
var echarts = require('./../../_echarts/ec-canvas/echarts');

let chart = null;

function initChart(canvas, width, height) {
	chart = echarts.init(canvas, null, {
		width: width,
		height: height
	});
	canvas.setChart(chart);

	var option = {
		color: ['#37a2da', '#32c5e9', '#67e0e3'],
		tooltip: {
			trigger: 'axis',
			axisPointer: {            // 坐标轴指示器，坐标轴触发有效
				type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
			}
		},
		legend: {
			data: ['热度', '正面', '负面']
		},
		grid: {
			left: 20,
			right: 20,
			bottom: 15,
			top: 40,
			containLabel: true
		},
		xAxis: [
			{
				type: 'value',
				axisLine: {
					lineStyle: {
						color: '#999'
					}
				},
				axisLabel: {
					color: '#666'
				}
			}
		],
		yAxis: [
			{
				type: 'category',
				axisTick: { show: false },
				data: ['汽车之家', '今日头条', '百度贴吧', '一点资讯', '微信', '微博', '知乎'],
				axisLine: {
					lineStyle: {
						color: '#999'
					}
				},
				axisLabel: {
					color: '#666'
				}
			}
		],
		series: [
			{
				name: '热度',
				type: 'bar',
				label: {
					normal: {
						show: true,
						position: 'inside'
					}
				},
				data: [300, 270, 340, 344, 300, 320, 310],
				itemStyle: {
					// emphasis: {
					//   color: '#37a2da'
					// }
				}
			},
			{
				name: '正面',
				type: 'bar',
				stack: '总量',
				label: {
					normal: {
						show: true
					}
				},
				data: [120, 102, 141, 174, 190, 250, 220],
				itemStyle: {
					// emphasis: {
					//   color: '#32c5e9'
					// }
				}
			},
			{
				name: '负面',
				type: 'bar',
				stack: '总量',
				label: {
					normal: {
						show: true,
						position: 'left'
					}
				},
				data: [-20, -32, -21, -34, -90, -130, -110],
				itemStyle: {
					// emphasis: {
					//   color: '#67e0e3'
					// }
				}
			}
		]
	};

	chart.setOption(option);
	return chart;
}

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
    //起始日期选择器的年月日数组
    startTimeYears:[],
		startTimeMonth:[],
    startTimeDay:[],
		//起始日期是否显示
		isStartTimeShow:false,
		//是否正在获取时间
		isFetchingTime:false,
		//服务端获取到的时间对象
		dateObj:{},
		//起止日期
		startTimeDate:'',
		endTimeDate:'',
		//起始日期的年月日选中的结果
		startTimeYearResult:'',
		startTimeMonthResult:'',
		startTimeDayResult:'',
		//结束日期的年月日选中结果
		endTimeYearResult:'',
		endTimeMonthResult:'',
		endTimeDayResult:'',
		//是否展示终止时间选择器
		isShowEndTimeSelector:false,
		//最终发给后台的起始终止日期字符串,默认本周
		finalStartTimeStr:'',
		finalEndTimeStr:'',
		//最终发给后台的人员列表,默认全部人(空字符串代表全部人)
		finalStaffName:'',
		//最终发给后台的图表类型,分为house,staff 2种
		finalChartType:'house',
		/** echarts 相关**/
		ec: {
			onInit: initChart
		}

  },
  //日期选择器change
	bindTimeSelectorChange: function(e){
    this.setData({
			timeSelectedIndex:e.detail.value
    })
    //如果选择的是自选(对应0)则弹框指引用户先选择起始日期，再选择结束日期
    if(e.detail.value==='0'){
    	this.setData({
				isStartTimeShow:true
			})
			//获取时间
			this.getTodayTimeFromServer()
		}else if(e.detail.value==='1'){
    	this.initThisWeekTime();
		}else if(e.detail.value==='2'){
			this.initThisMonthTime();
		}
  },
  //图表选择器change
	bindChartSelectorChange: function(e){
		var index = parseInt(e.detail.value,10);
		this.setData({
			chartSelectedIndex:index,
			finalChartType:index===0?'house':'staff'
		})
  },
  //人员选择器change
	bindStaffSelectorChange: function(e){
		var index = parseInt(e.detail.value,10);
		this.setData({
			staffSelectedIndex:e.detail.value,
			finalStaffName:index===0?'':this.data.staffNameList[index]
		})

  },
	//初始化日期为本月
	initThisMonthTime(){
		//本月，今天到之前最近的1号
		let finalStartTimeStr='',finalEndTimeStr='';
		let d = new Date();
		finalEndTimeStr = d.getFullYear()+'-'
				+((d.getMonth()+1)<10?('0'+(d.getMonth()+1)):(d.getMonth()+1))
				+'-'+d.getDate();
		d.setDate(1);
		finalStartTimeStr = d.getFullYear()+'-'+
				((d.getMonth()+1)<10?('0'+(d.getMonth()+1)):(d.getMonth()+1))
				+'-'+d.getDate();
		this.setData({
			finalStartTimeStr:finalStartTimeStr,
			finalEndTimeStr:finalEndTimeStr
		})
	},
	//初始化日期为本周
	initThisWeekTime(){
		let finalStartTimeStr='',finalEndTimeStr='';
		//本周,今天到之前最近的周一
		let d = new Date();
		finalEndTimeStr = d.getFullYear()+'-'
				+((d.getMonth()+1)<10?('0'+(d.getMonth()+1)):(d.getMonth()+1))
				+'-'+d.getDate();
		//判断是否是周末
		var isWeekend = d.getDay() === 0 || d.getDay()=== 6;
		if(isWeekend){
			d.setDate(d.getDate()-(d.getDay()===0?6:5))
		}else{
			//回退至本周一
			d.setDate(d.getDate()-(d.getDay()-1))
		}
		finalStartTimeStr = d.getFullYear()+'-'+
				((d.getMonth()+1)<10?('0'+(d.getMonth()+1)):(d.getMonth()+1))
				+'-'+d.getDate();
		this.setData({
			finalStartTimeStr:finalStartTimeStr,
			finalEndTimeStr:finalEndTimeStr
		})
	},
	//初始化最终起止日期
	initStartEndTimeStr(){
		this.initThisWeekTime();
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
	//点击自选按钮后从服务器获取今天的时间,不能从客户端获取，防止用户修改手机时间
	getTodayTimeFromServer(){
  	var self = this;
		self.setData({
			isFetchingTime:true
		})
		getTimeFromServer(function(res){
			var date = res.data.dateObj;
			var startTimeDate = res.data.startTimeDate;
			var endTimeDate = res.data.endTimeDate;
			var yearList = Object.keys(date)
			var monthList = Object.keys(date[yearList[0]])
			var dayList = [];
			//初始显示最早的月份，从startTimeDate开始
			for(var i=startTimeDate;i<=date[yearList[0]][monthList[0]];i++){
				dayList.push(i)
			}
			self.setData({
				startTimeYears:yearList,
				startTimeMonth:monthList,
				startTimeDay:dayList,
				dateObj:date,
				startTimeDate:startTimeDate,
				endTimeDate:endTimeDate,
				//初始化选择结果
				startTimeYearResult:yearList[0],
				startTimeMonthResult:monthList[0],
				startTimeDayResult:dayList[0],
				endTimeYearResult:yearList[0],
				endTimeMonthResult:monthList[0],
				endTimeDayResult:dayList[0],
			})
		},function(){
			wx.showToast({
				title: '时间获取失败!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
			wx.redirectTo({
				url:'/pages/admin/history/history'
			})
		},function(){
				self.setData({
					isFetchingTime:false
				})
		})
	},
	//处理时间选择器日期改变,type:0表示起始日期，1为结束日期
	bindStartTimePickerViewChange: function(e){
		//valueArray[0,0,0]对应年月日的index值
		var valueArray = e.detail.value;
		//改变后的月份列表
		var changedMonthList = Object.keys(this.data.dateObj[this.data.startTimeYears[valueArray[0]]]);
		var changedDayNum = this.data.dateObj[this.data.startTimeYears[valueArray[0]]][changedMonthList[valueArray[1]]];
		var changedDayList = []
		if(valueArray[1]===changedMonthList.length-1 && valueArray[0]===this.data.startTimeYears.length-1){
			//如果是选择了最后一个月份且是最后一年,天数从1开始到endTimeDate
			for(var i=1;i<=this.data.endTimeDate;i++){
				changedDayList.push(i)
			}
		}else if(valueArray[1]===0 && valueArray[0]===0){
			//选择了第一个月份 且 是前一年,天数从startTimeDate到当月末
			for(var i=this.data.startTimeDate;i<=changedDayNum;i++){
				changedDayList.push(i)
			}
		}else{
			//其他月份
			for(var i=1;i<=changedDayNum;i++){
				changedDayList.push(i)
			}
		}
		this.setData({
			startTimeMonth:changedMonthList,
			startTimeDay:changedDayList,
			//设置选中的起始时间
			startTimeYearResult:this.data.startTimeYears[valueArray[0]],
			startTimeMonthResult:changedMonthList[valueArray[1]],
			startTimeDayResult:changedDayList[valueArray[2]]
		})
	},
	//处理时间选择器日期改变,type:0表示起始日期，1为结束日期
	bindEndTimePickerViewChange: function(e){
		//valueArray[0,0,0]对应年月日的index值
		var valueArray = e.detail.value;
		//改变后的月份列表
		var changedMonthList = Object.keys(this.data.dateObj[this.data.startTimeYears[valueArray[0]]]);
		var changedDayNum = this.data.dateObj[this.data.startTimeYears[valueArray[0]]][changedMonthList[valueArray[1]]];
		var changedDayList = []
		if(valueArray[1]===changedMonthList.length-1 && valueArray[0]===this.data.startTimeYears.length-1){
			//如果是选择了最后一个月份且是最后一年,天数从1开始到endTimeDate
			for(var i=1;i<=this.data.endTimeDate;i++){
				changedDayList.push(i)
			}
		}else if(valueArray[1]===0 && valueArray[0]===0){
			//选择了第一个月份 且 是前一年,天数从startTimeDate到当月末
			for(var i=this.data.startTimeDate;i<=changedDayNum;i++){
				changedDayList.push(i)
			}
		}else{
			//其他月份
			for(var i=1;i<=changedDayNum;i++){
				changedDayList.push(i)
			}
		}
		this.setData({
			startTimeMonth:changedMonthList,
			startTimeDay:changedDayList,
			//设置选中的起始时间
			endTimeYearResult:this.data.startTimeYears[valueArray[0]],
			endTimeMonthResult:changedMonthList[valueArray[1]],
			endTimeDayResult:changedDayList[valueArray[2]]
		})
	},
	//点击确定选择起始时间
	selectStartTime: function(){
		//如果正在获取时间则禁止点击确认
		if(this.data.isFetchingTime){
			return
		}
		//显示终止时间选择器
		this.setData({
			isShowEndTimeSelector:true
		})
	},
	//开始日期修正
	modifyStartDate: function(year,month,day){
		var d = new Date(year,month-1,day);
		//判断是否是周末
		var isWeekend = d.getDay() === 0 || d.getDay()=== 6;
		if(isWeekend){
			//前进至下周一
			d.setDate(d.getDate()+(d.getDay()===0?1:2))
		}else{
			//回退至本周一
			d.setDate(d.getDate()-(d.getDay()-1))
		}
		return {
			year:d.getFullYear(),
			month:d.getMonth()+1,
			day:d.getDate()
		}
	},
	//结束日期修正
	modifyEndDate: function(year,month,day){
		var d = new Date(year,month-1,day);
		//判断是否是周末
		var isWeekend = d.getDay() === 0 || d.getDay()=== 6;
		if(isWeekend){
			//后退到周五
			d.setDate(d.getDate()-(d.getDay()===0?2:1))
		}else{
			//前进至最近的周五
			d.setDate(d.getDate()+5-d.getDay())
		}
		return {
			year:d.getFullYear(),
			month:d.getMonth()+1,
			day:d.getDate()
		}
	},
	//选择结束时间
	selectEndTime: function(){
		//如果正在获取时间则禁止点击确认
		if(this.data.isFetchingTime){
			return
		}
		//判断终止时间是否大于等于起始时间
		var isValid = this.checkTimeIsCorrect(
				this.data.startTimeYearResult,this.data.startTimeMonthResult,this.data.startTimeDayResult,
				this.data.endTimeYearResult,this.data.endTimeMonthResult,this.data.endTimeDayResult
		);
		if(!isValid){
			wx.showToast({
				title: '时间选择非法!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
			return
		}
		//计算修正后的日期
		var modifiedStartDate = this.modifyStartDate(
				this.data.startTimeYearResult,
				this.data.startTimeMonthResult,
				this.data.startTimeDayResult);
		var modifiedEndDate = this.modifyEndDate(
				this.data.endTimeYearResult,
				this.data.endTimeMonthResult,
				this.data.endTimeDayResult);
		//计算最终时间字符串
		var finalStartTimeStr = modifiedStartDate.year +'-'
				+(modifiedStartDate.month<10?('0'+modifiedStartDate.month):modifiedStartDate.month) +'-'
				+modifiedStartDate.day;
		var finalEndTimeStr = modifiedEndDate.year +'-'
				+(modifiedEndDate.month<10?('0'+modifiedEndDate.month):modifiedEndDate.month) +'-'
				+modifiedEndDate.day;
		this.setData({
			isFetchingTime:false,
			isShowEndTimeSelector:false,
			isStartTimeShow:false,
			finalStartTimeStr:finalStartTimeStr,
			finalEndTimeStr:finalEndTimeStr
		})
	},
	//检查时间是否正确
	checkTimeIsCorrect(s1,s2,s3,e1,e2,e3){
		var startDate = new Date(s1,s2,s3);
		var endDate = new Date(e1,e2,e3);
		return startDate.getTime()<=endDate.getTime()
	},
	//生成统计图
	generateGraph: function(){
		getEstateGraphData(
				this.data.finalChartType,
				this.data.finalStartTimeStr,
				this.data.finalEndTimeStr,
				this.data.finalStaffName,
		function(res){
			//请求成功
			if(res.data.status === 1){
				console.log(res.data.dataArray)
			}else if(res.data.status === -1){

			}else{
				//结果为空
			}
		},function(){
			//请求失败
		},function(){
			//请求完成
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
		this.getStaffNameList();
		this.initStartEndTimeStr();
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