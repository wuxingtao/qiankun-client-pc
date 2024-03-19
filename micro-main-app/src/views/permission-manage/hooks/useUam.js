/**
 * @Desc: useUserInfo
 * @Author: wu xingtao
 * @Date: 2021/11/18
 */
import {
  uam_authDetail,
  uam_checkUserSameRoles,
  uam_unBindCustomerCode,
  uam_updateUserExternalType,
  uam_userInfo,
  uam_userSearch
} from '@api/permission'
import { Message } from 'element-ui'
import store from '@/store'
import { paymentAccountType, permissionLevel } from '@views/permission-manage/enum/permissionEnum'
import { permissionServe } from '@views/permission-manage/permissionUtil'
import kye_message from '@utils/message'
import Format from '@utils/format'
import usePayment from '@views/permission-manage/hooks/usePayment'

const userLevelName = { 1: '主管理员', 2: '副管理员', 3: '普通账户' }

export default function() {
  const messageError = message => {
    messageInstance('error', message)
  }

  const messageSuccess = message => {
    messageInstance('success', message)
  }

  const messageInstance = (type, message) => {
    Message({
      message,
      type: type,
      duration: 2000
    })
  }

  // 获取用户权限角色名称
  const uam_user_type = userExternalType => {
    return uam_auth_isManager(userExternalType) ? userLevelName[userExternalType] : null
  }

  const uam_is_normal = userExternalType => {
    return userExternalType === permissionLevel.NORMAL || !userExternalType
  }

  const uam_is_admin = userExternalType => {
    return userExternalType === permissionLevel.ADMIN
  }

  const uam_is_owner = userExternalType => {
    return userExternalType === permissionLevel.OWNER
  }

  const uam_auth_isManager = userExternalType => {
    return permissionServe.uam_auth_isManager(userExternalType)
  }

  const uam_current_owner = () => {
    return uam_is_owner(uam_current_user().userExternalType)
  }

  // 通用权限-当前用户权限等级
  const uam_current_user = () => {
    return permissionServe.uam_current_user()
  }
  // 通用权限-按钮权限
  const uam_operation_btn = item => {
    const uamUser = uam_current_user()
    const paymentIsSuper = permissionServe.uam_payment_isSuper(item.authorizer)
    let result = {
      edit: false,
      setAdmin: false,
      view: false,
      unbind: false,
      unbindDisabled: false, // 解绑是否禁用,默认不禁用
      unbindDisableTip: paymentIsSuper ? '请先联系商务移除授权号后再解绑' : ''
    }
    switch (uamUser.userExternalType) {
      case permissionLevel.OWNER:
        result = Object.assign(result, {
          edit: true,
          setAdmin: true,
          view: false,
          unbind: !paymentIsSuper // 主授权号不可解绑
        })
        break
      case permissionLevel.ADMIN:
        result = Object.assign(result, {
          edit: item.userExternalType === permissionLevel.NORMAL,
          setAdmin: false,
          view: true,
          unbind: item.userExternalType === permissionLevel.NORMAL
        })
        if (paymentIsSuper) {
          result.unbind = false
        }
        break
    }

    switch (Number(uamUser.authorizer)) {
      case paymentAccountType.SUPER:
        result = Object.assign(result, {
          unbindDisabled: false
        })
        break
      case paymentAccountType.SECOND:
        result = Object.assign(result, {
          unbindDisabled: permissionServe.uam_payment_isManager(item.authorizer)
        })
        break
      case paymentAccountType.NORMAL:
        result = Object.assign(result, {
          unbindDisabled: permissionServe.uam_payment_isManager(item.authorizer)
        })
        break
      default:
        result = Object.assign(result, {
          unbindDisabled: permissionServe.uam_payment_isManager(item.authorizer)
        })
        break
    }

    return result
  }

  // 付款授权管理-按钮权限
  const uam_payment_operation_btn = item => {
    const uamUser = uam_current_user()
    let result = {
      edit: false,
      setAdmin: false,
      view: false,
      unbind: false,
      unbindDisabled: false, // 解绑是否禁用,默认不禁用
      unbindDisableTip: permissionServe.uam_is_owner(item.userExternalType)
        ? '请先联系商务移除主管理员后再解绑'
        : ''
    }
    switch (Number(uamUser.authorizer)) {
      case paymentAccountType.SUPER:
        result = Object.assign(result, {
          edit: true,
          setAdmin: true,
          view: false,
          unbind: true
        })
        break
      case paymentAccountType.SECOND:
        result = Object.assign(result, {
          edit: permissionServe.uam_payment_isNormal(item.authorizer),
          setAdmin: false,
          view: true,
          unbind: permissionServe.uam_payment_isNormal(item.authorizer)
        })
        break
    }

    switch (uamUser.userExternalType) {
      case permissionLevel.OWNER:
        result = Object.assign(result, {
          unbindDisabled: false
        })
        break
      case permissionLevel.ADMIN:
        result = Object.assign(result, {
          unbindDisabled:
            item.userExternalType === permissionLevel.OWNER ||
            item.userExternalType === permissionLevel.ADMIN
        })
        break
      case permissionLevel.NORMAL:
        result = Object.assign(result, {
          unbindDisabled:
            item.userExternalType === permissionLevel.OWNER ||
            item.userExternalType === permissionLevel.ADMIN
        })
        break
      default:
        result = Object.assign(result, {
          unbindDisabled:
            item.userExternalType === permissionLevel.OWNER ||
            item.userExternalType === permissionLevel.ADMIN
        })
        break
    }

    return result
  }

  // 获取用户信息
  const uam_user = async () => {
    let result = {}
    const res = await uam_userInfo()
    if (res.code === 0) {
      result = res.data
    } else {
      messageError(res.msg)
    }
    return result
  }

  // 获取联想下拉框用户信息
  const uam_formatUsers = (users, queryString) => {
    users = (users || []).map(u => ({
      ...u,
      label: u.userName || u.userTel,
      text: `${Format.formatMobliePhone(u.userTel)} ${u.userName || ''}`
    }))
    if (queryString) {
      queryString = queryString.toLowerCase()
      users = users
        .filter(
          u =>
            u.userTel?.startsWith(queryString) || u.userName?.toLowerCase().startsWith(queryString)
        )
        .map(u => {
          let text = `${Format.formatMobliePhone(u.userTel)} ${u.userName || ''}`
          if (queryString) {
            queryString = Format.formatMobliePhone(queryString)
            text = text.replace(
              new RegExp(`(${queryString})`, 'ig'),
              "<span style='color:#8365f6;font-weight:bold'>$1</span>"
            )
          }
          return {
            ...u,
            text
          }
        })
    }
    return users
  }

  // 查看编辑用户权限 <type: 1 查看 2编辑 3新增（可分配权限）>
  const uam_auth_edit = async (type, userId, bigType) => {
    let result = []
    const res = await uam_authDetail({ type, userId, bigType })
    if (res.code === 0 && res.data) {
      result = res.data
    }
    return result
  }

  const uam_admin_set = async ({ userId, userExternalType, authorizer, remark }) => {
    const res = await uam_updateUserExternalType({ userExternalType, userId, authorizer, remark })
    if (res.code !== 0 && res.msg) {
      messageError(res.msg)
    }
    return res
  }

  const uam_list_query = async (query, pagination) => {
    const { pageIndex, pageSize } = pagination
    const { userExternalType = '', permissionIds = [], accountInfo = '', orderByClauses } = query

    const params = {
      userExternalType,
      permissionIds,
      page: pageIndex,
      pageSize,
      accountInfo,
      orderByClauses
    }
    return await uam_userSearch(params)
  }

  const uam_unbind = async (root, row, callback) => {
    const h = root.$createElement
    const { id: userId, userName, phoneFormat, userExternalType, authorizer } = row
    const tipText = `${phoneFormat}${userName ? '(' + userName + ')' : ''}`
    const permission_tab_active = store.state.permission.permission_tab_active
    const { uam_payment_accountName } = usePayment()
    const roleTip =
      (permission_tab_active === 'payment-auth'
        ? uam_payment_accountName(authorizer)
        : uam_user_type(userExternalType)) || ''
    let tip1 = '解绑后，将解绑其客户编码及移除其所有权限。'
    root.$kye_message
      .$message({
        message: h('p', null, [
          h('span', { style: 'font-Size:15px' }, `确定对${roleTip}`),
          h('span', { style: 'color: #fe8151;font-size:15px;' }, tipText),
          h('span', { style: 'font-size:15px;' }, '进行解绑吗？'),
          h(
            'p',
            {
              style:
                'color: ##03050D;font-size:13px;margin-top:8px;font-family: PingFangSC, PingFangSC-Regular;'
            },
            tip1
          )
        ]),
        type: 'warning'
      })
      .then(async () => {
        let res = await uam_unBindCustomerCode(userId)
        if (res.code === 0) {
          root.$message.success('解绑成功')
          callback && callback()
        }
      })
  }

  // 判断角色类型线上最新与本地是否一致
  const uam_role_equal = async () => {
    let roleData = await uam_user()
    const currentUserData = uam_current_user()
    const valid =
      roleData.userExternalType === currentUserData.userExternalType &&
      roleData.authorizer === currentUserData.authorizer
    await store.dispatch('permission/update_auth_user', roleData)
    return {
      valid,
      roleData
    }
  }

  const uam_setAdmin = async (
    root,
    { userExternalType, authorizer, row, remark, removeCallback, addCallback, catchCallback }
  ) => {
    const { id: userId, userName, phoneFormat } = row
    const tipText = `${phoneFormat} ${userName ? '(' + userName + ')' : ''}`
    const permission_tab_active = store.state.permission.permission_tab_active
    const tipRole = permission_tab_active === 'permission-index' ? '副管理员' : '副授权号'
    const h = root.$createElement
    let type = ''
    if (permission_tab_active === 'payment-auth') {
      type =
        permissionServe.uam_payment_isNormal(authorizer) &&
        permissionServe.uam_payment_isAdmin(row.authorizer)
          ? 'remove'
          : 'set'
    } else if (permission_tab_active === 'permission-index') {
      type =
        userExternalType === permissionLevel.NORMAL && uam_is_admin(row.userExternalType)
          ? 'remove'
          : 'set'
    }

    const remarkCurrent =
      remark || (permission_tab_active === 'payment-auth' ? row.remarkPayAuth : row.remarkAuth)
    const params = {
      userExternalType,
      authorizer,
      userId,
      remark: remarkCurrent
    }
    if (type === 'remove') {
      root.$kye_message
        .$message({
          message: h('p', null, [
            h('span', null, '确定移除'),
            h('span', { style: 'color: #fe8151' }, tipText),
            h('span', null, `的${tipRole}角色吗？`)
          ]),
          type: 'warning'
        })
        .then(async () => {
          let res = await uam_admin_set(params)
          removeCallback && removeCallback(res)
        })
        .catch(err => {
          catchCallback && catchCallback()
        })
    } else {
      let res = await uam_admin_set(params)
      addCallback && addCallback(res)
    }
  }

  return {
    kye_message,
    messageError,
    uam_user,
    uam_auth_edit,
    uam_user_type,
    uam_is_normal,
    uam_is_owner,
    uam_auth_isManager,
    uam_current_user,
    uam_current_owner,
    uam_is_admin,
    uam_operation_btn,
    uam_payment_operation_btn,
    uam_unbind,
    uam_setAdmin,
    uam_role_equal,
    uam_admin_set,
    uam_list_query,
    uam_formatUsers
  }
}
