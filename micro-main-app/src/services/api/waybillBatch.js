import request from '@api/request'
import { getPhone, getCustomerCode } from '@utils/storage'

// 电子运单-批次号查询 (V1.0)
export function getBatchNoView(params={}){
  return request({
    headerUrl: 'E-GetBatchNoView' ,
    method: 'post' ,
    data: params
  })
}

// 电子运单-批次运单信息分页查询 (V1.0)
export function pageBatchWaybillInfo(params){
  return request({
    headerUrl: 'E-GetBatchNoView' ,
    method: 'post' ,
    data: params
  })
}

//查询运单各状态下的数量
export function queryBatchWaybillStatusCounts(params) {
  let tempParams = {
    customerCode: getCustomerCode(),
    phone: getPhone(),
    // DateType:0
  }
  tempParams = Object.assign(tempParams, params)
  return request({
    headerUrl: 'inc.client.getBatchWaybillStatusCount',
    method: 'post',
    data: tempParams
  })
}