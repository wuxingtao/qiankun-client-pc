import request from '@/services/api/request'
import { getPhone } from '@/utils/storage'
import Native from '@utils/native/index'

// 密码登录
export function login({ phone, passWord }) {
  return request({
    // headerUrl: 'login_webForLogin',
    headerUrl: 'ecas.loginAdapter.pwdLogin',
    method: 'post',
    token: true,
    toReject: true,
    data: {
      phone,
      passWord,
      from: '1',
    },
  })
}

// 退出登录
export function loginOut() {
  return request({
    headerUrl: 'web.ssoPc.loginOut',
    method: 'post',
    data: {
      phone: getPhone(),
    },
  })
}

// 绑定客户编码
export function bindUserCode(params) {
  return request({
    headerUrl: 'web.ssoUser.userBindCustomerCode',
    method: 'post',
    toReject: true,
    data: params,
  })
}

// 换绑客户端编码
export function changeBindCustomerCode(params) {
  return request({
    headerUrl: 'web.ssoUser.changeBindCustomerCode',
    method: 'post',
    toReject: true,
    data: params,
  })
}

// 解除客户编码
export function unbindCode(params) {
  return request({
    headerUrl: 'web.ssoUser.unBindCustomerCode',
    method: 'post',
    data: params,
  })
}

// 获取推广配置
export function getPopularizeConfig(params) {
  return request({
    headerUrl: 'web.popularize.getConfig',
    method: 'post',
    token: true,
    data: params,
    hideErrMsg: true,
  })
}

// 检测是否灰度用户
export function checkIsGrayUser(phone) {
  return request({
    headerUrl: 'web.uam.gray.checkGray',
    method: 'post',
    toReject: true,
    data: {
      phone,
      clientType: Native.isClientMode()?'pc':'gw'
    }
  })
}