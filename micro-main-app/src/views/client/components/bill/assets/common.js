import { getUserData } from '@/utils/storage'

export function isMonthlyPaymentCustomer() {
  const loginInfo = getUserData()
  // console.log(loginInfo.payMode);
  if (loginInfo.hasOwnProperty('isCustomerIsMonthly')) {
    return loginInfo.isCustomerIsMonthly
  }
  return loginInfo.customerInfo.payMode=='40'
}

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */
export function formateDate(date, fmt) {
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds() //毫秒
  }
  var week = {
    '0': '日',
    '1': '一',
    '2': '二',
    '3': '三',
    '4': '四',
    '5': '五',
    '6': '六'
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '星期' : '周') : '') +
            week[date.getDay() + '']
    )
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt
}
// //把时间戳转化为日期
// export function convertTimeStampToDate(timeStamp, formate = 'yyyy-MM-dd') {
//     let tempDate = new Date(Number(timeStamp))
//     return formateDate(tempDate, formate)
// }
// //比较两个日期，取得相隔的天数
// export function getDaysBetweenDates(date1, date2) {
//     //date1:小日期   date2:大日期
//     var minDate = new Date(date1)
//     var maxDate = new Date(date2)
//     var times = maxDate.getTime() - minDate.getTime()
//     var days = parseInt(times / (1000 * 60 * 60 * 24))
//     return days
// }

export function getContactNumbers(contactNumber) {
  if (!contactNumber) {
    return {
      phones: [],
      telephones: []
    }
  }
  var contactNumber = contactNumber.replace(/[(（\s]/g, '')
  var phones = contactNumber.match(
    /(0|86|17951)?(13\d|15\d|17\d|18\d|19\d|14[057]|165|166|168|199|198)(\d{8}|(\s{0,}|-)\d{4}(\s{0,}|-)\d{4})/g
  )
  if (phones) {
    phones.forEach(item => {
      contactNumber = contactNumber.replace(item, '')
    })
  }
  contactNumber = contactNumber.replace(/\D/g, '-').replace(/-+/g, '-')
  var telephones = contactNumber.match(
    /((0[0-9]{2,3}-)?([2-9][0-9]{6,7}|400[0-9]{6,7})(-[0-9]{1,7})?)|((400-)?[2-9]{6,7})/g
  )
  return {
    phones: phones ? phones : [],
    telephones: telephones ? telephones : []
  }
}

// 导出功能
export function downloadFile(fileName, content) {
  const blob = base64ToBlob(content) // new Blob([content]);
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName)
  } else {
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(blob)
    link.download = fileName
    //此写法兼容可火狐浏览器
    document.body.appendChild(link)
    const evt = document.createEvent('MouseEvents')
    evt.initEvent('click', false, false)
    link.dispatchEvent(evt)
    document.body.removeChild(link)
  }
}

function base64ToBlob(code) {
  const raw = window.atob(code)
  const rawLength = raw.length
  const uInt8Array = new Uint8Array(rawLength)
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i)
  }
  return new Blob([uInt8Array], {
    type: 'application/vnd.ms-excel'
  })
}

export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0
      ,v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

