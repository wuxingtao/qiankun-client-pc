import * as commonApi from '@api/common'

const defaultServiceWayDict = [
  { value: '10', label: '当天达' },
  { value: '20', label: '次日达' },
  { value: '30', label: '隔日达' },
  { value: '40', label: '陆运件' },
  { value: '50', label: '同城次日' },
  { value: '70', label: '同城即日' },
  { value: '160', label: '省内次日' },
  { value: '170', label: '省内即日' }
]

const state = {
  defaultServiceWayDict,
  serviceWayDict: [], //服务方式数据字典
  payWayOptions: null, //付款方式下拉选项,
  wrapOptions: [
    //包装服务
    { value: ' ', label: '无需包装' },
    { value: '10', label: '帮我打卡板' },
    { value: '20', label: '帮我打木架' },
    { value: '30', label: '帮我打木箱' }
  ],
  receiptOptions: [
    //回单类型
    { value: '20', label: '无需回单' },
    { value: '10', label: '回单原件' },
    { value: '30', label: '回单图片' }
  ]
}
const mutations = {
  setserviceWayDict(state, dict) {
    state.serviceWayDict = dict
  },
  setPayWayOptions(state, list) {
    state.payWayOptions = list
  }
}

const actions = {
  async setServiceWayDictAction({ commit, state }) {
    if (state.serviceWayDict?.length > 0) {
      return
    }
    const res = await commonApi.queryDataDictionary('common_service_type')
    if (res.code === 0 && res.data?.length>0) {
      const dict = res.data.map(m => ({ value: m.lookupCode, label: m.lookupValue }))
      commit('setserviceWayDict', dict)
    }else if (res.code !== 0){
      state.serviceWayDict = defaultServiceWayDict
    }
  },
  async setPayWayOptionsAction({ commit }) {
    if (state.payWayOptions && state.payWayOptions.length > 0) {
      return
    }
    let options = [
      { label: '寄方付', value: '10' },
      { label: '收方付', value: '20' },
      { label: '第三方付', value: '30' }
    ]
    try {
      const res = await commonApi.queryDataDictionary('eam_pay_type')
      if (res.code === 0 && res.data && res.data.length > 0) {
        options = res.data.map(d => ({
          label: d.lookupValue,
          value: d.lookupCode
        }))
      }
    } finally {
      commit('setPayWayOptions', options)
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
