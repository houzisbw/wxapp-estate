// pages/pictureUpload/pictureUpload.js
// 获取图片配置信息接口
let getPictureConfigInfo = require('../../api/picture_config').getPictureConfigInfo;
//配置信息
let config = require('../../config/config')
//腾讯云oss的sdk
let COS = require('../../lib/tencent-cos-wx-sdk')

// 签名回调
var getAuthorization = function(options, callback) {
  // 格式四、（不推荐，适用于前端调试，避免泄露密钥）前端使用固定密钥计算签名
  var authorization = COS.getAuthorization({
      SecretId: config.tencentyunSecretId,
      SecretKey: config.tencentyunSecretKey,
      Method: options.Method,
      Pathname: options.Pathname,
      Query: options.Query,
      Headers: options.Headers,
      Expires: 60,
  });
  callback({
      Authorization: authorization,
      // XCosSecurityToken: credentials.sessionToken, // 如果使用临时密钥，需要传 XCosSecurityToken
  });
};

var cos = new COS({
  // path style 指正式请求时，Bucket 是在 path 里，这样用途相同园区多个 bucket 只需要配置一个园区域名
  // ForcePathStyle: true,
  getAuthorization: getAuthorization,
});


Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 房屋index,用于向腾讯云oss上查图片(前缀)
    estateIndex:0,
    // 房屋位置
    estatePosition:'',
    // 配置信息
    configData:[],
    // 模板类型
    type: '',
    //参数
    options:''
  },

  // 获取图片配置信息
  fetchPictureConfig: function(type){
    return new Promise((resolve,reject)=>{
      let self = this;
      getPictureConfigInfo(type,function(resp){
        if(resp.data.status===-1){
          wx.showToast({
            title: '网络错误!',
            image:'/assets/images/icon/toast_warning.png',
            duration: 2000
          });
          reject();
        }else {
          resolve(resp.data.config)
        }
      },function(){
        wx.showToast({
          title:'数据不存在!',
          icon:'none',
          duration: 2000
        });
        reject();
      })
    })

  },

  // 读取腾讯云oss的图片
  readPicturesFromOss: function(){
    return new Promise((resolve,reject)=>{
      cos.getBucket({
        Bucket: config.tencentyunOssBucketName,
        Region: config.tencentyunOssRegion,
        // 房屋index作为查询前缀
        Prefix: this.data.estateIndex+'-',
      }, function (err, data) {
        if(err){
          wx.showToast({
            title:'图片读取失败!',
            icon:'none',
            duration: 2000
          });
          reject();
        }else{
          let keyArray = [];
          data.Contents.forEach((item)=>{
            keyArray.push(item.Key)
          });
          if(keyArray.length === 0){
            wx.showToast({
              title:'未上传图片!',
              icon:'none',
              duration: 2000
            });
            resolve(keyArray)
          }else{
            // 根据图片的key通过接口获取图片的url
            var getUrlPromiseList = [];
            keyArray.forEach((item)=>{
              var p = new Promise((res1,rej1)=>{
                cos.getObjectUrl({
                  Bucket: config.tencentyunOssBucketName,
                  Region: config.tencentyunOssRegion,
                  Key: item,
                }, function (err, data) {
                  if(err){
                    rej1()
                  }else{
                    //返回一个对象，指明图片名称和url的对应关系
                    res1({
                      name:item,
                      url:data.Url
                    })
                  }
                });
              });
              getUrlPromiseList.push(p)
            });
            Promise.all(getUrlPromiseList).then((result)=>{
              resolve(result)
            })
          }
        }
      });
    })
  },

  // 上传图片
  uploadPicture: function(e){
    let self  = this;
    // 照片数量上下限
    let min = e.currentTarget.dataset.min,
        max = e.currentTarget.dataset.max,
        name = e.currentTarget.dataset.name,
        //当前已有照片数量
        currentCount = e.currentTarget.dataset.currentcount || 0,
        estateIndex = this.data.estateIndex;
    wx.chooseImage({
      success: function (res) {
        //判断是否能上传
        var tempFilePaths = res.tempFilePaths
        if(tempFilePaths.length+currentCount>max){
          //超过图片上限，无法上传
          wx.showToast({
            title:'图片超过上限!',
            icon:'none',
            duration: 2000
          });
          return
        }
        wx.showLoading({
          title: '上传中...',
        });
        // 多图上传，promise.all
        var promiseList = [];
        tempFilePaths.forEach((item,index)=>{
          var promise = new Promise((resolve,reject)=>{
            cos.postObject({
              Bucket: config.tencentyunOssBucketName,
              Region: config.tencentyunOssRegion,
              Key: estateIndex+'-'+name+'-'+(index+1)+'.jpg',
              FilePath: item,
              onProgress: function (info) {}
            }, function (err, data) {
              if(err){reject()}
              resolve()
            });
          });
          promiseList.push(promise);
        });
        Promise.all(promiseList).then((result)=>{
          wx.showToast({
            title: "上传成功",
            icon: 'success',
            duration: 1000
          });
          wx.hideLoading();
          // 更新界面,重新拉取数据
          self.initConfigAndPictures(self.data.options);
        },()=>{
          wx.hideLoading();
          wx.showToast({
            title: "上传失败,请重试",
            icon: 'error',
            duration: 1000
          })
        })
      }
    })

  },

  // 删除已有的照片,用前缀查询然后删除
  deletePictures: function(){
    return new Promise((resolve,reject)=>{
      wx.showLoading({
        title: '删除中...',
      });
      //查询
      cos.getBucket({
        Bucket: config.tencentyunOssBucketName,
        Region: config.tencentyunOssRegion,
        // 房屋index作为查询前缀,注意有横杠
        Prefix: this.data.estateIndex+'-',
      }, function (err, data) {
        if(err){
          wx.hideLoading();
          reject()
        }else{
          let keyArray = [];
          data.Contents.forEach((item)=>{
            keyArray.push(item.Key)
          });
          keyArray = keyArray.map((item)=>{
            return {Key:item}
          });
          //有数据才能删除
          if(keyArray.length>0){
            //删除
            cos.deleteMultipleObject({
              Bucket: config.tencentyunOssBucketName,
              Region: config.tencentyunOssRegion,
              Objects: keyArray
            }, function(err, data) {
              wx.hideLoading();
              resolve()
            });
          }else{
            wx.hideLoading();
            resolve()
          }
        }
      });
    });
  },

  // 初始化配置和图片
  initConfigAndPictures: function(options){
    wx.showLoading({
      title: '加载中...',
    });
    var promiseList = [];
    // 请求图片配置数据
    var p1 = this.fetchPictureConfig(options.type);
    var p2 = this.readPicturesFromOss();
    promiseList.push(p1,p2);
    Promise.all(promiseList).then((result)=>{
      var result2 = result[1];
      //处理图片url，因为带上了查询参数
      result2.forEach((item)=>{
        if(item.url.indexOf('?')!==-1){
          //注意这里要加上随机参数防止图片缓存不刷新
          item.url = item.url.split('?')[0]+ '?'+Math.random() / 9999
        }
      });
      //处理configData,添加图片数组属性
      var result1 = result[0];
      // 配置信息数组
      result1.forEach((item)=>{
        //遍历已有图片数组
        result2.forEach((item2)=>{
          //如果图片名称包含了类别名称
          if(item2.name.indexOf(item.name)!==-1){
            if(item.imgList){
              item.imgList.push({
                name:item2.name,
                url:item2.url
              })
            }else{
              item.imgList = [
                {
                  name:item2.name,
                  url:item2.url
                }
              ]
            }
          }
        })
      });
      this.setData({
        configData:result1
      });
      wx.hideLoading();
    },()=>{
      wx.showToast({
        title:'图片读取失败!',
        icon:'none',
        duration: 2000
      });
      wx.hideLoading();
    })
  },

  // 处理图片点击
  handleImageTap: function(e){
    let imgName = e.currentTarget.dataset.name;
    let self = this;
    wx.showActionSheet({
      itemList: ['删除', '修改'],
      itemColor:"#ff0000",
      success(res) {
        if(res.tapIndex === 0){
          //删除,用deleteObject就会报403错误
          cos.deleteMultipleObject({
            Bucket: config.tencentyunOssBucketName,
            Region: config.tencentyunOssRegion,
            Objects: [{
              Key:imgName
            }]
          }, function (err, data) {
            if(err){
              wx.showToast({
                title:'删除失败!',
                icon:'none',
                duration: 2000
              });
            }else{
              wx.showToast({
                title:'删除成功!',
                icon:'none',
                duration: 2000
              });
            }
            //刷新页面
            self.initConfigAndPictures(self.data.options)
          });
        }else{
          //修改
          wx.chooseImage({
            count:1,
            success: function (res) {
              wx.showLoading({
                title: '上传中...',
              });
              var tempFilePaths = res.tempFilePaths;
              cos.postObject({
                Bucket: config.tencentyunOssBucketName,
                Region: config.tencentyunOssRegion,
                Key: imgName,
                FilePath: tempFilePaths[0],
                onProgress: function (info) {}
              }, function (err, data) {
                if(err){
                  wx.showToast({
                    title:'修改失败!',
                    icon:'none',
                    duration: 2000
                  });
                }else{
                  wx.showToast({
                    title:'修改成功!',
                    icon:'none',
                    duration: 2000
                  });
                }
                //刷新页面
                wx.hideLoading();
                self.initConfigAndPictures(self.data.options)
              });
            }
          })
        }
      }
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      estateIndex:options.estateIndex,
      estatePosition:options.estatePosition,
      type:options.type,
      options:options
    });
    //删除已有照片
    if(options.isDelete === 'true'){
      var p = this.deletePictures();
      p.then(()=>{
        // 初始化配置和图片
        this.initConfigAndPictures(options);
      },()=>{
        wx.showToast({
          title:'图片读取失败!',
          icon:'none',
          duration: 2000
        });
      })
    }else{
      this.initConfigAndPictures(options);
    }
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