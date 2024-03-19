export default [
  {
    name: 'user',
    path: 'user',
    component: () => import(/* webpackChunkName: 'user' */ '@/views/setting/user/index')
  },
  {
    name: 'customer-code',
    path: 'user/customer-code',
    component: () => import(/* webpackChunkName: 'user-customer-code' */ '@/views/setting/user/customer-code/index')
  },
  {
    name: 'cusCode',
    path: 'user/cusCode',
    component: () => import(/* webpackChunkName: 'user-cusCode' */ '@/views/setting/user/cusCode')
  },
  {
    name: 'customerCodeApply',
    path: 'user/customer-code-apply',
    component: () =>
      import(
        /* webpackChunkName: 'customer-code-apply' */ '@/views/setting/user/customer-code-apply'
      )
  },
  {
    name: 'pasSet',
    path: 'user/pasSet',
    component: () => import(/* webpackChunkName: 'user-pasSet' */ '@/views/setting/user/pasSet')
  },
  {
    name: 'cooperationPersonnel',
    path: 'user/cooperationPersonnel',
    component: () =>
      import(
        /* webpackChunkName: 'user-cooperationPersonnel' */ '@/views/setting/user/cooperationPersonnel'
      )
  },
  {
    name: 'addCooperation',
    path: 'user/addCooperation',
    component: () =>
      import(/* webpackChunkName: 'user-addCooperation' */ '@/views/setting/user/addCooperation')
  },
  {
    name: 'addAuthorizationAccount',
    path: 'user/addAuthorizationAccount',
    component: () =>
      import(
        /* webpackChunkName: 'user-addAuthorizationAccount' */ '@/views/setting/user/addAuthorizationAccount'
      )
  },
  {
    name: 'approverCooperationAuthorization',
    path: 'user/approverCooperationAuthorization',
    component: () =>
      import(
        /* webpackChunkName: 'user-approverCooperationAuthorization' */ '@/views/setting/user/approverCooperationAuthorization'
      )
  },
  {
    name: 'jurisdictionConnect',
    path: 'user/jurisdictionConnect',
    component: () =>
      import(
        /* webpackChunkName: 'user-jurisdictionConnect' */ '@/views/setting/user/jurisdictionConnect'
      )
  },
  {
    name: 'authorizationAccountDetail',
    path: 'user/authorizationAccountDetail',
    component: () =>
      import(
        /* webpackChunkName: 'user-authorizationAccountDetail' */ '@/views/setting/user/authorizationAccountDetail'
      )
  }
]
