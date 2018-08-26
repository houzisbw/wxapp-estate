// component/checkbox/checkbox.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //用户传入的option数据，用于渲染复选框
    options:{
      type:Array,
      value:[]
    },
    //该checkbox数据从属的key,指明数据属于哪个字段
    parentKey:{
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
		onCheckBoxChange: function(e){
		  //注意value是选中的checkbox的value
			var myEventDetail = {
			  changedValue:e.detail.value,
        parentKey:this.data.parentKey
			};
			var myEventOption = {};
			//将组件内更新的checkbox数据传递到父组件内
			this.triggerEvent('checkboxchange', myEventDetail, myEventOption)
    }
  }
})
