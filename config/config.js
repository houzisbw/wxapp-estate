/**
 * 各种配置信息，如地图sdk的key
 */
module.exports = {
	qqMapKey:'5RQBZ-3YO6I-HAGGQ-5T5BU-5RNHK-NIF3N',
	AMapKey:'b0c901ec99006c935486c5aa135a522a',
	//腾讯地图qps上限
	tencentQPS:20,
	//智能路径规划房屋数量上限
	smartRouteHouseLimit:10,
	//地图页面刷新间隔:5分钟
	mapPageUpdateInterval:1000*60*5,
	//房屋反馈分隔符
	feedbackDelimiter:"*##*",
	//2次提交反馈的间隔(15分钟)
	submitInterval:15*60*1000,
	//腾讯云oss图片上传相关
	tencentyunOssServerUrl:'',
	tencentyunSecretId:'AKID8AEFQ4Jzz8whgtj2fEbmlbGn8JHkNxZi',
  tencentyunSecretKey:'3sRviSR8hOB3jjejopwY2QkgR0PabO3V',
  tencentyunOssBucketName:'estate-picture-1258800495',
  tencentyunOssRegion:'ap-chengdu'
}
