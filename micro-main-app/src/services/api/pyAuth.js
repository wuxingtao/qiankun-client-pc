import request from './request'
import { getPhone, getCustomerCode } from '@/utils/storage'

// 付款授权-申请授权记录查询
export function applyList(param = {}) {
  let params = {
    applyMobile: getPhone(),
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.customer.payAuth.applyList',
    method: 'post',
    data: params
  })
}

// 付款授权-获取授权记录详情
export function getPayAuth(param = {}) {
  let params = {
    ...param
  }
  return request({
    headerUrl: 'web.customer.payAuth.get',
    method: 'post',
    data: params
  })
}

// 付款授权-审批付款授权 同意 / 拒绝 / 解除授权
export function apply(param) {
  let params = {
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.customer.payAuth.apply',
    method: 'post',
    data: params
  })
}

// 付款授权-新增付款授权 
export function add(param = {}) {
  let params = {
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.customer.payAuth.add',
    method: 'post',
    data: params
  })
}

// 付款授权-授权列表查询(待授权、已授权)
export function list(param = {}) {
  let params = {
    phone: getPhone(),
    mainAuthMobile: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.customer.payAuth.list',
    method: 'post',
    data: params
  })
}

// 获取我的授权信息
export function getAuthInfo() {
  let params = {
    phone: getPhone()
  }
  return request({
    headerUrl: 'web.team.getAuthInfo',
    method: 'post',
    data: params
  })
}

// 获取协作人列表 
export function teamList() {
  let params = {
    phone: getPhone()
  }
  return request({
    headerUrl: 'web.team.list',
    method: 'post',
    data: params
  })
}

// 新增协作人
export function teamAdd(param = {}) {
  let params = {
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.team.add',
    method: 'post',
    data: params
  })
}

// 删除协作人
export function teamDelete(param = {}) {
  let params = {
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.team.delete',
    method: 'post',
    data: params
  })
}

// 获取协作人详情
export function teamGet() {
  let params = {
    phone: getPhone()
  }
  return request({
    headerUrl: 'web.team.get',
    method: 'post',
    data: params
  })
}

// 修改协作人
export function teamUpdate(param) {
  let params = {
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.team.update',
    method: 'post',
    data: params
  })
}

// 发送交接权限验证码 
export function sendTeamMessage() {
  let params = {
    phone: getPhone()
  }
  return request({
    headerUrl: 'web.team.sendTeamMessage',
    method: 'post',
    data: params
  })
}

// 确认交接权限（验证验证码）
export function replaceMainAuthPhone(param = {}) {
  let params = {
    phone: getPhone(),
    ...param
  }
  return request({
    headerUrl: 'web.team.replaceMainAuthPhone',
    method: 'post',
    data: params
  })
}

// 校验第三方账号
export function check(param = {}) {
  let params = {
    phone: getPhone(),
    applyMobile: getPhone(),
    applyCustomerCode: getCustomerCode(),
    ...param
  }
  return request({
    headerUrl: 'web.customer.payAuth.check',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

export async function checkPaymentAuth(payAccount){
  let phoneReg = /^1\d{10}$/
    ,freeMobile = ''
    ,customerCode = ''
  if (phoneReg.test(payAccount)) {
    freeMobile = payAccount
  } else {
    customerCode = payAccount
  }
  let res = await check({ freeMobile, customerCode })
  if (res.code !== 0) {
    return  res.msg || '服务器异常'  
  }
  if (res.data && res.data.authStatus === 10) {
    return '您暂未获得该公司的付款授权，请先申请授权'
  }
}

