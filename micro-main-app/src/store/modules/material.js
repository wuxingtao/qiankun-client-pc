import dayjs from 'dayjs'

/** 设置回单路由数据 */
const SET_WAYBILL_ROUTE = 'SET_WAYBILL_ROUTE'

/** 设置反馈状态 */
const SET_FEEDBACK_STATUS = 'SET_FEEDBACK_STATUS'

/** 设置运单列表总页数 */
const SET_CODE_LIST_TOTAL = 'SET_CODE_LIST_TOTAL'

/** 设置激活运单号 */
const SET_ACTIVED_YD_CODE = 'SET_ACTIVED_YD_CODE'

/** 设置查询所有运单接口参数 */
const SET_QUERY_CODES_PARAMS = 'SET_QUERY_CODES_PARAMS'

const defaultParams = {
  clientType: 10,
  /** 搜索参数：不指定运单号，订单号，手机号，产品编码，外部编码等查询条件 */
  smallQuery: [],
  /** 查询状态：10-40表示查询全部 */
  waybillStatus: ['30', '40'],
  /** 查询角色：10-40表示查询全部 */
  // waybillCustomerSource: ['10', '20', '30', '40'],
}

const defaultActivedCode = sessionStorage.getItem(SET_ACTIVED_YD_CODE)
const defaultCodeListTotal = sessionStorage.getItem(SET_CODE_LIST_TOTAL)
const defaultQueryListParams = sessionStorage.getItem(SET_QUERY_CODES_PARAMS)

export default {
  namespaced: true,
  state: {
    /** 回单反馈状态数据 */
    feedbackData: null, 
    /** 回单路由展示数据 */
    waybillRoute: null,
    /** 激活的运单号 */
    activedCode: defaultActivedCode,
    /** 列表总条数 */
    codeListTotal: defaultCodeListTotal,
    /** 查询运单列表参数 */
    queryListParams: defaultQueryListParams ? JSON.parse(defaultQueryListParams) : {},
  },
  getters: {
  },
  mutations: {
    [SET_FEEDBACK_STATUS](state, data) {
      state.feedbackData = data
    },
    [SET_WAYBILL_ROUTE](state, route) {
      state.waybillRoute = route
    },
    [SET_CODE_LIST_TOTAL](state, total) {
      state.codeListTotal = total
      sessionStorage.setItem(SET_CODE_LIST_TOTAL, state.codeListTotal)
    },
    [SET_ACTIVED_YD_CODE](state, code) {
      state.activedCode = code
      // console.log(code, '运单号')
      sessionStorage.setItem(SET_ACTIVED_YD_CODE, state.activedCode)
    },
    [SET_QUERY_CODES_PARAMS](state, params) {
      state.queryListParams = { ...params, ...defaultParams }
      sessionStorage.setItem(SET_QUERY_CODES_PARAMS, JSON.stringify(state.queryListParams))
    },
  },
  actions: {
    [SET_FEEDBACK_STATUS]({ commit }, data) {
      commit(SET_FEEDBACK_STATUS, data)
    },
    [SET_WAYBILL_ROUTE]({ commit }, route) {
      commit(SET_WAYBILL_ROUTE, route)
    },
    [SET_CODE_LIST_TOTAL]({ commit }, total) {
      commit(SET_CODE_LIST_TOTAL, total)
    },
    [SET_ACTIVED_YD_CODE]({ commit }, code) {
      commit(SET_ACTIVED_YD_CODE, code)
    },
    [SET_QUERY_CODES_PARAMS]({ commit }, params) {
      commit(SET_QUERY_CODES_PARAMS, params)
    },
  },
}
