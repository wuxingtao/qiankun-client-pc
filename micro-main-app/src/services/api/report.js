import request from "./request"
import { getPhone,getCustomerCode,getCustomerId } from "@/utils/storage"

const serviceWay={
  10:'当天达',
  20:'次日达',
  30:'隔日达',
  40:'陆运件',
  50:'同城次日',
  60:'次晨达',
  70:'同城即日',
  80:'航空件',
  90:'早班件',
  100:'中班件',
  110:'晚班件',
  160:'省内次日',
  170:'省内即日',
  190:'内部次日',
  200:'内部件',
  210:'空运',
  220:'专运',
  230:'B2B',
  240:'整车运输',
  290:'内部急件',
  300:'冷链零担',
  340:'次中达',
  350:'隔晨达',
  360:'隔中达',
  370:'陆晨达',
  380:'同城次晨',
  390:'同城次中',
  400:'省内次晨',
  410:'省内次中',
  1100:'特惠快运',
  1200:'特惠普运',
  1300:'特惠航空',
  1400:'特惠同城',
  1500:'特惠省内',
}


function addParams(params){
  if(!params){
    return
  }
  params.customerCode=getCustomerCode()
  params.customerId=getCustomerId()
}

//获取数据更新时间
export function getDataUpdateTime() {
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.crm.search.etltime.log",
      param: JSON.stringify({'params':{taskCode:'project_analytics'}})
    },
    method: "post",
  })
}

//获取费用汇总数据
export function getFeeSummary(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.cost.summary",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取费用走势图数据(按月)
export function getFeeTrendDataByMonth(payway) {
  const params={
    customerCode:getCustomerCode(),
    customerId:getCustomerId(),
    payMode:payway
  } 
  return  request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.cost.searchByMonth",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取费用走势图数据(按季)
export function getFeeTrendDataByQuarter(payway) {
  const params={
    customerCode:getCustomerCode(),
    customerId:getCustomerId(),
    payMode:payway
  } 
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.cost.searchByQuarter",
      param: JSON.stringify({'params':params})
    },
    method: "post",
    token: false,
  })
}

//获取费用服务方式占比
export async function getFeeServiceWayProportion(params) {
  addParams(params)
  const res=await request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.cost.serviceModeProportion",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
  if(res.code===0&&res.data){
    res.data.forEach(d=>{
      Object.assign(d,{serviceType:serviceWay[d.serviceType]})
    })
  }
  return res
}

//获取费用服务方式分布明细
export async function getFeeServiceWayDetail(params) {
  addParams(params)
  const res=await request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.cost.serviceModeDetail",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
  if(res.code===0&&res.data){
    res.data.forEach(d=>{
      Object.assign(d,{serviceType:serviceWay[d.serviceType]})
    })
  }
  return res
}

//获取总重量
export function getWeigthAmount(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.goodstype.statistics.weight.summary",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取重量统计数据
export function getWeigthStatistic(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.goodstype.statistics.weight",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取省份重量统计数据
export function getWeigthStatisticOfProvince(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.goodstype.statisticsByProvice.list",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取城市重量统计数据
export function getWeigthStatisticOfCity(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.goodstype.statisticsByCity.list",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}


//获取整体妥投汇总信息
export function getInvestmentSummary(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.investment.summary",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取整体妥投分析-按产品服务方式
export async function getInvestmentByServiceModeList(params) {
  addParams(params)
  let result=await request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.investment.byServiceMode.list",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })

  if (result.code === 0 && result.data) {
    result.data.forEach(e=>{
      e.serviceName=serviceWay[''+e.serviceType]
    })
  }
  return result
}

//获取整体妥投分析-按省市
export function getInvestmentByAddressList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.investment.byAddress.list",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取发货省份
export function getSendProvinceList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.getShipProvinceList",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取收件省份
export function getReceiveProvinceList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.getReceiveProvinceList",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取发货城市
export function getSendCityList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.getShipCityList",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取收件城市
export function getReceiveCityList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.getReceiveCityList",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取收件公司
export function getReceiveCompanyList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.getReceiveCustomerList",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取时效内妥投汇总信息
export function getPrescriptionSummary(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.prescription.investment.summary",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

    
//通过省份获取流向数据
export function getFlowDataByProvince(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.byProvince",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取时效内妥投分析-按产品服务方式
export async function getPrescriptionByServiceModeList(params) {
  addParams(params)
  let result=await request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.prescription.investment.byServiceMode.list",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
  if (result.code === 0 && result.data) {
    result.data.forEach(e=>{
      e.serviceName=serviceWay[''+e.serviceType]
    })
  }
  return result
}

//通过城市获取流向数据
export function getFlowDataByCity(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.byCity",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}
//通过收件公司获取流向数据
export function getFlowDataByReceiveCompany(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.byReceiveCustomer",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取时效内妥投分析-按省市
export function getPrescriptionByAddressList(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.prescription.investment.byAddress.list",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

//获取流向数据发货地
export function getFlowSendCity(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.shipCity",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}
//获取流向数据
export function getFlowDirectionData(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.flowDirectionPicture",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 流向分析-城市（件）TOP10
export function topCityByWaybillCount(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.topCityByWaybillCount",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 流向分析-城市（票）TOP10 
export function topCityByWaybill(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.topCityByWaybill",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 流向分析-收件公司TOP10 
export function topReceiveCustomer(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.topReceiveCustomer",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 流向分析-获取城市数量
export function getCityCount(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.flowDirectionAnalysis.getCityCount",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 获取报表权限
export function getCustomerizedPermission() {
  return request({
    headerUrl: 'web.authorization.getCustomerizedPermission',
    method: 'post',
    data: {},
  })
}

// 快件统计-总览数据
export function getExpressOverview(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.expressStatistics.overviewByWaybill",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 快件统计-产品服务
export function getExpressServiceWay(params) {
  addParams(params)
  return request({
    headerUrl:'web.v2.clientBigDataReport.serviceType',// 'bigdata.web.expressStatistics.serviceType',
    method: 'post',
    data: { params }
  })
}

// 快件统计-异常运单数据总览
export function getExpressAbnormalOverview(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.expressStatistics.unDeliveryOverview",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 快件统计-异常运单占比数据
export function getExpressAbnormalProportion(params) {
  addParams(params)
  return request({
    headerUrl: 'web.v2.clientBigDataReport.unDeliveryOverviewDetail',
    method: 'post',
    data: { params }
  })
}

// 快件统计-异常运单详情(带分页)
export function getExpressAbnormalWaybillWithPages(params) {
  return request({
    headerUrl: 'web.v2.clientBigDataReport.pageUnDeliveryWaybillDetail',
    method: 'post',
    data:  params 
  })
}

// 快件统计-异常运单详情(全部数据)
export function getExpressAbnormalWaybill(params) {
  return request({
    headerUrl: 'web.v2.clientBigDataReport.exportUnDeliveryWaybillDetail',
    method: 'post',
    data: { params }
  })
}

// 快件统计-通过付款方式获取运单详情(含分页信息)
export function getExpressWaybillsByPaymentWithPages(params) {
  return request({
    headerUrl: 'web.v2.clientBigDataReport.pageExpressStatisticsWaybillDetail',
    method: 'post',
    data:  params 
  })
}

// 快件统计-通过付款方式获取运单详情（各付款方式数量）
export function getExpressWaybillsCountInfoByPayment(params) {
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.expressStatistics.eachPayModeWaybillCount",
      param: JSON.stringify({'params':params})
    },
    method: "post",
  })
}

// 快件统计-通过付款方式获取运单详情（全部运单数据）
export function getExpressWaybillsByPayment(params) {
  return request({
    headerUrl: 'web.v2.clientBigDataReport.exportExpressStatisticsWaybillDetail',
    method: 'post',
    data: { params }
  })
}

// 快件实时动态-总览
export function getExpressRealtimeOverview(params) {
  addParams(params)
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.currentExpressData.overview",
      param: JSON.stringify({'params':params})
    },
    method: "post" 
  })
}

// 快件实时动态-运单管理数据
export function getExpressRealtimeWaybills(params) {
  return request({
    headerUrl: 'web.v2.bigdata.waybill.list',
    method: 'post',
    data: params 
  })
}

// 快件实时动态-运单管理数据(总条数信息)
export function getExpressRealtimeWaybillsCountInfo(params) {
  return request({
    headerUrl: "web.bigdata.foward.api-auth",
    data: {
      method: "bigdata.web.currentExpressData.logisticsStatusWaybillCount",
      param: JSON.stringify({'params':params})
    },
    method: "post" 
  })
}