// component/estate-data-state/estate-data-state.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    //价格
    price:{
      type:Number,
      value:0
    },
    //是否出预评
    hasPreAssessment:{
      type:Boolean,
      value:false
    },
    //是否看房
    isVisit:{
      type:Boolean,
      value:false
    },
    //反馈信息
    feedback:{
      type:String,
      value:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //状态所显示的文字
    text:'',
    //未看且未处理状态
    isUnProcessedState:false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取状态文本
    getStateText:function(){
      //已报价 且 已出
      if(this.data.price!==0 && this.data.hasPreAssessment){
        return '已出:'+this.data.price+'元/m2'
      }
      //已报价 且 未出
      if(this.data.price!==0 && !this.data.hasPreAssessment){
				return '已报价:'+this.data.price+'元/m2'
      }
      //未报价 且 已出
      if(this.data.price === 0 && this.data.hasPreAssessment){
        return '已出且未报价'
      }

      //以下是未报价且未出的情况
      //已看
      if(this.data.isVisit){
        return '已看'
      }
			this.setData({
				isUnProcessedState:true
			});
      //未看
      if(!this.data.isVisit && this.data.feedback!==''){
        return '未看'
      }
      //未处理
      return '未处理'
    }
  },

	/**
	 * 组件生命周期函数，在组件布局完成后执行
	 */
	ready:function(){
	  /*初始化状态文本*/
	  let text = this.getStateText();
	  this.setData({
			text
    })
  }
})
