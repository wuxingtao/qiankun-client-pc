import { getPhone } from '@utils/storage'
import request from '@/services/api/request'

class PaymentAuth {
  getAuthorIdentityCode() {
    return request({
      headerUrl: 'web.uam.payAuthorize.authorIdentityCode',
      method: 'post',
      data: {},
      hideErrMsg: true,
    })
  }

  getPayAuthorizeList(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.list',
      method: 'post',
      data: params,
    })
  }

  examineAuth(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.examine',
      method: 'post',
      data: params,
    })
  }

  cancelAuth(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.cancelAuth',
      method: 'post',
      data: params,
    })
  }

  getWaybillDetailByPay(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.getWaybillDetail',
      method: 'post',
      data: params,
    })
  }

  //web.uam.payAuthorize.getPopoutInfo
  getPayAuthDetail(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.getPayAuthDetail',
      method: 'post',
      data: params,
    })
  }

  //获取弹窗提醒
  getPopoutInfo(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.getPopoutInfo',
      method: 'post',
      data: params,
    })
  }

  // 根据客户编码或者免绑手机号查询客户名称
  getCustomerName(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.getCustomerName',
      method: 'post',
      data: params,
    })
  }

  // 申请付款授权
  payAuthorizeApply(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.apply',
      method: 'post',
      data: params,
    })
  }

  //给他人授权
  giveAuth(params) { 
    return request({
      headerUrl: 'web.uam.payAuthorize.giveAuth',
      method: 'post',
      data: params,
    })
  }

  //给他人授权弹窗提醒
  getGiveAuthPopoutInfo(params) { 
    return request({
      headerUrl: 'web.uam.payAuthorize.getGiveAuthPopoutInfo',
      method: 'post',
      data: params,
    })
  }

  // 根据客户编码或者免绑手机号查询客户名称
  getCustomerName_new(params) {
    return request({
      headerUrl: 'web.uam.payAuthorize.getCustomerName',
      method: 'post',
      data: params,
      hideErrMsg:true
    })
  }
}

export default new PaymentAuth()
