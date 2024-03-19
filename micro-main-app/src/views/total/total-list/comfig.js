import dayjs from 'dayjs'
// 初始化默认7天
export const dtType = [
  dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  dayjs().add(-1, 'd').format('YYYY-MM-DD'),
]
/*form 数据*/
export const formData = {
  waybillNumber: '', //运单号
  shipingTimeStart: dtType || [], //寄件时间
  shipingCompany: '', //寄件公司
  origin: '', //始发地
  pickupPerson: '', //收件人
  pickupCustomerShortName: '', //收件公司
  destination: '', //目的地
  serviceType: [], //服务方式
  payMode: '', //付款方式
  unDeliveryReasonType: '', //异常状态
  timeoutValue: '', //超时时长
  /* transportMode: '',//运输模式*/
  mainProduct: '', //托寄物
  payCustomerShortName: '', //付款公司
  /*  flightNo: '',//航班号*/
  actualTimeConsuming: '', //实际耗时
  /*  isReturn: '',//是否转寄退回*/
  /*  returnCommitTimeStart: [],//退货提交时间*/
  /*  returnSignTimeStart: [],//退货签收时间*/
  customerFlag: '1', //物流角色
  overtimeType: [],
  dateType: 'shipingTime',
}

/*付款方式*/
export const payLookUp = [
  {
    label: '现结',
    value: '10',
  },
  {
    label: '周结',
    value: '20',
  },
  {
    label: '半月结',
    value: '30',
  },
  {
    label: '月结',
    value: '40',
  },
]

/*结算方式*/
export const payModeLookUp = [
  {
    label: '寄付',
    value: '10',
  },
  {
    label: '到付',
    value: '20',
  },
  {
    label: '第三方',
    value: '30',
  },
]
/*时间快捷方式*/
export const pickerOptions = {
  disabledDate(time) {
    if (time > new Date().getTime()) {
      return true
    }
  },
  // shortcuts: [
  //   {
  //     text: '近7天',
  //     onClick(picker) {
  //       const start = dayjs().add(-7, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       picker.$emit('pick', [start, end])
  //     },
  //   },
  //   {
  //     text: '近30天',
  //     onClick(picker) {
  //       const start = dayjs().add(-30, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       picker.$emit('pick', [start, end])
  //     },
  //   },
  //   {
  //     text: '近90天',
  //     onClick(picker) {
  //       const start = dayjs().add(-90, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       picker.$emit('pick', [start, end])
  //     },
  //   },
  //   {
  //     text: '近180天',
  //     onClick(picker) {
  //       const start = dayjs().add(-180, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       picker.$emit('pick', [start, end])
  //     },
  //   },
  //   {
  //     text: '近365天',
  //     onClick(picker) {
  //       const start = dayjs().add(-365, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       const end = dayjs().add(-1, 'd').format('YYYY-MM-DD HH:mm:ss')
  //       picker.$emit('pick', [start, end])
  //     },
  //   },
  // ],
}
/*服务方式数据字典*/
export const serviceLookUp = [
  {
    label: '全部',
    value: '1',
  },
  { value: '10', label: '当天达' },
  { value: '20', label: '次日达' },
  { value: '30', label: '隔日达' },
  { value: '40', label: '陆运件' },
  { value: '50', label: '同城次日' },
  { value: '60', label: '次晨达' },
  { value: '70', label: '同城即日' },
  { value: '80', label: '航空件' },
  { value: '90', label: '早班件' },
  { value: '100', label: '中班件' },
  { value: '110', label: '晚班件' },
  { value: '160', label: '省内次日' },
  { value: '170', label: '省内即日' },
  { value: '190', label: '内部次日' },
  { value: '200', label: '内部件' },
  { value: '210', label: '空运' },
  { value: '220', label: '专运' },
  { value: '240', label: '整车运输' },
  { value: '250', label: '企业整车' },
  { value: '260', label: '同城配送' },
  { value: '280', label: '次晚达' },
  { value: '290', label: '内部急件' },
  { value: '300', label: '冷链零担' },
  { value: '340', label: '次中达' },
  { value: '350', label: '隔晨达' },
  { value: '360', label: '隔中达' },
  { value: '370', label: '陆晨达' },
  { value: '380', label: '同城次晨' },
  { value: '390', label: '同城次中' },
  { value: '400', label: '省内次晨' },
  { value: '410', label: '省内次中' },
  { value: '1100', label: '特惠快运' },
  { value: '1200', label: '特惠普运' },
  { value: '1300', label: '特惠航空' },
  { value: '1400', label: '特惠同城' },
  { value: '1500', label: '特惠省内' },
]

/*结算方式*/
export const paymentPayTypeLookUp = [
  { value: '10', label: '现结' },
  { value: '20', label: '周结' },
  { value: '30', label: '半月结' },
  { value: '40', label: '月结' },
]
/*有无回单*/
export const addedServicesLookUp = [
  { value: '10', label: '有' },
  { value: '20', label: '无' },
]
/*
 * 车辆类型
 * */

export const pickupCarModelsLookUp = [
  { value: '11', label: '大货9.6' },
  { value: '12', label: '大货7.6' },
  { value: '20', label: '中货4.2' },
  { value: '30', label: '拖头' },
  { value: '40', label: '油罐' },
  { value: '50', label: '面包' },
  { value: '60', label: '两轮' },
  { value: '70', label: '三轮' },
  { value: '80', label: '小货' },
  { value: '90', label: '挂箱' },
  { value: '101', label: '冷链大货9.6' },
  { value: '102', label: '冷链大货7.6' },
  { value: '170', label: '冷链中货' },
  { value: '120', label: '叉车' },
  { value: '110', label: '大巴' },
  { value: '140', label: '小巴' },
  { value: '130', label: '中巴' },
  { value: '150', label: '轿车' },
  { value: '10', label: '大货' },
  { value: '100', label: '冷链大货' },
]

/*
 * 车辆类型
 * */

export const shipingRegionLookUp = [
  { value: '10', label: '华东大区' },
  { value: '20', label: '华南大区' },
  { value: '30', label: '华北大区' },
  { value: '40', label: '京津冀大区' },
]

/*物流角色*/
export const customerLookUp = [
  {
    label: '作为寄方',
    value: '1',
    auth: '',
  },
  {
    label: '作为收方',
    value: '2',
    auth: 'switchRoleReceiving',
  },
  {
    label: '作为付款方',
    value: '3',
    auth: '',
  },
]

/*运输模式*/
export const transportModeLookUp = [
  {
    label: '直飞',
    value: '10',
  },
  {
    label: '陆运',
    value: '20',
  },
  {
    label: '空对空',
    value: '40',
  },
]
/*是否转寄退回*/
export const isReturnLookUp = [
  {
    label: '否',
    value: 0,
  },
  {
    label: '是',
    value: 1,
  },
]

/*是否子母单*/
export const isChildLookUp = [
  {
    label: '非子母单',
    value: 0,
  },
  {
    label: '子单',
    value: 1,
  },
  {
    label: '母单',
    value: 2,
  },
]

export const tableColumns = [
  {
    text: '运单号',
    disabled: false,
    prop: 'waybillNumber',
    auth: 'waybillNumber',
    checked: true,
    visible: true,
    fixed: 'left',
    width: 140,
    attr: {
      sortable: false,
    },
  },
  {
    text: '服务方式',
    disabled: false,
    prop: 'serviceType',
    auth: 'serviceModel',
    checked: true,
    visible: true,
    width: 92,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '运单运费(元)',
    disabled: false,
    prop: 'freightCharges',
    auth: 'waybillFee',
    checked: true,
    visible: true,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '计费重量(KG)',
    disabled: false,
    prop: 'freightWeight',
    auth: 'billWeight',
    checked: true,
    visible: true,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '总件数',
    disabled: false,
    prop: 'unitCount',
    auth: 'number',
    checked: true,
    visible: true,
    width: 98,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '总费用(元)',
    disabled: false,
    prop: 'totalCost',
    auth: 'totalCost',
    checked: true,
    visible: true,
    width: 105,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '寄件时间',
    disabled: false,
    prop: 'shipingTime',
    auth: 'sendTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '签收时间',
    disabled: false,
    prop: 'signingTime',
    auth: 'signinTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '寄件人',
    disabled: false,
    prop: 'shipingPerson',
    auth: 'deliveryPerson',
    checked: true,
    visible: true,
    width: 80,
    attr: {
      sortable: false,
    },
  },
  {
    text: '寄件公司',
    disabled: false,
    prop: 'shipingCompany',
    auth: 'deliveryCompanyName',
    checked: true,
    visible: true,
    width: 92,
    attr: {
      sortable: false,
    },
  },
  {
    text: '始发地',
    disabled: false,
    prop: 'shipingAreaCode',
    auth: 'deliveryCityCode',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '寄件电话',
    disabled: false,
    prop: 'shipingPhone',
    auth: 'deliveryTelPhone',
    checked: true,
    visible: true,
    width: 110,
    attr: {
      sortable: false,
    },
  },
  {
    text: '寄件手机号',
    disabled: false,
    prop: 'shipingMobile',
    auth: 'deliveryMobile',
    checked: true,
    visible: true,
    width: 110,
    attr: {
      sortable: false,
    },
  },
  {
    text: '收件人',
    disabled: false,
    prop: 'pickupPerson',
    auth: 'receivePerson',
    checked: true,
    visible: true,
    width: 80,
    attr: {
      sortable: false,
    },
  },
  {
    text: '收件公司',
    disabled: false,
    prop: 'pickupCustomerShortName',
    auth: 'receiveCompanyName',
    checked: true,
    visible: true,
    width: 92,
    attr: {
      sortable: false,
    },
  },
  {
    text: '目的地',
    disabled: false,
    prop: 'receiveAreaCode',
    auth: 'receiveCityCode',
    checked: true,
    visible: true,
    width: 100,
    attr: {
      sortable: false,
    },
  },
  {
    text: '收件电话',
    disabled: false,
    prop: 'pickupPhone',
    auth: 'receiveTelPhone',
    checked: true,
    visible: true,
    width: 110,
    attr: {
      sortable: false,
    },
  },
  {
    text: '收件手机号',
    disabled: false,
    prop: 'pickupMobile',
    auth: 'receiveMobile',
    checked: true,
    visible: true,
    width: 110,
    attr: {
      sortable: false,
    },
  },
  {
    text: '收件地址',
    disabled: false,
    prop: 'receiveAddress',
    auth: 'receiveAddress',
    checked: true,
    visible: true,
    width: 350,
    attr: {
      sortable: false,
    },
  },
  {
    text: '签收人',
    disabled: false,
    prop: 'signingPerson',
    auth: 'signPerson',
    checked: true,
    visible: true,
    width: 80,
    attr: {
      sortable: false,
    },
  },
  {
    text: '体积(m³)',
    disabled: false,
    prop: 'goodsSize',
    auth: 'volume',
    checked: true,
    visible: true,
    width: 98,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '付款方式',
    disabled: false,
    prop: 'payMode',
    auth: 'payMode',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '始发省份',
    disabled: false,
    prop: 'shipingProvince',
    auth: 'startProvince',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '目的省份',
    disabled: false,
    prop: 'receiveProvince',
    auth: 'endProvince',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '回单份数',
    disabled: false,
    prop: 'receiptCount',
    auth: 'receiptNumber',
    checked: true,
    visible: true,
    width: 80,
    attr: {
      sortable: false,
    },
  },
  {
    text: '预计送达时间',
    disabled: false,
    prop: 'expectedArrivalDate',
    auth: 'expectServiceTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '托寄物',
    disabled: false,
    prop: 'mainProduct',
    auth: 'goods',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '声明价值',
    disabled: false,
    prop: 'insuranceValue',
    auth: 'declaredValue',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  /*  {
    "text":"最低计费标准",
    "disabled":false,
    "prop":"freightLowestAmount",
    "auth": 'minChargedStandard',
    "checked":true,
    "visible":true,
    "attr":{
      "sortable":false,
      "width":150
    }
  },*/
  {
    text: '取货车型',
    disabled: false,
    prop: 'pickupCarModels',
    auth: 'pickupCarModel',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '始发大区',
    disabled: false,
    prop: 'shipingRegion',
    auth: 'startArea',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '目的大区',
    disabled: false,
    prop: 'receiveArea',
    auth: 'endArea',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  // {
  //   "text":"计费方数(m³)",
  //   "disabled":false,
  //   "prop":"freightVolume",
  //     "auth": 'billSquare',
  //   "visible":true,
  //   "attr":{
  //     sortable:"custom",
  //     "width":92
  //   }
  // },
  {
    text: '首重(KG)',
    disabled: false,
    prop: 'firstWeight',
    auth: 'firstWeight',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  // {
  //   "text":"首方(m³)",
  //   "disabled":false,
  //   "prop":"firstVolume",
  //     "auth": 'firstSquare',
  //   "visible":true,
  //   "attr":{
  //     "sortable":false,
  //     "width":92
  //   }
  // },
  {
    text: '结算方式',
    disabled: false,
    prop: 'paymentPayType',
    auth: 'settleModel',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '实际重量(KG)',
    disabled: false,
    prop: 'actualWeight',
    auth: 'realWeight',
    checked: true,
    visible: true,
    width: 128,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '是否子母单',
    disabled: false,
    prop: 'isChildMother',
    auth: 'isChild',
    checked: true,
    visible: true,
    width: 128,
    attr: {
      sortable: false,
    },
  },
  {
    text: '是否违禁品',
    disabled: false,
    prop: 'isContraband',
    auth: 'isContraband',
    checked: true,
    visible: true,
    width: 128,
    attr: {
      sortable: false,
    },
  },
  {
    text: '折后运费(元)',
    disabled: false,
    prop: 'discountSalesAmount',
    auth: 'discountFee',
    checked: true,
    visible: true,
    width: 130,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '折扣%',
    disabled: false,
    prop: 'discountRate',
    auth: 'discount',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '提货时间',
    disabled: false,
    prop: 'pickGoodsDate',
    auth: 'deliveryTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      sortable: false,
    },
  },
  {
    text: '航班号',
    disabled: false,
    prop: 'flightNo',
    auth: 'flightNumber',
    checked: true,
    visible: true,
    width: 80,
    attr: {
      sortable: false,
    },
  },
  {
    text: '目的机场',
    disabled: false,
    prop: 'destinationAirport',
    auth: 'endAirport',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '运输模式',
    disabled: false,
    prop: 'transportMode',
    auth: 'transportMode',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '起落时间',
    disabled: false,
    prop: 'riseDecayTime',
    auth: 'updownTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      sortable: false,
    },
  },
  {
    text: '是否专车',
    disabled: false,
    prop: 'isTailoredCar',
    auth: 'isSpecialCar',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '揽收时间',
    disabled: false,
    prop: 'takeTime',
    auth: 'collectTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '退货提交时间',
    disabled: false,
    prop: 'returnCommitTime',
    auth: 'returnSubmitTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '退货签收时间',
    disabled: false,
    prop: 'returnSignTime',
    auth: 'returnSignTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '退回单号',
    disabled: false,
    prop: 'returnNumber',
    auth: 'returnWaybillNumber',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '退货公司',
    disabled: false,
    prop: 'returnCompany',
    auth: 'returnCompanyName',
    checked: true,
    visible: true,
    width: 92,
    attr: {
      sortable: false,
    },
  },
  {
    text: '实际耗时(h)',
    disabled: false,
    prop: 'actualTimeConsuming',
    auth: 'realTime',
    checked: true,
    visible: true,
    width: 130,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '超时时长(h)',
    disabled: false,
    prop: 'timeoutValue',
    auth: 'overtime',
    checked: true,
    visible: true,
    width: 150,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '超时类型',
    disabled: false,
    prop: 'overtimeType',
    auth: 'timeoutType',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '增值费用(元)',
    disabled: false,
    prop: 'addedFee',
    auth: 'expenseFee',
    checked: true,
    visible: true,
    width: 98,
    attr: {
      sortable: false,
    },
  },
  {
    text: '签到时间',
    disabled: false,
    /*"prop":"deliverySignDate",*/
    prop: 'deliverySignDate',
    auth: 'signTime',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '超时原因',
    disabled: false,
    prop: 'overtimeReason',
    auth: 'timeoutReason',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '是否转寄退回',
    disabled: false,
    prop: 'isForwardReturn',
    auth: 'returnNumber',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      sortable: false,
    },
  },
  {
    text: '实际送达日',
    disabled: false,
    /* "prop":"signingDate",*/
    prop: 'signingDate',
    auth: 'realServiceDate',
    checked: true,
    visible: true,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '有无回单',
    disabled: false,
    prop: 'addedServices',
    auth: 'isReceipt',
    checked: true,
    visible: true,
    width: 90,
    attr: {
      sortable: false,
    },
  },
  {
    text: '付款公司',
    disabled: false,
    prop: 'paymentCompany',
    auth: 'paymentCustomerName',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '到站编码（联邦）',
    disabled: false,
    prop: 'pickupStationCode',
    auth: 'arriveStation',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '寄站编码（联邦）',
    disabled: false,
    prop: 'deliveryStationCode',
    auth: 'sendStation',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '发运单号（联邦）',
    disabled: false,
    prop: 'forwardingCustomerWaybillNumber',
    auth: 'fwaybillNumber',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '签到状态',
    disabled: false,
    prop: 'signInState',
    auth: 'checkInStatus',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '签收状态',
    disabled: false,
    prop: 'signState',
    auth: 'signInStatus',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '运单备注',
    disabled: false,
    prop: 'waybillRemark',
    auth: 'waybillRemark',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
  {
    text: '寄件地址',
    disabled: false,
    prop: 'address',
    auth: 'deliveryAddress',
    checked: true,
    visible: true,
    width: 120,
    attr: {
      sortable: false,
    },
  },
]

export const timeoutTypeOptions = [
  {
    label: '全部',
    value: '1',
  },
  {
    label: '跨越原因',
    value: '2',
  },
  {
    label: '客户原因',
    value: '3',
  },
  {
    label: '不可抗力',
    value: '4',
  },
]
