/**
 * @Desc: tabUtils
 * @Author: wu xingtao
 * @Date: 2021/12/7
 */

const ExcludeRouters = [
  {
    path: '/admin/waybill-v3',
    componentName: 'Waybill'
  },
  {
    path: '/admin/permission-manage',
    componentName: 'permission-lists'
  },
  {
    path: '/admin/permission-manage/user-auth',
    componentName: 'user-auth'
  },
  {
    path: '/admin/permission-manage/my-auth',
    componentName: 'my-auth'
  },
  {
    path: '/admin/permission-manage/user-add',
    componentName: 'user-add'
  },
  {
    path: '/admin/permission-manage/operation-record',
    componentName: 'permission-record'
  },
  {
    path: '/admin/coupon',
    componentName: 'coupon'
  },
  {
    path: '/admin/query',
    componentName: 'query'
  },
  {
    path: '/admin/preference-delivery',
    componentName: 'Preference'
  },
]

// 详情页无需做缓存
// toDo： 需要把所有tab以外的页面包括进来
const AlwaysClear = [
  {
    path: '/admin/waybill-v3-detail',
    componentName: 'WaybillDetail'
  },
  {
    path: '/admin/waybill-international-detail',
    componentName: 'WaybillInternationalDetail'
  },
  {
    path: '/admin/batch-template',
    componentName: 'batch-template'
  },
  {
    path: '/admin/setting',
    componentName: 'default-setting'
  },
  {
    path: '/admin/permission-manage/customer-pass',
    componentName: 'customer-pass'
  },
 
]

/**
 * 无需keep-alive配置 未打开tab则exclude
 * @param openTabs
 * @returns {[]}
 */
export function getOpenTabExclude(openTabs) {
  let result = []
  ExcludeRouters.forEach(item => {
    if (!openTabs.find(tab => tab.path === item.path)) {
      result.push(item.componentName)
    }
  })
  const alwayClear = AlwaysClear.map(i => {
    return i.componentName
  })
  return result.concat(alwayClear)
}
