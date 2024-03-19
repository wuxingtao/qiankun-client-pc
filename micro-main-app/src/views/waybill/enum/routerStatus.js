export const ROUTER_STATUS_EMUN = {
  AWAIT: 0, // 待揽件
  ARRANGED: 10, // 正在安排司机
  ONCOMING: 20, // 司机正在赶来
  ARRIVED: 30, // 司机已到达
  PICKUP: 40, // 已揽件
  IN_TRANSIT: 50, // 运输中
  DISPATCHING: 60, // 派送中
  ERROR: 70, // 派送异常
  SIGNED: 80, // 已签收
  SUBMIT_ORDER: 90, // 下单成功，请尽快投递
  INFORM: 100, // 待通知取货
  DISPATCH_SIGN: 101 // 派送签到
}
