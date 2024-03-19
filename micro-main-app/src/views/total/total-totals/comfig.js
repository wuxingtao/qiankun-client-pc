import dayjs from 'dayjs'

export const tableColumns = [
  /*加的*/
  {
    text: '寄件时间',
    disabled: false,
    prop: 'shipingDate',
    auth: 'shipingTimeStart',
    checked: true,
    visible: true,
    sortIndex: 0,
    width: 98,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '签收日期',
    disabled: false,
    prop: 'signingDate',
    auth: 'signDate',
    checked: false,
    visible: true,
    sortIndex: 0,
    width: 98,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '服务方式',
    disabled: false,
    prop: 'serviceMode',
    auth: 'serviceModel',
    checked: false,
    visible: true,
    sortIndex: 1,
    width: 95,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '始发地',
    disabled: false,
    prop: 'beginCity',
    auth: 'startPlace',
    checked: false,
    visible: true,
    sortIndex: 2,
    width: 100,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '目的地',
    disabled: false,
    prop: 'endCity',
    auth: 'endPlace',
    checked: false,
    visible: true,
    sortIndex: 3,
    width: 100,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '总票数',
    disabled: false,
    prop: 'sumVotes',
    auth: 'totalNumber',
    checked: false,
    visible: true,
    sortIndex: 4,
    width: 85,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },

  /*加的*/
  {
    text: '总件数',
    disabled: false,
    prop: 'totalUnit',
    auth: 'totalPackage',
    checked: false,
    visible: true,
    sortIndex: 4,
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
    checked: false,
    visible: true,
    sortIndex: 4,
    width: 105,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '计费重量(KG)',
    disabled: false,
    prop: 'sumWeight',
    auth: 'totalBillWeight',
    checked: false,
    visible: true,
    sortIndex: 5,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  /*加的*/
  {
    text: '实际重量(KG)',
    disabled: false,
    prop: 'totalActualWeight',
    auth: 'realTotalWeight',
    checked: false,
    visible: true,
    sortIndex: 5,
    width: 140,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },

  /*  {
    "text":"总方数",
    "disabled":false,
    "prop":"sumVotum",
     "auth": 'totalSquareNumber',
      "checked":false,
    "visible":true,
    "sortIndex": 0,
    "attr":{
      "width":55
    }
  },*/
  {
    text: '妥投票数',
    disabled: false,
    prop: 'sumDeliveredVotes',
    auth: 'deliveredPoll',
    checked: false,
    visible: true,
    sortIndex: 6,
    width: 100,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '妥投率',
    disabled: false,
    prop: 'sumDevliveredRate',
    auth: 'delivereRate',
    checked: false,
    visible: true,
    sortIndex: 7,
    width: 80,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },

  {
    text: '时效达成票数',
    disabled: false,
    prop: 'agingAchievedVotes',
    auth: 'timeReachNumber',
    checked: false,
    visible: true,
    sortIndex: 8,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '时效达成率',
    disabled: false,
    prop: 'agingAchievedRate',
    auth: 'timeReachRate',
    checked: false,
    visible: true,
    sortIndex: 9,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '揽收及时票数',
    disabled: false,
    prop: 'collectTimeoutVotes',
    auth: 'collectTimelyNumber',
    checked: false,
    visible: true,
    sortIndex: 10,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '揽收及时率',
    disabled: false,
    prop: 'collectTimeoutRate',
    auth: 'collectTimelyRate',
    checked: false,
    visible: true,
    sortIndex: 11,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '派签到及时票数',
    disabled: false,
    prop: 'sendDeliveredVotes',
    auth: 'dispatchTimelyNumber',
    checked: false,
    visible: true,
    sortIndex: 12,
    width: 135,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '派签到及时率',
    disabled: false,
    prop: 'sendDeliveredRate',
    auth: 'dispatchTimelyRate',
    checked: false,
    visible: true,
    sortIndex: 13,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },

  {
    text: '超时未签票数',
    disabled: false,
    prop: 'timeOutNoSignVotes',
    auth: 'timeoutNotSignNumber',
    checked: false,
    visible: true,
    sortIndex: 14,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
  {
    text: '未签收票数',
    disabled: false,
    prop: 'noSignVotes',
    auth: 'notSignNumber',
    checked: false,
    visible: true,
    sortIndex: 15,
    width: 125,
    attr: {
      'sort-orders': ['ascending', 'descending'],
      sortable: 'custom',
    },
  },
]
// 初始化默认7天
export const dtType = [
  dayjs().add(-7, 'd').format('YYYY-MM-DD'),
  dayjs().add(-1, 'd').format('YYYY-MM-DD'),
]

export const formData = {
  shipingTimeStart: dtType || [], //	寄件时间开始	string	否
  shipingTimeEnd: '', //	寄件时间结束	string	否
  signingTimeStart: [], //	签收时间开始	string	否
  signingTimeEnd: '', //	签收时间结束	string	否
  customerFlag: '1', //	客户类型，1.寄，2.收，3.付款	string	否
  serviceType: [], //服务方式
  beginCity: '', //	始发地(支持区号)	string	否
  endCity: '', //	目的地(支持区号)	string	否
  customerId: '',
  groupFlag: '1',
  dateType: 'shipingTime',
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
