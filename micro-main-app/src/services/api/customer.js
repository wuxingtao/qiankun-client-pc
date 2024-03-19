import request from "./request"
import { getLoginData } from "@/utils/storage"
let {phone,customerShortName,customerCode} = getLoginData()
// 默认展示条数
const PAGE_SIZE = 10
/**
 * 客户预存-预存信息
 * @param {*} param
 * mobile : 手机
 * customerShortName: 客户名称
 */
export const getByCustomerName = () => {
  return request({
    headerUrl: 'web.deposit.getByCustomerName',
    method:'post',
    token: false,
    hideErrMsg: true,
    data: {
      mobile: phone,
      customerShortName: customerShortName
    },
  })
}


/**
 * 客户预存-充值明细
 * page 当前页码
 * pageSize 每页显示条数
 * customerShortName 客户名称
 */
export const rechargeByCustomerName = param => {
  return request({
    headerUrl: 'web.deposit.searchRechargeByCustomerName',
    method: 'post',
    hideErrMsg: true,
    data: {
      pageSize: PAGE_SIZE,
      customerShortName: customerShortName,
      ...param
    },
  })
}

/**
 * 客户预存-消费明细
 * waybillNumber     运单号
 * customerShortName 客户名称
 * mobile            手机号
 * startTime         开始时间
 * endTime           结束时间
 * page              当前页码
 * pageSize          每页显示几条
 */

/**
 * 互联网转发接口(需token鉴权)
 * @param {*} { code, data }
 * @returns
 */
function forwardAuthRequest({ code, data }) {
  return request({
    method: 'post',
    headerUrl: 'gw.foward.api-auth',
    data: {
      param: JSON.stringify(data),
      method: code
    }
  })
}

export const depositBillDetail = param => {
  return forwardAuthRequest({
    code: 'fms.depositBillDetail.getByCustomerName',
    data: {
      mobile: phone,
      pageSize: PAGE_SIZE,
      customerShortName: customerShortName,
      ...param
    }
  })
}


/**
 * 客户报价—报价列表&条件查询
 * @param {*} param
 * customerId           客户ID()
 * page                 当前页
 * pageSize             每页显示条数
 * chargeType           收费方式
 * serviceType          报价服务方式（数据字典common_service_type）
 *                      10 当天达
 *                      20 次日达
 *                      30 隔日达
 *                      40 陆运件
 *                      50 同城次日
 *                      70 同城即日
 *                      80 航空件
 * beginEndAddress      始发地→目的地
 * beginAreaCode        始发区号
 * endAreaCode          目的区号
 * generic Object类型    通用查询(详情见开放平台)
 */
export const customerOfferSearch = param => {
  // const { customerId } = getLoginUser()
  return request({
    headerUrl: 'web.customerOffer.search',
    method: 'post',
    hideErrMsg: true,
    data: {
      customerId: customerCode,
      pageSize: PAGE_SIZE,
      ...param
    }
  })
}



// 获取所有服务方式
export function getServiceAll(params={}) {
  return request({
    headerUrl: 'PC-GetCustomerQuoteServiceWay',
    method: 'post',
    data: params
  })
}
