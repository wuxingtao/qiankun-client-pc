import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import {
  CLAER_CANCEL,
  PUSH_CANCEL,
  SET_ADVERTISEMENT,
  SET_OPEN_TABS,
  UPDATE_REAL_NAME_INFO,
  UPDATE_USER_INFO
} from './mutation-types'
import UserService from '@/services/module/user'
import * as storageUtil from '@/utils/storage'

Vue.use(Vuex)

// 模块化
const req = require.context('./modules', true, /\.js$/)
const modules = req.keys().reduce((m, modulePath) => {
  const filename = modulePath.replace(/^\.\/(.*)\.\w+$/, '$1')
  const value = req(modulePath)
  m[filename] = value.default
  return m
}, {})

const state = {
  isMenuCollapse: false,
  userInfo: {},
  realNameInfo: {},
  cancelTokenArr: [],
  openTabs: [],
  advertisement: [],
  customerList: [], //相关客户编码
}

const mutations = {
  [UPDATE_USER_INFO](state, userInfo) {
    state.userInfo = userInfo
    // 同步sessionStorage
    storageUtil.setUserData(state.userInfo)
    storageUtil.setCustomerCode(userInfo.customCode || '')
  },
  [UPDATE_REAL_NAME_INFO](state, payload) {
    state.realNameInfo = { ...state.realNameInfo, ...payload }
  },
  [PUSH_CANCEL](state, payload) {
    let arr = [...state.cancelTokenArr]
    arr = arr.concat(payload.cancelToken)
    state.cancelTokenArr = arr
  },
  [CLAER_CANCEL](state) {
    state.cancelTokenArr.forEach(item => {
      item('cancelToken')
    })
    state.cancelTokenArr = []
  },
  updateMenuCollapseStatus(state, flag) {
    state.isMenuCollapse = flag
  },
  [SET_OPEN_TABS](state, data) {
    state.openTabs = data
  },
  [SET_ADVERTISEMENT](state, data) {
    state.advertisement = data
  },
  setCustomerList(state,list){
    state.customerList = list
  }
}

const actions = {
  updateUserInfo({ commit }, callback) {
    UserService.getUserInfo().then(res => {
      commit(UPDATE_USER_INFO, res.data)
      callback && callback()
    })
  },
  updateRealNameInfo({ commit }) {
    UserService.checkRealNameAuth().then(res => {
      commit(UPDATE_REAL_NAME_INFO, res.data)
    })
  },
  async setCustomerListAction({ commit }) {
    const res = await UserService.getCustomerCodeBindInfo()
    if (res.code === 0 && res.data) {
      commit('setCustomerList', res.data.customers || [])
    }
  }
}

export default new Vuex.Store({
  modules,
  getters,
  state,
  mutations,
  actions
})
