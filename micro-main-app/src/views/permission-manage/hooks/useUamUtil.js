/**
 * @Desc: useUamUtil
 * @Author: wu xingtao
 * @Date: 2021/11/25
 */
import paymentManagerNum from '@views/permission-manage/hooks/paymentManagerNum'
import { permissionServe } from '@views/permission-manage/permissionUtil'
export default function() {
  // 修改全选传参authRequest
  function get_auth_request(data, arr = []) {
    let result = arr
    data.forEach(item => {
      if (item.checkedLists?.length > 0) {
        item.checkedLists.forEach(v => {
          result.push({
            permissionId: v.permissionId,
            display: v.type === '20' ? 'C' : ''
          })
        })
      }
      if (item.authInfos) {
        get_auth_request(item.authInfos, result)
      }
    })

    return result
  }

  // 前端数据初始化,增加字段
  function auth_format_front(data) {
    data.forEach((item, index) => {
      item.disabledFront = false // 前端禁止
      item.disabledDynamic = false // 动态禁止
      if (item.authInfos) {
        auth_format_front([...item.authInfos])
      }
    })
    return data
  }

  function auth_format(data, resultCurrent = []) {
    let result = resultCurrent
    data.forEach((item, index) => {
      if (!item.permissionId && item.authInfos?.length > 0) {
        item.checkedLists = item.authInfos.filter(v => v.check && v.permissionId)
        item.isIndeterminate =
          item.checkedLists.length > 0 && item.checkedLists.length < item.authInfos.length
        item.checkAll =
          item.checkedLists.length > 0 && item.checkedLists.length === item.authInfos.length
      }
      if (item.authInfos) {
        auth_format([...item.authInfos])
      }
    })
    return data
  }

  // 编辑数据增加全选，半选
  function edit_auth_format(data, needInit = true) {
    let result
    if (needInit) {
      result = auth_format_front(data)
      result = auth_format(result)
    } else {
      result = auth_format(data)
    }
    result.forEach(item => {
      if (item.code === 'frontPage' || item.authName === '通用权限' || item.code === 'payAuth') {
        item.checkAll = item.authInfos.every(item => item.check)
        item.isIndeterminate = !item.checkAll && item.checkedLists.length > 0
      } else {
        item.checkAll = item.authInfos.every(item => item.checkAll)
        item.isIndeterminate =
          !item.checkAll && item.authInfos.filter(item => item.checkedLists?.length > 0).length > 0
      }
    })
    return data
  }

  // 用户新增权限格式转换
  function add_auth_format(data) {
    data.forEach((item, index) => {
      item.checkedLists = []
      item.isIndeterminate = false
      item.checkAll = false
      item.check = false
      item.check2 = false
      item.disabledFront = false // 前端禁止 用于副授权号控制
      item.disabledDynamic = false // 动态禁止
      if (item.authInfos) {
        add_auth_format([...item.authInfos])
      }
    })
    return data
  }

  /* 专属权限整列隐藏 */
  function view_auth_format(data, resultCurrent = []) {
    let result = resultCurrent
    data.forEach(item => {
      item.hideItem = item.authInfos?.every(e => e.exclusive) || false
      if (item.authInfos) {
        view_auth_format([...item.authInfos])
      }
    })

    return data
  }

  /* 专属权限最外层整行隐藏 */
  function view_auth_filter(data) {
    let arr = view_auth_format(data)
    const result = arr.map(item => {
      return {
        ...item,
        hideItem: item.authInfos?.every(e => e.exclusive || e.hideItem)
      }
    })
    return result
  }

  function get_search_type(type) {
    if (!type) {
      return []
    }
    let result = []
    type.forEach(item => {
      result = result.concat(item)
    })
    return Array.from(new Set(result)).filter(item => item)
  }

  // 默认角色选中/取消 角色选中优先级高于disableNotice下disabledDynamic
  function auth_format_default(data, val) {
    data.forEach((item, index) => {
      if (item.defaultAuth) {
        item.check = val
        item.disabledFront = val
        item.disabledDynamic = val // disabledFront
      }
      if (item.authInfos) {
        auth_format_default([...item.authInfos], val)
      }
    })
    return data
  }

  /**
   * 选中付款授权管理-副授权号默认角色选中 defaultAuth
   * @param data 编辑数据
   * @param val 是否勾选 <Boolean>
   * @returns {*}
   */
  function select_default_auth(data, val) {
    let result = auth_format_default(data, val)
    return edit_auth_format(result, false)
  }

  /**
   * 动态修改权限data字段
   * @param data
   * @param callback
   * @returns {*}
   */
  function data_variable_update(data, callback) {
    data.forEach(item => {
      callback && callback(item)
      if (item.authInfos) {
        data_variable_update([...item.authInfos], callback)
      }
    })
    return data
  }

  /**
   * 动态禁用修改字段
   * @param data
   * @param val {Boolean} <true 开启禁用，false 关闭禁用>
   * @param userInfo 当前后台保存的用户信息
   * @return {any}
   */
  function disable_dynamic_update(data, val, userInfo) {
    const uam_tab_user_isNormal = permissionServe.uam_tab_user_isNormal(userInfo)
    return data_variable_update(data, item => {
      // 存在disableNotice 字段才修改动态禁用,且(当前check状态,或者<普通用户+初始状态check2 true> 状态不禁用，可编辑)
      if (item.check || (uam_tab_user_isNormal && item.check2)) {
        item.disabledDynamic = false
      } else {
        item.disabledDynamic = item.disableNotice ? val : false
      }
    })
  }

  return {
    ...paymentManagerNum,
    get_auth_request,
    edit_auth_format,
    add_auth_format,
    view_auth_format,
    view_auth_filter,
    get_search_type,
    select_default_auth,
    disable_dynamic_update
  }
}
