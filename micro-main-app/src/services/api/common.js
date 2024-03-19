import request from './request'
import { getPhone, getCustomerCode } from '@/utils/storage'

// 解析Excel
export function parseExcel(params) {
  return request({
    headerUrl: 'web.v2.file.analyseExcel',
    hideErrMsg: true,
    method: 'post',
    data: params
  })
}

// 解析Excel成原始数据
export function parseExcelData(params) {
  return request({
    headerUrl: 'web.order.analyseExcel',
    hideErrMsg: true,
    method: 'post',
    data: params
  })
}

//查询数据字典
export function queryDataDictionary(dictionaryCode) {
  return request({
    headerUrl: 'web.order.getDataDictionaryByCode',
    method: 'post',
    data: { dictionaryCode }
  })
}

// 查询服务方式数据字典
export function queryServiceWayDict() {
  return request({
    headerUrl: 'gw.servicemode.listByStatus',
    hideErrMsg: true,
    method: 'post',
    data: {
      customerCode: 'PC_CLIENC',
      status: 10
    }
  })
}

// 获取ka客户自定义编码 (V1.0)
export function getKaCustomerMapping() {
  const data = {
    customerCode: getCustomerCode(),
    source:'20',
    page: 1,
    pageSize: 20
  }
  return request({
    headerUrl: 'web.order.customer.getKaCustomerMapping',
    hideErrMsg: true,
    method: 'post',
    data
  })
}

//取得客户的项目编码
export function getCustomerProjectInfo(customerCode) {
  customerCode = customerCode || getCustomerCode()
  if (!customerCode) {
    return
  }
  let params = {
    customerCode
  }
  return request({
    headerUrl: 'inc.client.getCrmMarketProject',
    method: 'post',
    data: params
  })
}

//取得系统配置信息
export function getSystemConfig() {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  if (!params.companyNo) {
    return
  }
  return request({
    headerUrl: 'PC-GetSystemConfigData',
    method: 'post',
    data: params
  })
}

//查询打印面单加密规则
export function getEncryptInfo() {
  let params = {
    customerCodes: [getCustomerCode()]
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'crm.customer.waybillEncryptConfig.queryByCondition',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false,
    hideErrMsg: true
  })
}

//路由查询
export function getRouteList(ydNos) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    data: ydNos.map(m => ({ ydCode: m })),
    waybillSource: '140'
  }
  return request({
    headerUrl: 'E-AWBRoute',
    method: 'post',
    data: params
  })
}

//获取路由详情
export function getRoutesApi(params) {
  return request({
    headerUrl: 'E-AWBRoute',
    method: 'post',
    data: params,
    hideErrMsg: true
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

//新增表格配置
export function addGridConfigApi(params) {
  return request({
    headerUrl: 'gw.gridConfig.addGridConfig',
    method: 'post',
    data: params
  })
}

//修改表格配置
export function modifyGridConfigApi(params) {
  return request({
    headerUrl: 'gw.gridConfig.updateGridConfig',
    method: 'post',
    data: params
  })
}

//获取用户权限
export function getUserPermissionApi() {
  let params = {
    phone: getPhone()
  }
  return request({
    headerUrl: 'client.authorization.list',
    method: 'post',
    data: params
  })
}

export function getUamPermissionList() {
  let params = {}
  return request({
    headerUrl: 'web.uam.net.permission.listByPhone',
    method: 'post',
    data: params
  })
}

// 查询打印配置
export function getPrintConfig() {
  let params = { mobile: getPhone() }
  return request({
    headerUrl: 'PC-GetPrintSet',
    hideErrMsg: true,
    method: 'post',
    data: params
  })
}

//136两联模板批量打印
export function batchPrint_136(
  waybills,
  printerNo,
  encryptionText,
  isPrintJJcg,
  IsPrintSon,
  TemplateType = 1
) {
  let params = {
    CompanyNo: getCustomerCode(),
    TemplateType: TemplateType,
    PrinterNo: printerNo,
    // "EncryptFieldStr": this.shieldInfo + '1',
    customerMsgEncry: encryptionText,
    BatchModels: waybills,
    IsPrintJJcg: isPrintJJcg,
    IsPrintSon: IsPrintSon,
    PrintCount: 1,
    PrintSource: 0
  }
  return request({
    headerUrl: 'KYE_BatchPrint_136',
    method: 'post',
    data: params
  })
}

//210三联模板批量打印
export function batchPrint_210(waybills, printerNo, encryptionText, isPrintJJcg, IsPrintSon) {
  let params = {
    CompanyNo: getCustomerCode(),
    TemplateType: 1,
    PrinterNo: printerNo,
    // "EncryptFieldStr": this.shieldInfo + '1',
    customerMsgEncry: encryptionText,
    BatchModels: waybills,
    IsPrintJJcg: isPrintJJcg,
    IsPrintSon: IsPrintSon,
    PrintCount: 1,
    PrintSource: 0
  }
  return request({
    headerUrl: 'KYE_BatchPrint_210',
    method: 'post',
    data: params
  })
}

//云打印标签打印
export function batchPrint_Tag(tagModel, printerNo) {
  let params = {
    CompanyNo: getCustomerCode(),
    PrinterNo: printerNo,
    BatchModels: tagModel,
    PrintCount: 1,
    PrintSource: 0
  }
  return request({
    headerUrl: 'KYE_BatchPrint_Tag',
    method: 'post',
    data: params
  })
}

//列表打印
export async function batchPrint(params) {
  let res = await request({
    headerUrl: 'inc.client.printWaybill',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
  if (res.code == 601 && res.taskId) {
    params.taskId = res.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 400)
    })
    return await batchPrint(params)
  }
  return res
}

// 月结助手打印
export async function billPrint(params) {
  let res = await request({
    headerUrl: 'inc.client.printWaybillForMonth',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
  if (res.code == 601 && res.taskId) {
    params.taskId = res.taskId
    await new Promise(resolve => {
      setTimeout(resolve, 400)
    })
    return await billPrint(params)
  }
  return res
}

// 获取打印机列表
export function getPrinters() {
  let params = { companyNo: getCustomerCode() }
  return request({
    headerUrl: 'KYE_GetPrinters',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 获取所有服务方式
export function getServiceAll() {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  return request({
    headerUrl: 'PC-GetCustomerQuoteServiceWay',
    method: 'post',
    data: params
  })
}

// 获取付款账号
export function getPayCustomerInfo() {
  let params = {
    phone: getPhone()
  }
  return request({
    headerUrl: 'inc.client.getPayCustomerInfo',
    method: 'post',
    data: params
  })
}

// 获取货好批次时间
export function getGoodsBatchTimes() {
  let params = {
    mobile: getPhone()
  }
  return request({
    headerUrl: 'inc.client.getGoodsBatch',
    method: 'post',
    data: params
  })
}

// 获取打印模板
export function getTemplateList() {
  let params = {
    mobile: getPhone()
  }
  return request({
    headerUrl: 'web.v2.printBasic.templateList',
    method: 'post',
    data: params
  })
}

//更新版本号
export function UpdateVersion(versionNo) {
  let params = {
    phone: getPhone(),
    mac: getPhone(),
    pcname: getPhone(),
    versionNo: versionNo
  }
  return request({
    headerUrl: 'PC-UpdateCustomerAuthorizationInfo',
    method: 'post',
    data: params
  })
}

// 获取问卷调查信息
export function getQuestionInfo() {
  let params = {
    sourceKey: '30',
    pageKey: '300'
  }
  return request({
    headerUrl: 'web.questionPushRecord.isExistQuestion',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 获取服务方式
export function getCustomerServiceTypes() {
  let data = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  return request({
    headerUrl: 'web.query.waybill.getCustomerServiceTypes',
    method: 'post',
    data
  })
}

// 获取付款公司
export function getPayCustomerList() {
  let data = {
    companyNo: getCustomerCode(),
    mobile: getPhone()
  }
  return request({
    headerUrl: 'web.query.waybill.listPayCustomer',
    method: 'post',
    data
  })
}

//获取数据-子母单权限等等
export function GetRequirementNew() {
  return request({
    headerUrl: 'web.order.getRequirementNew',
    method: 'post',
    data: {},
    hideErrMsg: true
  })
}

//获取货好批次web.order.getGoodsBatch
export function getGoodsBatch() {
  const code = getCustomerCode()
  if (!code) {
    return {}
  }
  return request({
    headerUrl: 'web.order.getGoodsBatch',
    method: 'post',
    data: {}
  })
}

//130一联模板批量打印
export function batchPrint_130(
  waybills,
  printerNo,
  encryptionText,
  isPrintJJcg,
  IsPrintSon,
  TemplateType = 1
) {
  let params = {
    CompanyNo: getCustomerCode(),
    TemplateType: TemplateType,
    PrinterNo: printerNo,
    // "EncryptFieldStr": this.shieldInfo + '1',
    customerMsgEncry: encryptionText,
    BatchModels: waybills,
    IsPrintJJcg: isPrintJJcg,
    IsPrintSon: IsPrintSon,
    PrintCount: 1,
    PrintSource: 0
  }
  return request({
    headerUrl: 'KYE_BatchPrint_130',
    method: 'post',
    data: params
  })
}

//保存代理信息
export function saveProxyInfo(params) {
  let paramsData = {
    address: params.ProxyUrl,
    port: params.ProxyPort,
    userName: params.ProxyUsername,
    password: params.ProxyPassword,
    domain: params.ProxyDomain,
    agentStatus: params.ProxyType
  }
  return request({
    headerUrl: 'web.client.clientLoginDomainLog.updateLog',
    method: 'post',
    data: paramsData
  })
}

//获取客户加密配置
export function getWaybillEncryptConfig(){
  let params={
    companyNo:getCustomerCode()
  }
  return request({
    headerUrl: 'web.printTools.getWaybillEncryptConfig',
    method: 'post',
    data:params,
    hideErrMsg: true
  })
}

//广告基础配置查询 
export function getByChannel(){
  let params={
    channelCode:'pc'
  }
  return request({
    headerUrl: 'web.advertisement.area.getByChannel',
    method: 'post',
    data:params,
    hideErrMsg: true
  })
}

//广告详情查询 
export function getAdvertisementDetails(params){
  return request({
    headerUrl: 'web.advertisement.getDetails',
    method: 'post',
    data:params,
    hideErrMsg: true,
  })
}

//用户操作事件触发接口 
export function advertisementConfirmByUser(params,hideErrMsg){
  return request({
    headerUrl: 'web.advertisement.confirmByUser',
    method: 'post',
    data:params,
    hideErrMsg:hideErrMsg
  })
}