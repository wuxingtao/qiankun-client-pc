import { GetPrintSet } from '@api/setting'
import { getPhone , getCustomerCode } from '@utils/storage'

/**
 * @Desc: 设置中心
 * @Author: wu xingtao
 * @Date: 2021/3/2
 */

const state = {
  // 打印机信息
  printInfo: {
    // 面单类型 [1 三联 2 二联 3 存根]
    sheetType: '1' ,
  } ,
}
const mutations = {
  // 更新打印机信息
  UPDATE_PRINT_INFO(state , val = {}) {
    state.printInfo = {...val,
      printModel:val&&val.printCode,
      sheetType:val&&val.paperType
    }
  }
}

const actions = {
  update_print_set({commit}) {
    return new Promise(async (resolve , reject) => {
      let res = await GetPrintSet({
        mobile: getPhone() ,
        customerCode: getCustomerCode()
      })
      if (res.code === 0) {
        resolve(res.data)
        commit('UPDATE_PRINT_INFO' , res.data)
      } else {
        reject('')
      }
    })
  }
}

export default {
  namespaced: true ,
  state ,
  mutations ,
  actions
}
