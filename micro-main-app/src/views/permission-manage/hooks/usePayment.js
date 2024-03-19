/**
 * @Desc: usePayment
 * @Author: wu xingtao
 * @Date: 2021/12/6
 */

import { Message } from 'element-ui'
import paymentApi from '@api/payment'
import { paymentAccountType } from '@views/permission-manage/enum/permissionEnum'
import { permissionServe } from '@views/permission-manage/permissionUtil'

const accountLevelName = { 10: '主授权号', 20: '副授权号', '': '普通号' }

export default function () {
  const messageInstance = (type, message) => {
    Message({
      message,
      type: type,
      duration: 2000
    })
  }

  const messageError = message => {
    messageInstance('error', message)
  }
  // 获取用户信息
  const uam_payment_api_user = async () => {
    let result = {}
    const res = await paymentApi.uam_payment_authorizerInfo()
    if (res.code === 0) {
      if (res.data) {
        result = res.data
      }
    }
    return result
  }

  const uam_payment_isSuper = accountType => {
    return permissionServe.uam_payment_isSuper(accountType)
  }

  const uam_payment_isManager = accountType => {
    return permissionServe.uam_payment_isManager(accountType)
  }

  const uam_payment_isNormal = accountType => {
    return permissionServe.uam_payment_isNormal(accountType)
  }

  const uam_payment_isAdmin = accountType => {
    return permissionServe.uam_payment_isAdmin(accountType)
  }

  const uam_payment_accountName = accountType => {
    return uam_payment_isManager(accountType) ? accountLevelName[accountType] : null
  }

  const uam_payment_bindFlagName = bindFlag => {
    return bindFlag === 1 ? '已绑码' : '未绑码'
  }

  const uam_payment_user = () => {
    return permissionServe.uam_payment_user()
  }

  /**
   *  用户类型附加信息
   * @param accountType
   * @returns {{isSuper: boolean, accountType, accountLevel: *}}
   */
  const uam_payment_accountPlus = accountType => {
    return {
      accountType,
      isSuper: uam_payment_isSuper(accountType), //
      accountLevel: uam_payment_accountName(accountType) || ''
    }
  }

  return {
    uam_payment_api_user,
    uam_payment_isSuper,
    uam_payment_isManager,
    uam_payment_isNormal,
    uam_payment_isAdmin,
    uam_payment_accountName,
    uam_payment_accountPlus,
    uam_payment_bindFlagName,
    uam_payment_user
  }
}
