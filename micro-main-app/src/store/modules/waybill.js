/**
 * @Desc: waybill
 * @Author: wu xingtao
 * @Date: 2021/10/13
 */

import cacheOfWaybill from '@utils/cacheOfWaybill'

const state = {
  // {clientType:'',customerCodes:[],phones:[],generalQuery:[],smallQuery:[],waybillStatus}
  waybillSearchParams:{}, // 运单管理查询条件
  visibleTableColumns:[], // 运单管理展示的列
  goodsBatchTimes: [], //批次货好时间
  childParentAuthority:false, //子母单权限
  exportProcess: 0, // 导出进度
  exportStatus: '', // 导出状态 ['START','WORKING','FINISH','FAIL']
  userType:3 //	1-主管理员 2-副管理员 3-普通用户
}

const getters = {}

const mutations = {
  UPDATE_SEARCH_QUERY (state, val) {
    state.waybillSearchParams = val
  },
  UPDATE_TABLE_COLUMN (state, val) {
    state.visibleTableColumns = val
  },
  UPDATE_EXPORT_PROCESS (state, val) {
    state.exportProcess = val
  },
  UPDATE_EXPORT_STATUS (state, val) {
    state.exportStatus = val
  },
  updateChildParentAuthority(state,val){
    state.childParentAuthority=val
  },
  updateGoodsBatchTimes(state,val){
    state.goodsBatchTimes=val
  },
  updateUserType(state,val){
    state.userType=val
  }
}

const actions = {
  update_small_query ({ commit }, payload) {
    commit('UPDATE_SEARCH_QUERY', payload)
  },
  update_table_column ({ commit }, payload) {
    let payloadCopy = [...payload]
    let key = 0
    const hasWaybillNumber = payload.find((item,index)=>{
      if(item.prop === 'waybillNumber'){
        key = index + 1
      }
      return item.prop === 'waybillNumber'
    })
    if(hasWaybillNumber){
      payloadCopy.splice(key,0,{
        prop: 'serviceModeDesc',
        text: '服务方式'
      })
    }
    commit('UPDATE_TABLE_COLUMN', payloadCopy)
  },
  async updateChildParentAuthorityAction({commit}){
    const data = await cacheOfWaybill.getChildParentAuthority()
    if (data) {
      commit('updateChildParentAuthority', data)
    }
  },
  async updateGoodsBatchTimesAction({commit}){
    const data = await cacheOfWaybill.getGoodsBatchTimesNew()
    if (data) {
      commit('updateGoodsBatchTimes', data)
    }
  },
  // 更新运单管理导出进度
  update_export_process ({ commit }, payload) {
    commit('UPDATE_EXPORT_PROCESS', payload)
  },
  // 更新运单管理导出状态
  update_export_status ({ commit }, payload) {
    commit('UPDATE_EXPORT_STATUS', payload)
  },
  async updateUserTypeAction({commit}){
    const data = await cacheOfWaybill.getUserType()
    if (data) {
      commit('updateUserType', data)
    }
  },

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
