import store from '@/store/index'
// 订单状态
export const status = {
  100: '未报价',
  200: '已报价',
  300: '已下单',
  400: '已中标',
  500: '运输中',
  600: '已签收',
  700: '已取消'
}

export const statusOptions = [
  {
    label: '未报价',
    value: 100
  },
  {
    label: '已报价',
    value: 200
  },
  {
    label: '已下单',
    value: 300
  },
  {
    label: '已中标',
    value: 400
  },
  {
    label: '运输中',
    value: 500
  },
  {
    label: '已签收',
    value: 600
  },
  {
    label: '已取消',
    value: 700
  },
]

// 订单状态对应的可操作按钮
export const statusBtns = {
  100: [ // 未报价
    {
      name: '联系销售',
      type: 100
    },
    // {
    //   name: '详情',
    //   type: 2
    // }
  ],
  200: [ // 已报价
    {
      name: '确认下单',
      type: 200
    },
    // {
    //   name: '详情',
    //   type: 2
    // }
  ],
  300: [ // 已下单
    {
      name: '再来一单',
      type: 300
    },
    // {
    //   name: '详情',
    //   type: 2
    // }
  ],
  400: [ // 已调度
    {
      name: '再来一单',
      type: 400
    },
    // {
    //   name: '详情',
    //   type: 2
    // }
  ],
  500: [ // 进行中
    {
      name: '再来一单',
      type: 500
    },
    // {
    //   name: '详情',
    //   type: 2
    // }
  ],
  600: [ // 已签收
    {
      name: '再来一单',
      type: 600
    },
    // {
    //   name: '详情',
    //   type: 2
    // }
  ],
  700: [ // 已取消
    {
      name: '再来一单',
      type: 700
    }
  ]
}

/**
 * 订单付款方式
 * @param {*} status
 * @return {*}
 */
export const statusPayModel = (status) => {
  let _status = {
    10: '现结',
    20: '周结',
    30: '半月结',
    40: '月结',
  }
  return _status[+status] || '--'
}

/**
 * 数据字典-整车车型
 * @param {*} vts_base_car_type_config_car_type_code
 * @return {*}
 */
export const carType = (status) => {
  let _status = {
    1001: '面包车',
    1003: '厢式车',
    1005: '平板车',
    1006: '高栏车',
    1008: '冷藏车',
    1009: '高低板',
    1010: '飞翼车',
    1011: '两轮车',
    1012: '三轮车',
  }
  return _status[+status] || '--'
}

/**
 * 数据字典-整车车长
 * @param {*}
 * @return {*}
 */
export const carLong = (status) => {
  let _status = {}
  let cars = store.getters.carTypeList
  console.log('cars', cars)
  return _status[+status] || '--'
}
