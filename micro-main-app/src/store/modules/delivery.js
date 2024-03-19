import deliveryApi from '@/services/api/delivery'
import { v4 as uuidv4 } from 'uuid'

const state = {
  currentDeliveryPage:'single',//当前下单页 single、batch-index、batch-import、batch-fill
  deliveryActiveTab:'single',// 下单寄件当前页签：single、batch
  deliveryBatchPage:'', //批量下单所在页：''、import、fill
  senderHistoryContactList:null, //历史下单寄件人信息
  receiverHistoryContactList:null,//历史下单收件人信息
  waybillHistoryRemarksList:['易压勿碎', '联系市场', '不可沾水', '包装不能破损'],
  loadingOfBatchFreight:false, //批量计算预估运费中
  loadingOfBatch:{
    declaredValue:false,
  },
  countInfoOFBatchFreight:0 ,//批量没有预估运费的行数
  importProgess:0,//批量导入进度
  deliveryBatchId:'', //批量导入或填写的唯一标识，用户是否取消轮询接口请求
  declaredValueDescripChecked:false, //是否勾选已阅读保价说明
  senderAddressListCache:{},//寄件地址列表
  importTemplateUpdateFlag:false, //导入模板更新标识
  existsNewImportTemplate: false, //是否存在新模板标识，
  // 超长超重起始值
  lengthAndWeightInitial: {
    minLength: 0,
    lengthCompareFlag: '',
    minWeight: 0,
    weightCompareFlag: ''
  },
}
const mutations = {
  setImportTemplateUpdateFlag(state, flag) {
    state.importTemplateUpdateFlag = flag
  },
  setExistsNewImportTemplate(state, flag) {
    state.existsNewImportTemplate = flag
  },
  setCurrentDeliveryPage(state, page) {
    state.currentDeliveryPage = page
  },
  setDeliveryActiveTab(state, tabName) {
    state.deliveryActiveTab = tabName
  },
  setDeliveryBatchPage(state, page) {
    state.deliveryBatchPage = page
  },
  setSenderHistoryContactList(state,list){
    state.senderHistoryContactList = list
  },
  setReceiverHistoryContactList(state,list){
    state.receiverHistoryContactList = list
  },
  setWaybillHistoryRemarksList(state,list){
    state.waybillHistoryRemarksList = list
  },
  setLoadingOfBatchFreight(state, flag) {
    state.loadingOfBatchFreight = flag
  },
  setLoadingOfBatch(state, {field,loading}) {
    state.loadingOfBatch[field] = loading
  },
  setRowCountWithoutFreight (state, count) {
    state.rowCountWithoutFreight = count
  },
  setImportProgess (state, progress) {
    state.importProgess = progress
  },
  setDeliveryBatchId (state, isRenewId) {
    state.deliveryBatchId = isRenewId ? uuidv4() : ''
  },
  setDeclaredValueDescripChecked(state, flag) {
    state.declaredValueDescripChecked = flag
  },
  setSenderAddressListCache(state, cache) {
    state.senderAddressListCache = cache
  },
  setMinLengthWeight (state, payload = {}) {
    state.lengthAndWeightInitial = { ...state.lengthAndWeightInitial, ...payload }
  },
}

const actions = {
  async setSenderHistoryContactListAction({ commit }) {
    const res = await  deliveryApi.queryAddressHistory(0)
    if (res.code === 0) {
      commit('setSenderHistoryContactList', res.data || [])
    }
  },
  async setReceiverHistoryContactListAction({ commit }) {
    const res = await  deliveryApi.queryAddressHistory(1)
    if (res.code === 0) {
      commit('setReceiverHistoryContactList', res.data || [])
    }
  },
  async setWaybillHistoryRemarksListAction ({ commit }) {
    const res = await deliveryApi.getWaybillRemarkHistory()
    if (res.code === 0 && res.data?.length > 0) {
      commit('setWaybillHistoryRemarksList', res.data)
    }
  },
  async setMinLengthWeightAction ({ commit }) {
    const res = await deliveryApi.overLengthAndWeight()
    if (res.code === 0 && res.data) {
      commit('setMinLengthWeight', res.data)
    }
  }
}

export default {
  namespaced: true ,
  state ,
  mutations ,
  actions
}
