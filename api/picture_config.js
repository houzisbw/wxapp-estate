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

//更新经纬度信息
var updateSignPositionUrl = require('./url').updateSignPositionUrl;
const updateSignPosition = (position,index,successHandler,failHandler)=>{
  baseRequest('POST',{
    position:position,
    index:index,
  },updateSignPositionUrl,successHandler,failHandler)
};

//确认传完照片
var updateCanDownloadUrl = require('./url').updateCanDownloadUrl;
const updateCanDownload = (index,successHandler,failHandler)=>{
  baseRequest('POST',{
    index:index,
  },updateCanDownloadUrl,successHandler,failHandler)
};

//获取是否传完照片
var fetchCanDownloadUrl = require('./url').fetchCanDownloadUrl;
const fetchCanDownload = (index,successHandler,failHandler)=>{
  baseRequest('POST',{
    index:index,
  },fetchCanDownloadUrl,successHandler,failHandler)
};

module.exports = {
  getPictureConfigInfo,
  updateSignPosition,
  updateCanDownload,
  fetchCanDownload
}