import request from '@/services/api/request'
// 时效运费弹层
/*
export function serviceModeOptimizeNotice(data){
  return request({
    headerUrl: "gw.foward.api",
    data: {
      method: "map.smartorder.delivery.agingOptimization",
      param: JSON.stringify(data)
    },
    method: "post",
    token: false,
  })
}
*/

// 时效运费弹层
export const serviceModeOptimizeNotice = data => {
  return request({
    headerUrl: 'web.v2.front.serviceModeOptimizeNotice',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data
  })
}

// 时效运费弹层(新，2021-10-18)
export const getAgingOptimizeNotice = data => {
  return request({
    headerUrl: 'web.order.getAgingOptimizeNotice',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data
  })
}

export const getAdvertisement = () => {
  return request({
    headerUrl: 'web.advertisement.area.getByChannel',
    method: 'post',
    token: false,
    hideErrMsg: true,
    data: {
      channelCode: 'pc'
    }
  })
}

export const getAdvertisementDetail = params => {
  return request({
    headerUrl: 'web.advertisement.getDetails',
    method: 'post',
    token: true,
    hideErrMsg: true,
    data: {
      ...params,
      channelCode: 'pc'
    }
  })
}
