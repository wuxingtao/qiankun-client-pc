/**
 * @Desc: permissionUtil
 * @Author: wu xingtao
 * @Date: 2021/12/8
 */
import formatDate from '@/utils/formatDate'
import { isEqual } from 'lodash'
import request from '@api/request'
import useUam from '@views/permission-manage/hooks/useUam'
import router from '@router'
import store from '@/store'
import { MessageBox } from 'element-ui'
export { default as permissionServe } from '@/utils/permissionServe'
export { default as paymentManagerNum } from '@views/permission-manage/hooks/paymentManagerNum'

export const dateTimeHM = val => {
  return formatDate.dateTimeHM(val)
}

export const base64Str = {
  btoa: val => {
    return window.btoa ? window.btoa(val) : val
  },

  atob: val => {
    return window.atob ? window.atob(val) : val
  }
}

export const permissionIsEqual = function(currentData, oldData) {
  return isEqual(currentData, oldData)
}

export const requestProxy = async params => {
  // 错误提醒全部拦截 TODO 重复请求待处理
  let res = await request({ ...params, hideErrMsg: true })
  const { uam_role_equal, messageError, kye_message } = useUam()

  // 发包中提示
  if (res.code === 502) {
    messageError(res.msg)
    return res
  }
  // checkAuth 强制检测
  if (res.code !== 0 || params.checkAuth) {
    // 在权限管理调用
    const isPermissionPath = window.location.href.includes('/permission-manage')
    try {
      let role_equal = (await uam_role_equal()) || {}
      // 角色未变更 且存在客户编码
      if (role_equal.valid && role_equal.roleData?.customerCode) {
        if (res.code !== 0 && res.msg && !params.hideErrMsg) {
          messageError(res.msg)
        }
      } else {
        if (!isPermissionPath) {
          return res
        }
        const dialogTarget = document.querySelector('.permission-confirm-refresh')
        if (!dialogTarget || dialogTarget.parentElement.style.display === 'none') {
          const messageParams = {
            showCancelButton: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            customClass: 'permission-confirm-refresh'
          }
          // 是否存在入口
          const permissionMenuAble = store.getters['permission/permissionMenuAble']
          if (!permissionMenuAble) {
            MessageBox.confirm('权限角色已变更，暂无权限管理权限', '提示', {
              ...messageParams,
              showClose: false,
              confirmButtonText: '确认',
              type: 'warning'
            }).then(() => {
              router.push({ path: '/admin/waybill-v3' })
            })
          } else {
            kye_message.confirm('权限角色已变更,是否刷新页面', messageParams).then(() => {
              const activeTabName = store.state.permission.permission_tab_active
              router.replace({
                name: 'permission-manage-empty',
                params: { pageRefresh: true, activeTabName }
              })
            })
          }
        }
      }
    } catch (e) {
      console.log(e)
    }
  }
  return res
}
