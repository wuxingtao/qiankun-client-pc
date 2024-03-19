import store from '@/store'
import REGULAR from '@/utils/regular'
import { setWebSiteLoginFlag, removeWebSiteLoginFlag } from '@/utils/cookies'
import * as storageUtil from '@/utils/storage'

/**
 * 判断是否有权限
 * @param {string,Number} authId
 * @returns
 */
export function hasPermission(authId) {
  const authorityIds = store.getters.authorityIds
  const hasPermission = authorityIds.includes(authId + '')
  return hasPermission
}
/**
 * 退出登录
 */
export function userLogout() {
  // 清空会话缓存
  sessionStorage.clear()
  // 重载清空store，路由会拦截并跳回登录页
  // if(native.isClientMode){  移至登录页面
  //   native.win.setLoginFormFlag(true)
  // }
  location.reload()
  removeWebSiteLoginFlag()

}

/**
 * 登录/切换账号后，会调用此方法，清理和初始化store
 */
export function initStore() {
  const { phone, customCode } = storageUtil.getUserData()
  setWebSiteLoginFlag({ token: storageUtil.getToken(), phone, customCode })
  // 各模块自行添加，仅同步commit，不要将异步dispatch放入
  // 例如，store.commit(UPDATE_USER_INFO, {})
}

export function formatDate(dateTime, fmt) {
  const date = new Date(dateTime)
  if (!fmt) fmt = 'yyyy-MM-dd'
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (var k in o) if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  return fmt
}

export function formatDate2(date, fmt) {
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours() % 12 == 0 ? 12 : date.getHours() % 12, //小时
    'H+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  }
  var week = {
    '0': '日',
    '1': '一',
    '2': '二',
    '3': '三',
    '4': '四',
    '5': '五',
    '6': '六',
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? '星期' : '周') : '') + week[date.getDay() + ''])
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
    }
  }
  return fmt
}

/**
 * 获取字符串中的手机号和座机号
 *
 */
export function getContactNumbers(contactNumber) {
  if (!contactNumber) {
    return {
      phones: [],
      telephones: [],
    }
  }
  let phones = []
  let telephones = []
  var numbers = (contactNumber + '').split(/[,，/]/).filter(n => n)
  numbers.forEach(num => {
    if (REGULAR.mobilePhone.test(num)) {
      phones.push(num)
    } else if (REGULAR.landlinePhone.test(num)) {
      telephones.push(num)
    }
  })
  return {
    phones,
    telephones,
  }
}

/**
 * 对数组进行分组
 *   @param {Array} array 数据源数组
 *   @param {function} fn 键值选择函数
 *   例：groupBy([{a:'a',a:'a2',b:'b'}],item=>item.a)
 */
export function groupBy(array, fn) {
  const groups = {}
  array.forEach(item => {
    const key = fn(item)
    groups[key] = groups[key] || []
    groups[key].push(item)
  })
  return groups
}

/**
 * 移除字符串中的指定字符
 * @param {String} text 需要移除首尾指定字符的字符串
 * @param {String\char} char 指定移除的字符，为空时表示移除空格
 */
export function trim(text, char) {
  if (!char) {
    char = 's'
  }
  const exp = new RegExp('^\\' + char + '+|\\' + char + '+$', 'g')
  text = text || ''
  return (text + '').replace(exp, '')
}

/**
 * 去除所有空格
 * @param str
 * @returns {*}
 */
export function trimAll(str) {
  if (typeof str === 'string') {
    return str.replace(/\s+/g, '')
  } else {
    return str
  }
}

/**
 * [{}] 类型去除所有空格
 * @param arr
 * @returns {*[]}
 */
export function fileDataTrim(arr = []) {
  arr.forEach(item => {
    Object.keys(item).forEach(objItem => {
      item[objItem] = trimAll(item[objItem])
    })
  })
  return arr
}

export async function downloadFileByUrls(urls) {
  urls.forEach((url, index) => {
    createIFrame(url, index * 100, 1000)
  })
}

function createIFrame(url, triggerDelay, removeDelay) {
  setTimeout(() => {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none' // 防止影响页面
    iframe.style.height = 0 // 防止影响页面
    iframe.src = url
    document.body.appendChild(iframe)
    setTimeout(() => {
      iframe.remove()
    }, removeDelay)
  }, triggerDelay)
}

/**
 * 格式化数字
 * @param {String,Number} num 需格式化的数字
 * @param {Number} decimalDigits 保留的小数位数
 * @param {Boolean} isCommaStyle 是否需格式化为千分位样式
 * @returns
 */
export function formatNumber(num, decimalDigits = 2, isCommaStyle = true) {
  if (!num || !Number(num)) {
    return 0
  }
  num = Number(num)
  if (decimalDigits >= 0) {
    num = num.toFixed(decimalDigits)
  }
  if (isCommaStyle) {
    return (num + '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  return num
}

/**
 * 将相同属性名的值赋值给另一个对象
 * @param {Object} targetObject  目标对象，被赋值的对象
 * @param {Object} originObject  源对象
 */
export function copyTheSameProperty(targetObject, originObject) {
  Object.keys(targetObject).forEach(key => {
    targetObject[key] = originObject[key]
  })
}

/**
 * 将jsonString转化为json对象
 * @param { String } jsonString json字符串
 */
export function parseJson(jsonString) {
  if (typeof jsonString !== 'string') {
    return
  }
  try {
    var obj = JSON.parse(jsonString)
    if (typeof obj === 'object' && obj) {
      return obj
    }
  } catch (e) {
    // console.log('e :>> ', e)
  }
}

/**
 *  将数组拆分为拆分为组（适用于将数据拆分成批次上传数据）
 * @param {Array} arrayData 需要拆分的数组
 * @param {Number} maxCount 一组数据里最大包含的数量
 * @param {Boolean} isInAvgMethod 是否以平均方式分组
 * @return {Array<Array>}
 */
export function splitArrayToGroup(arrayData, maxCount, isInAvgMethod = true) {
  if (!arrayData || !Array.isArray(arrayData)) {
    return
  }
  if (arrayData.length <= maxCount) {
    return [arrayData]
  }
  const total = arrayData.length
  const times = Math.ceil(total / maxCount) //最多需要上传的次数
  let avg = Math.ceil(total / times) //平均每次上传的数量
  if (!isInAvgMethod) {
    avg = maxCount
  }
  let group = []
  let startIndex = 0
  for (let i = 0; i < times; i++) {
    const arr = arrayData.slice(startIndex, startIndex + avg)
    group.push(arr)
    startIndex += arr.length
  }
  return group
}

/**
 * 同步批量请求
 * @param {Function} requestFunc 请求接口方法，参数为数据数组，如：arr=>{}
 * @param {Array} arrayData 需要拆分的数据数组
 * @param {Array} signleDataCount 一次请求发送的数据条数上限
 * @param {Array} continueCodes 可为空，不为空时，只有当上次请求响应码包含在该数组中时才继续发送下一轮请求
 * @param {Number} requestCount 同时发送的请求数量上限
 * @returns 返回每次接口返回的数据数组
 */
export async function batchRequest({ requestFunc, arrayData, signleDataCount, continueCodes, requestCount = 5 }) {
  const arrayGroup = splitArrayToGroup(arrayData, signleDataCount)
  const groupOfGroup = splitArrayToGroup(arrayGroup, requestCount)
  const resList = []
  for (let i = 0; i < groupOfGroup.length; i++) {
    const promiseList = groupOfGroup[i].map(list => requestFunc(list))
    const tempResList = await Promise.all(promiseList)
    if (continueCodes && tempResList.some(r => !continueCodes.includes(r.code))) {
      return
    }
    resList.push(...tempResList)
  }
  return resList
}

/**
 * 同步批量请求（无效）
 * @param {Array} promises promise数组
 * @param {Number} requestCount 一次发起请求的数量，默认为3
 * @param {Array} continueCodes 可为空， 请求结果的code为该数组中时才继续下一轮请求
 * @returns 返回-1时，表示有中断请求，否则返回所有请求结果
 */
export async function batchRequestPromises(promises, requestCount = 3, continueCodes) {
  if (!promises || promises.length < 1) {
    return
  }
  const promiseGroup = splitArrayToGroup(promises, requestCount)
  const resList = []
  for (let i = 0; i < promiseGroup.length; i++) {
    const tempResList = await Promise.all(promiseGroup[i])
    if (continueCodes && tempResList.some(r => !continueCodes.includes(r.code))) {
      return -1
    }
    resList.push(...tempResList)
  }
  return resList
}

/**
 * 通过查询接口导出excel（注：接口入参必须包含page属性，出参中res.data.pageTotal和res.data.rows
 * @param {Function} requestFunc 请求接口方法
 * @param {Object} params 请求接口入参
 * @param {Array} tableColumns 表格列
 * @param {String} filename 文件名
 * @param {String} pageIndexName 入参当前页的参数名称
 * @param {String} pageSizeName 入参页大小的参数名称
 * @param {String} totalCountName 出参总行数的参数名称
 * @param {String} rowsName 出参数据的参数名称
 * @param canDataEmpty 是否允许空数据
 * @returns
 */
export async function exportExcelByApi ({
  requestFunc,
  params,
  tableColumns,
  filename,
  pageIndexName = 'page',
  pageSizeName = 'pageSize',
  totalCountName = 'rowTotal',
  rowsName = 'rows',
  canDataEmpty = false
}) {
  if (!params || [pageIndexName, pageSizeName].some(f => !params.hasOwnProperty(f))) {
    return console.error(`请求方法参数中必须包含${pageIndexName}和${pageSizeName}属性`)
  }
  params[pageIndexName] = 1
  const res = await requestFunc(params)
  if (res.code === 0) {
    let data = []
    if (!res.data.hasOwnProperty(totalCountName)) {
      return console.error(`请求接口返回接口不包含${totalCountName}属性，该方法不适用`)
    }
    const pageCount = Math.ceil(res.data[totalCountName] / params[pageSizeName])
    if (!canDataEmpty && pageCount < 1) {
      this.$message('未查询到数据')
      return
    }
    data = res.data[rowsName]
    if (pageCount > 1) {
      const promiseList = []
      for (let i = 2; i <= pageCount; i++) {
        params[pageIndexName] = i
        promiseList.push(requestFunc({ ...params }))
        if (promiseList.length === 5 || i === pageCount) {
          const resList = await Promise.all(promiseList)
          promiseList.length = 0
          if (resList.every(r => r.code === 0)) {
            resList.forEach(r => data.push(...r.data[rowsName]))
          }
        }
      }
    }
    const theadColumns = tableColumns.filter(c => c.visible).map(c => c)
    try {
      const excel = await import('@utils/clientUtil')
      excel.exportExcel({
        theadColumns,
        jsonData: data,
        filename: filename,
        canDataEmpty
      })
    } catch (ex) {
      console.log('exportExcelByApi :>> ', ex)
    }
  }
}

export function base64ToFile(data, filename = '') {
  const arr = data.split(',')
  let mime = ''
  let raw = ''
  if (arr.length > 1) {
    mime = arr[0].match(/:(.*?);/)[1]
    raw = window.atob(arr[1])
  } else {
    raw = window.atob(arr[0])
  }
  const rawLength = raw.length
  const uint8Array = new Uint8Array(rawLength)
  for (let i = 0; i < rawLength; ++i) {
    uint8Array[i] = raw.charCodeAt(i)
  }
  return new File([uint8Array], filename, { type: mime })
}

export async function exportFileWithData ({ theadColumns, jsonData, filename, canDataEmpty = false }) {
  try {
    const excel = await import('@utils/clientUtil')
    await excel.exportExcel({
      theadColumns,
      jsonData: jsonData,
      filename: filename,
      canDataEmpty
    })
  } catch (ex) {
    console.log('exportExcelByApi :>> ', ex)
  }
}

//中文符号转英文符号
export function toCdb(str) {
  var tmp = ''
  const dict = {'。':'.','》':'>','《':'<','‘':'\'','’':'\'','、':'\\'}
  for (var i = 0; i < str.length; i++) {
    const item = dict[str[i]]
    if( item){
      tmp += item
    }else if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
      tmp += String.fromCharCode(str.charCodeAt(i) - 65248)
    }
    else {
      tmp += String.fromCharCode(str.charCodeAt(i))
    }
  }
  return tmp
}

export const getQueryObject = (url) => {
  url = url == null ? window.location.href : url
  const search = url.substring(url.lastIndexOf('?') + 1)
  const obj = {}
  const reg = /([^?&=]+)=([^?&=]*)/g
  search.replace(reg, (rs, $1, $2) => {
    const name = decodeURIComponent($1)
    let val = decodeURIComponent($2)
    val = String(val)
    obj[name] = val
    return rs
  })
  return obj
}