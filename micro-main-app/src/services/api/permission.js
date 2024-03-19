import { getPhone } from '@utils/storage'
import * as storageUtil from '@utils/storage'
import request from '@api/request'
import useUam from '@views/permission-manage/hooks/useUam'
import router from '@router'
import { permissionServe, requestProxy } from '@views/permission-manage/permissionUtil'

// UAM-net-获取当前用户信息 <用户信息接口不代理>
export function uam_userInfo({ phone, hideErrMsg = false } = {}) {
  let params = { phone }
  return request({
    headerUrl: 'web.uam.net.appUser.getUserInfo',
    method: 'post',
    data: params,
    hideErrMsg: hideErrMsg
  })
}

// UAM-net-发送短信验证码
export function uam_smsSend() {
  let params = {
    phone: getPhone()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.sms.send',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// UAM-net-权限转让
export function uam_userTransfer({ userId, mobile, smsCode }) {
  let params = {
    mobile,
    smsCode,
    userId
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.transfer',
    method: 'post',
    data: params
  })
}

// UAM-net-获取用户列表 <角色转换>
export function uam_userList({ owner = false, history, bigType }) {
  let params = { owner, history, bigType: bigType || permissionServe.uam_params_bigType() }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.getAppUserList',
    method: 'post',
    data: params
  })
}

export function uam_api_userInfoByAdd({ phone, searchType, hideErrMsg = false, bigType } = {}) {
  let params = { phone, searchType, bigType: bigType || permissionServe.uam_params_bigType() }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.getUserInfoByAdd',
    method: 'post',
    data: params,
    hideErrMsg: hideErrMsg
  })
}

// UAM-net-权限编辑，查看 type<1 查看 2编辑> bigType<权限大类 10-通用权限 20-付款授权权限>
export function uam_authDetail({ type, userId, bigType }) {
  let params = {
    type,
    userId,
    bigType: bigType || permissionServe.uam_params_bigType()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.getAuthDetail',
    method: 'post',
    data: params,
    checkAuth: true
  })
}

// UAM-net-用户变更记录查询
export function uam_permissionLog(params = {}) {
  params.bigType = permissionServe.uam_params_bigType()
  return requestProxy({
    headerUrl: 'web.uam.net.uamUserPermissionLog.search',
    method: 'post',
    data: params
  })
}

// UAM-net-获取用户信息列表 (查询)
export function uam_userSearch(params = {}) {
  params.bigType = permissionServe.uam_params_bigType()
  return requestProxy({
    headerUrl: 'web.uam.net.uamAppUser.search',
    method: 'post',
    data: params
  })
}

// UAM-net-批量开通单笔开通 (修改权限)
export function uam_permissionAuth({ userIds, authRequest, bigType }) {
  let params = {
    userIds,
    authRequest,
    bigType: bigType || permissionServe.uam_params_bigType()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.permission.auth',
    method: 'post',
    data: params
  })
}

// UAM-net-解绑客户编码
export function uam_unBindCustomerCode(userId) {
  let params = {
    userId,
    bigType: permissionServe.uam_params_bigType()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.unBindCustomerCode',
    method: 'post',
    data: params
  })
}

// UAM-net-判断用户是否存在多个相同角色 (V1.0)
export function uam_checkUserSameRoles(userId) {
  let params = {
    userId,
    bigType: permissionServe.uam_params_bigType()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.checkUserSameRoles',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// UAM-net-设置或移除管理员 <userExternalType 2-副管理员 3-普通用户> <authorizer 10 副授权人 20 普通用户 >
export function uam_updateUserExternalType({ userExternalType, userId, authorizer, remark }) {
  let params = {
    userExternalType,
    userId,
    authorizer,
    remark,
    bigType: permissionServe.uam_params_bigType()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.updateUserExternalType',
    method: 'post',
    data: params
  })
}

// UAM-net-新增账号
export function uam_api_addUser({ main, vices, phone, userName, remark, permissionIds }) {
  let params = {
    main,
    vices,
    phone,
    userName,
    remark,
    permissionIds,
    bigType: permissionServe.uam_params_bigType()
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.addUser',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// UAM-net-新增账号/转让判断手机号类型 (V1.0)
export function uam_getPhoneType(phone) {
  let params = {
    phone
  }
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.net.getPhoneType',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

//获取第三方付款账号
export function uam_getThirdPartyPayaccounts({ sjMobile, sjTelephone, sjCompany }) {
  const params = {
    senderMoblie: storageUtil.getPhone(),
    senderCustomerCode: storageUtil.getCustomerCode(),
    receivingMoblie: sjMobile || sjTelephone,
    receivingCustomerName: sjCompany
  }
  return requestProxy({
    headerUrl: 'web.uam.payAuthorize.getThirdPay',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 审批管理-获取未审批和已审批条数
export function uam_getAuditCounts() {
  const params = {}
  return requestProxy({
    headerUrl: 'web.uam.apply.getApprovalPendingCount',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 审批管理-获取未审批或已审批的数据
export function uam_getAuditList(params) {
  return requestProxy({
    headerUrl: 'web.uam.apply.pageApprovalManagementInfo',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 审批管理-审批操作
export function uam_setAuditStatus(params) {
  return requestProxy({
    headerUrl: 'web.uam.apply.approvalOperate',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// 审批管理-获取审批人列表
export function uam_getApplicantList() {
  return requestProxy({
    headerUrl: 'web.uam.apply.getApprovalUserList',
    method: 'post',
    data: {},
    hideErrMsg: true
  })
}

// UAM-net-获取副管理员和授权人数 (V1.0)
export function uam_getAdminVicesNumber() {
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.getAdminVicesNumber',
    method: 'post',
    data: {},
    hideErrMsg: true
  })
}

// UAM-net-获取用户密码 (V1.0)
export function uam_getCustomerPassword() {
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.getCustomerPassword',
    method: 'post',
    data: {},
    hideErrMsg: false
  })
}

// UAM-net-修改用户密码 (V1.0)
export function uam_changeCustomerPassword(params = {}) {
  return requestProxy({
    headerUrl: 'web.uam.net.appUser.changeCustomerPassword',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}

// UAM-net-用户操作日志类型 (V1.0)
export function uam_getLogTypes(params = {}) {
  return requestProxy({
    headerUrl: 'web.uam.net.uamUserPermissionLog.getLogTypes',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}

// 用户权限-修改客户码编码验证码 (V1.0)
export function uam_changeCustomerCodeSendSmsCode(params = {}) {
  return requestProxy({
    headerUrl: 'web.net.uam.changeCustomerCodeSendSmsCode',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}

// 获取操作按钮配置信息 (V1.0)
export function uam_getButtonInfo(params = {}) {
  return requestProxy({
    headerUrl: 'web.uam.config.getButtonInfo',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}
