export const ticketStatus = Object.freeze({
  HAS_BEEN_USED: 1, // 已使用
  EXPIRED: 2, // 已过期
  UNUSED: 3, // 未使用
  IN_USE: 4, // 使用中
})

export const ticketReliefTypeEnum = Object.freeze({
  RELIEF: 0, // 减免券
  DISCOUNT: 1, // 折扣券
  LAPSE: 2, // 直减券
  MONEY_OFF: 3, // 满减券
  FREE: 4, // 免单券
})

export const ticketReliefNameEnum = Object.freeze({
  RELIEF: '减免券',
  DISCOUNT: '折扣券',
  LAPSE: '直减券',
  MONEY_OFF: '满减券',
  FREE: '免单券',
})
