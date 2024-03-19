/**
 * 批量模板管理 (弃用)
 * @Desc: batchTemplate
 * @Author: wu xingtao
 * @Date: 2021/2/24
 */

const state = {
  // 当前操作模板信息
  templateDetail: {},
  // ['add','edit','delete','list']
  templateStep: null
}
const mutations = {
  UPDATE_DETAIL(state,val){
    state.templateDetail = val
  },
  UPDATE_STEP(state,val){
    state.templateStep = val
  }
}

const actions = {
  update_detail({commit},payload){
    commit('UPDATE_DETAIL',payload)
  },
  update_step({commit},payload){
    commit('UPDATE_STEP',payload)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
