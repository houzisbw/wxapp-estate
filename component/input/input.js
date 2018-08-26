// component/input/input.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //输入框类型,默认text类型
    inputType:{
      type:String,
      value:'text'
    },
    //传入输入框的默认值
    value:{
      type:String,
      value:''
    },
		//该input数据从属的key,指明数据属于哪个字段
		parentKey:{
			type:String,
			value:''
		},
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
    //将input的值传递给父组件
    trigger: function(value){
			var myEventDetail = {
				changedValue:value,
				parentKey:this.data.parentKey
			};
			var myEventOption = {};
			//将组件内更新的单选数据传递到父组件
			this.triggerEvent('inputchange', myEventDetail, myEventOption)
    },
    //处理输入框input事件
		handleOnInput: function(e){
      let value = e.detail.value;
      this.trigger(value)

    },
    //处理输入框清空按钮
		handleTap: function(){
      this.trigger('');
    }
  }
})
