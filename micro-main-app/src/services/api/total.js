import request from '@/services/api/request'
import dayjs from 'dayjs'
import { getCustomerId, getPhone } from '@/utils/storage'
import { cloneDeep } from 'lodash'
import { timeoutTypeOptions } from '@/views/total/total-list/comfig.js'
/*
 * 初始化参数
 *  表单 formData
 * 添加dateType的处理及对需派时间的兼容
 * */
export const initParams = formData => {
  let param = cloneDeep(formData)
  param.serviceType = param.serviceType.filter(item => item !== '1')
  param.serviceType = param.serviceType.join(',') || ''
  const isAll = param.payMode.some(item => {
    if (item === '1') {
      return true
    }
  })
  if (isAll) {
    param.payMode = ''
  } else {
    param.payMode = param.payMode.join(',') || ''
  }
  param.customerId = getCustomerId() || ''

  if (Array.isArray(param.startDate)) {
    let [start, end] = param.startDate
    if (param.dateType === 'shipingTime') {
      param = {
        ...param,
        startDate: start ? dayjs(start).format('YYYY-MM-DD') : '',
        endDate: end ? dayjs(end).format('YYYY-MM-DD') : '',
        agentDeliveryAgingStart: '',
        agentDeliveryAgingEnd: '',
      }
    } else {
      param = {
        ...param,
        startDate: '',
        endDate: '',
        agentDeliveryAgingStart: start ? dayjs(start).format('YYYY-MM-DD') : '',
        agentDeliveryAgingEnd: end ? dayjs(end).format('YYYY-MM-DD') : '',
      }
    }
  }
  delete param.dateType
  return param
}

/*获取时间*/
export const getTime = (time, format = 'YYYY-MM-DD') => {
  let startTime = ''
  let endTime = ''
  if (time && time.length > 0) {
    let [start, end] = time
    startTime = start ? dayjs(start).format(format) : ''
    endTime = end ? dayjs(end).format(format) : ''
  }
  return {
    startTime,
    endTime,
  }
}

// 物流实时状态数据 (V1.0)
export const navigateQueryRealTime = data => {
  return request({
    headerUrl: 'web.report.navigate.queryRealTime',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: data,
    },
  })
}

// 区域列表 查询 (V1.0)
export const qualityAreaList = data => {
  return request({
    headerUrl: 'web.report.quality.areaList',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 破损丢失、退货、转寄 查询 (V1.0)
export const analysis = data => {
  return request({
    headerUrl: 'web.report.anomalous.analysis',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 时效延误 查询 (V1.0)
export const unAgingAchieved = data => {
  return request({
    headerUrl: 'web.report.anomalous.unAgingAchieved',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 派签到延误 查询 (V1.0)
export const deliveryOuttimes = data => {
  return request({
    headerUrl: 'web.report.anomalous.deliveryOuttimes',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 揽收超时 查询 (V1.0)
export const collectTimeout = data => {
  return request({
    headerUrl: 'web.report.anomalous.collectTimeout',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 时效流向分析 查询 (V1.0)
export const qualityAgingFlow = data => {
  return request({
    headerUrl: 'web.report.quality.agingFlow',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 左边面板--- (V1.0)
/*
 nomorlFlag	默认标识--10.默认ES，20.否大数据CK	string	否
 startDate	开始日期	string	否
 endDate	结束日期	string	否
 customerId	客户ID	string	否
 customerFlag	客户类型，10.寄，20.收，30.付款	string	否
 serviceType	服务方式	string	否
 payMode	付款方式	string	否
 dtType	时间类型 0 默认,1 近7天，2近30天，3近90天,4近180天，5近360天	number	否
* */
export const overviewLeftPanel = data => {
  return request({
    headerUrl: 'web.report.overview.leftPanel',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 时效达成趋势图 查询 (V1.0)
export const qualityAgingAchieved = data => {
  return request({
    headerUrl: 'web.report.quality.agingAchieved',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 妥投率趋势 图查询 (V1.00))
export const qualityDelivered = data => {
  return request({
    headerUrl: 'web.report.quality.delivered',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 寄件城市-TOP5 (V1.0))
export const qualityAgingTop5 = data => {
  let obj = {}
  if (data.orderByClauses) {
    obj = {
      params: initParams(data),
      orderByClauses: data.orderByClauses,
    }
  } else {
    obj = { params: initParams(data) }
  }
  return request({
    headerUrl: 'web.report.quality.agingTop5',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: obj,
  })
}

// 客户报表-物流实时状态 (V1.0)
/*
* @param
* customerId	客户ID	string	是	075566370755
 startDate	开始时间	string	是
* */
export const logisticsRealData = data => {
  return request({
    headerUrl: 'web.report.logistics.realData',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: data,
    },
  })
}

// 客户报表-业务概况 (V1.0)
/*
params	参数对象	object	是
 startDate	开始时间	string	是
 endDate	结束时间	string	是
 customerId	客户ID	string	是
 customerFlag	客户类型	string	是	客户类型，1.寄，2.收，3.付款
 nomorlFlag	默认标识--1.默认ES，0.否大数据CK	string	是
 serviceType	服务方式	string	是
 payMode	付款方式	string	是	10.寄付.20.到付.30.第三方付
* */
export const overviewSummary = data => {
  return request({
    headerUrl: 'web.report.overview.summary',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 客户报表-业务概况-重量区间占比(饼图) (V1.0)
/*
startDate	开始时间	string	是	8tee
 endDate	结束时间	string	是	f10h
 customerId	客户ID	string	是	cvgp
 searchFlag	查询类型	string	是	1.票,2.件
 customerFlag	客户类型	string	是	客户类型，1.寄，2.收，3.付款
 nomorlFlag	默认标识	string	是	1.默认ES;0.否大数据CK
 serviceType	服务方式	string	是	1x3e
 payMode	付款方式	string	是	10.寄付.20.到付.30.第三方付
* */
export const overviewActualWeightsRation = data => {
  return request({
    headerUrl: 'web.report.overview.actualWeights',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 客户报表-业务概况-重量区间占比(饼图) (V1.0)
/*
startDate	开始时间	string	是	8tee
 endDate	结束时间	string	是	f10h
 customerId	客户ID	string	是	cvgp
 searchFlag	查询类型	string	是	1.票,2.件
 customerFlag	客户类型	string	是	客户类型，1.寄，2.收，3.付款
 nomorlFlag	默认标识	string	是	1.默认ES;0.否大数据CK
 serviceType	服务方式	string	是	1x3e
 payMode	付款方式	string	是	10.寄付.20.到付.30.第三方付
* */
export const overviewWeightRation = data => {
  return request({
    headerUrl: 'web.report.overview.weights',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 客户报表-业务概况-票数趋势图 (V1.0)
/*
 startDate	开始时间	string	是	8tee
 endDate	结束时间	string	是	f10h
 customerId	客户ID	string	是	cvgp
 searchFlag	查询类型	string	是	1.票,2.件
 customerFlag	客户类型	string	是	客户类型，10.寄，20.收，30.付款
 nomorlFlag	默认标识	string	是	10.默认ES;20.否大数据CK
 serviceType	服务方式	string	是	10,20
 payMode	付款方式	string	是	10.寄付.20.到付.30.第三方付
* */
export const overviewVotesTrendList = data => {
  return request({
    headerUrl: 'web.report.overview.votesTrendList',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
      // params: data,
    },
  })
}

// 客户报表-业务概况-费用组成(饼图/增值费趋势图)
export const overviewCostRation = data => {
  return request({
    headerUrl: 'web.report.overview.costRation',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

// 客户报表-业务概况-增值费明细组成趋势图 (V1.0)
export const overviewCostTrendList = data => {
  return request({
    headerUrl: 'web.report.overview.costTrendList',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: initParams(data),
    },
  })
}

/*
 *  明细报表查询 初始化参数
 *  表单 formData
 * */
export const initListParams = formData => {
  let param = cloneDeep(formData)
  let format = 'YYYY-MM-DD'
  // 寄件时间或需派时间
  // 处理不同时间选择器的参数兼容
  let shipingTime = getTime(param.shipingTimeStart, format)
  if (param.shipingTimeStart && param.shipingTimeStart.length > 0) {
    if (formData.dateType === 'shipingTime') {
      param = {
        ...param,
        shipingTimeStart: shipingTime.startTime,
        shipingTimeEnd: shipingTime.endTime,
        agentDeliveryAgingStart: '',
        agentDeliveryAgingEnd: '',
      }
    } else {
      param = {
        ...param,
        shipingTimeStart: '',
        shipingTimeEnd: '',
        agentDeliveryAgingStart: shipingTime.startTime,
        agentDeliveryAgingEnd: shipingTime.endTime,
      }
    }
  } else {
    delete param.shipingTimeStart
  }
  delete param.dateType
  // if (param.shipingTimeStart && param.shipingTimeStart.length > 0) {
  //   let shipingTime = getTime(param.shipingTimeStart, format)
  //   param.shipingTimeStart = shipingTime.startTime + ':00'
  //   param.shipingTimeEnd = shipingTime.endTime + ':59'
  // } else {
  //   delete param.shipingTimeStart
  // }
  //退货提交时间
  if (param.returnCommitTimeStart && param.returnCommitTimeStart.length) {
    let returnCommitTime = getTime(param.returnCommitTimeStart, format)
    param.returnCommitTimeStart = returnCommitTime.startTime + ':00'
    param.returnCommitTimeEnd = returnCommitTime.endTime + ':59'
  } else {
    delete param.returnCommitTimeStart
  }
  //退货签收时间
  if (param.returnSignTimeStart && param.returnSignTimeStart.length) {
    let returnSignTime = getTime(param.returnSignTimeStart, format)
    param.returnSignTimeStart = returnSignTime.startTime + ':00'
    param.returnSignTimeEnd = returnSignTime.endTime + ':59'
  } else {
    delete param.returnSignTimeStart
  }
  if (param.customerFlag === '1') {
    //寄件客户id
    param.shipingCustomerId = getCustomerId()
  }
  if (param.customerFlag === '2') {
    //收件客户id
    param.pickupCustomerId = getCustomerId()
  }
  if (param.customerFlag === '3') {
    //付款客户id
    param.paymentCustomerId = getCustomerId()
  }
  if (param.serviceType) {
    param.serviceType = param.serviceType.filter(item => item !== '1')
    param.serviceType = param.serviceType.join(',') || ''
  }
  if (param.overtimeType) {
    param.overtimeType = param.overtimeType.filter(item => item !== '1')
    let overtimeType = []
    if (param.overtimeType.length > 0) {
      for (let key in timeoutTypeOptions) {
        let cur = timeoutTypeOptions[key]
        if (param.overtimeType.includes(cur.value)) {
          overtimeType.push(cur.label)
        }
      }
    }
    param.overtimeType = overtimeType.join(',') || ''
  }
  delete param.customerFlag
  return param
}

/*详情明细*/
// 明细报表查询 (V1.0)
export const reportSearch = ({ page, orderByClauses, data }) => {
  return request({
    headerUrl: 'web.report.report.search',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      ...page,
      orderByClauses,
      params: initListParams(data),
    },
  })
}

/*  查询服务方式*/
export const overviewServiceType = () => {
  return request({
    headerUrl: 'web.report.overview.serviceType',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: {
        customerId: getCustomerId(),
      },
    },
  })
}

/*
 * 初始化 数据汇总参数
 * */
export const initSummaryParams = formData => {
  let param = cloneDeep(formData)
  param.customerId = getCustomerId()
  // 寄件时间或需派时间处理
  if (param.shipingTimeStart && param.shipingTimeStart.length > 0) {
    if (param.dateType === 'shipingTime') {
      let shipingTime = getTime(param.shipingTimeStart)
      param = {
        ...param,
        shipingTimeStart: shipingTime.startTime,
        shipingTimeEnd: shipingTime.endTime,
        agentDeliveryAgingStart: '',
        agentDeliveryAgingEnd: '',
      }
    } else {
      let agentDeliveryAging = getTime(param.shipingTimeStart)
      param = {
        ...param,
        shipingTimeStart: '',
        shipingTimeEnd: '',
        agentDeliveryAgingStart: agentDeliveryAging.startTime,
        agentDeliveryAgingEnd: agentDeliveryAging.endTime,
      }
    }
  } else {
    delete param.shipingTimeStart
    delete param.shipingTimeEnd
  }
  delete param.dateType

  //签收时间
  if (param.signingTimeStart && param.signingTimeStart.length) {
    let signingTime = getTime(param.signingTimeStart)
    param.signingTimeStart = signingTime.startTime
    param.signingTimeEnd = signingTime.endTime
  } else {
    delete param.signingTimeStart
    delete param.signingTimeEnd
  }
  param.serviceType = param.serviceType.filter(item => item !== '1')
  param.serviceType = param.serviceType.join(',') || ''
  return param
}

// 汇总报表查询 (V1.0)
export const waybillsummarySearch = ({ page, orderByClauses, data }) => {
  return request({
    headerUrl: 'web.report.waybillsummary.search',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      ...page,
      orderByClauses,
      params: initSummaryParams(data),
    },
  })
}

//查询表格列配置
export function queryGridColumnConfig({ name }) {
  let params = {
    mobile: getPhone(),
    gridName: name,
  }
  return request({
    headerUrl: 'gw.gridConfig.queryGridConfig',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//新增表格配置
export function addGridConfig({ name, columns }) {
  let phone = getPhone()
  if (!phone) {
    this.$message.error('没有找到手机号')
    return
  }
  let params = {
    mobile: phone,
    gridName: name,
    gridAttribute: JSON.stringify(columns),
  }
  return request({
    headerUrl: 'gw.gridConfig.addGridConfig',
    method: 'post',
    data: params,
  })
}

//修改表格配置
export function updateGridConfig({ id, columns }) {
  let params = {
    id: id,
    gridAttribute: JSON.stringify(columns),
  }
  return request({
    headerUrl: 'gw.gridConfig.updateGridConfig',
    method: 'post',
    data: params,
  })
}

/*
获取客户报表权限 (V1.0)
*/
export function getByMobile() {
  return request({
    headerUrl: 'web.report.report.reportAuthor',
    method: 'post',
    data: {},
    token: false,
    hideErrMsg: true,
  })
}

/*
汇总报表 导出 (V1.0)
 sorts	排序字段集合（仅用于明细报表排序）	array[object]	否
 sortField	排序字段	string	否
 asc	是否升序，默认升序	boolean	否
 params	终端请求参数对象--大数据请求对象	object	否
 shipingTimeStart	寄件时间开始	string	否
 shipingTimeEnd	寄件时间结束	string	否
 signingTimeStart	签收时间开始	string	否
 signingTimeEnd	签收时间结束	string	否
 customerFlag	客户类型，1.寄，2.收，3.付款	string	否
 serviceType	服务方式	string	否
 beginCity	始发地(支持区号)	string	否
 endCity	目的地(支持区号)	string	否
 customerId	客户Id	string	否
*/
export const waybillsummaryExport = ({ page, orderByClauses, data }) => {
  return request({
    headerUrl: 'web.report.waybillsummary.export',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      ...page,
      orderByClauses,
      params: initSummaryParams(data),
    },
  })
}

/*

明细报表 导出 (V1.0)
*/
export const reportList = ({ page, orderByClauses, data }) => {
  return request({
    headerUrl: 'web.report.report.export',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      ...page,
      orderByClauses,
      params: initListParams(data),
    },
  })
}

/*大客户报表—未签收导出 (V1.0)
sorts	排序字段集合（仅用于明细报表排序）	array[object]	否
sortField	排序字段	string	否
asc	是否升序，默认升序	boolean	否
params	终端请求参数对象--大数据请求对象	object	否
customerId	客户Id	string	否
dataType	数据维度，1- 寄方；2- 收方；3-付方	number	否
dtType	时间类型	number	否*/

export const navigateExport = data => {
  return request({
    headerUrl: 'web.report.navigate.export',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      params: data,
    },
  })
}

/*获取实习导出进度*/
export const fileResultFn = (url, taskId) => {
  return request({
    headerUrl: url || 'web.report.download.status',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      taskId,
    },
  })
}

// 数据更新时间
export const updateTime = () => {
  return request({
    headerUrl: 'gw.foward.api',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      // method: 'bigdata.web.client.uopdatetime.gray',
      method: 'bigdata.web.client.uopdatetime',
      param: JSON.stringify({
        dateType: '',
        dateValue: [],
      }),
    },
  })
}

/*
导出接口
*/
export const exportDataFn = (url, data) => {
  return request({
    headerUrl: url,
    method: 'post',
    token: false,
    hideErrMsg: true,
    data,
  })
}
