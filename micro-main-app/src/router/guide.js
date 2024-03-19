export default {
  path: '/guide',
  component: () => import('@/views/guide/index'),
  redirect: '/guide/password',
  children: [
    { path: 'code', component: () => import(/* webpackChunkName: 'guide-code' */ '@/views/guide/code') },
    { path: 'password', component: () => import(/* webpackChunkName: 'guide-password' */ '@/views/guide/password') },
    { path: 'verify', component: () => import(/* webpackChunkName: 'guide-verify' */ '@/views/guide/verify') }
  ]
}