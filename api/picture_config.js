/**
 * Created by Administrator on 2019/3/7 0007.
 */

//请求基类
var baseRequest = require('./request/request');
//获取图片配置信息
var getPictureConfigInfoUrl = require('./url').getPictureConfigUrl;
const getPictureConfigInfo = (type,successHandler,failHandler)=>{
  baseRequest('POST',{
    type:type
  },getPictureConfigInfoUrl,successHandler,failHandler)
};

module.exports = {
  getPictureConfigInfo
}