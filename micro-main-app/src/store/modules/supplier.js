import { existSupplierInfo } from '@/services/api/supplier'

const state = {
  existSupplierInfo:'', //是否存在供应商信息
}
const mutations = {
  setExistSupplierInfo(state , flag) {
    state.existSupplierInfo = flag
  }
}

const actions = {
  async setExistSupplierInfoAction({commit}) {
    if(state.existSupplierInfo !== ''){
      return
    }
    const flag = await existSupplierInfo()
    commit('setExistSupplierInfo',flag)  
  }
}

export default {
  namespaced: true ,
  state ,
  mutations ,
  actions
}
