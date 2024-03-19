import request from "./request"


//获取费用汇总数据
export function getTimelinessNew(params) {
  return request({
    headerUrl: 'inc.client.getTimelinessNew',
    method: 'post',
    data: {params}
  })
}
