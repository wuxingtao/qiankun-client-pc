import { getPhone } from '@utils/storage'
import { getByMobile } from '@/services/api/total.js'
import {checkAuth} from "@/utils/total.js"
/*
 * @Desc: 统计分析
 * @Author: pan boren
 * @Date: 2021/7/2
 *!/
*/

const state = {
  // 权限
  /* auth: {
    "dataBoard": {
      switchRoleReceiving: 10,
      "delivey":"10",
      "totalNumber":"10",
      "reachNumber":"10",
      "delayRate":"10",
      "delivereRate":"10",
      "collected":"10",
      "deliveredPoll":"10",
      "returnNumber":"10",
      "wornLoseNumber":"10",
      "reachRate":"10",
      "totalBillWeight":"10",
      "transiting":"10",
      "collectedTimeoutNumber":"10",
      "totalPoll":"10",
      "collectedTimeoutRate":"10",
      "delayNumber":"10",
      "notsigned":"10",
      "totalCost":"10",
      realTotalWeight: '10'
    },
    "summaryReport": {
      switchRoleReceiving: 20,
      "timeoutNotSignNumber": "10",
      "notSignNumber": "10",
      "totalNumber": "10",
      "startPlace": "10",
      "serviceModel": "10",
      "timeReachRate": "10",
      "timeReachNumber": "10",
      "delivereRate": "10",
      "deliveredPoll": "20",
      "signDate": "10",
      "endPlace": "10",
      "toatlWeight": "10",
      "dispatchTimelyNumber": "10",
      "collectTimelyNumber": "10",
      "collectTimelyRate": "10",
      "dispatchTimelyRate": "10",
      "totalSquareNumber": "10",
      "export": "10",
      totalPoll: '10',
      route: '10'
    },
    "detailReport": {
      switchRoleReceiving: 20,
      returnWaybillNumber: '10',
      deliveryMobile: '10',
      serviceModel: '10',
      startArea: '10',
      discountFee: '10',
      endAirport: '10',
      waybillNumber: '10',
      returnSignTime: '10',
      timeoutType: '10',
      startProvince: '10',
      discount: '10',
      goods: '10',
      expectServiceTime: '10',
      deliveryCityCode: '10',
      expenseFee: '10',
      number: '10',
      returnCompanyName: '10',
      returnSubmitTime: '10',
      declaredValue: '10',
      isChild: '10',
      firstWeight: '10',
      endArea: '10',
      signTime: '10',
      deliveryPerson: '10',
      receiveAddress: '10',
      endProvince: '10',
      receiveTelPhone: '10',
      signPerson: '10',
      timeoutReason: '10',
      firstSquare: '10',
      flightNumber: '10',
      realTime: '10',
      volume: '10',
      deliveryCompanyName: '10',
      settleModel: '10',
      deliveryTelPhone: '10',
      transportMode: '10',
      overtime: '10',
      updownTime: '10',
      realServiceDate: '10',
      waybillFee: '10',
      deliveryTime: '10',
      receiveCompanyName: '10',
      isSpecialCar: '10',
      returnNumber: '10',
      receiveCityCode: '10',
      receivePerson: '10',
      minChargedStandard: '10',
      billWeight: '10',
      isReceipt: '10',
      receiptNumber: '10',
      receiveMobile: '10',
      collectTime: '10',
      pickupCarModel: '10',
      billSquare: '10',
      landTransportTakeupTime: '10',
      payMode: '10',
      realWeight: '10',
      deliveryTakeupTime: '10',
      isContraband: '10',
      signinTime: '10',
      sendTime: '10',
      totalPoll: '10',
      exceptionPoll: '10',
      route: '10',
      export: '10',
      customerFlag: '10',
      payCustomerShortName: '10'
    }
  }*/
  auth:{}
}

const getters ={
  dataBoardAuth(state){
    if(state.auth&&state.auth.dataBoard){
      return state.auth.dataBoard
    }else{
      return {}
    }
  }
}

const mutations = {
  SET_AUTH(state,options) {
    state.auth=options || {}
    // 白名单不受限制
    if(state.auth.detailReport){
      state.auth.detailReport.customerFlag= '10'
    }else{
      state.auth.detailReport={
        customerFlag: '10'
      }
    }
    if(state.auth.summaryReport){
      state.auth.summaryReport.shipingTimeStart= '10'
    }
  }
}


const actions = {
  GET_TOTALS_AUTH({commit,state},auth) {
    return new Promise(async (resolve , reject) => {
      if(auth){
        if(Object.keys(state.auth).length>0){
          if(state.auth[auth]&&checkAuth(state.auth[auth])){
            resolve(state.auth) // 检查是否有权限
          }else{
            reject({
              auth: true,
              msg:'请检查是否有权限'
            })
          }
        }else{
          let res = await getByMobile({mobile: getPhone()})
          if (res.code === 0) {
            let data=res.data || {}
            if(data[auth]&&checkAuth(data[auth])){
              resolve(data) // 检查是否有权限
              commit('SET_AUTH' , res.data)
            }else{
              reject({
                auth: true,
                msg:'请检查是否有权限'
              })
            }
          }
        }
      }else{
        if(Object.keys(state.auth).length>0){
          resolve(state.auth)
        }else{
          let res = await getByMobile({mobile: getPhone()})
          if (res.code === 0&&res.data) {
            resolve(res.data)
            commit('SET_AUTH' , res.data)
          }else{
            reject({
              auth: true,
              msg:'网络压力山大，请刷新重试'
            })
          }
        }
      }
    })
  }
}

export default {
  namespaced: true ,
  state ,
  getters,
  mutations ,
  actions
}
