// component/slider/slider.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    checked:{
      type:Boolean,
      value:true
    },
    parentKey:{
      type:String,
      value:''
    },
    trueLabel:{
			type:String,
			value:''
    },
    falseLabel:{
			type:String,
			value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
		switchChange: function(e){
		  let value = e.detail.value;
			var myEventDetail = {
				changedValue:value,
				parentKey:this.data.parentKey
			};
			var myEventOption = {};
			//将组件内更新的checkbox数据传递到父组件内
			this.triggerEvent('switchchange', myEventDetail, myEventOption)
    }
  }
})
