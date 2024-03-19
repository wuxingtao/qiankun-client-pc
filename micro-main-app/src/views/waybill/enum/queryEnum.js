export const queryModeEnum = Object.freeze({
  GENERAL: 10, // 通用查询
  SMALL: 20, // 小查询
  DEFAULT: 30 // 默认查询
})

export const printStatusEnum = Object.freeze({
  PRINTED: '10', // 已打印
  NEVER_PRINT: '20', // 未打印
  ALL: '' // 全部
})

//2021/10/18 修改为10已产生，20即将产生
export const storageFeeStatusEnum = Object.freeze({
  ALL: '', //全部
  COMING: '20', // 即将产生
  ATTRACTED: '10', //已产生
  NONE: '30' // 无
})

export const customerSourceEnum = Object.freeze({
  SENDED: '10', // 我发出的
  RECEIVED: '20', // 我收到的
  PAIED: '30' // 我付款的
})

export const statusEnum = Object.freeze({
  INFORM: '10', // 待通知取货
  PICKUP: '20', // 待揽件
  UNSIGNED: '30', // 待签收
  SIGNED: '40', // 已签收
  CANCEL: '50', // 已取消
  ALL: '' // 全部
})

export const queryTypeEnum = Object.freeze({
  WAYBILL_NO: '10', //运单号
  ORDER_NO: '20', //订单号
  MOBILE_NO: '30', // 手机号
  OTHER: '40' // 其他
})

export const hasReceiptEnum = Object.freeze({
  HAS_RECEIPT: '1', // 有回单
  HAS_NOT_RECEIPT: '2', // 没有回单
  ALL: '' // 全部
})

export const hasDownloadReceiptEnum = Object.freeze({
  HAS_DOWNLOAD_RECEIPT: '1', // 有回单
  HAS_NOT_DOWNLOAD_RECEIPT: '0' // 没有回单
})

export const downloadPicType = Object.freeze({
  WAYBILL_UPLOAD_IMAGE_RECEIPT: 'waybill_upload_image_receipt',
  WAYBILL_UPLOAD_IMAGE_REPORT: 'waybill_upload_image_report',
  WAYBILL_UPLOAD_IMAGE_DELIVERY: 'waybill_upload_image_delivery',
  WAYBILL_UPLOAD_IMAGE_WEIGHT: 'waybill_upload_image_weight'
})

export const needFeeFlagEnum = Object.freeze({
  NEED_FEE_FLAG: 10,
  NEED_NOT_FEE_FLAG: 20
})
