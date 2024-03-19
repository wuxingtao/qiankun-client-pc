import Admin from '@/views/admin'
import Error from '@/views/layout/error'
import userRoutes from './user'

export default {
  path: '/admin',
  component: Admin,
  redirect: '/admin/waybill-v3',
  children: [
    {
      path: 'total-show',
      name: 'totalShow',
      redirect: '/dashboard',
      component: () =>
        import(/* webpackChunkName: 'total-show' */ '../views/total/total-show/index')
    },
    {
      path: 'total-list',
      name: 'totalList',
      component: () =>
        import(/* webpackChunkName: 'total-list' */ '../views/total/total-list/index')
    },
    {
      path: 'total-totals',
      name: 'totalTotals',
      component: () => import('../views/total/total-totals/index')
    },
    // {
    //   name: 'order',
    //   path: 'order',
    //   text: '单票下单',
    //   component: () => import('@/views/shipment/index')
    // },
    {
      name: 'delivery',
      path: 'delivery',
      text: '单票下单',
      meta: { pageCode: 'page_express_express' },
      component: () => import(/* webpackChunkName: 'delivery' */ '@/views/delivery/index')
    },
    // {
    //   path: 'adjust-price-notice',
    //   text: '调价通知',
    //   component: () => import(/* webpackChunkName: 'delivery' */ '@/views/delivery/adjust-price/index')
    // },
    {
      name: 'vtsOrder',
      path: 'vtsOrder',
      text: 'vts整车下单',
      component: () => import(/* webpackChunkName: 'vtsOrder' */ '@/views/vts/vts-order')
    },
    {
      name: 'vtsWaybill',
      path: 'vtsWaybill',
      text: 'vts整车运单',
      component: () => import(/* webpackChunkName: 'vtsWaybill' */ '@/views/vts/vts-waybill')
    },
    {
      name: 'vtsWaybill-detail',
      path: 'vtsWaybill-detail/:id',
      text: 'vts整车运单详情',
      component: () => import('@/views/vts/vts-detail')
    },
    // {
    //   name:'delivery-batch',
    //   path: 'delivery-batch',
    //   text:'批量导入',
    //   component: () => import ('@/views/delivery/batch-import')
    // },
    // {
    //   name: 'waybill',
    //   path: 'waybill',
    //   component: () => import('@/views/client/pages/waybill')
    // },
    {
      name: 'waybill-v3',
      path: 'waybill-v3',
      meta: { pageCode: 'page_search_order' },
      component: () => import(/* webpackChunkName: 'waybill-v3' */ '@/views/waybill/index')
    },
    {
      name: 'waybillBatchQuery',
      path: 'waybill/waybillBatchQuery',
      component: () =>
        import(
          /* webpackChunkName: 'waybill-waybillBatchQuery' */ '@/views/waybill/pages/waybill-batch-query'
          )
    },
    // {
    //   path: 'search-waybill',
    //   component: () => import('@/views/client/pages/waybill-query')
    // },
    // {
    //   name: 'search-waybillDetail',
    //   path: 'search-waybill-detail',
    //   component: () => import('@/views/client/pages/waybill-detail')
    // },
    {
      name: 'waybill-v3-detail-material',
      path: 'waybill-v3-detail-material',
      component: () =>
        import(
          /* webpackChunkName: 'waybill-v3-detail-material' */ '@/views/waybill/components/detail/waybill-detail-material'
          )
    },
    {
      name: 'waybill-v3-material',
      path: 'waybill-v3-material',
      component: () =>
        import(
          /* webpackChunkName: 'waybill-v3-material' */ '@/views/waybill/pages/waybill-material'
          )
    },
    {
      name: 'waybill-v3-migration',
      path: 'waybill-v3-migration',
      component: () =>
        import(
          /* webpackChunkName: 'waybill-v3-migration' */ '@/views/waybill/pages/waybill-migration'
          )
    },
    {
      name: 'query',
      path: 'query',
      meta: { pageCode: 'page_freight_time' },
      component: () => import(/* webpackChunkName: 'query' */ '@/views/client/pages/query')
    },
    {
      name: 'bill',
      path: 'bill',
      meta: { pageCode: 'page_bill_total' },
      component: () => import(/* webpackChunkName: 'bill' */ '@/views/client/pages/bill')
    },
    {
      name: 'advertising',
      path: 'advertising',
      component: () =>
        import(/* webpackChunkName: 'advertising' */ '@/views/client/components/bill/advertising')
    },
    {
      name: 'billListDetail',
      path: 'billListDetail',
      meta: { pageCode: 'page_bill_total_detail' },
      component: () =>
        import(
          /* webpackChunkName: 'billListDetail' */ '@/views/client/components/bill/billListDetail'
          )
    },
    {
      name: 'bill-unmonthly',
      path: 'bill-unmonthly',
      component: () =>
        import(/* webpackChunkName: 'bill-unmonthly' */ '@/views/bill/unmonthly-payment')
    },
    // {
    //   name: 'prestore',
    //   path: 'prestore',
    //   component: () => import ('@/views/prestore/index')
    // },
    // {
    //   name: 'quotation',
    //   path: 'quotation',
    //   component: () => import ('@/views/quotation/index')
    // },
    // {
    //   name: 'waybillBatch',
    //   path: 'waybill/waybillBatch',
    //   component: () => import('@/views/client/pages/waybill-batch')
    // },
    // {
    //   name: 'waybillDetail',
    //   path: 'waybill-detail',
    //   component: () => import('@/views/client/pages/waybill-detail')
    // },
    {
      name: 'waybillDetail-v3',
      path: 'waybill-v3-detail',
      component: () =>
        import(/* webpackChunkName: 'waybill-v3-detail' */ '@/views/waybill/pages/waybill-detail')
    },
    {
      name: 'waybillInternationalDetail',
      path: 'waybill-international-detail',
      component: () =>
        import(
          /* webpackChunkName: 'waybill-international-detail' */ '@/views/waybill/waybill-international/pages/waybill-international-detail'
          )
    },
    {
      path: 'address',
      component: () => import(/* webpackChunkName: 'address' */ '@/views/address-book/index')
    },
    {
      name: 'coupon',
      path: 'coupon',
      meta: {
        name: '我的优惠券'
      },
      component: () => import(/* webpackChunkName: 'coupon' */ '@/views/coupon/index')
    },
    {
      path: 'permission-manage',
      name: 'permission-manage',
      component: () => import('@/views/permission-manage/index')
    },
    {
      name: 'permission-operation-record',
      path: 'permission-manage/operation-record',
      meta: {
        name: '操作记录'
      },
      component: () => import('@/views/permission-manage/permission-index/operation-record')
    },
    {
      name: 'permission-my-auth',
      path: 'permission-manage/my-auth',
      meta: {
        name: '我的权限'
      },
      component: () => import('@/views/permission-manage/permission-index/my-auth')
    },
    {
      name: 'permission-user-auth',
      path: 'permission-manage/user-auth',
      meta: {
        name: '账户详情'
      },
      component: () => import('@/views/permission-manage/permission-index/user-auth')
    },
    {
      name: 'permission-user-add',
      path: 'permission-manage/user-add',
      meta: {
        name: '用户新增'
      },
      component: () => import('@/views/permission-manage/permission-index/user-add')
    },
    {
      name: 'permission-customer-pass',
      path: 'permission-manage/customer-pass',
      meta: {
        name: '客户编码密码'
      },
      component: () => import('@/views/permission-manage/permission-index/customer-pass')
    },
    {
      name: 'permission-manage-empty',
      path: 'permission-manage-empty',
      meta: {
        name: '权限管理空白页'
      },
      component: () => import('@/views/permission-manage/permission-empty')
    },
    {
      name: 'payment-operation-record',
      path: 'permission-manage/payment/operation-record',
      meta: {
        name: '权限管理-付款授权操作记录'
      },
      component: () => import('@/views/permission-manage/permission-index/operation-record')
    },
    {
      name: 'payment-my-auth',
      path: 'permission-manage/payment/my-auth',
      meta: {
        name: '权限管理-付款授权我的权限'
      },
      component: () => import('@/views/permission-manage/permission-index/my-auth')
    },
    {
      name: 'payment-user-auth',
      path: 'permission-manage/payment/user-auth',
      meta: {
        name: '账户详情'
      },
      component: () => import('@/views/permission-manage/permission-index/user-auth')
    },
    {
      name: 'payment-user-add',
      path: 'permission-manage/payment/user-add',
      meta: {
        name: '用户新增'
      },
      component: () => import('@/views/permission-manage/permission-index/user-add')
    },
    {
      path: 'print',
      name: 'print',
      component: () => import(/* webpackChunkName: 'print' */ '@/views/setting/print/index')
    },
    {
      path: 'electronic-invoice',
      name: 'electronicInvoice',
      component: () =>
        import(/* webpackChunkName: 'electronic-invoice' */ '@/views/electronic-invoice/index')
    },
    {
      name: 'batchTemplate',
      path: 'batch-template',
      component: () =>
        import(/* webpackChunkName: 'batch-template' */ '@/views/setting/batchTemplate/index')
    },
    {
      name: 'batchTemplateAdd',
      path: 'batch-template-add',
      component: () =>
        import(
          /* webpackChunkName: 'batch-template-add' */ '@/views/setting/batchTemplate/template-add'
          )
    },
    {
      name: 'setting',
      path: 'setting',
      component: () => import(/* webpackChunkName: 'setting' */ '@/views/setting/setting/index')
    },
    {
      name: 'realVerify',
      path: 'real-name-verify',
      component: () =>
        import(/* webpackChunkName: 'real-name-verify' */ '@/views/real-name-verify/index'),
      meta: {
        name: '实名认证'
      }
    },
    {
      name: 'personalVerify',
      path: 'real-name-verify/personal-verify',
      component: () =>
        import(
          /* webpackChunkName: 'real-name-verify-personal-verify' */ '@/views/real-name-verify/personal-verify'
          ),
      meta: {
        name: '个人认证'
      }
    },
    {
      name: 'enterpriseVerify',
      path: 'real-name-verify/enterprise-verify',
      component: () =>
        import(
          /* webpackChunkName: 'real-name-verify-enterprise-verify' */ '@/views/real-name-verify/enterprise-verify'
          ),
      meta: {
        name: '企业认证'
      }
    },
    {
      name: 'payment-authorization',
      path: 'payment-authorization',
      component: () => import('@/views/setting/payment-authorization'),
      meta: {
        name: '付款授权'
      }
    },
    {
      name: 'selfSign',
      path: 'self-sign',
      component: () => import(/* webpackChunkName: 'self-sign' */ '@/views/setting/self-sign'),
      meta: {
        name: '本人签收'
      }
    },
    // {
    //   name:'report',
    //   path: 'report',
    //   component: () => import ('@/views/report/index'),
    //   meta: {
    //     name: '统计报表'
    //   }
    // },
    // {
    //   path: 'report/fee',
    //   component: () => import ('@/views/report/fee/index'),
    //   meta: {
    //     name: '费用统计'
    //   }
    // },
    // {
    //   path: 'report/express',
    //   component: () => import ('@/views/report/express/index'),
    //   meta: {
    //     name: '产品服务'
    //   }
    // },
    // {
    //   path: 'report/waybill-payment',
    //   component: () => import ('@/views/report/express/waybill-payment'),
    //   meta: {
    //     name: '运单查询'
    //   }
    // },
    // {
    //   path: 'report/waybill-deliver-status',
    //   component: () => import ('@/views/report/express/waybill-deliver-status'),
    //   meta: {
    //     name: '运单查询'
    //   },
    // },
    // {
    //   path: 'report/abnormal-waybill',
    //   component: () => import ('@/views/report/express/abnormal-waybill'),
    //   meta: {
    //     name: '异常运单'
    //   }
    // },
    // {
    //   path: 'report/weight',
    //   component: () => import ('@/views/report/weight/index'),
    //   meta: {
    //     name: '重量分析'
    //   }
    // },
    // {
    //   path: 'report/flow-analyse',
    //   component: () => import ('@/views/report/flow-analyse/index'),
    //   meta: {
    //     name: '流向分析'
    //   }
    // },
    // {
    //   name: 'delivered',
    //   path: 'report/delivered',
    //   component: () => import ('@/views/report/delivered/index'),
    //   meta: {
    //     name: '整体妥投分析'
    //   }
    // },
    // {
    //   name: 'prescription',
    //   path: 'report/PrescriptionIndex',
    //   component: () => import ('@/views/report/delivered/componets/PrescriptionIndex.vue'),
    //   meta: {
    //     name: '时效内妥投分析'
    //   }
    // },
    // {
    //   name: 'time-analysis',
    //   path: 'report/time-analysis',
    //   component: () => import ('@/views/report/time-analysis/index.vue'),
    //   meta: {
    //     name: '时效分析报表'
    //   }
    // },
    // {
    //   name: 'time-analysis-details',
    //   path: 'report/time-analysis-details',
    //   component: () => import ('@/views/report/time-analysis/details.vue'),
    //   meta: {
    //     name: '时效分析报表'
    //   }
    // },
    {
      path: 'exhibition-waybills',
      component: () =>
        import(
          /* webpackChunkName: 'exhibition-waybills' */ '@/views/exhibition-waybills/index.vue'
          ),
      meta: {
        name: '国际会展运单'
      }
    },
    {
      path: 'question-naire',
      component: () =>
        import(/* webpackChunkName: 'question-naire' */ '@/views/question-naire/index.vue'),
      meta: {
        name: '问卷调查'
      }
    },
    {
      path: 'function-feedback',
      component: () =>
        import(/* webpackChunkName: 'function-feedback' */ '@/views/function-feedback/index.vue'),
      meta: {
        name: '功能反馈'
      }
    },
    /** 问卷详情（首页） */
    {
      path: 'survey',
      component: () =>
        import(/* webpackChunkName: 'survey' */ '@/views/survey/pages/home/index.vue'),
      meta: {
        name: '问卷调查'
      }
    },
    /** 查看结果 */
    {
      path: 'survey-result',
      name: 'result',
      component: () =>
        import(/* webpackChunkName: 'survey-result' */ '@/views/survey/pages/result/index.vue'),
      meta: {
        name: '问卷调查'
      }
    },
    /** 状态页 */
    {
      path: 'survey-status',
      name: 'status',
      component: () =>
        import(/* webpackChunkName: 'survey-status' */ '@/views/survey/pages/status/index.vue'),
      meta: {
        name: '问卷调查'
      }
    },
    {
      path: 'encrypt-records',
      component: () =>
        import(/* webpackChunkName: 'encrypt-records' */ '@/views/encrypt-records/index.vue'),
      meta: {
        name: '操作日志'
      }
    },
    // 偏好设置调整
    {
      name:'preference-delivery',
      path: 'preference-delivery',
      component: () => import('@views/preference/preference-delivery/preference-delivery.vue')
    },
    //消息中心
    {
      name: 'message-center',
      path: 'message-center',
      component: () =>
        import(/* webpackChunkName: 'ky-message-popup' */ '@/components/ky-message-popup/index.vue')
    },

    // 外部页面承载
    // {
    //   path: 'outside-page',
    //   name: 'outside-page',
    //   component: () =>
    //     import(/* webpackChunkName: 'outside-page' */ '@/views/layout/outside-page.vue')
    // },
    {
      name: 'VueMicroApp',
      path: 'vue'
    },
    {
      name: 'VueMicroAppList',
      title: 'Vue 列表页',
      path: 'vue/slot'
    },
    {
      name: 'VueMicroAppCommunication',
      title: 'Vue 通信',
      path: 'vue/communication'
    },
    ...userRoutes,
    // 未匹配到的路由统一走error
    {
      path: 'error',
      component: Error
    },
    {
      path: '*',
      redirect: '/admin/error'
    }
  ]
}
