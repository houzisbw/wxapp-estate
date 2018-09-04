// component/radio/radio.js
Component({
  /**
   * 组件的属性列表
   */
  //这些数据可通过this.data获取
  properties: {
		//用户传入的option数据，用于渲染单选框
		options:{
			type:Array,
			value:[]
		},
		//该radio数据从属的key,指明数据属于哪个字段
		parentKey:{
			type:String,
			value:''
		},
		//是否有其他选项，默认无
		hasOther:{
			type:Boolean,
			value:false
		},
		//其他项是否选中
		otherRadioHasChecked:{
			type:Boolean,
			value:false
		},
		//输入框初始值
		inputInitialValue:{
			type:String,
			value:''
		}
  },

  /**
   * 组件的初始数据
   */
  data: {
  	//其他选项的checked状态
		otherRadioChecked:false,
		inputFocus:false,
		inputValue:''

  },

	ready: function(){
  	this.setData({
			otherRadioChecked:this.data.otherRadioHasChecked
		})
	},
  /**
   * 组件的方法列表
   */
  methods: {
		onRadioChange: function(e){
		  let value = e.detail.value;
			//需要判断otherRadioValue是否存在，如果存在则表示其他项被选中，然后就是trigger输入框的值
		  let hasOtherRadio = value === 'otherRadioValue';
		  if(hasOtherRadio){
				this.setData({
					otherRadioChecked:true,
					inputFocus:true
				})
			}else{
				this.setData({
					otherRadioChecked:false,
					inputFocus:false
				})
			}

			var myEventDetail = {
				changedValue:value === 'otherRadioValue'?'':value,
				parentKey:this.data.parentKey
			};
			var myEventOption = {};
			//将组件内更新的单选数据传递到父组件
			this.triggerEvent('radiochange', myEventDetail, myEventOption)
    },
		handleOnInput: function(e){
			let inputValue = e.detail.value;
			var myEventDetail = {
				changedValue:inputValue.replace(';',''),
				parentKey:this.data.parentKey
			};
			var myEventOption = {};
			//将组件内更新的单选数据传递到父组件
			this.triggerEvent('radiochange', myEventDetail, myEventOption)
		},
		//处理输入框失去焦点
		handleBlur: function(e){},
		//处理输入框获得焦点
		handleFocus: function(e){
			let inputValue = e.detail.value;
			var myEventDetail = {
				changedValue:inputValue,
				parentKey:this.data.parentKey
			};
			var myEventOption = {};
			//将组件内更新的单选数据传递到父组件
			this.triggerEvent('radiochange', myEventDetail, myEventOption)
		}
  }
})
