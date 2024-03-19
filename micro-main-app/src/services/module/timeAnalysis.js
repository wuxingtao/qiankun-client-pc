import api from '@/services/api'
import { getUserData, getCustomerCode } from '@/utils/storage'

// TMS默认参数
const DEFAULT_PARAMS = {
  accordFlag: 0,                // 符合票分析：1-勾选 0-不勾选
  addWorkday: '',               // 加工作日
  agingType: 1,                 // 1-派送时效 2-内控时效
  areaCode: '',
  balanceWeightRange: '',       // 经营重量，数据字典：tms_landing_deploy_balanceWeightRange
  companyName: '',              // 公司名称
  companyType: 2,               // 公司类型：1-付款公司 2-寄件公司 3-收件公司
  crossMonthFlag: 0,            // 是否跨月  1-跨月 0-非跨月
  customerId: '',               // 公司ID
  customerType: '',             // 客户类型
  customerflightType: [],
  dateType: 10,                 // 时期类型 10-寄件日期 20-需派日期 30-提货日期 40-航班日期 50-内控日期
  deliveryAreaCode: '',         // 始发区号
  deliveryMode: '',             // 派送方式
  depth: 1,                     // 行政层级：1-全国 2-省 3-市 4-区县
  districtId: '-11',            // 行政ID
  districtName: "全国",         // 行政区域
  endDate: '',                  // 结束日期：yyyy-mm-dd
  flightScreenType: 5,          // 航班筛选条件：1-航班(t+0) 2-航班(t+1) 3-航班(t+2) 4-航班(t+2)+ 5-航班(t+不限) 6-航班(t+3) 7-航班(t+3+)
  flightTimeMorningEnd: '',     // 早班_止
  flightTimeMorningStart: '',   // 早班_起
  flightTimeNightEnd: '',       // 晚班_止
  flightTimeNightStart: '',     // 晚班_起
  flightTimeNoonEnd: '',        // 中班_止
  flightTimeNoonStart: '',      // 中班_起
  ladingLogicType: '',          // 提货逻辑条件：1-<=当天 2->=当天 3-范围 4-<= 全部 5->= 全部
  ladingTimeEnd: '',            // 提货时间_止
  ladingTimeStart: '',          // 提货时间_起
  lineFlag: 2,                  // 是否按线路汇总展示：1-是 2-否      
  pickScreenType: '',           // 提货筛选条件：1-提货(t+0) 2-提货(t+1) 3-提货(t+2) 4-提货(t+2)+ 5- 提货(t+不限)
  pickupAreaCode: '',           // 目的区号
  pickupLogicType: '',          // 寄件时间逻辑条件：1-<= ; 2- >= ; 3-范围
  pickupTimeEnd: '',            // 寄件时间_止
  pickupTimeStart: '',          // 寄件时间_起
  projectCode: '',              // 项目编码
  screenType: '',
  serviceMode: '',              // 服务方式-数据字典
  serviceModeFlag: 2,           // 是否按服务方式汇总展示：1-是 2-否
  signFlag: 10,                 // 10-勾选签到 20-勾选签收
  signLogicType: '',            // 签收/签到逻辑条件：1-<= ; 2- >= ; 3-范围 ; 4-<= 全部; 5- >= 全部;
  signScreenType: 1,            // 签收签到筛选条件：1-签收(t+0) 2-签收(t+1) 3-签收(t+2) 4-签收(t+2)+ 5-签到(t+不限) 6-签到(t+0) 7-签到(t+1) 8-签到(t+2) 9-签到(t+2)+ 10-签到(t+不限)
  signTimeEnd: '',              // 签收/签到时间_止
  signTimeStart: '',            // 签收/签到时间_起
  startDate: '',                // 开始日期:yyyy-mm-dd
  title: 1,
  transportMode: '',            // 运输模式-数据字典
  updownType: 1,                // 1，查询 2 下钻
  zhoutianFlag: 0               // 是否单选卓天：1-是 0-否
}

/**
 * 汇总
 */
const totalList = (dateRange, companyType) => {
  let params = {...DEFAULT_PARAMS}
  // 时间
  __setDateRange(params, dateRange)
  // 公司类型
  __setCompanyType(params, companyType)
  return api.requestErpInterface('bigdata.tms.aging.analysis.total.list', { params: params })
}

/**
 * 线路趋势图(省市)
 */
const totalLineTrend = (dateRange, companyType, trendDataType, trendDimType, formData) => {
  let params = {...DEFAULT_PARAMS}
  // 时间
  __setDateRange(params, dateRange)
  // 公司类型
  __setCompanyType(params, companyType)
  params.title = 2
  params.showType = 2  // 1-柱状图 2-列表
  params.trendDataType = trendDataType // 1-省 2-城市
  params.trendDimType = trendDimType // 1-始发地 2-目的地
  if (formData) {
    params = {...params, ...formData}
  }
  return api.requestErpInterface('bigdata.tms.aging.analysis.total.line.trend', {
    orderByClauses: [{field: 'total_poll_a', orderByMode: 1}],
    page: 1,
    pageSize: 1000,
    params: params
  })
}

/**
 * 产品服务
 */
const getServiceData = (dateRange, companyType, formData, page = 1, pageSize = 200) => {
  let params = {...DEFAULT_PARAMS}
  // 时间
  __setDateRange(params, dateRange)
  // 公司类型
  __setCompanyType(params, companyType)
  params.serviceModeFlag = 1
  params.title = 2
  params = {...params, ...formData}
  return api.requestErpInterface('bigdata.tms.aging.analysis.total.list', {
    orderByClauses: [{field: 'total_poll_a', orderByMode: 1}],
    page: page,
    pageSize: pageSize,
    params: params
  })
}


/**
 * 线路
 */
const getLineData = (dateRange, companyType, formData, page = 1, pageSize = 200) => {
  let params = {...DEFAULT_PARAMS}
  // 时间
  __setDateRange(params, dateRange)
  // 公司类型
  __setCompanyType(params, companyType)
  params.lineFlag = 1
  params.title = 2
  params = {...params, ...formData}
  return api.requestErpInterface('bigdata.tms.aging.analysis.total.list', {
    orderByClauses: [{field: 'total_poll_a', orderByMode: 1}],
    page: page,
    pageSize: pageSize,
    params: params
  })
}

/**
 * 获取月趋势数据
 */
const getMonthTrend = (dateRange, companyType, formData, sumData = 0) => {
  let params = {...DEFAULT_PARAMS}
  // 时间
  __setDateRange(params, dateRange)
  // 公司类型
  __setCompanyType(params, companyType)
  params.sumData = sumData    // 是否查询列表汇总 1-是 0-否
  params.timeType = 2   // 	1-天 2-月 3-周
  params.title = 2
  params.trendDataType = 2
  params.trendDimType = 2
  params.companyContainFlag = 10  // 公司名称过滤条件：10-包含 20-排除
  params = {...params, ...formData}
  return api.requestErpInterface('bigdata.tms.aging.analysis.total.date.trend', { params: params })
}

/**
 * 获取详细运单列表
 */
const getDetailLsit = (dateRange, companyType, formData, page = 1, pageSize = 200) => {
  let params = {...DEFAULT_PARAMS}
  // 时间
  __setDateRange(params, dateRange)
  // 公司类型
  __setCompanyType(params, companyType)
  params.detType = '0'    // 明细类型 0-总票数
  params.title = 2
  params.companyContainFlag = 10  // 公司名称过滤条件：10-包含 20-排除
  params = {...params, ...formData}
  return api.requestErpInterface('bigdata.tms.aging.analysis.detail.list', {
    orderByClauses: [{
      field: "delivery_time", orderByMode: 1
    }],
    page: page,
    pageSize: pageSize,
    params: params
  })
}


/**
 * 获取客户历史信息
 * @param dataType 数据类型：10-发货城市 20-收货城市 30-服务方式
 */
const getCustomerInfo = (dataType) => {
  let params = {
    dataType,
    customerCode: [getCustomerCode()]
  }
  return api.requestErpInterface('bigdata.tms.customer.info', { params: params })
}


/**
 * 根据时间段配置参数
 */
const __setDateRange = (params, dateRange) => {
  if (!dateRange && dateRange.length !== 2) return
  params.startDate = dateRange[0]
  params.endDate = dateRange[1]
  // 是否跨月
  if (params.startDate.substr(0, 7) !== params.endDate.substr(0, 7)) {
    params.crossMonthFlag = 1
  }
}

/**
 * 根据公司类型配置参数
 */
const __setCompanyType = (params, companyType) => {
  params.companyType = companyType
  params.companyName = getUserData().customerInfo.customerShortName
  params.customerId = getUserData().customerInfo.id
}

export default {
  totalList,
  totalLineTrend,
  getServiceData,
  getLineData,
  getCustomerInfo,
  getMonthTrend,
  getDetailLsit
}