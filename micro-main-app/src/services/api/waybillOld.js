import dayjs from 'dayjs'
import request from './request'
import { v4 as uuidv4 } from 'uuid'
import { getPhone, getCustomerCode } from '@/utils/storage'
import { convertQueryModels } from '@utils/clientUtil'
import { toJSONString } from 'xe-utils'
// import { delete } from "vue/types/umd"

//查询运单数据
// export function queryWaybillData(params){
//     let tempParams = {
//         customerNo: getCustomerCode(),
//         phone:getPhone(),
//         DateType:0
//     }
//     tempParams= Object.assign(tempParams,params)
//     return request({
//         headerUrl: 'E-AWBYDList_V3',
//         method: 'post',
//         data: tempParams,
//         hideErrMsg: true
//     })
// }
export async function queryWaybillData(params) {
  let tempParams = {
    customerCode: getCustomerCode(),
    phone: getPhone()
  }
  if (!tempParams.customerCode) {
    return { code: -1, msg: '客户编码不能为空' }
  }
  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'inc.client.pageWaybillInfoV2',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
  if (result.code == 601 && result.taskId) {
    tempParams.taskId = result.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })
    return await queryWaybillData(tempParams)
  }
  if (result.code === 0 && result.data && result.data.dataList) {
    result.data.dataList = convertQueryModels(result.data.dataList)
  }
  return result
}

// 批次运单信息查询
export async function queryBatchWaybillData(params) {
  let tempParams = {
    customerCode: getCustomerCode(),
    phone: getPhone(),
    DateType: 0
  }
  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'inc.client.pageBatchWaybillInfo',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })

  if (result.code === 0 && result.data && result.data.dataList) {
    result.data.dataList = convertQueryModels(result.data.dataList)
  }
  return result
}

//查询运单各状态下的数量
export async function queryWaybillStatusCounts(params) {
  let tempParams = {
    customerCode: getCustomerCode(),
    phone: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  if (!tempParams.customerCode) {
    return { code: -1, msg: '客户编码不能为空' }
  }
  let result = await request({
    headerUrl: 'inc.client.getWaybillStatusCountV2',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
  if (result.code == 601 && result.taskId) {
    tempParams.taskId = result.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 300)
    })
    return await queryWaybillStatusCounts(tempParams)
  }
  return result
}

//查询单票运单详情
export async function queryWaybillDetail(ydCode, deliveryRoler) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    deliveryRoler: deliveryRoler || '0',
    keyword: ydCode,
    pageIndex: '1',
    pageSize: '1',
    ydStatus: '-1',
    type: '-1'
  }
  let res = await queryWaybillData(params)
  if (res.code === 0) {
    return res.data.dataList[0]
  }
}

// 电子运单-通过运单号查询运单信息
export async function queryWaybillInfoByNumbers(
  waybillNumbers,
  isConvertFieldName = true,
  startTime = null,
  endTime = null
) {
  let params = {
    customerCode: getCustomerCode(),
    phone: getPhone(),
    waybillNumbers: waybillNumbers.map(m => ({ waybillNumber: m })),
    startTime: startTime,
    endTime: endTime
  }
  let res = await request({
    headerUrl: 'inc.client.queryWaybillInfoByNumbers',
    method: 'post',
    data: params
  })
  if (res.code === 0) {
    if (isConvertFieldName) {
      return convertQueryModels(res.data)
    }
    return res.data || []
  }
}

//判断当前用户自动下单信息
export function getAutoOrderInfo() {
  let params = {
    companyNo: getCustomerCode(),
    phone: getPhone()
  }
  return request({
    headerUrl: 'query_isCanAutoAddOrder',
    method: 'post',
    data: params
  })
}

//下单
// export function placeOrder(params){
//     let tempParams= {
//         companyNo: getCustomerCode(),
//         mobile:getPhone(),
//         WaybillSource:"140" //TODO：暂定死来源为客户端
//     }
//     tempParams= Object.assign(tempParams,params)
//     return request({
//         headerUrl: 'E-AWBXD',
//         method: 'post',
//         data: tempParams
//     })
// }
export async function placeOrder(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    WaybillSource: '140'
  }
  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'inc.client.orderWaybill',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
  if (result.code == 601 && result.taskId) {
    tempParams.taskId = result.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    return await placeOrder(tempParams)
  } else if (result.code != 0 && result.msg) {
    throw result.msg
  }
  let addressList = []
  params.data &&
    params.data.reduce((arr, cur) => {
      arr.push(...cur.addressList)
      return arr
    }, addressList)
  restrictSearchAndPushKS(addressList)
  return result
}

// 限行查询(互联网各端) (V1.0)
async function restrictSearchAndPushKS(addressList) {
  try {
    addressList = Array.from(new Set(addressList))
    addressList = addressList.map((m, index) => ({ id: index, address: addressList[index] }))
    let params = { addressList }
    const res = await request({
      headerUrl: 'gw.restrict.restrictBatchSearch',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if (res.code == 0 && res.data.length > 0) {
      if (res.data.some(s => s.restrictTag === '1')) {
        //如果有一个地址有限行，则推送跨声
        restrictPush()
      }
    }
  } catch (ex) {
    console.log('限行推送异常 :>> ', ex)
  }
}

// 限行推送至跨声 (互联网各端) (V1.0)
function restrictPush() {
  let params = {
    phone: getPhone(),
    customerCode: getCustomerCode(),
    orderNo: []
  }
  return request({
    headerUrl: 'gw.restrict.iaaPush',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

//查询夜间取货费用
export function getNightPickupFee(pickupTime, areaCode) {
  let params = {
    customerCode: getCustomerCode(),
    calculationFeeTime: pickupTime,
    beginAreaCode: areaCode
  }
  return request({
    headerUrl: 'gw.foward.api-auth', //'gw.foward.api',
    data: {
      method: 'crm.query.freightAmount.remote.calculateNightPickupFee',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false
  })
}

// 单个查询夜间取货费用-新 [{customerCode,waybillNo,sendAddress,calculationFeeTime}]
export function getNgihtFeeNew(params=[]){
  const paramsData = params.map(item=>{
    return {
      ...item,
      waybillNo: item.waybillNo || uuidv4() // 运单号或者唯一标识
    }
  })
  return request({
    headerUrl: 'web.order.batchGetNightFee',
    method: 'post',
    data: paramsData
  })
}

//运单推送
export function pushWaybill(params) {
  let tempParams = {
    // companyNo: getCustomerCode(),
    phone: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'E-AWBPush',
    method: 'post',
    data: tempParams
  })
}

//删除运单
export function deleteWaybill(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'E-AWBDeleteYD_V3',
    method: 'post',
    data: tempParams
  })
}

//取消发货
export function cancelShipment(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'E-AWBDelete',
    method: 'post',
    data: tempParams
  })
}

//取消发货（新）
export function cancelOrder(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'inc.client.cancelOrder',
    method: 'post',
    data: tempParams
  })
}

//修改货好时间
export function modifyGoodtime(ydNo, goodtime) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    ydCode: ydNo,
    hhDateTime: dayjs(goodtime).format('YYYY-MM-DD HH:mm:ss')
  }
  return request({
    headerUrl: 'E-AWBUpdateHHDateTime',
    method: 'post',
    data: params
  })
}

//上传唯品会入库号
export function uploadVipshopCode(list) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    dataList: list
  }
  return request({
    headerUrl: 'E-UploadVipshopCode',
    method: 'post',
    data: params
  })
}

/**
 * 上传委托书或预约单
 * @param {Boolean} isAppointmentFile  是否是上传预约单
 * @param {*} uploadFiles 上传文件
 * @param {*} ydNo
 * @param {*} isOrder
 */
export function uploadOrderFiles(isAppointmentFile, uploadFiles, ydNo, isOrder = false) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    data: uploadFiles,
    ydCode: ydNo
  }
  if (!isAppointmentFile) {
    params.type = '0'
    if (isOrder) {
      params.ydCode = ''
      params.OrderNo = ydNo
    }
  }
  return request({
    headerUrl: isAppointmentFile ? 'E-AppointmentsUpload' : 'ProxyUpload',
    method: 'post',
    data: params
  })
}

//删除委托书或预约单
export function deleteOrderFile(isAppointmentFile, id) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    id
  }
  return request({
    headerUrl: isAppointmentFile ? 'E-DeleteAppointment' : 'E-DeleteProxy',
    method: 'post',
    data: params
  })
}

//查询委托书或预约单
export function queryOrderFile(isAppointmentFile, ydNo, isOrder = false) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  if (isAppointmentFile) {
    params.YDCode = ydNo
  } else {
    (params.ydCode = isOrder ? '' : ydNo), (params.OrderNo = isOrder ? ydNo : '')
  }
  return request({
    headerUrl: isAppointmentFile ? 'E-GetAppointmentList' : 'E-GetProxyList',
    method: 'post',
    data: params
  })
}

//京东预约
export function appointOfJd(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    phone: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'AppointToJd',
    method: 'post',
    data: tempParams
  })
}

//催收
export function urgeCollection(ydNo, isOrder = false) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    ydCode: isOrder ? '' : ydNo,
    OrderNo: isOrder ? ydNo : ''
  }
  return request({
    headerUrl: 'E-AWBReminder',
    method: 'post',
    data: params
  })
}

//催派
export function urgeDelivery(ydNo) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    ydCode: ydNo
  }
  return request({
    headerUrl: 'E-AWBReminderDelivery',
    method: 'post',
    data: params
  })
}

/**
 * 查询运单、签收、回单图片
 * @param {String} ydNo
 * @param {Number} type 1：运单联 2：派送联 3：回单联
 */
export function queryWaybillImages(ydNo, type) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    ydCode: ydNo,
    intKndType: type
  }
  return request({
    headerUrl: 'PC-DownloadWaybillPic',
    method: 'post',
    data: params
  })
}

//查询回单信息
export function queryReceiptImageInfo(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    accountdate: '',
    orderNo: ''
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'PC-GetHDPicCountAndWBNos_V3',
    method: 'post',
    data: tempParams
  })
}

//查询回单信息-分页
export function queryHDPicCountAndWBNos(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    accountdate: '',
    orderNo: ''
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'inc.client.pageHDPicCountAndWBNos',
    method: 'post',
    data: tempParams
  })
}

//下载回单图片
export function downloadReceiptImages(ydNos) {
  let params = { bizCode: 'waybill_upload_image_receipt', bizIds: ydNos }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'file.getByBizCodeAndBizIds',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false
  })
}

//回单图片反馈
export function feedbackOfReceipt(ydNo, content, errorType) {
  let params = {
    customerPhone: getPhone(),
    detail: content,
    waybillNumber: ydNo,
    source: '10',
    errorType: errorType
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'tms.receipt.externalapp.rePicture',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false
  })
}

//查询默认配置
export function queryDefaultConfig() {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  return request({
    headerUrl: 'PC-GetInitialParam',
    method: 'post',
    data: params
  })
}

// 更新默认配置
export function updateInitialParam(params) {
  return request({
    headerUrl: 'PC-UpdateInitialParam',
    method: 'post',
    data: params
  })
}

//查询表格列配置
export function queryGridColumnConfig(gridName) {
  let params = {
    mobile: getPhone(),
    gridName
  }
  return request({
    headerUrl: 'gw.gridConfig.queryGridConfig',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

//获取路由详情
export function getRoutesApi(params) {
  return request({
    headerUrl: 'E-AWBRoute',
    method: 'post',
    data: params
  })
}

export async function exportWaybillData(params) {
  delete params.waybillStatus
  let tempParams = {
    customerCode: getCustomerCode(),
    phone: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'inc.client.exportWaybillInfo',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
  if (result.code == 601 && result.taskId) {
    tempParams.taskId = result.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    return await exportWaybillData(tempParams)
  }
  if (result.code === 0 && result.data) {
    result.data = convertQueryModels(result.data)
  }
  return result
}

// 批次号导出运单数据
export async function exportBatchWaybillData(params) {
  delete params.waybillStatus
  let tempParams = {
    customerCode: getCustomerCode(),
    phone: getPhone()
  }
  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'inc.client.exportBatchWaybillInfo',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
  if (result.code == 601 && result.taskId) {
    tempParams.taskId = result.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })
    return await exportBatchWaybillData(tempParams)
  }
  if (result.code === 0 && result.data) {
    result.data = convertQueryModels(result.data)
  }
  return result
}

//打印标签-修改运单件数
export function updateYdNumber(params) {
  return request({
    headerUrl: 'inc.client.updateYdNumber',
    method: 'post',
    data: params
  })
}

//打印数据获取
export function getPrintData(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    printSource: 10,
    addPrintCount:false
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'web.v2.printTools.getPrintData',
    method: 'post',
    data: tempParams
  })
}

//通过打印组件打印
export function printByPrintApp(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    printSource: 10
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'web.v2.printTools.synchronizePrint',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
}

//打印数据获取
export function getSingleNos(params) {
  let tempParams = {
    companyNo: getCustomerCode(),
    parentNos: params
  }
  return request({
    headerUrl: 'inc.client.getSingleNos',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
}

//修改打印次数
export function incrementYDPrintTimes(params) {
  let tempParams = {
    CompanyNo: getCustomerCode(),
    Data: params
  }
  return request({
    headerUrl: 'E-IncrementYDPrintTimes',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
}

//获取水印码
export function getWatermarks(params) {
  let tempParams = {
    moblile: getPhone(),
    companyNo: getCustomerCode(),
    waybillInfoGetWatermarks: params
  }
  return request({
    headerUrl: 'inc.client.getWatermarks',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
}

//获取防伪码
export function getSecurityCodeList(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'pda.oemtransfer.platform.stowageLabel.pickupLabelSaveForPlatform',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false,
    hideErrMsg: true
  })
}

//取货标签 pda.oemtransfer.platform.externalWaybill.externalBatchSave
export function pickupGoodsLabel(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'pda.pickupgoodsLabel.save',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false,
    hideErrMsg: true
  })
}

//京东信息传递给巴枪
export function externalBatchSave(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'pda.oemtransfer.platform.externalWaybill.externalBatchSave',
      param: JSON.stringify({ externalWaybillInfoList: params })
    },
    method: 'post',
    token: false,
    hideErrMsg: true
  })
}

//根据运单号获取供应商信息
export function getSupplierNameByWaybillNums(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'web.supplier.distributionInfo.getSupplierNameByWaybillNums',
    method: 'post',
    data: params
  })
}

//查询委托书状态
export function getListProxyStatus(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'webClient.order.query.listProxy',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

//批量查询落地配平台转代理信息
export function getListOutsideAgentLandingDelivery(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'web.client.listOutsideAgentLandingDelivery',
    method: 'post',
    data: params
  })
}

//查件管理-查询运单货物仓储信息
export function getCargoStorageInfo(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'web.order.waybill.getCargoStorageInfo',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

//修改货好时间 web.order.waybill.getCarGoStorageCount
export function modifyDeliveryTime(params) {
  if (!params || params.length === 0) {
    return { code: -1 }
  }
  return request({
    headerUrl: 'web.order.waybill.modifyDeliveryTime',
    method: 'post',
    data: params
  })
}

//获取产生保管费运单数量
export function getCarGoStorageCount() {
  let params = {
    waybillSource: '30'
  }
  return request({
    headerUrl: 'web.order.waybill.getCarGoStorageCount',
    method: 'post',
    data: params
  })
}

// 导出-获取任务状态
export function waybillExportStatus() {
  let params = {}
  return request({
    headerUrl: 'web.client.export.exportStatus',
    method: 'post',
    data: params
  })
}

// 导出-获取任务结果
export function waybillGetExportResult() {
  let params = {}
  return request({
    headerUrl: 'web.client.export.getExportResult',
    method: 'post',
    data: params
  })
}

// 查件-Excel导出运单信息 (导出按钮-触发)
export async function queryExportWaybill(params) {
  let tempParams = {
    customerCodes: [],
    clientType: 10,
    fileName: '运单列表'
  }

  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'web.client.order.qurey.exportWaybill',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })

  return result
}


// 查件-Excel导出运单信息 (导出按钮-触发)
export async function queryExportWaybillOld(params) {
  // 6位随机数，用于生成webTraceId
  const randomNum = Math.floor(100000 + 100000 * Math.random())
  let tempParams = {
    customerCodes: [],
    requestId: String(randomNum),
    clientType: 10
  }

  tempParams = Object.assign(tempParams, params)
  let result = await request({
    headerUrl: 'web.client.order.qurey.exportWaybill',
    method: 'post',
    data: tempParams,
    hideErrMsg: true
  })
  // [40001:'开始导出',4002:'正在导出中',40003:'导出完成'，40004：'导出失败']
  if (result.code === 40001 || result.code === 40002) {
    // tempParams.traceId = result.traceId
    await new Promise(resolve => {
      setTimeout(resolve, 500)
    })

    return await queryExportWaybill(tempParams)
  }

  if (result.code === 30000) {
    return result
  }

  return result
}


// 获取单个优惠券详情
export function getTicketDetail(params) {
  return request({
    headerUrl: 'kyact.userTicketInfo.getTicketDetail',
    method: 'post',
    data: params
  })
}
// 获取单个优惠券详情及是否存在可用优惠券
export function getTicketDetailV2(params) {
  return request({
    headerUrl: 'kyact.userTicketInfo.getTicketDetailV2',
    method: 'post',
    data: params
  })
}

// 获取下单优惠券列表
export function getListTicketsByOrder(params) {
  return request({
    headerUrl: 'kyact.userTicketInfo.listTicketsByOrder',
    method: 'post',
    data: params
  })
}

// 下单优惠券可用数
export function getCountTicketsByOrder(params) {
  return request({
    headerUrl: 'kyact.userTicketInfo.countTicketsByOrder',
    method: 'post',
    data: params
  })
}

// 获取历史订单备注
export function getOrderRemarkHistory() {
  const params = {
    customerCode: getCustomerCode()
  }
  return request({
    headerUrl: 'web.query.orderRemark.history',
    method: 'post',
    data: params
  })
}

// 敏感词校验对外接口
export function vaildSensitiveWord(content) {
  const params = {
    content
  }
  return request({
    headerUrl: 'web.order.help.vaildSensitiveWord',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}




