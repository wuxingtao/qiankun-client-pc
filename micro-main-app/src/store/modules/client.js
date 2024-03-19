import cacheOfWaybill from '@utils/cacheOfWaybill'
import * as commonApi from '@api/common'
import * as settingApi from '@api/setting'
import deliveryApi from '@api/delivery'
import permissionServe from '@utils/permissionServe'

const state = {
  encryptionText: '3333333001-1111111001-1111111001',
  authorityIds: '004,004-a,004-b,004-c,004-d,004-e,004-f,006,006-a,006-b,006-c,013,034,034-a,034-b,034-c,035,038,044,123,124,125'.split(
    ','
  ),
  permissionCodes: [], // 权限控制补充
  hasSetReceiptImage: false,
  projectInfo: {}, //项目信息
  paymentTypeList: [], //付款方式
  defaultConfig: {},
  requirements: {}, //defaultInsurancePrice：默认保价  recoveryReceiptFlag：回单标识
  printConfig: {}, //打印配置信息
  printerNo: '', //默认打印机编号
  customOriginalFields: [], // 自定义字段接口返回数据
  serviceWay: [], //运单查询条件中的付款方式来源
  payCustomerInfo: [], //运单查询条件中的付款公司来源
  historyGoodsList: [], //最近使用过的托寄物列表
  skuList: [],
  goodsBatchTimes: [], //批次货好时间
  printTemplateList: [], //打印模板
  customerizedPermission: [],

  // 2021.10重构
  newServiceWay: [], //运单查询条件中的付款方式来源
  newPayCustomerInfo: [] //运单查询条件中的付款公司来源
}

const mutations = {
  setCustomerMappingField(state, fields) {
    state.customOriginalFields = fields
  },
  setPrinterNo (state, printerNo) {
    state.printerNo = printerNo
  },
  setPermission (state, resourcesID) {
    const authorityIds = (resourcesID && resourcesID.split(/,|，/).filter(f => f)) || []
    state.authorityIds = authorityIds
  },
  setPermissionPlus (state, payload) {
    state.permissionCodes = payload
  },
  setPrintConfig (state, config) {
    state.printConfig = config
  },
  setPaymentTypeList (state, list) {
    state.paymentTypeList = list
  },
  setDefaultConfig (state, defaultConfig) {
    state.defaultConfig = defaultConfig
  },
  setRequirements (state, requirements) {
    state.requirements = requirements
  },
  setEncryptText(state, encryptionText) {
    state.encryptionText = encryptionText
  },
  setSystemConfig(state, configs) {
    const item = configs.find(c => c.SystemConfigName == 'IsOnlineReceiptPic')
    state.hasSetReceiptImage = item && item.SystemConfigValue == '1'
  },
  setCustomerProjectInfo(state, projectInfo) {
    state.projectInfo = projectInfo
  },
  setServiceWay(state, list) {
    state.serviceWay = list
  },
  setPayCustomerCodeList(state, list) {
    state.payCustomerInfo = list
  },
  setHistoryGoodsList(state, list) {
    state.historyGoodsList = list
  },
  setSkuList(state, list) {
    state.skuList = list
  },
  setGoodsBatchTimes(state, list) {
    state.goodsBatchTimes = list
  },
  setPrintTemplateList(state, list) {
    state.printTemplateList = list
  },
  setCustomerizedPermission(state, list) {
    state.customerizedPermission = list
  },
  // 2021.10 重构
  setNewServiceWay(state, list) {
    state.newServiceWay = list
  },
  setNewPayCustomerInfo(state, list) {
    state.newPayCustomerInfo = list
  }
}

const actions = {
  async setCustomerMappingFieldAction({ commit }) {
    const res = await commonApi.getKaCustomerMapping()
    if (res.code == 0 && res.data) {
      commit('setCustomerMappingField',  res.data.rows)
      return res.data
    }
  },
  async setPermissionAction({ commit }) {
    const data = await cacheOfWaybill.getUserPermission()
    if (data) {
      commit('setPermission', data)
    }
    const dataNew = await permissionServe.getUamPermissionList()
    if (dataNew) {
      commit('setPermissionPlus', dataNew)
    }
  },
  async setPrintConfigAction({ commit }) {
    const data = await cacheOfWaybill.getPrintConfig()
    if (data) {
      commit('setPrintConfig', data)
    }
  },
  async setPaymentTypeListAction({ commit }) {
    const data = await cacheOfWaybill.getPaymentTypes()
    if (data) {
      commit('setPaymentTypeList', data)
    }
  },
  async setDefaultConfigAction({ commit }) {
    let res = await settingApi.queryDefaultConfig({})
    if (res.code === 0 && res.data) {
      if(res.data.payType !== '第三方付' && res.data.payAccount){
        res.data.payAccount = ''
      }
      commit('setDefaultConfig', res.data)
    }
    // const data=await cacheOfWaybill.getDefaultConfig(ignoreCache)
    // if(data){
    //   commit('setDefaultConfig',data)
    // }
  },
  async setRequirementsAction({ commit }) {
    const data = await cacheOfWaybill.getRequirementConfig()
    if (data) {
      commit('setRequirements', data)
    }
  },
  async setEncryptTextAction({ commit }) {
    const data = await cacheOfWaybill.getPrintEncryptText()
    if (data) {
      commit('setEncryptText', data)
    }
  },
  async setSystemConfigAction({ commit }) {
    const data = await cacheOfWaybill.getSystemConfig()
    if (data) {
      commit('setSystemConfig', data)
    }
  },
  async setCustomerProjectInfoAction({ commit }) {
    const data = await cacheOfWaybill.getCustomerProjectInfo()
    if (data) {
      commit('setCustomerProjectInfo', data)
    }
  },
  async setServiceWayAction({ commit }) {
    const data = await cacheOfWaybill.getServiceWays()
    if (data) {
      commit('setServiceWay', data)
    }
  },
  async setPayCustomerCodeListAction({ commit }) {
    const data = await cacheOfWaybill.getPayCustomerInfo()
    if (data) {
      commit('setPayCustomerCodeList', data)
    }
  },
  async setHistoryGoodsListAction({ commit }) {
    const res = await deliveryApi.getHistoryGoodsList()
    if (res.code === 0 && res.data) {
      commit('setHistoryGoodsList', res.data)
    }
  },
  async setSkuListAction({ commit }) {
    const data = await cacheOfWaybill.getHistorySkuList()
    if (data) {
      commit('setSkuList', data)
    }
  },
  async setGoodsBatchTimesAction({ commit }) {
    const data = await cacheOfWaybill.getGoodsBatchTimes()
    if (data) {
      commit('setGoodsBatchTimes', data)
    }
  },
  async setPrintTemplateListAction({ commit }) {
    const data = await cacheOfWaybill.getTemplateList()
    if (data) {
      commit('setPrintTemplateList', data)
    }
  },
  async setCustomerizedPermissionAction({ commit }) {
    const data = await cacheOfWaybill.getCustomerizedPermission()
    if (data) {
      commit('setCustomerizedPermission', data)
    }
  },
  // 2021.10重构后
  async setNewServiceWayAction({ commit, state }) {
    if (!state.newServiceWay.length) {
      const data = await cacheOfWaybill.getNewServiceWays()
      if (data) {
        commit('setNewServiceWay', data)
      }
    }
  },
  async setNewPayCustomerInfo({ commit, state }) {
    if (!state.newPayCustomerInfo.length) {
      const data = await cacheOfWaybill.getNewPayCustomerInfo()
      if (data) {
        commit('setNewPayCustomerInfo', data)
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
