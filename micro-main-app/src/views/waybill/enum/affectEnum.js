export const affectEnum = Object.freeze({
  PANDEMIC: 10, // 疫情
  STORM: 20, // 台风天气
  SNOW: 30, // 雨雪天气
  RAIN: 40, // 汛期影响
  HOLIDAY: 50, // 假期影响
  SPRING_TRAVEL: 60, // 春运期间
  MEETING: 70, // 国际大型会议
  OTHER: 80, // 其他
  CUSTOM: 200 // 报关
})

export const affectTextEnum = Object.freeze({
  10: '疫情',
  20: '台风',
  30: '雨雪',
  40: '汛期',
  50: '假期',
  60: '春运',
  70: '国议',
  80: '其他',
  200: '报关'
})

export const affectTypeEnum = Object.freeze({
  LIMIT: 10, // 限制
  WARNING: 20, // 提醒
  UNFREEZE: 30 // 不限制
})

export const limitCancelFlagEnum = Object.freeze({
  NORMAL: 10, // 正常
  UNFREEZE: 20, // 解除限制
  KEEP: 30 // 未解除限制
})

export const clearanceControlFlagEnum = Object.freeze({
  EXIST: 10, // 命中
  NONE: 20, // 未命中
})

export const needClearanceControlEnum = Object.freeze({
  NEED: 10, // 需要
  WITHOUT: 20, // 不需要
  NONE: 30, // 未选择
  NO_PERMISSION: 40 // 无权限
})