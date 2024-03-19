import request from './request'


// 查询中奖纪录
export function queryDrawResult(params={level:0}) {
  return request({
    headerUrl: 'kyact.prize.queryDrawResult',
    method: 'post',
    data: params
  })
}

// 抽奖
export function drawPrize(params) {
  return request({
    headerUrl: 'kyact.prize.drawPrize',
    method: 'post',
    data: params
  })
}

// 单个抽奖
export function drawOnePrize(params){
  return request({
    headerUrl: 'kyact.prize.drawOnePrize',
    method: 'post',
    data: params
  })
}

// 获取所有用户
export function getAllUser(params={"current": 0, "size": 0}){
  return request({
    headerUrl: 'kyact.prize.user.getAllUser',
    method: 'post',
    data: params
  })
}
