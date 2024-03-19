import router from '@/router'
import store from '@/store'
import { getToken, getCustomerCode, getCustomerData, getUserData } from './storage'
import { MessageBox } from 'element-ui'
import uploadLog from './LogTracker'
import { permissionServe } from '@views/permission-manage/permissionUtil'

//没有编码可以进的路由
const routesWithoutCustomerCode = ['/login', '/guide', '/admin/user', '/supplier']
//没有绑码不能进的路由 '/admin/waybill',
const routesPrehibitWithoutCustomerCode = [
  '/admin/waybill-v3',
  '/admin/delivery',
  '/supplier/index',
  '/supplier/detail',
  '/admin/vtsOrder',
  '/admin/vtsWaybill'
]

/**
 * 全局前置守卫
 */
router.beforeEach(async (to, from, next) => {
  uploadLog(to)
  store.commit('CLAER_CANCEL')
  if (['/lottery', '/demo'].find(f => to.path.startsWith(f))) {
    next()
    return true
  }
  if (to.path === '/admin/waybill') {
    next('/admin/waybill-v3')
    return
  }
  let routeFlag = !routesWithoutCustomerCode.some(r => to.path.startsWith(r))
  routeFlag = routeFlag || routesPrehibitWithoutCustomerCode.some(r => r === to.path)
  // 未登录
  if (!getToken() && !to.path.startsWith('/login')) {
    location.href = window.location.origin + '/login'
    return
  }
  else if (to.path.startsWith('/admin/permission-manage')) {
    if(!permissionServe.permissionMenuAbleCheck()){
      MessageBox.confirm('权限角色已变更，暂无权限管理权限', '提示',{
        showClose: false,
        confirmButtonText: '确认',
        type: 'warning',
        showCancelButton: false
      }).then(()=>{
        next('/admin/waybill-v3')
      })
      return
    }
    let activeTab = 'permission-index'
    if(to.path.startsWith('/admin/permission-manage/payment')){
      activeTab = 'payment-auth'
    }
    await store.dispatch('permission/update_tab_active', activeTab)

    next()

  }
  // 未绑码客户
  else if (!getCustomerCode() && routeFlag) {
    const flag = await canToWaybillWithoutCumeCode(to, next)
    !flag &&
      MessageBox.confirm('该功能需绑定客户编码后才可操作，是否去绑定客户编码', '提示', {
        showClose: false,
        confirmButtonText: '确认',
        type: 'warning',
        showCancelButton: false
      }).then(() => {
        if (from.path !== '/admin/user/cusCode') {
          next('/admin/user/cusCode')
        }
      })
  } else if (to.path === '/admin/delivery') {
    checkOrderDeliveryAuth(to, from, next)
  } else {
    havePermisson(to, from, next)
  }
})

async function canToWaybillWithoutCumeCode (to, next) {
  /*
   * 未绑码不能进入的页面
   * /admin/waybill-v3
   * /admin/delivery
   * */
  const arr = ['/admin/waybill-v3', '/admin/delivery', '/admin/vtsOrder', '/admin/vtsWaybill']
  if (!arr.includes(to.path)) {
    next()
    return true
  }
  await store.dispatch('supplier/setExistSupplierInfoAction')
  if (store.state.supplier.existSupplierInfo) {
    next()
    return true
  }
  next('/admin/user/cusCode')
  MessageBox.alert('客户编码是我司为保障客户利益，提供的个性化定制的唯一服务帐号', '您未绑定客户编码')
  return true
}

async function checkOrderDeliveryAuth (to, from, next) {
  const { allowToOrderFlag, allowToOrderTip } = getCustomerData()
  const {
    allowToOrderFlag: user_allowToOrderFlag,
    allowToOrderTip: user_allowToOrderTip
  } = getUserData()
  const { fullPath } = from
  // if (allowToOrderFlag !== '10') {
  //   await MessageBox.alert(allowToOrderTip)
  //   next(fullPath)
  // } else {
  //   next()
  // }
  if (allowToOrderFlag === '10' || user_allowToOrderFlag === '10') {
    next()
  } else {
    let msg = allowToOrderTip || user_allowToOrderTip
    if (!msg) {
      msg = '不允许下单，请联系商务'
    }
    await MessageBox.alert(msg)
    next(fullPath)
  }
}

function havePermisson (to, from, next) {
  const authorityIds = store.getters.authorityIds || []
  const authCodes = store.state.auth.authCodeList || []
  const idList = [...authorityIds,...authCodes]

  const menus = [
    { path: '/admin/exhibition-waybills', id: 'internationalEx' },
    { path: '/admin/total-list', id: '125' },
    { path: '/dashboard', id: '123' },
    { path: '/admin/total-totals', id: '124' },
    {
      path: '/admin/encrypt-records',
      id: '127'
    }
  ]
  const flag = menus.find(m => to.path.startsWith(m.path) && !idList.includes(m.id))
  if (flag) {
    next('/admin/waybill')
    return false
  }

  next()
  return true
}
