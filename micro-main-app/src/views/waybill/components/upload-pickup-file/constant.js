// 配置项
export const options = {
  bizCode: 'erp_upload_image_preOrder', // 业务类型 CODE
  maxCount: 10, // 最大上传数
  maxSize: 1024 * 10, // 文件大小限制，单位为 kb 默认 10m
  fileType: ['jpg', 'png', 'doc', 'docx', 'pdf', 'txt', 'xls', 'xlsx'], // 文件类型
  maxUpdateCount: 2 // 最大修改次数
}

// 图标
export const ICONS = {
  default: require('@/assets/image/waybill/suffix-default.png'),
  doc: require('@/assets/image/waybill/suffix-doc.png'),
  docx: require('@/assets/image/waybill/suffix-doc.png'),
  pdf: require('@/assets/image/waybill/suffix-pdf.png'),
  xls: require('@/assets/image/waybill/suffix-xls.png'),
  xlsx: require('@/assets/image/waybill/suffix-xls.png'),
}

export const STATUS = { WAIT: 1, FAIL: 2, SUCCESS: 3, DELETING: 4, UPLOADING: 5 }
