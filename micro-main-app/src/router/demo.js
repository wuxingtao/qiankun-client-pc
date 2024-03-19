import Admin from '@/views/admin'

const routes = [
  {
    path: 'page-list',
    component: () => import (/* webpackChunkName: 'demo-page-list' */ '@/views/demo/page-list.vue'),
    meta: {
      name: '列表页示例'
    },
  },
  {
    path: 'page-form',
    component: () => import (/* webpackChunkName: 'demo-page-form' */ '@/views/demo/page-form.vue'),
    meta: {
      name: '表单页示例'
    },
  },
  {
    path: 'componets',
    component: () => import (/* webpackChunkName: 'demo-componets' */ '@/views/demo/componets.vue'),
    meta: {
      name: '其它组件示例'
    },
  },
  {
    path: 'table',
    component: () => import (/* webpackChunkName: 'demo-table' */ '@/views/demo/table.vue'),
    meta: {
      name: '表格组件示例'
    },
  },
]

export default {
  path: '/demo',
  component: Admin,
  redirect: '/demo/page',
  children: process.env.NODE_ENV !== 'production' ? routes : []
}
