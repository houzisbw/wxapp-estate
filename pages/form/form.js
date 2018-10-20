// pages/form/form.js
//拉取表单结构的数据
var getFormStructureData = require('./../../api/form').getFormStructureData;
var getFormDataFromCorrespondingList = require('./../../api/form').getFormDataFromCorrespondingList;
var saveFormDataToDB = require('./../../api/form').saveFormDataToDB;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    estateIndex:'',
    estateDate:'',
		estatePosition:'',
		estateArea:'',
		//loading标志
		isFormLoading:false,
		//上面数据经过处理后要渲染到wxml的数组
		formDataArrayToRender:[],
		//最终保存到数据库的formData,key为formDataArray的key，value为字符串
		formDataToDB:{},
		//是否在提交中
		isSubmitting:false
  },
	//更新最终要存入数据库的formDataToDB
	updateFormDataToDB: function(parentKey,changedValue){
		let oldFormDataToDB = this.data.formDataToDB;
		oldFormDataToDB[parentKey]=changedValue;
		this.setData({
			formDataToDB:oldFormDataToDB
		})
	},
	//提交表单
	submitForm: function(){
		let self = this;
		//如果正在提交中则返回
		if(this.data.isSubmitting)return
		//将formDataToDB转化为数组保存
  	let dataArray = [];
  	Object.keys(this.data.formDataToDB).forEach((item)=>{
  		let obj = {};
  		obj[item] = this.data.formDataToDB[item];
			dataArray.push(obj)
		});
  	wx.showLoading({
			title:'提交中',
			mask:true
		});
  	this.setData({
			isSubmitting:true
		});
  	//延迟一秒
  	setTimeout(()=>{
			saveFormDataToDB(this.data.estateIndex,this.data.estateDate,dataArray,function(resp){
				if(resp.data.status === 1){
					wx.showToast({
						title: '提交成功!',
						icon:'success',
						duration: 2000
					})
				}else{
					wx.showToast({
						title: '提交失败!',
						image:'/assets/images/icon/toast_warning.png',
						duration: 2000
					})
				}
			},function(){
				wx.showToast({
					title: '提交失败!',
					image:'/assets/images/icon/toast_warning.png',
					duration: 2000
				})
			},function(){
				//回到上一页
				setTimeout(()=>{
					self.setData({
						isSubmitting:false
					});
					wx.hideLoading();
					wx.navigateBack({
						delta: 1
					})
				},500)
			})
		},1000)
	},
  //处理复选框的逻辑
	handleCheckboxChange: function(e){
    let changedValue = e.detail.changedValue,
        parentKey = e.detail.parentKey;
    //根据parentKey更新对应的checkbox的数据
    if(parentKey){
      //获取data中保存的复选框数据
			let oldData = this.data.formDataArrayToRender;
			oldData.forEach((item)=>{
				if(item.key === parentKey){
					let originCheckboxData = item.value;
					originCheckboxData.forEach((it)=>{
						it.checked = false;
						changedValue.forEach((newItem)=>{
							if(newItem===it.value){
								it.checked = true;
							}
						})
					});
					this.setData({
						formDataArrayToRender:oldData
					})
					//更新最终要存入数据库的值
					this.updateFormDataToDB(parentKey,changedValue.join(';'))
				}
			});
    }
  },
	//处理单选框的逻辑
	handleRadioChange: function(e){
		let changedValue = e.detail.changedValue,
				parentKey = e.detail.parentKey;
		if(parentKey){
			//获取data中保存的单选框数据
			let oldData = this.data.formDataArrayToRender;
			oldData.forEach((item)=>{
				if(item.key === parentKey){
					let originRadioData = item.value;
					let isOther = true;
					originRadioData.forEach((it)=>{
						if(changedValue === it.value) isOther = false;
						it.checked = changedValue === it.value
					});
					//如果更新的是输入框的值
					if(isOther){
						item.inputInitialValue = changedValue
					}
					this.setData({
						formDataArrayToRender:oldData
					})

					//更新最终要存入数据库的值
					this.updateFormDataToDB(parentKey,changedValue)
				}
			});

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
			let oldData = this.data.formDataArrayToRender;
			oldData.forEach((item)=>{
				if(item.key === parentKey){
					item.defaultValue = changedValue;
					this.setData({
						formDataArrayToRender:oldData
					})
					//更新最终要存入数据库的值
					this.updateFormDataToDB(parentKey,changedValue)
				}
			})

		}
	},

	//处理户型结构的逻辑
	handleStructureChange: function(e){
		let changedValue = e.detail.changedValue,
				parentKey = e.detail.parentKey;
		if(parentKey){
			let oldData = this.data.formDataArrayToRender;
			oldData.forEach((item)=>{
				if(item.key === parentKey){
					item.value = changedValue;
					this.setData({
						formDataArrayToRender:oldData
					})
					//更新最终要存入数据库的值
					this.updateFormDataToDB(parentKey,changedValue)
				}
			})
		}
	},

  //页面初始化
  initData: function(options){
		this.setData({
			estateIndex:options.estateIndex,
			estateDate:options.estateDate,
			estatePosition:options.estatePosition,
			estateArea:options.estateArea,
			estateRoadNumber:options.estateRoadNumber
		})
  },
	//初始化表单数据
	initForm: function(){
		this.getFormDataFromServer()
	},
  //从后台获取本单已有的数据,首先获取表单结构数据，再获取表单填写的数据
  getFormDataFromServer: function(){
		wx.showLoading({
			title:'努力加载中',
			mask:true
		});
		let self = this;
		self.setData({
			isFormLoading:true
		});
		let promiseOne = new Promise(function(resolve,reject){
			getFormStructureData(function(resp){
				let status = resp.data.status;
				if(status === -1){
					reject()
				}else{
					resolve(resp.data.formStructure)
				}
			},function(){reject()})
		});
		promiseOne.then(function(result){
			//请求成功
			return new Promise(function(res,rej){
				//请求该单的具体表单填写的数据
				getFormDataFromCorrespondingList(
						self.data.estateIndex,
						self.data.estateDate,
						self.data.estateRoadNumber,
						//成功
						function(response){
								let formDataObj = {};
								let formDataArray = response.data.formData;
								formDataArray.forEach((item)=>{
									let key = Object.keys(item)[0];
									formDataObj[key] = item[key];
								});
								//处理一些默认选项(注意首先判断该项是否存在，然后判断该项是否为空)
								formDataObj.realLocation!==undefined && (formDataObj.realLocation===''&&(formDataObj.realLocation = self.data.estatePosition));
								formDataObj.area!==undefined && (formDataObj.area===''&&(formDataObj.area = self.data.estateArea));
								res({
									formStructure:result,
									formData:formDataObj
								})
						},
						//失败
						function(){
							rej();
						}
				);
			})
		},function(){
			wx.showToast({
				title: '读取数据失败!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		}).then(function(result){
				//merge数据，生成最终的表单项用于渲染wxml
				self.mergeFromData(result.formStructure,result.formData)
		},function(){
			wx.showToast({
				title: '读取数据失败!',
				image:'/assets/images/icon/toast_warning.png',
				duration: 2000
			})
		})

  },


	//合并表单数据结构,第一个参数是表单原有的数据结构，第二个是已填的表单数据
	mergeFromData: function(formStructure,formData){
  	  //遍历后台读出的已填好的小程序表单项
			let formDataKeys = Object.keys(formData);
			for(let i=0;i<formDataKeys.length;i++){
					let index,targetKey;
					for(let j=0;j<formStructure.length;j++){
						if(formStructure[j].key === formDataKeys[i]){
							index = j;
							targetKey = formDataKeys[i];
							break;
						}
					}
					this.processFormDataByStrategy(formStructure[index],formData[targetKey])
			}

			//针对form中之前没有的字段进行补充合并
			let formDataToDBKeys = Object.keys(this.data.formDataToDB);
			formStructure.forEach((item,index)=>{
				//如果该字段未被初始化则进行初始化
				if(formDataToDBKeys.indexOf(item.key)===-1){
					this.processFormDataByStrategy(formStructure[index],'')
				}
			});

			//将合并完成的formStructure赋值给formDataArrayToRender进行wxml渲染
			this.setData({
				formDataArrayToRender:formStructure,
				isFormLoading:false
			});

			wx.hideLoading()

	},

	//根据不同合并策略处理表单项
	processFormDataByStrategy: function(targetObj,valueToMerge){
			//如果是输入框组件
			if(targetObj.type === 'input'){
				//直接将value赋值给对应的defaultValue
				targetObj.defaultValue = valueToMerge;
				//更新最终要存入数据库的data字段
				this.updateFormDataToDB(targetObj.key,targetObj.defaultValue)
			}
			//如果是checkbox组件
			else if(targetObj.type === 'checkbox'){
				//需要构建options数组
				let options = [];
				let splittedRange = targetObj.range.split(';');
				//填充复选框所有的可能值
				let splittedCheckboxValue = valueToMerge.split(';');
				//如果存在复选框值已经填充了，获取填充的值
				if(valueToMerge){
					splittedRange.forEach((item)=>{
						if(splittedCheckboxValue.indexOf(item)!==-1){
							options.push({
								name:item,
								value:item,
								checked:true
							})
						}else{
							options.push({
								name:item,
								value:item,
								checked:false
							})
						}
						//更新最终要存入数据库的data字段
						this.updateFormDataToDB(targetObj.key,valueToMerge)
					})
				}else{
					//采用默认值
					let defaultSplitted = targetObj.defaultValue.split(';');
					splittedRange.forEach((item)=>{
						if(defaultSplitted.indexOf(item)!==-1){
							options.push({
								name:item,
								value:item,
								checked:true
							})
						}else{
							options.push({
								name:item,
								value:item,
								checked:false
							})
						}
					});
					//更新最终要存入数据库的data字段
					this.updateFormDataToDB(targetObj.key,targetObj.defaultValue)
				}
				//给targetObj增加options属性
				targetObj.value = options;
			}
			//如果是单选组件
			else if(targetObj.type === 'radio'){

				//需要构建options数组
				let options = [];
				let splittedRange = targetObj.range.split(';');
				//如果用户填了值
				if(valueToMerge){
						//看是否是其他选项的值
						let hasOther = splittedRange.indexOf(valueToMerge) === -1;
						//如果用户填了其他选项(输入框)
						if(hasOther){
								targetObj.otherRadioHasChecked = true;
								targetObj.inputInitialValue = valueToMerge;
								splittedRange.forEach((item)=>{
									options.push({
										name:item,
										value:item,
										checked:false
									})
								})
						}else{
								//如果用户没有填其他选项(输入框)
								targetObj.otherRadioHasChecked = false;
								splittedRange.forEach((item)=>{
									if(item===valueToMerge){
										options.push({
											name:item,
											value:item,
											checked:true
										})
									}else{
										options.push({
											name:item,
											value:item,
											checked:false
										})
									}
								})
						}
						//更新最终要存入数据库的data字段
						this.updateFormDataToDB(targetObj.key,valueToMerge)
				}else{
					//用户没填，用默认值
					targetObj.otherRadioHasChecked = false;
					splittedRange.forEach((item)=>{
						if(item===targetObj.defaultValue){
							options.push({
								name:item,
								value:item,
								checked:true
							})
						}else{
							options.push({
								name:item,
								value:item,
								checked:false
							})
						}
					});
					//更新最终要存入数据库的data字段
					this.updateFormDataToDB(targetObj.key,targetObj.defaultValue)
				}
				//给targetObj增加options属性
				targetObj.value = options;


			}
			//如果是structure组件(加减号那个)
			else if(targetObj.type === 'structure'){
				//用户填了值
				if(valueToMerge){
					targetObj.value = valueToMerge;
				}else{
					//用默认值
					targetObj.value = targetObj.defaultValue;
				}
				this.updateFormDataToDB(targetObj.key,targetObj.value)
			}
	},

	//回到页面顶部
	goToTop: function(){
		wx.pageScrollTo({
			scrollTop: 0,
			duration: 300
		})
	},
	//回到底部
	goToBottom: function(){
		//获取到节点的高度然后再滚动到该高度从而实现触底操作
		wx.createSelectorQuery().select('#form-wrapper').boundingClientRect(function(rect){
			wx.pageScrollTo({
				scrollTop: rect.height,
				duration: 300
			})
		}).exec()
	},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		this.initData(options)
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
		this.initForm();
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