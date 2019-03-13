// component/collapse/collapse-item/collapse-item.js
//手风琴组件的子组件
Component({
  //组件间关系
  relations:{
    '../collapse':{
      type:'parent'
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {
    //子组件标题
    title:{
      type:String,
      value:''
    },
    //子组件的唯一标识符
    name:{
      type:String,
      value:'1'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    //当前子组件是否展开状态
    isActive:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //处理子组件header点击事件
	handleHeaderTap: function(){
		  //获取父组件Collapse节点
      let nodeList = this.getRelationNodes('../collapse');
			let parentCollapseNode = nodeList.length>0?nodeList[0]:null;
			//调用父组件的方法更新其activeItemName
      if(parentCollapseNode){
				parentCollapseNode._handleActiveNameChange(this.data.name,this.data.isActive)
      }
    },
    //父组件Collapse调用该方法进行设置isActive
    _setIsActive: function(isActive){
      this.setData({
				isActive:isActive
      })
    }
  }
})
