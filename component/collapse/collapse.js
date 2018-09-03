// component/collapse/collapse.js
//手风琴折叠组件
Component({
  //组件间的关系,用于通信
  relations:{
    './collapse-item/collapse-item':{
      type:'child'
    }
  },
  /**
   * 组件的属性列表
   */
  properties: {

    // activeItemName:{
    //   type:String,
    //   value:'1'
    // }
  },

  /**
   * 组件的初始数据
   */
  data: {
		//当前激活的子面板的名字,名字从1开始递增
		activeItemName:'0'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //处理子选项激活项变化
    _handleActiveNameChange: function(activeItemName,isActive){
      //获取所有子组件
      let childCollapseItems = this.getRelationNodes('./collapse-item/collapse-item');
      //对于每个子组件调用其方法进行设置子组件的isActive(是否收起面板)
			childCollapseItems.forEach((item)=>{
			  let itemName = item.data.name;
			  let is = itemName === activeItemName;
				//如果点击的是上次相同的子组件则toggle该子组件
        if(itemName === activeItemName){
					item._setIsActive(!isActive)
        }else{
					item._setIsActive(is);
        }
      });
			this.setData({
				activeItemName:activeItemName
			})
    }

	}
})
