import { queryPrintCompanyFlag,queryPrintCompanyGoodsFlag} from "@/services/api/setting"

const state = {
  companyFlags:[],  //打印定制样式3（收、寄件公司）
  companyGoodsFlags:[], //打印定制样式2（收件公司、货品编码）
}
const mutations = {
  setCompanyFlags(state , list) {
    state.companyFlags = list || []
  },
  setCompanyGoodsFlags(state , list) {
    state.companyGoodsFlags = list || []
  }
}

const actions = {
  async setCompanyFlagsAction({commit}) {
    const params = {
      page: 1,
      pageSize: 500,
    }
    const res = await queryPrintCompanyFlag(params)
    if(res.code === 0){
      commit('setCompanyFlags',res.data.rows) 
    } 
  },
  async setCompanyGoodsFlagsAction({commit}) {
    const params = {
      page: 1,
      pageSize: 500,
    }
    const res = await queryPrintCompanyGoodsFlag(params)
    if(res.code === 0){
      commit('setCompanyGoodsFlags',res.data.rows) 
    } 
  }
}

export default {
  namespaced: true ,
  state ,
  mutations ,
  actions
}
