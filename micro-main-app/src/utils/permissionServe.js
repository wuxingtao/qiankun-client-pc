/**
 * @Desc: permissionServe
 * @Author: wu xingtao
 * @Date: 2022/1/10
 */
import { getUamPermissionList } from '@api/common'
import { paymentAccountType, permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import store from '@/store'

class PermissionServe {
  // 获取客户后台权限补充
  async getUamPermissionList() {
    let result = []
    const res = await getUamPermissionList()
    if (res.code === 0 && res.data) {
      result = res.data.map(item => item.code)
      return result
    }
  }
  uam_current_user() {
    return JSON.parse(window.sessionStorage.getItem('UAM_USER') || '{}')
  }

  // 弃用
  uam_payment_user() {
    return JSON.parse(window.sessionStorage.getItem('UAM_PAYMENT_USER') || '{}')
  }

  // 验证菜单是否有权限管理权限 （session数据，用于刷新支持）
  permissionMenuAbleCheck() {
    const auth_user_info = this.uam_current_user()
    const isAuthManager = this.uam_auth_isManager(auth_user_info.userExternalType)
    const isPaymentManager = this.uam_payment_isManager(auth_user_info.authorizer)
    const hasCustomerCode = auth_user_info.customerCode
    return (
      hasCustomerCode &&
      (store.state.permission.show_payment_entry
        ? isAuthManager || isPaymentManager
        : isAuthManager)
    )
  }

  uam_auth_isManager(userExternalType) {
    return userExternalType === permissionLevel.ADMIN || userExternalType === permissionLevel.OWNER
  }

  uam_is_normal(userExternalType) {
    return userExternalType === permissionLevel.NORMAL
  }

  uam_is_admin(userExternalType) {
    return userExternalType === permissionLevel.ADMIN
  }

  uam_is_owner(userExternalType) {
    return userExternalType === permissionLevel.OWNER
  }

  uam_payment_isSuper(accountType) {
    return Number(accountType) === paymentAccountType.SUPER
  }

  uam_payment_isAdmin(accountType) {
    return Number(accountType) === paymentAccountType.SECOND
  }

  /**
   * 是否付款授权管理-管理员
   * @param type <string> accountType 账户标识 <number>
   * @returns {boolean}
   */
  uam_payment_isManager(type) {
    const accountType = Number(type)
    return this.uam_payment_isSuper(accountType) || this.uam_payment_isAdmin(accountType)
  }

  uam_payment_isNormal(type) {
    const accountType = Number(type)
    return (
      accountType === paymentAccountType.NORMAL ||
      accountType === paymentAccountType.NORMAL_NEW ||
      !!!accountType
    )
  }

  /**
   * 解绑多角色提示
   * @param type <'10' 主管理员 '20' 主授权人>
   * @returns {string}
   */
  uam_unbind_toolTip(type) {
    if (!type) {
      return ''
    }
    const row =
      store.state.permission.auth_user_info.userRoleRequestList?.filter(
        item => item.roleType === type + ''
      )[0] || {}

    const userName = row.userName || ''
    const userPhone = row.userPhone || ''

    let roleAlias = ''
    switch (type) {
      case '10':
        roleAlias = '管理员'
        break
      case '20':
        roleAlias = '授权号'
        break
      default:
        roleAlias = ''
        break
    }
    return `请先联系主${roleAlias}${userName}${userPhone}移除副${roleAlias}后再解绑`
  }
  uam_params_bigType() {
    return store.state.permission.permission_tab_active === 'permission-index' ? 10 : 20
  }
  /**
   * 是否是低于当前用户级别 <当前用户主/副管理 主/副授权>
   * @param type
   * @param useInfo 用户对象
   * @returns {boolean}
   */
  uam_level_smaller(type, useInfo = {}) {
    const auth_user_info = this.uam_current_user()
    const { userExternalType, authorizer } = useInfo

    let result = true
    if (type === 'permission-index') {
      switch (userExternalType) {
        case permissionLevel.OWNER:
          result = false
          break
        case permissionLevel.ADMIN:
          result = this.uam_is_owner(auth_user_info.userExternalType)
          break
        default:
          result = true
          break
      }
    }
    if (type === 'payment-auth') {
      switch (Number(authorizer)) {
        case paymentAccountType.SUPER:
          result = false
          break
        case paymentAccountType.SECOND:
          result = this.uam_payment_isSuper(auth_user_info.authorizer)
          break
        default:
          result = true
          break
      }
    }

    return result
  }
  // 当前tab类型下用户是否是普通用户
  uam_tab_user_isNormal(userInfo) {
    let result = false
    if (userInfo instanceof Object) {
      const permission_tab_active = store.state.permission.permission_tab_active
      const uam_is_normal = permissionServe.uam_is_normal(userInfo?.userExternalType)
      const uam_payment_isNormal = permissionServe.uam_payment_isNormal(userInfo?.authorizer)
      if (
        (permission_tab_active === 'permission-index' && uam_is_normal) ||
        (permission_tab_active === 'payment-auth' && uam_payment_isNormal)
      ) {
        result = true
      }
    }
    return result
  }
}

const permissionServe = new PermissionServe()
export default permissionServe
