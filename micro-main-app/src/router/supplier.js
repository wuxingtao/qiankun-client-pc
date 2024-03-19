import Admin from '@/views/admin'

export default {
  path: '/supplier',
  component: Admin,
  redirect: '/supplier/index',
  children: [
    {
      path: 'index',
      name:'supplier-index',
      component: () => import (/* webpackChunkName: 'supplier-index' */ '@/views/supplier-management/supplier/index.vue'),
      meta: {
        name: '供应商列表'
      },
    }, 
    {
      path: 'detail',
      component: () => import (/* webpackChunkName: 'supplier-detail' */ '@/views/supplier-management/supplier/detail.vue'),
      meta: {
        name: '供应商详情页'
      },
    },
    {
      path: 'sku',
      name:'sku',
      component: () => import (/* webpackChunkName: 'supplier-sku' */ '@/views/supplier-management/sku/index.vue'),
      meta: {
        name: 'SKU列表'
      },
    }, 
    {
      path: 'sku-detail',
      component: () => import (/* webpackChunkName: 'supplier-sku-detail' */ '@/views/supplier-management/sku/sku-detail.vue'),
      meta: {
        name: 'SKU详情页'
      },
    },
    {
      name:'allocation-index',
      path: 'allocation',
      component: () => import (/* webpackChunkName: 'supplier-allocation-index' */ '@/views/supplier-management/allocation/index.vue'),
      meta: {
        name: '供应商列表'
      },
    }, 
    {
      path: 'allocation-detail',
      component: () => import (/* webpackChunkName: 'supplier-allocation-detail' */ '@/views/supplier-management/allocation/detail.vue'),
      meta: {
        name: '供应商详情页'
      },
    },
  ]
}
