import * as commonApi from '@api/common'

const state = {
  authCodeList:[],
}
const mutations = {
  setAuthCodeList(state, list) {
    state.authCodeList = list
  },
}

const actions = {
  async setAuthCodeListAction({ commit }) {
    const res = await commonApi.getUamPermissionList()
    if (res.code === 0 && res.data) {
      const  list = res.data.map(item => item.code)
      commit('setAuthCodeList', list)
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
