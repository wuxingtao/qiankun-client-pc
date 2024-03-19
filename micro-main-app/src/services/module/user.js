import api from '@/services/api'
import ENV from '@/utils/env'
import { getPhone, getCustomerCode} from '@/utils/storage'

/**
 * 获取广告图片
 */
const getAdImage = () => {
  return api.request('inc.client.getAdImage', null, { withToken: false, errorMode: 'silent' })
}

/**
 * 登录
 */
const login = params => {
  return api.request('web.ssoPc.login', params,  { withToken: false })
}

/**
 * 获取官方文档 - 用户协议127、隐私政策131、 电子运单137
 */
const getHelpDoc = params => {
  return api.request('web.help.getHelp', params,  { withToken: false, errorMode: 'silent' })
}

/**
 * 获取图形验证码
 */
const getImgCode = params => {
  return api.request('web.ssoVerification.getImgCode', { from: ENV.APP_FROM_ID, ...params },  { withToken: false })
}

/**
 * 发送短信验证码
 */
const sendSmsCode = params => {
  return api.request('web.ssoVerification.sendSmsCode', { from: ENV.APP_FROM_ID, ...params },  { withToken: false })
}

/**
 * 忘记密码
 */
const resetPassword = params => {
  return api.request('web.ssoPc.resetPwd', params,  { withToken: false })
}

/**
 * 获取登录二维码
 */
const getQrUrl = () => {
  return api.request('web.ssoPc.getQrCodeUrl', { appId: ENV.ECAS_APP_ID },  { withToken: false })
}

/**
 * 扫码登录
 */
const qrCodeLogin = lgToken => {
  return api.request('web.ssoPc.qrCodeLogin', { lgToken: lgToken }, { withToken: false, errorMode: 'silent' })
}


/**
 * 用户信息
 */
const getUserInfo = () => {
  return api.request('web.ssoUser.getUserInfoByPhoneNew', { from: ENV.APP_FROM_ID })
}

// 获取客户信息
const queryCustomerInfo = customerCode => {
  if(!customerCode){
    return {}
  }
  return api.request('web.user.getcustomerInfo',{customerCode})
}

/**
 * 检查手机号是否注册
 */
const checkRegisterByPhone = params => {
  return api.request('web.ssoUser.checkRegisterByPhone', params, { withToken: false, errorMode: 'silent' })
}

/**
 * 获取系统配置数据
 */
const getSystemConfigData = () => {
  return api.request('PC-GetSystemConfigData', {})
}

/**
 * 检查用户是否已实名认证
 */
const checkRealNameAuth = () => {
  return api.request('web.v2.userRealName.checkAuth', {})
}

/**
 * 检查运单是否存在或有效
 */
const checkWaybillExist = waybillNumber => {
  return api.request('inc.client.existWaybillNumbers', { waybillNumber: waybillNumber, phone: getPhone(), customerCode: getCustomerCode() })
}

/**
 * 初次登录设置密码
 */
const modifyPwdByFirstLogin = password => {
  return api.request('web.ssoUser.modifyPwdByFirstLogin', {password: password})
}

/**
 * 绑定客户编码
 */
const bindCustomerCode = (code, password) => {
  return api.request('web.ssoUser.userBindCustomerCode', {customCode: code, customPwd: password})
}

/**
 * 获取解绑时的提示语
 */
const getUnbindWarnMessage = () => {
  return api.request('web.uam.net.appUser.checkUserRoleByUnbind', {})
}
/**
 * 获取用户绑定信息
 * @returns 
 */
const getCustomerCodeBindInfo = () => {
  return api.request('web.uam.uamAppUser.getUserUnionBindInfo', {})
}

// /**
//  * 获取当前用户相关客户编码
//  * @param {string} userType 用户类型 10：新客户 20：老客户
//  * @returns 
//  */
// const getCustomerList = (userType='20') => {
//   return api.request('web.uam.uamAppUser.selectUserCustomer', {unionFlag:userType})
// }

// /**
//  * 获取用户关联绑定上限以及绑定数量
//  * @returns 
//  */
// const getCustomerCodeBindCountAndLimit = () => {
//   return api.request('web.uam.uamAppUser.getUnionBindCountAndLimit', {userPhone:getPhone()})
// }

export default {
  getSystemConfigData,
  getAdImage,
  getHelpDoc,
  login,
  getImgCode,
  sendSmsCode,
  resetPassword,
  getQrUrl,
  qrCodeLogin,
  getUserInfo,
  queryCustomerInfo,
  checkRegisterByPhone,
  checkRealNameAuth,
  checkWaybillExist,
  modifyPwdByFirstLogin,
  bindCustomerCode,
  getUnbindWarnMessage,
  getCustomerCodeBindInfo
}
