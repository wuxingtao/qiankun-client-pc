import request from '@api/request'
import { getPhone } from '@utils/storage'
import { requestProxy } from '@views/permission-manage/permissionUtil'

/** 权限管理-付款授权
 * @Desc: payment
 * @Author: wu xingtao
 * @Date: 2021/12/7
 */

class PaymentApi {
  // 付款授权-获取付款授权人身份信息
  uam_payment_authorizerInfo() {
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorPrima.authorIdentity',
      data: {},
      method: 'post',
      hideErrMsg: true
    })
  }

  // 付款授权-获得副授权号信息
  uam_payment_getViceAuth(phone) {
    let params = { phone }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorVice.getViceAuth',
      data: params,
      method: 'post'
    })
  }

  // 付款授权-获取付款授权列表
  uam_payment_authorVices(phone) {
    let params = { phone }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorPrima.authorVices',
      data: params,
      method: 'post',
      hideErrMsg: true
    })
  }

  //付款授权-新增副授权号
  uam_payment_addViceAuth(params = {}) {
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorVice.addViceAuth',
      data: params,
      method: 'post'
    })
  }

  // 付款授权-编辑副授权号
  uam_payment_changeViceAuth({ userName, userMobile, remarks } = {}) {
    let params = { userName, userMobile, remarks }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorVice.changeViceAuth',
      data: params,
      method: 'post'
    })
  }

  // 付款授权-移除副授权号
  uam_payment_removeViceAuth(phone) {
    let params = { phone }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorVice.removeViceAuth',
      data: params,
      method: 'post'
    })
  }

  // 付款授权-获取用户信息 <phone,userName>
  uam_payment_getAuthInfo({ phone, hideErrMsg = false } = {}) {
    let params = { phone }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorPrima.getAuthInfo',
      data: params,
      method: 'post',
      hideErrMsg: hideErrMsg
    })
  }

  // 付款授权-检查转让授权人 <下一步进行检查>
  uam_payment_checkTransferIsLegal(phone) {
    let params = { phone }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorPrima.checkTransferIsLegal',
      data: params,
      method: 'post'
    })
  }

  // 权限管理-付款授权转让发送验证码
  uam_payment_smsCode() {
    let params = {
      phone: getPhone()
    }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorPrima.transferPrimaSendSmsCode',
      data: params,
      method: 'post'
    })
  }

  // 权限管理-付款授权转让授权人
  uam_payment_transferPrima({ userName, userMobile, verificationCode } = {}) {
    let params = { userName, userMobile, verificationCode }
    return requestProxy({
      headerUrl: 'web.uam.net.paymentAuthorPrima.transferPrima',
      data: params,
      method: 'post',
      hideErrMsg: true
    })
  }
}

const paymentApi = new PaymentApi()

export default paymentApi
