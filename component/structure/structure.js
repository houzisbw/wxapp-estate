// component/structure/structure.js
//户型结构组件
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //用户传入的户型结构数据
    structureData:{
      type:String,
      value:''
    },
		//该户型结构数据从属的key,指明数据属于哪个字段
		parentKey:{
			type:String,
			value:''
		},
    //该户型最大楼层
    maxFloor:{
      type:Number,
      value:5
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //组件内房屋结构的数据，一个二维数组
    innerData:[],
		//获得焦点的输入框的index
		focusedInputIndex:-1
  },

  /**
   * 组件的方法列表
   */
  methods: {
		handleOtherInputBlur: function(){
			this.setData({
				focusedInputIndex:-1
			});
		},
  	//其他输入框获得焦点时弹出对话框显示填写规范
		handleOtherInputFocus: function(e){
			wx.showToast({
				title:'填写格式请按照:[数字][内容]，比如 2阳台3储物室',
				duration:3000,
				icon:'none'
			})
		},
    trigger: function(value){
			let myEventDetail = {
				changedValue:value,
				parentKey:this.data.parentKey
			};
			let myEventOption = {};
			//将组件内更新的单选数据传递到父组件
			this.triggerEvent('structureinputchange', myEventDetail, myEventOption)
    },
    //格式化楼层数据
    formatFloorData: function(floorDataArray){
			let newFloorData = floorDataArray.map((item)=>{
				item.forEach((it,idx)=>{
					if(it==='')item[idx]='0';
				});
				return item.join(',')
			});
			return newFloorData.join(';');
    },
		handleInput: function(e){
		  //每个输入框输入变化时都要通知父组件更新自己的值
			//去掉分号和逗号
      let value = e.detail.value.replace(';','').replace(',','');
      //获取该值所在行数
      let row = e.target.dataset.row || 0;
      //获取该值所在列数
      let column = e.target.dataset.column || 0;
      //更新innerData
      let newData = this.data.innerData;
			//newData[row][column] = value?parseInt(value,10):'0';
			newData[row][column] = value;
      //构造更新后的数据
      let newResult = this.formatFloorData(newData);
      //通知父组件自己的值被更新了
      this.trigger(newResult);
    },
    //处理加号的点击
    handleAdd: function(){
			let len = this.data.innerData.length,
          data = this.data.innerData;
		  if(len === this.data.maxFloor) return
      //如果3个数都是0则禁止继续添加
      if(data[len-1][0]==='' && data[len-1][1]==='' && data[len-1][2]==='' && data[len-1][3]===''){
		    wx.showToast({
					title: '请至少填写一项!',
					icon:'none',
					duration: 2000
        });
				return
      }

      let addedData = [['','','','']];
			let newData = this.data.innerData.concat(addedData)
      this.setData({
        innerData:newData
      });
			//更新数据到父组件
			let newResult = this.formatFloorData(newData);
			this.trigger(newResult);
    },
    //处理减号的点击
    handleMinus: function() {
			if (this.data.innerData.length < 2) return
      let newData = this.data.innerData.slice(0, -1)
			this.setData({
				innerData: newData
			});
      //更新数据到父组件
			let newResult = this.formatFloorData(newData);
			this.trigger(newResult)
		},
    //处理失去焦点
		handleBlur: function(e){
      let value = e.detail.value;
			//获取该值所在行数
			let row = e.target.dataset.row || 0;
			//获取该值所在列数
			let column = e.target.dataset.column || 0;
			// if(!value){
			// 	let newData = this.data.innerData;
			// 	newData[row][column]=0;
			// 	this.setData({
			// 		innerData:newData
			// 	})
			// }
    }
  },
	/**
	 * 组件ready方法
	 */
	ready: function(){
    //处理传入的prop:structureData
    let result = [];
    let tempData = this.data.structureData.split(';');
    tempData.forEach((item)=>{
      let floorData = item.split(',');
      floorData.forEach((subItem,index)=>{
      	if(subItem === '0'){
					floorData[index]='';
				}
			});
			//处理最后一项
      if(floorData.length===3){
				floorData.push('')
			}
      result.push(floorData)
    });
    this.setData({
			innerData:result
    })
  }


})
