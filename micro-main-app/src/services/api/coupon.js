import request from './request'
import { getPhone, getCustomerCode } from '@/utils/storage'
import dayjs from 'dayjs'

const serviceWays = {
  当天达: '10',
  次日达: '20',
  隔日达: '30',
  陆运件: '40',
  航空件: '50',
  同城即日: '70',
  省内次日: '160',
  省内即日: '170',
  内部次日: '190',
  空运: '210',
  专运: '220',
}
const payWays = { 寄方付: 10, 收方付: 20, 第三方付: 30 }

/**
 *
 * @param {String} serviceWay 服务方式
 * @param {Number} couponStatus 优惠券使用状态（0：未使用，1：已使用，2：已过期，null：查询全部）
 */
export async function queryCouponList(serviceWay, couponStatus = null) {
  let params = {
    customerCode: getCustomerCode(),
    phone: getPhone(),
    productType: serviceWays[serviceWay],
    isUsed: couponStatus,
    orderResource: '3',
    // sendingRegioncode:null,
    // receivingRegioncode:null,
  }
  //   const res2=await getCoupons()
  let res = await request({
    headerUrl: 'kyact.redPrizeInfoErp.getCashPrizeInfoByPhoneFWX',
    method: 'post',
    data: params,
  })
  // let res={code:0,data:[{winAmount:100,serviceMode:'测试',validityRange:'test',reliefType:0},
  //     {winAmount:100,serviceMode:'测试',validityRange:'test',reliefType:0},{winAmount:100,serviceMode:'测试',validityRange:'test',reliefType:0}]}
  if (res.code === 0 && res.data) {
    const couponTypes = { 0: '满减券', 1: '折扣券', 2: '直减券', 3: '满减券' }
    const status = { 0: 'unused', 1: 'used', 2: 'expired' }
    return res.data.map(r => ({
      status: status[couponStatus] || 'used',
      faceValue: r.winAmount,
      customerType: !r.sendIsOld ? '新/老客户' : r.sendIsOld === '0' ? '新客户' : '老客户',
      scope: r.serviceMode,
      lifeSpans: (r.validityRange + '').replace(/-/g, '.').replace(' 至 ', '~'),
      prizeDesc: r.prizeDesc,
      couponType: couponTypes[r.reliefType],
      prizeCode: r.prizeCode,
    }))
  }
}

//绑定优惠券
export function bindCouponWithWaybill(
  waybillNumber,
  prizeCode,
  sendingRegioncode,
  receivesAreaCode,
  payWay,
  serviceWay
) {
  let params = {
    deliveryCustomerCode: getCustomerCode(),
    orderPhone: getPhone(),
    payType: payWays[payWay],
    productType: serviceWays[serviceWay],
    prizeCode,
    waybillNumber,
    mailingTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    orderResource: '3',
    sendingRegioncode,
    receivesAreaCode,
  }
  return request({
    headerUrl: 'kyact.redPrizeInfoErp.updateCashPrizeTimeFCW',
    method: 'post',
    data: params,
  })
}

//解绑优惠券
export function unbindCouponWithWaybill(waybills) {
  const params = { waybillNumberList: waybills.map(w => ({ waybillNumber: w.ydNo })) }
  return request({
    headerUrl: 'kyact.redPrizeInfoErp.batchCancelCashPrizeFWX',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

// export function unbindCouponWithWaybill(waybillNumber,prizeCode,waybills){
//   let params= [{
//     prizeCode,
//     waybillNumber,
//     orderResource:'3',
//   }]
//   if(waybills){
//     params=waybills.map(w=>({
//       prizeCode:w.couponPrizeCode,
//       waybillNumber:w.ydNo,
//       orderResource:'3',
//     }))
//   }
//   return request({
//     headerUrl: 'kyact.redPrizeInfoErp.batchCancelPrize',
//     method: 'post',
//     data: params,
//     hideErrMsg:true
//   })
// }

// 测试用
function getCoupons() {
  let params = {
    customerCode: getCustomerCode(),
    phone: getPhone(),
    sendIsOld: 0,
    waybillCount: 1,
    // isUsed:couponStatus,
    orderResource: '3',
  }
  return request({
    headerUrl: 'kyact.redPrizeInfoErp.sendHairyCrabsPrize',
    method: 'post',
    data: params,
  })
}

/** 客户端下单-优惠券列表 */
export const getListTicketsByOrder = params => {
  // const mockData = {
  //   data: {
  //     externalTicketVOList: [
  //       {
  //         prizeCode: 'KY000000000001',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 0,
  //         shortDesc: '每满1000减500',
  //         unusableDesc: '付款方式仅限寄方付',
  //         startArea: '始发地：深圳、长沙、上海、北京始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000002',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 1,
  //         shortDesc: '每满1000减5000',
  //         startArea: '始发地：深圳、长沙、上海、北京始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000003',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 1,
  //         shortDesc: '每满100减500',
  //         startArea: '始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000009',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 1,
  //         shortDesc: '每满100减500',
  //         startArea: '始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000010',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 1,
  //         shortDesc: '每满100减500',
  //         startArea: '始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000004',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 0,
  //         shortDesc: '每满1000减50000',
  //         startArea: '始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000005',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 1,
  //         shortDesc: '每满1000减5000000',
  //         startArea: '始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //       {
  //         prizeCode: 'KY000000000006',
  //         relieType: 0,
  //         desc: '奖券描述免单展示免单券,下单月结券展示类似减免比例60%最多减600',
  //         validityBegin: '2021-10-01',
  //         validityEnd: '2021-10-19',
  //         title: '¥99',
  //         status: 1,
  //         shortDesc: '每满1000000减500',
  //         startArea: '始发地：深圳、长沙、上海、北京',
  //         endArea: '目的地：深圳、长沙、上海、北京',
  //         serviceMode: '10|20|30|40',
  //         lineFreeRange: '10',
  //         lineFreeLimit: 100,
  //         startArea1: '<=100'
  //       },
  //     ],
  //     usableCount: 6,
  //     disabledCount: 2
  //   }
  // }
  // return mockData
  return request({
    headerUrl: 'kyact.userTicketInfo.listTicketsByOrderPc', // kyact.userTicketInfo.listTicketsByOrder
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

export async function getCouponList(ticketStatus, page, pageSize) {
  let params = {
    from: 5,
    ticketStatus,
    page,
    pageSize,
  }
  let { data } = await request({
    headerUrl: 'kyact.userTicketInfo.listByPersonalCenter',
    method: 'post',
    data: params,
  })
  return data
}

// 获取优惠券统计数量
export async function queryCouponCount() {
  let { data } = await request({
    headerUrl: 'kyact.userTicketInfo.statisticsByPersonalCenter',
    method: 'post',
    data: {
      from: 5,
    },
  })
  return data
}

/** 账单券激活 */
export function activatePackage(params) {
  return request({
    headerUrl: 'kyact.marketingActivityInfo.activatePackage',
    method: 'post',
    data: params,
  })
}