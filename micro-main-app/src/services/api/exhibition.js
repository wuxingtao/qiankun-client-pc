import request from "./request"

export function getWaybillListByProjectName(params) {
  return request({
    headerUrl: 'web.v2.waybill.listWaybillByProjectName',
    method: 'post',
    data: params
  })
}