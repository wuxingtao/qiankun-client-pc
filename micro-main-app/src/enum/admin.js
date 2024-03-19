export const CHECK_GRAY_ENUM = Object.freeze({
  EXCLUDED: 0, // 非灰度
  INCLUDED: 1, // 灰度
  OPTIONAL: 2 // 可选升级
})

export const ADVERTISEMENT_TYPE_ENUM = Object.freeze({
  BANNER: '10', // banner
  POPPER: '20', // 弹窗
  MARQUEE: '30', // 走马灯
  OPEN_PAGE: '40' // 开屏页
})

export const ADVERTISEMENT_JUMPMODE_ENUM = Object.freeze({
  NONE: 0, // 不跳转
  H5: 1, // H5
  NORMAL: 2, // 原生
  WX: 3 // 微信小程序
})
