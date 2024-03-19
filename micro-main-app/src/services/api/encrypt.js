import request from './request' 

//添加日志
export function addRecord(params) {
  return request({
    headerUrl: 'web.client.operationLogSee.batchInsert',
    method: 'post',
    data: params,
  })
}

//查询日志
export function queryRecords(params) {
  return request({
    headerUrl: 'web.client.operationLogSee.pageView',
    method: 'post',
    data: params,
  })
}