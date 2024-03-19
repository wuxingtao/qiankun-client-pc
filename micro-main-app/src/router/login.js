export default {
  path: '/login',
  component: () => import('@/views/login/index'),
  children: [
    { path: '', component: () => import(/* webpackChunkName: "login-index" */ '@/views/login/login') },
    { path: 'qrcode', component: () => import(/* webpackChunkName: "login-qrcode" */ '@/views/login/qrcode') },
    { path: 'forget', component: () => import(/* webpackChunkName: "login-forget" */ '@/views/login/forget') }
  ]
}