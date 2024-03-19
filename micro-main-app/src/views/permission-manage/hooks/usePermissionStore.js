/**
 * @Desc: usePermissionStore
 * @Author: wu xingtao
 * @Date: 2022/2/19
 */
import { computed } from '@vue/composition-api'
import store from '@/store'

export default function(root) {
  // 付款授权管理 自动对账展示详情 <true,false>
  const checkFlag = computed(() => {
    if (store.state.permission.permission_tab_active === 'permission-index') {
      return true
    }
    return store.state.permission.auth_user_info?.checkFlag
  })

  const permission_tab_active = computed(() => {
    return store.state.permission.permission_tab_active
  })

  const auth_user_info = computed(() => {
    return store.state.permission.auth_user_info
  })

  const permissionIsManager = computed(() => {
    return store.getters['permission/permissionIsManager']
  })

  const adminRoleButtonInfoList = computed(() => {
    return store.state.permission.adminRoleButtonInfoList
  })

  const payRoleButtonInfoList = computed(() => {
    return store.state.permission.payRoleButtonInfoList
  })

  // 判断是否存在权限
  const permission_role_button = code => {
    const currentAuthLists =
      permission_tab_active.value === 'payment-auth'
        ? payRoleButtonInfoList.value
        : adminRoleButtonInfoList.value
    return currentAuthLists && currentAuthLists.find(item => item.moduleCode === code)
  }

  return {
    checkFlag,
    permission_tab_active,
    auth_user_info,
    permissionIsManager,
    permission_role_button
  }
}
