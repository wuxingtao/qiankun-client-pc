import request from '@/services/api/request'
import { paramsSpecife } from '@/views/setting/batchTemplate/utils'

const md5 = require('md5')
const createPrinterSign = (UserID, PrinterNo, timestamp) => {
  return md5(UserID + PrinterNo + timestamp + '36D9D723-116F-4E06-80D7-7B33BA5033F2').toUpperCase()
}

// 查询打印配置
export function GetPrintSet() {
  return request({
    // headerUrl: 'inc.client.getPrintSet',
    headerUrl: 'web.order.getPrintConfigure',
    method: 'post',
    data: {},
    hideErrMsg: false
  })
}

// 修改打印配置
export function UpdatePrintSet(params) {
  return request({
    // headerUrl: 'inc.client.updatePrintSet',
    headerUrl: 'web.order.savePrintConfigure',
    method: 'post',
    data: params
  })
}

// 绑定打印机
export function BindDevice(params) {
  return request({
    headerUrl: 'KYE_BindDevice',
    method: 'post',
    data: params
  })
}

// 解绑云打印机
export function UnBindDevice(params) {
  const now = parseInt(Date.now() / 1000)
  const data = Object.assign(params, {
    TimeStamp: now,
    Sign: createPrinterSign(params.UserID, params.PrinterNo, now),
    Fun: 'cancelapply'
  })
  return request({
    headerUrl: 'net.cloudprint.alicloud.cancelApply',
    method: 'post',
    data: data,
    hideErrMsg: true
  })
}

// 获取打印机列表
export function GetPrinters(params, hideErrMsg = false) {
  return request({
    headerUrl: 'KYE_GetPrinters',
    method: 'post',
    data: params,
    hideErrMsg
  })
}

// 获取面单类型图片
export function GetPrintTemplateImage(params, hideErrMsg = true) {
  return request({
    headerUrl: 'web.v2.printTools.getPrintTemplateImage',
    method: 'post',
    data: params,
    hideErrMsg
  })
}

// 获取市场员工号
export function GetSrcWorkerNoByCompNo(params = {}) {
  return request({
    headerUrl: 'GetSrcWorkerNoByCompNo',
    method: 'post',
    data: params
  })
}

// 修改密码-已修改
export function updateUserPassword(params) {
  return request({
    headerUrl: 'web.ssoUser.modifyPwd',
    method: 'post',
    data: params
  })
}

// 首次设置密码
export function updateUserFirstPassword(params) {
  return request({
    headerUrl: 'web.ssoUser.modifyPwdByFirstLogin',
    method: 'post',
    data: params
  })
}

// 修改个人信息
export function revisePersonalInfo(params) {
  return request({
    headerUrl: 'ecas.userAdapter.updateProfile',
    method: 'post',
    data: params
  })
}

// // 获取用户信息
// export function findByTel(params) {
//   return request({
//     headerUrl: 'ecas.userAdapter.findByTel' ,
//     method: 'post' ,
//     data: params
//   })
// }

// 个人中心-获取模板列表
export function getUserTemplatePageSearch(params) {
  return request({
    headerUrl: 'web.order.getUserTemplatePageSearch',
    method: 'post',
    data: params
  })
}

// 批量导入-获取默认模板
export async function getUserDefaultTemplatePageSearch(params) {
  const res = await request({
    headerUrl: 'web.order.getUserTemplatePageSearch',
    method: 'post',
    data: params
  })
  // 新接口需要做字段转换
  if (res.code === 0 && res.data.rows && res.data.rows.length > 0) {
    const defalutModel = res.data.rows.find(m => m.defaultSate === 1)
    let result = null
    if (defalutModel) {
      result = paramsSpecife('receipt', defalutModel)
    }
    return result
  }
}

// 个人中心-获取模板列表
export function saveUserTemplate(params) {
  return request({
    headerUrl: 'web.order.saveUserTemplate',
    method: 'post',
    data: params
  })
}

// 个人中心-删除模板列表
export function deleteUserTemplate(params) {
  return request({
    headerUrl: 'web.order.deleteUserTemplate',
    method: 'post',
    data: params
  })
}

// 个人中心模板-新增，更新
export function updateUserTemplate(params) {
  return request({
    headerUrl: 'web.order.updateUserTemplate',
    method: 'post',
    data: params
  })
}

// 个人中心模板-设为默认
export function updateDefaultTemplate(params) {
  return request({
    headerUrl: 'inc.client.updateDefaultTemplate',
    method: 'post',
    data: params
  })
}

// 获取客户信息
export function queryCustomerInfo(params) {
  return request({
    headerUrl: 'web.customer.get',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 获取个人信息-新
export function getUserInfoByPhone(params) {
  return request({
    headerUrl: 'web.ssoUser.getUserInfoByPhoneNew',
    method: 'post',
    data: params
  })
}

// 修改个人信息
export function modifyUserInfo(params) {
  return request({
    headerUrl: 'web.ssoUser.modifyUserInfo',
    method: 'post',
    data: params
  })
}

//新增电子运单打印地址标识
export function addPrintAddressFlag(params) {
  return request({
    headerUrl: 'web.client.printAddressFlag.save',
    method: 'post',
    data: params
  })
}

//修改电子运单打印地址标识
export function modifyPrintAddressFlag(params) {
  return request({
    headerUrl: 'web.client.printAddressFlag.update',
    method: 'post',
    data: params
  })
}

//删除电子运单打印地址标识
export function deletePrintAddressFlag(params) {
  return request({
    headerUrl: 'web.client.printAddressFlag.delete',
    method: 'post',
    data: params
  })
}

//查询电子运单打印地址标识
export function queryPrintAddressFlag(params) {
  return request({
    headerUrl: 'web.client.printAddressFlag.search',
    method: 'post',
    data: params
  })
}

//新增电子运单打印公司货品标识
export function addPrintCompanyGoodsFlag(params) {
  return request({
    headerUrl: 'web.client.printCompanyLabel.save',
    method: 'post',
    data: params
  })
}

//修改电子运单打印公司货品标识
export function modifyPrintCompanyGoodsFlag(params) {
  return request({
    headerUrl: 'web.client.printCompanyLabel.update',
    method: 'post',
    data: params
  })
}

//删除电子运单打印公司货品标识
export function deletePrintCompanyGoodsFlag(params) {
  return request({
    headerUrl: 'web.client.printCompanyLabel.delete',
    method: 'post',
    data: params
  })
}

//查询电子运单打印公司货品编码标识
export function queryPrintCompanyGoodsFlag(params) {
  return request({
    headerUrl: 'web.client.printCompanyLabel.search',
    method: 'post',
    data: params
  })
}

//新增电子运单打印公司标识
export function addPrintCompanyFlag(params) {
  return request({
    headerUrl: 'web.client.printCustomerFlag.save',
    method: 'post',
    data: params
  })
}

//修改电子运单打印公司标识
export function modifyPrintCompanyFlag(params) {
  return request({
    headerUrl: 'web.client.printCustomerFlag.update',
    method: 'post',
    data: params
  })
}

//删除电子运单打印公司标识
export function deletePrintCompanyFlag(params) {
  return request({
    headerUrl: 'web.client.printCustomerFlag.delete',
    method: 'post',
    data: params
  })
}

//查询电子运单打印公司标识
export function queryPrintCompanyFlag(params) {
  return request({
    headerUrl: 'web.client.printCustomerFlag.search',
    method: 'post',
    data: params
  })
}

export function isPrintAppOnline(appid) {
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'open.api.cloudPrint.queryPrinterStauts',
      param: JSON.stringify({ printClientId: appid })
    },
    method: 'post',
    token: false,
    hideErrMsg: true
  })
}

//查询默认配置
export function queryDefaultConfig() {
  let params = {}
  return request({
    headerUrl: 'web.order.config.getSendDefaultConfig',
    method: 'post',
    data: params
  })
}

// 更新默认配置
export function updateDefaultConfig(params) {
  return request({
    headerUrl: 'web.order.config.addOrUpdate',
    method: 'post',
    data: params
  })
}

// 通过地址获取市场员信息
export function getMarketingInfoByAddress(params) {
  return request({
    headerUrl: 'web.user.customer.queryMarketingPersonnel',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}
