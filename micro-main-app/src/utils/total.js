/*
检查参数是否有变化
* @param
*
* */
import dayjs from 'dayjs'
import { cloneDeep } from 'lodash'
import { Message } from 'element-ui'

export const checkParams = (newValue = {}, oldvalue = {}) => {
  if (Object.keys(oldvalue).length <= 0) {
    return true
  }
  let isload = true
  let key = [
    'topSize',
    'shipingCity',
    'startDate',
    'endDate',
    'customerId',
    'customerFlag',
    'nomorlFlag',
    'serviceType',
    'payMode',
    'dateType',
    'agentDeliveryAgingStart',
    'agentDeliveryAgingEnd',
  ]
  for (let i = 0; i < key.length; i++) {
    let cur = key[i]
    let n = newValue[cur]
    let t = oldvalue[cur]
    // if (cur === 'startDate' || cur === 'serviceType' || cur === 'payMode') {
    if (cur === 'serviceType' || cur === 'payMode') {
      if (n.length !== t.length) {
        isload = false
      }
      for (let k = 0; k < n.length; k++) {
        if (!t.includes(n[k])) {
          isload = false
        }
      }
    } else {
      if (n !== t) {
        isload = false
      }
    }
  }
  return isload
}

/*
千分符
* @param
*
* */

export const thousands = (num, fixed = 2) => {
  if (num && num > 0) {
    return (+num).toFixed(fixed).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  return 0
}

/*
取整数
* @param
*
* */

export const numberInt = num => {
  if (num && num > 0) {
    return parseInt(num)
  }
  return 0
}

/*
取位数
* @param
*
* */

export const numberFixed = (num, fxed = 2) => {
  if (!num) {
    return 0
  }
  if (num && !isNaN(num)) {
    return (+num).toFixed(fxed)
  }
  return num
}

/*
小数转百分数
* @param
*
* */
export const toPercent = (num, fxed = 2) => {
  if (!num) {
    return 0
  }
  let str = Number(num * 100).toFixed(fxed)
  str += '%'
  return str
}

/*
百分数转化为小数
*/
export const toPoint = num => {
  if (!num) {
    return
  }
  let str = num.replace('%', '')
  str = str / 100
  return str
}

/*
转化  name value
*/
export const weightLevel = {
  1: '0~5',
  2: '5~30',
  3: '30~50',
  4: '50~100',
  5: '100~300',
  6: '300~1000',
  7: '1000以上',
}
export const toLabelValue = (attr = [], keyValue, keyName) => {
  if (attr && attr.length > 0) {
    attr.forEach(item => {
      let value = numberFixed(item[keyValue], 2)
      item.value = value > 2 ? value : value > 0 ? 2 : 0
      item.name = weightLevel[item[keyName]]
      item.weightLevel = item[keyName]
    })
  }
  return attr || []
}

/*
 position  graphic 偏移 吨
*/
export const toPosition = (str = '') => {
  let position = ['30%', '28.5%', '27%', '25.5%', '24%', '22.5%', '21%', '19.5%']
  let positionT = ['29.5%', '28.5%', '27%', '25.5%', '24.5%', '23%', '22%', '20.5%', '19.5%', '18%']
  if (!str) {
    return '28.5%'
  }
  str = toTon(str) || ''
  if (str.indexOf('吨') > 0) {
    return positionT[str.length - 1] || '28.5%'
  }
  return position[str.length - 1] || '28.5%'
}

/*
 position  graphic 偏移 元
*/
export const toPositionYuan = (str = '') => {
  let position = ['30%', '28.5%', '27%', '25.5%', '24%', '22.5%', '21%', '19.5%', '18.5%', '17.5%']
  if (!str) {
    return '28.5%'
  }
  str = toWan(str) || ''
  return position[str.length - 1] || '28.5%'
}

/*
  转换吨
*/
export const toTon = num => {
  if (!num) {
    return 0
  }
  if (num <= 1000) {
    return (+num).toFixed(2)
  }
  return thousands(num / 1000) + '吨'
}

/*
  转换百吨
*/
export const toWamTon = (num, unit = true) => {
  if (!num) {
    return 0
  }
  if (num > 99999999999) {
    // 转万吨
    if (unit === true) {
      return thousands(num / 100000000) + '万吨'
    }
    return thousands(num / 100000000)
  }
  if (num > 99999999) {
    // 转百万吨
    if (unit === true) {
      return thousands(num / 100000) + '百吨'
    }
    return thousands(num / 100000)
  }
  if (num <= 1000) {
    if (unit === true) {
      return (+num).toFixed(2) + 'KG'
    }
    return (+num).toFixed(2)
  }
  if (unit === true) {
    return thousands(num / 1000) + '吨'
  }
  return thousands(num / 1000)
}

/*
  转换百吨 取单位
*/
export const toWamTonUnit = num => {
  if (!num) {
    return '(KG)'
  }
  if (num > 99999999999) {
    // 转万吨
    return '(万吨)'
  }
  if (num > 99999999) {
    // 转百万吨
    return '(百吨)'
  }
  if (num <= 1000) {
    return '(KG)'
  }
  return '(吨)'
}

/*
  转换百万 取单位
*/
export const toBaiWamUnit = num => {
  if (!num) {
    return '(元)'
  }
  if (num > 99999999999) {
    // 转亿
    return '(亿)'
  }
  if (num > 99999999) {
    // 转百万
    return '(百万)'
  }
  if (num > 9999) {
    // 转万
    return '(万)'
  }
  return '(元)'
}

/*
  转换百万
*/
export const toBaiWam = (num, unit = true) => {
  if (!num) {
    return 0
  }
  if (num > 99999999999) {
    // 转亿
    if (unit === true) {
      return thousands(num / 100000000) + '亿'
    }
    return thousands(num / 100000000)
  }
  if (num > 99999999) {
    // 转百万
    if (unit === true) {
      return thousands(num / 1000000) + '百万'
    }
    return thousands(num / 1000000)
  }
  if (num > 9999) {
    // 转万
    if (unit === true) {
      return thousands(num / 10000) + '万'
    }
    return thousands(num / 10000)
  }
  if (unit === true) {
    return thousands(num) + '元'
  }
  return thousands(num)
}

/*
  转换万
*/
export const toWan = (num, unit = '') => {
  if (!num) {
    return 0
  }
  if (num <= 10000) {
    return (+num).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + unit
  }
  let n = num / 10000
  return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + unit
}

/*
  转换吨
*/
export const toTonNo = num => {
  if (!num) {
    return 0
  }
  if (num <= 1000) {
    return (+num).toFixed(2)
  }
  let n = (num / 1000).toFixed(2)
  return n.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/*
  补0
*/
export const toZero = num => {
  return num >= 10 ? num : '0' + num
}

/*
 * 根据数据字典，获取对应数据
 * */
export const getLookUp = (value, look = []) => {
  if (!value) {
    return
  }
  if (look && look.length > 0) {
    for (let key in look) {
      if (value === look[key].value) {
        return look[key].value
      }
    }
  }
}

export const numberSplitInt = val => {
  // 防止空字符返回为0
  if (val === '') return val
  let toNumberVal = Number(val)
  if (isNaN(toNumberVal)) {
    return val
  }
  let flag = ''
  if (toNumberVal < 0) {
    flag = '-'
    toNumberVal = Math.abs(toNumberVal)
  }
  if (toNumberVal >= 10000) {
    // 大于等于10000的数据要去掉小数位
    const numStr = Math.floor(toNumberVal) + ''
    const len = numStr.length
    const numArr = []
    // 每4位截取一次，截取小于10000部分的数据
    let itemLast = Number(numStr.substring(len - 4, len))
    // 只有个位数前面要加0 等于0则去掉，不加入数组拼接
    if (itemLast < 10 && itemLast > 0) {
      numArr.unshift('0' + itemLast)
    } else if (itemLast >= 10) {
      numArr.unshift(itemLast)
    }
    let itemCenter = 0
    let itemFirst = 0
    if (len <= 8) {
      // 长度小于等于8， 没有亿位，这个时候万位可以从index = 0 开始截取
      itemCenter = Number(numStr.substring(0, len - 4))
    } else {
      // 长度大于8才有亿， 万位不能再从index = 0开始截取
      itemCenter = Number(numStr.substring(len - 8, len - 4))
      itemFirst = Number(numStr.substring(0, len - 8))
    }
    // 万位和亿位如果大于0才加入数组拼接
    if (itemCenter > 0) numArr.unshift(itemCenter + '万')
    if (itemFirst > 0) numArr.unshift(itemFirst + '亿')
    return flag + numArr.join('')
  }
  return flag + toNumberVal
}

export const numberSplitFloat = val => {
  // 防止空字符返回为0
  if (val === '') return val
  let toNumberVal = Number(val)
  if (isNaN(toNumberVal)) {
    return val
  }
  let flag = ''
  if (toNumberVal < 0) {
    flag = '-'
    toNumberVal = Math.abs(toNumberVal)
  }
  if (toNumberVal >= 10000) {
    // 大于等于10000的数据要去掉小数位
    const numStrArr = String(toNumberVal).split('.')
    const numStr = numStrArr[0]
    const len = numStr.length
    const numArr = []
    // 每4位截取一次，截取小于10000部分的数据
    let itemLast = Number(numStr.substring(len - 4, len))
    // 只有个位数前面要加0 等于0则去掉，不加入数组拼接
    if (itemLast < 10 && itemLast > 0) {
      numArr.unshift('0' + itemLast)
    } else if (itemLast >= 10) {
      numArr.unshift(itemLast)
    }
    let itemCenter = 0
    let itemFirst = 0
    if (len <= 8) {
      // 长度小于等于8， 没有亿位，这个时候万位可以从index = 0 开始截取
      itemCenter = Number(numStr.substring(0, len - 4))
    } else {
      // 长度大于8才有亿， 万位不能再从index = 0开始截取
      itemCenter = Number(numStr.substring(len - 8, len - 4))
      itemFirst = Number(numStr.substring(0, len - 8))
    }
    // 万位和亿位如果大于0才加入数组拼接
    if (itemCenter > 0) numArr.unshift(itemCenter + '万')
    if (itemFirst > 0) numArr.unshift(itemFirst + '亿')
    return flag + numArr.join('') + (numStrArr[1] ? `.${numStrArr[1]}` : '')
  }
  return flag + toNumberVal
}

export const turnHtml = (title, tip) => {
  let data = '',
    titleText = ''
  for (let i = 0; i < tip.length; i++) {
    data =
      data +
      `<div style='display: flex; align-items: center; padding: 8px 16px;'><div style='width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; background: ${tip[i].backgroundColor}'></div><div style='font-size: 14px; color: #0c092b; margin-right: 8px;'>${tip[i].text}</div><div style='font-size: 14px; color: #0c092b;'>${tip[i].value}</div></div>`
  }
  if (title) {
    titleText = `<h2 style='padding: 8px; font-weight: 500; color: #0c092b; border-bottom: 1px solid #dcdae3;'>${title}</h2>`
  }
  return `<div style='position: relative; z-index: 100; background-color: #fff; box-sizing: border-box; border-radius: 3px; box-shadow: 0px 3px 11px 0px rgba(0,0,0,0.15); '>${titleText}${data}</div>`
}

export const doubleTurnHtml = (sendCityTitle, receiveCityTitle, receiveCityTip, sendCityTip) => {
  let sendCity = require('@assets/image/total/sendCity.svg'),
    receiveCity = require('@assets/image/total/receiveCity.svg'),
    dataSend = '',
    dataReceive = ''
  let titleSendText = `<div style='display: flex; align-items: center; padding: 8px; font-weight: 500; color: #0c092b; border-bottom: 1px solid #dcdae3;'><img src='${sendCity}' width='11px' height='14px' style='margin-right: 6px' />始发城市：${sendCityTitle}</div>`
  let titleReceiveText = `<div style='display: flex; align-items: center; padding: 8px; font-weight: 500; color: #0c092b; border-bottom: 1px solid #dcdae3;'><img src='${receiveCity}' width='11px' height='14px' style='margin-right: 6px' />目的城市：${receiveCityTitle}</div>`
  for (let i = 0; i < sendCityTip.length; i++) {
    dataSend =
      dataSend +
      `<div style='display: flex; align-items: center; padding: 8px 16px;'><div style='width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; background: ${sendCityTip[i].backgroundColor}'></div><div style='font-size: 14px; color: #0c092b; margin-right: 8px;'>${sendCityTip[i].text}</div><div style='font-size: 14px; color: #0c092b;'>${sendCityTip[i].value}</div></div>`
  }
  for (let i = 0; i < receiveCityTip.length; i++) {
    dataReceive =
      dataReceive +
      `<div style='display: flex; align-items: center; padding: 8px 16px;'><div style='width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; background: ${receiveCityTip[i].backgroundColor}'></div><div style='font-size: 14px; color: #0c092b; margin-right: 8px;'>${receiveCityTip[i].text}</div><div style='font-size: 14px; color: #0c092b;'>${receiveCityTip[i].value}</div></div>`
  }
  let send = `<div style='position: relative; z-index: 100; background-color: #fff; box-sizing: border-box; border-radius: 3px; box-shadow: 0px 3px 11px 0px rgba(0,0,0,0.15); '>${titleSendText}${dataSend}</div>`
  let receive = `<div style='position: relative; z-index: 100; background-color: #fff; box-sizing: border-box; border-radius: 3px; box-shadow: 0px 3px 11px 0px rgba(0,0,0,0.15); '>${titleReceiveText}${dataReceive}</div>`
  return `<div style='display: flex;'>${send}${receive}</div>`
}

/*
 * 数据字典获取对应值
 *
 * */
export const getLookUpValue = (value, look = []) => {
  if (!value && value !== 0) {
    return '--'
  }
  for (let i = 0; i < look.length; i++) {
    let cur = look[i].value
    if (+value === +cur) {
      return look[i].label
    }
  }
}

/*
 * 去掉秒
 *
 * */
export const queeTimeMin = time => {
  if (!time) {
    return '--'
  }
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}

/*导出*/
export const exportData = (url, target = '') => {
  let a = document.createElement('a')
  a.href = url
  a.target = target
  a.style.display = 'none'
  a.click()
}

/* 获取权限*/
export const getAuth = (vm, key) => {
  if (
    vm.$store.state &&
    vm.$store.state.tatol &&
    vm.$store.state.tatol.auth &&
    vm.$store.state.tatol.auth.dataBoard
  ) {
    let dataBoard = vm.$store.state.tatol.auth.dataBoard
    if (+dataBoard[key] === 10) {
      return true
    }
  }
  return false
}

/*
 * 检查是否有权限
 *
 * */

export const checkAuth = (data = {}) => {
  // if(data){
  //   for (let key in data){
  //     if(+data[key]===10){
  //       return true
  //     }
  //   }
  // }
  return true
}

/*
 * 增加默认数据  0
 *
 * */

export const pushData = (data = [], weightLevelList = [1, 2, 3, 4, 5, 6, 7]) => {
  let noList = []
  let active = {}
  data = data || []
  if (data.length === 0) {
    return data
  }
  data = cloneDeep(data)
  data.forEach(item => {
    if (weightLevelList.includes(item.weightLevel)) {
      if (item.weights && item.weights.length > 0) {
        active = item
      }
      noList.push(item.weightLevel)
    }
  })
  if (noList.length === weightLevelList.length) {
    return data
  }
  let list = weightLevelList.filter(item => !noList.includes(item))
  if (list.length > 0) {
    active = cloneDeep(active)
    for (let key in active) {
      if (key === 'weights') {
        active[key].forEach(it => {
          it.votes = 0
        })
      } else {
        active[key] = 0
      }
    }
    list.forEach(weightLevel => {
      let activeOld = cloneDeep(active)
      activeOld.weightLevel = weightLevel
      data.push(activeOld)
    })
  }
  return data
}

/* 检查时间是否超过2个月 */
export const checkTime = param => {
  let timer = param.startDate || []
  let [start, end] = timer
  if (start && end) {
    if (!dayjs(start).isBefore(dayjs(end), 'day')) {
      if (!dayjs(start).isSame(dayjs(end), 'day')) {
        Message.warning('开始时间要小于结束时间')
        return true
      }
    }
    if (!dayjs(start).isAfter(dayjs(end).add(-2, 'month'), 'day')) {
      Message.warning('非时间快捷查询，时间间隔不能超过2个月')
      return true
    }
    return false
  }
  Message.warning('请选择时间')
  return true
}

/* 检查时间是否一样*/
export const checkSaveTime = param => {
  /* 判断大于2个月的时间问题 */
  const saveTime = [
    {
      type: 3,
      start: dayjs().add(-90, 'd').format('YYYY-MM-DD') + ' 00: 00',
      end: dayjs().add(-1, 'd').format('YYYY-MM-DD') + ' 23:59',
    },
    {
      type: 6,
      start: dayjs().add(-5, 'month').startOf('month').format('YYYY-MM-DD') + ' 00: 00',
      end: dayjs().add(-1, 'd').format('YYYY-MM-DD') + ' 23:59',
    },
    {
      type: 12,
      start: dayjs().add(-11, 'month').startOf('month').format('YYYY-MM-DD') + ' 00: 00',
      end: dayjs().add(-1, 'd').format('YYYY-MM-DD') + ' 23:59',
    },
  ]
  let timer = param.startDate || []
  let [start, end] = timer
  if (start && end) {
    for (let i = 0; i < saveTime.length; i++) {
      let item = saveTime[i]
      let isStart = dayjs(item.start).isSame(dayjs(start), 'day')
      let isEnd = dayjs(item.end).isSame(dayjs(end), 'day')
      if (isStart && isEnd) {
        return true
      }
    }
    return false
  }
  Message.warning('请选择时间')
  return false
}

/* 检查时间是月 否一样*/
export const checkSaveMonth = param => {
  /* 判断大于2个月的时间问题 */
  const saveTime = [
    {
      type: 6,
      start: dayjs().add(-5, 'month').startOf('month').format('YYYY-MM-DD') + ' 00: 00',
      end: dayjs().add(-1, 'd').format('YYYY-MM-DD') + ' 23:59',
    },
    {
      type: 12,
      start: dayjs().add(-11, 'month').startOf('month').format('YYYY-MM-DD') + ' 00: 00',
      end: dayjs().add(-1, 'd').format('YYYY-MM-DD') + ' 23:59',
    },
  ]
  let timer = []
  if (param.startDate && param.endDate) {
    timer = [param.startDate, param.endDate]
  } else if (Array.isArray(param.startDate)) {
    timer = param.startDate
  } else if (param.agentDeliveryAgingStart && param.agentDeliveryAgingEnd) {
    timer = [param.agentDeliveryAgingStart, param.agentDeliveryAgingEnd]
  }
  let [start, end] = timer || []
  if (start && end) {
    for (let i = 0; i < saveTime.length; i++) {
      let item = saveTime[i]
      let isStart = dayjs(item.start).isSame(dayjs(start), 'day')
      let isEnd = dayjs(item.end).isSame(dayjs(end), 'day')
      if (isStart && isEnd) {
        return true
      }
    }
    return false
  }
  Message.warning('请选择时间')
  return false
}
