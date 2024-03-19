/**
 * @Desc: paymentManagerNum 设置副<管理员/授权号>判断逻辑
 * @Author: wu xingtao
 * @Date: 2022/2/17
 */

const UamAdminLimit = 5 // 副管理员最多个数
const UamAdminLimitTip = '副管理员最多可设置5个'

// 是否可新增副管理员
const uam_admin_can_add = () => {
  return uam_admin_get_num() < UamAdminLimit
}

const uam_admin_update_num = val => {
  sessionStorage.setItem('UAM_ADMIN_NUM', val)
}
const uam_admin_get_num = () => {
  return sessionStorage.getItem('UAM_ADMIN_NUM')
}

const uam_admin_add = val => {
  uam_admin_update_num(Number(uam_admin_get_num()) + Number(val))
}

const uam_admin_reduce = val => {
  const num = Number(uam_admin_get_num())
  num >= val ? uam_admin_update_num(num - val) : ''
}

const uamPaymentLimit = 3 // 副授权号个数限制
const UamPaymentLimitTip = '副授权号最多可设置3个'

// 是否可新增副授权人
const uam_payment_can_add = () => {
  return uam_payment_get_num() < uamPaymentLimit
}

const uam_payment_update_num = val => {
  sessionStorage.setItem('UAM_PAYMENT_MANAGER_NUM', val)
}

const uam_payment_get_num = () => {
  return sessionStorage.getItem('UAM_PAYMENT_MANAGER_NUM')
}

const uam_payment_add = val => {
  uam_payment_update_num(Number(uam_payment_get_num()) + Number(val))
}

const uam_payment_reduce = val => {
  const num = Number(uam_payment_get_num())
  num >= val ? uam_payment_update_num(num - val) : ''
}

const paymentManagerNum = {
  UamAdminLimit,
  uamPaymentLimit,
  UamAdminLimitTip,
  UamPaymentLimitTip,
  uam_admin_can_add,
  uam_admin_update_num,
  uam_admin_get_num,
  uam_admin_add,
  uam_admin_reduce,

  uam_payment_can_add,
  uam_payment_update_num,
  uam_payment_get_num,
  uam_payment_add,
  uam_payment_reduce
}

export default paymentManagerNum
