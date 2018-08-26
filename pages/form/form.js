// pages/form/form.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    estateIndex:'',
    estateDate:'',
    //测试数据
    facilityCheckboxData:[
      {
        name:'平层阳台',
        value:'平层阳台',
        checked:true
      },
			{
				name:'挑高阳台',
				value:'挑高阳台',
				checked:false,
			},
			{
				name:'花园',
				value:'花园',
				checked:false
			},
			{
				name:'平层阳台1',
				value:'平层阳台1',
				checked:false
			},
			{
				name:'挑高阳台1',
				value:'挑高阳台1',
				checked:false
			},
			{
				name:'花园1',
				value:'花园1',
				checked:true
			},
			{
				name:'平层阳台2',
				value:'平层阳台2',
				checked:false
			},
			{
				name:'挑高阳台2',
				value:'挑高阳台2',
				checked:false
			},
			{
				name:'花园2',
				value:'花园2',
				checked:false
			}
    ],
		estateProperty:[
			{
				name:'商品房',
				value:'商品房',
				checked:true
			},
			{
				name:'房改房',
				value:'房改房',
				checked:false,
			},
			{
				name:'安置房',
				value:'安置房',
				checked:false
			},
		],
		estatePos:{
    	checked:true,
			trueLabel:'一致',
			falseLabel:'不一致'
		},
		//输入框的测试数据
		totalFloor:5,
		//户型结构的测试数据
		structureData:'2,1,0;1,2,3;3,,'


  },
  //处理复选框的逻辑
	handleCheckboxChange: function(e){
    let changedValue = e.detail.changedValue,
        parentKey = e.detail.parentKey;
    //根据parentKey更新对应的checkbox的数据
    if(parentKey){
      //获取data中保存的复选框数据
      let originCheckboxData = this.data[parentKey];
      originCheckboxData.forEach((item)=>{
        item.checked = false;
				changedValue.forEach((newItem)=>{
				  if(newItem===item.value){
				    item.checked = true;
          }
        })
      });
      //注意这里用了es6计算属性计算出data中实际的key
      this.setData({
        [parentKey]:originCheckboxData
      })
    }
  },
	//处理单选框的逻辑
	handleRadioChange: function(e){
		let changedValue = e.detail.changedValue,
				parentKey = e.detail.parentKey;
		if(parentKey){
			//获取data中保存的单选框数据
			let originRadioData = this.data[parentKey];
			originRadioData.forEach((item)=>{
				item.checked = changedValue === item.value
			});
			this.setData({
				[parentKey]:originRadioData
			})

			//更新最终要存入数据库的值



		}
	},
	//处理switch滑块的逻辑
	handleSwitchChange: function(e){
		let changedValue = e.detail.changedValue,
				parentKey = e.detail.parentKey;
		if(parentKey) {
			let originSwitchData = this.data[parentKey];
			originSwitchData.checked = changedValue;
			this.setData({
				[parentKey]:originSwitchData
			})


		}
	},

	//处理输入框的逻辑
	handleInputChange: function(e){
		let changedValue = e.detail.changedValue,
				parentKey = e.detail.parentKey;
		if(parentKey){
			this.setData({
				[parentKey]:changedValue
			})
		}
	},

	//处理户型结构的逻辑
	handleStructureChange: function(e){
		let changedValue = e.detail.changedValue,
				parentKey = e.detail.parentKey;
		if(parentKey){
			this.setData({
				[parentKey]:changedValue
			});
			console.log(changedValue)
		}
	},

  //页面初始化
  initData: function(options){
		this.setData({
			estateIndex:options.estateIndex,
			estateDate:options.estateDate
		})
  },

  //从后台获取本单已有的数据
  getFormDataFromServer: function(){

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