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

module.exports = {
  formatTime: formatTime,
	formatQueryString
}
