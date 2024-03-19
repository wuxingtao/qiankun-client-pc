/**
 * @Desc: permission
 * @Author: wu xingtao
 * @Date: 2021/12/7
 */
import useUam from '@views/permission-manage/hooks/useUam'
import usePayment from '@views/permission-manage/hooks/usePayment'
import { uam_getButtonInfo } from '@api/permission'
import { getCustomerCode } from '@utils/storage'

const { uam_user, uam_is_normal, uam_user_type, uam_auth_isManager } = useUam()
const {
  uam_payment_api_user,
  uam_payment_isManager,
  uam_payment_accountName,
  uam_payment_isSuper
} = usePayment()

const state = {
  auth_user_info: {},
  payment_user_info: {}, // <弃用>
  permission_tab_active: '', // <'permission-index','payment-auth'>
  auditing_count: 0, //审批管理-待审批条数
  audited_count: 0, //审批管理-已审批条数
  show_payment_entry: true, // 是否展示付款授权管理入口,用于入口管控

  adminRoleButtonInfoList: [], // 权限按钮控制列表
  payRoleButtonInfoList: [] // 付款授权管理按钮控制列表
}

const getters = {
  permissionMenuAble: state => {
    const isAuthManager = uam_auth_isManager(state.auth_user_info.userExternalType)
    const isPaymentManager = uam_payment_isManager(state.auth_user_info.authorizer)
    const hasCustomerCode = state.auth_user_info.customerCode
    return !!(
      hasCustomerCode &&
      (state.show_payment_entry ? isAuthManager || isPaymentManager : isAuthManager)
    )
  },
  // 授权人级别描述
  paymentAccountName: state => {
    return state.auth_user_info.authorizer
      ? uam_payment_accountName(state.auth_user_info.authorizer)
      : ''
  },
  // 通用权限用户标识描述
  permissionAccountName: state => {
    return state.auth_user_info.userExternalType
      ? uam_user_type(state.auth_user_info.userExternalType)
      : ''
  },
  permissionIsNormal: state => {
    return state.auth_user_info.userExternalType
      ? uam_is_normal(state.auth_user_info.userExternalType)
      : false
  },
  permissionIsManager: state => {
    return uam_auth_isManager(state.auth_user_info.userExternalType)
  },
  paymentIsManager: state => {
    return uam_payment_isManager(state.auth_user_info.authorizer)
  },
  paymentIsSuper: state => {
    return uam_payment_isSuper(state.auth_user_info.authorizer)
  },
  // 是否存在审批列表 <-1 不存在>
  approvalPendingCountAble: state => {
    return state.auth_user_info?.approvalPendingCount >= 0
  }
}

const mutations = {
  UPDATE_AUTH_USER(state, val) {
    state.auth_user_info = val
  },
  UPDATE_PAYMENT_USER(state, val) {
    state.payment_user_info = val
  },
  UPDATE_TAB_ACTIVE(state, val) {
    state.permission_tab_active = val
  },
  UPDATE_AUDITING_COUNT(state, val) {
    state.auditing_count = val
  },
  UPDATE_AUDITED_COUNT(state, val) {
    state.audited_count = val
  },
  UPDATE_BUTTON_LIST(state, val) {
    state.adminRoleButtonInfoList = val.adminRoleButtonInfoList
    state.payRoleButtonInfoList = val.payRoleButtonInfoList
  }
}

const actions = {
  update_auth_user({ commit, dispatch }, payload) {
    commit('UPDATE_AUTH_USER', payload)
    // 用户信息更新审批管理个数
    dispatch('update_auditing_count', payload?.approvalPendingCount)
  },

  update_payment_user({ commit }, payload) {
    commit('UPDATE_PAYMENT_USER', payload)
  },

  // 更新当前权限tab
  update_tab_active({ commit }, payload) {
    commit('UPDATE_TAB_ACTIVE', payload)
  },

  // 获取通用权限用户
  async get_common_user({ dispatch, commit }, payload) {
    const data = await uam_user()
    // 用户合集 <roleType 10 主管理员 20主授权人>
    if (data && data.userRoleRequestList) {
      data.userRoleRequestList.forEach(item => {
        if (item.roleType) {
          data[`use_role_${item.roleType}`] = item
        }
      })
    }
    window.sessionStorage.setItem('UAM_USER', JSON.stringify(data || {}))
    dispatch('update_auth_user', data)
    return data
  },

  // 弃用：获取权限-付款授权用户
  async get_payment_user({ dispatch, commit }, payload) {
    const data = await uam_payment_api_user()
    window.sessionStorage.setItem('UAM_PAYMENT_USER', JSON.stringify(data || {}))
    dispatch('update_payment_user', data)
    return data
  },
  // 更新待审批个数
  update_auditing_count({ dispatch, commit }, count) {
    commit('UPDATE_AUDITING_COUNT', Number(count || 0))
  },

  // 更新权限管理按钮控制
  async update_button_list({ dispatch, commit }) {
    const customerCode = getCustomerCode()
    if(!customerCode){
      return
    }
    try {
      const res = await uam_getButtonInfo({ moduleType: '10' })
      if (res.code === 0 && res.data) {
        commit('UPDATE_BUTTON_LIST', res.data)
      }
    } catch (e) {}
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
