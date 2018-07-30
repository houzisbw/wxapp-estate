const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//格式化参数字符串
const formatQueryString = (obj)=>{
  var result = [];
  Object.keys(obj).forEach((item)=>{
    result.push(item+'='+obj[item])
  });
  return result.join('&');
}

//秒数转小时分钟表示
const secondToHourMinute = (seconds)=>{
	var result = '';
	if(seconds<3600){
		result += Math.floor(seconds/60)+'分钟';
	}else{
		var hour = Math.floor(seconds / 3600);
		var second = Math.floor((seconds - hour*3600)/60);
		result = hour+'小时'+(second?(second+'分钟'):'');
	}
	return result
}
//距离转公里
const meterToKM = (meters)=>{
	return (parseInt(meters,10)/1000).toFixed(1)+'公里';
};

module.exports = {
  formatTime: formatTime,
	formatQueryString,
	secondToHourMinute,
	meterToKM
}
