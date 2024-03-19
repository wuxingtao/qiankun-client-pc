const ADD_WORD_DAYS = [
  { label: '0', value: "'10'" },
  { label: '0.5', value: "'20'" },
  { label: '1', value: "'30'" },
  { label: '1.5', value: "'40'" },
  { label: '2', value: "'50'" },
  { label: '2+', value: "'60'" }
]

const SERVICE_MODE_LIST = [
  { name: '当天达', code: "'10'" },
  { name: '次日达', code: "'20'" },
  { name: '隔日达', code: "'30'" },
  { name: '陆运件', code: "'40'" },
  { name: '省内次日', code: "'50'" },
  { name: '省内即日', code: "'60'" },
  { name: '同城即日', code: "'70'" },
  { name: '同城次日', code: "'80'" },
  { name: '冷链零担', code: "'90'" },
  { name: '空运', code: "'100'" },
  { name: '专运', code: "'130'" },
  { name: '同城配送', code: "'140'" }
]


const COMMON_SERVICE_TYPE = [
  { name: '当天达', code: '10' },
  { name: '次日达', code: '20' },
  { name: '隔日达', code: '30' },
  { name: '陆运件', code: '40' },
  { name: '同城次日', code: '50' },
  { name: '次晨达', code: '60' },
  { name: '同城即日', code: '70' },
  { name: '航空件', code: '80' },
  { name: '早班件', code: '90' },
  { name: '中班件', code: '100' },
  { name: '晚班件', code: '110' },
  { name: '冷运件', code: '120' },
  { name: '省内次日', code: '160' },
  { name: '省内即日', code: '170' },
  { name: '内部次日', code: '190' },
  { name: '内部件', code: '200' },
  { name: '空运', code: '210' },
  { name: '专运', code: '220' },
  { name: '整车运输', code: '240' },
  { name: '企业整车', code: '250' },
  { name: '同城配送', code: '260' },
  { name: '次晚达', code: '280' },
  { name: '内部急件', code: '290' },
  { name: '冷链零担', code: '300' },
  { name: '次中达', code: '340' },
  { name: '隔晨达', code: '350' },
  { name: '隔中达', code: '360' },
  { name: '陆晨达', code: '370' },
  { name: '同城次晨', code: '380' },
  { name: '同城次中', code: '390' },
  { name: '省内次晨', code: '400' },
  { name: '省内次中', code: '410' },
  { name: '特惠快运', code: '1100' },
  { name: '特惠普运', code: '1200' },
  { name: '特惠航空', code: '1300' },
  { name: '特惠同城', code: '1400' },
  { name: '特惠省内', code: '1500' }
]


const DELAY_REASON_LIST = [
  { label: '寄方指定时间派送', code: '60'},
  { label: '寄方要求等通知派送', code: '100'},
  { label: '收方指定时间派送', code: '110'},
  { label: '收方要求等通知派送', code: '120'},
  { label: '销售要求等通知', code: '170'},
  { label: '联系不上收方', code: '180'},
  { label: '等预约单、报关单派送', code: '240'},
  { label: '疫情、冰雪天气，道路结冰', code: '250'},
  { label: '客户要求自提', code: '260'},
  { label: '客户拒收', code: '270'},
  { label: '客户退货', code: '280'},
  { label: '货物带错', code: '310'},
  { label: '联系不上寄方', code: '320'},
  { label: '收方要求改地址', code: '340'},
  { label: '寄方要求改地址', code: '350'},
  { label: '预约信息与货物不符', code: '370'},
  { label: '客户未预约', code: '390'},
  { label: '货物变形、缺少、破损、丢失', code: '400'},
  { label: '路上堵车', code: '420'},
  { label: '车辆故障', code: '430'},
  { label: '节假日不上班，节后派送', code: '450'},
  { label: '寄收方费用沟通异常', code: '460'},
  { label: '货未到齐（子母件、一票多件）', code: '490'},
  { label: '货物无法走航班，改陆运', code: '500'},
  { label: '送货单异常', code: '510'},
  { label: '大型设备、超长、超重派送异常', code: '520'},
  { label: '等客户指定拿单签收', code: '530'},
  { label: '航班取消、延误、备降、失事、返航', code: '540'},
  { label: '出港不及时', code: '550'},
  { label: '安排不及时', code: '560'},
  { label: '提货异常', code: '570'},
  { label: '理赔处理', code: '580'},
  { label: '道路限行', code: '590'},
  { label: '国家级大型会议（两会、G20峰会等）', code: '600'}
]

const DELAY_LOGIC_TYPE_LIST = [
  { label: '≤', value: 1 },
  { label: '≥', value: 2 },
  { label: '范围于', value: 3 },
]

const getServiceMode = (code) => {
  for (let i = 0; i < SERVICE_MODE_LIST.length; i++) {
    if (SERVICE_MODE_LIST[i].code.replace(/'/g, '') === code) {
      return SERVICE_MODE_LIST[i].name
    }
  }
  return ''
}

const getCommonServiceType = (code) => {
  for (let i = 0; i < COMMON_SERVICE_TYPE.length; i++) {
    if (COMMON_SERVICE_TYPE[i].code == code) {
      return COMMON_SERVICE_TYPE[i].name
    }
  }
  return ''
}

const getDelayReason = (code) => {
  for (let i = 0; i < DELAY_REASON_LIST.length; i++) {
    if (DELAY_REASON_LIST[i].code == code) {
      return DELAY_REASON_LIST[i].label
    }
  }
  return ''
}

export {
  ADD_WORD_DAYS,
  SERVICE_MODE_LIST,
  DELAY_REASON_LIST,
  DELAY_LOGIC_TYPE_LIST,
  getServiceMode,
  getCommonServiceType,
  getDelayReason
}