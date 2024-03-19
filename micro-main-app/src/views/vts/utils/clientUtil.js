import store from '@/store'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { Message } from 'element-ui'
import native from '@utils/native'
import { getUserData, getPhone, getCustomerCode } from '@/utils/storage'
import { getContactNumbers, trim, base64ToFile } from '@utils/commonUtil'
// import { parseAddressInfo } from '@/services/api/delivery'
import { batchPrint, batchPrint_136,batchPrint_130, batchPrint_210, getPrinters, batchPrint_Tag, parseExcel } from '@/services/api/common'
import dataMask from '@/utils/dataMask'


export function getSourceFlag () {
  return native.isClientMode() ? '140' : '120' //140为客户端，120：官网
}


/**
 * 导出excel
 * @param {Array} jsonData 表格数据
 * @param {Array} theadColumns 表格列数据
 * @param {String} filename 文件名
 * @returns 
 */
export async function exportExcel ({ jsonData, theadColumns, filename }) {
  if (native.isClientMode()) {
    let tableData = jsonData
    if (theadColumns) {
      tableData = tableData.map(r => {
        let row = {}
        theadColumns.forEach(c => {
          row[c.text] = r[c.prop] === 0 ? 0 : (r[c.prop] || '')
        })
        return row
      })
    }
    const result = JSON.parse(native.exportTable(JSON.stringify(tableData), filename))
    if (result) {
      if (result.code == 0 && result.msg) {
        Message.success(result.msg)
      } else if (result.code != 0 && result.msg) {
        Message.error(result.msg)
      }
    }
    return
  }
  const excel = await import('@utils/excelUtil')
  excel.exportExcel({ jsonData, theadColumns, filename })
}

/**
 * 读取excel内容
 * @param {Object(File)} file 
 * @param {Number} headerIndex 表头所在行，从0开始计数
 * @returns 返回excel中的内容
 */
export async function readExcel (file, headerIndex = 0, maxRowLimit = 1000) {
  const result = await uploadFileToFileCenter(file)
  if (result) {
    const params = {
      bizId: result.bizId,
      bizCode: result.bizCode,
      originalName: file.name,
      startingRowsIndex: headerIndex + 1,
      maxRowLimit: maxRowLimit + headerIndex + 1
    }
    const res = await parseExcel(params)
    if (res.code === 0) {
      let jsonData = []
      if (res.data && res.data.length > 1) {
        jsonData = res.data.slice(1).map(d => {
          const row = res.data[0].reduce((initValue, cur, index) => {
            initValue[cur] = d[index] || ''
            return initValue
          }, {})
          return row
        })
      } else {
        return { msg: '导入的数据为空,请确认', header: res.data && res.data[0] || [] }
      }
      return { jsonData, header: res.data[0] }
    }
    let msg = ''
    switch (res.code) {
      case 3003:
        msg = `一次最多只允许导入${maxRowLimit}条，请修改Excel`
        break
      case 3004:
        msg = '表格列标头为空，请修改Excel'
        break
      default:
        msg = res.msg
    }
    return { code: res.code, msg }
  } else {
    return await readExcelByJs(file, headerIndex)
  }
}

async function readExcelByJs (file, headerIndex = 0) {
  if (native.isClientMode()) {
    if (native.existsNativeFunc('readExcelAsync')) {
      return new Promise(resolve => {
        window.webApi_getReadExcelResult = data => {
          resolve(data)
        }
        native.readExcelAsync(file.name, headerIndex, () => { })
      })
    }
    const jsonData = JSON.parse(native.readExcel(file.name, headerIndex))
    return jsonData
  }
  const excel = await import('@utils/excelUtil')
  const data = await excel.readExcel(file, headerIndex)
  return data
}

/**
 * 读取文件并转化为base64
 * @param {File} file
 * @param {boolean} removeFileInfo 是否移除base64文件头信息
 */
export function readFileToBase64 (file, removeFileInfo) {
  if (native.isClientMode()) {
    const fileInfo = JSON.parse(native.fileToBase64(file.name, true))
    file.name = fileInfo.name
    return fileInfo.base64
  }
  const rawFile = file.raw
  return new Promise(function(resolve, reject) {
    let reader = new FileReader()
    let result = ''
    reader.readAsDataURL(rawFile)
    reader.onload = function() {
      result = reader.result
    }
    reader.progress = function(rawFile) {
      // console.log(rawFile)
    }
    reader.onerror = function(error) {
      reject(error)
    }
    reader.onloadend = function() {
      if (removeFileInfo) {
        result = result.split(',')[1]
      }
      resolve(result)
    }
  })
}

//上传文件至文件中心
export async function uploadFileToFileCenter (inputFile, bizCode = 'eam_excel_file', fileType = 'xls') {
  try {
    const base64 = await readFileToBase64(inputFile, true)
    let file = base64ToFile(base64, inputFile.name)
    let url = 'https://api.ky-express.com/router/upload'
    if (['uc-uat.ky-express.com', 'uc-dev.ky-express.com', 'localhost'].includes(window.location.hostname)) {
      url = 'http://api-uat.kyeapi.com/router/upload'
    }
    // if (process.env.NODE_ENV !== 'production') {
    //   url = 'http://api-uat.kyeapi.com/router/upload'
    // }
    let data = { bizCode, bizId: `excel${uuidv4()}`, type: fileType, file }
    let formData = new FormData()
    Object.entries(data).forEach(([key, value]) => formData.append(key, value))
    let res = await axios.post(url, formData)
    if (res.data.code === 0) {
      return res.data.data[0]
    }
  } catch (ex) {
    console.log('uploadFileToFileCenter :>> ', ex)
    Message.error('文件上传失败')
  }
}

/**
 * 取得当前登录用户绑定的公司简称或全称
 * @param {Boolean} flag 标识，为ture时优先获取全称
 * @returns 
 */
export function getLoginCompanyName (flag) {
  const userData = getUserData()
  if (!userData.customerInfo) {
    return ''
  }
  const { customerShortName, customerName } = userData.customerInfo
  if (flag) {
    return customerName || customerShortName
  }
  return customerShortName || customerName
}
/**
 *
 * @param {Object} waybills 运单数据
 * @param {String} printerNo 打印机编码，
 */
export async function printByCloudPrinter (waybills, printerNo, sendStubChecked, childMotherChecked, isBatchPrint = true) {
  let msg = ''
  if (!printerNo) {
    ({ msg, printerNo } = await checkPrinter())
  }
  if (msg) {
    return msg
  }
  let models = convertPrintModelsForCloudPrint(waybills)
  let res
  if (store.getters.printConfig.sheetType === '1') {
    res = await batchPrint_210(models, printerNo, store.getters.encryptionText, sendStubChecked, childMotherChecked)

  } else if(store.getters.printConfig.sheetType === 'oneCopy'){
    res = await batchPrint_130(models, printerNo, store.getters.encryptionText, sendStubChecked, childMotherChecked)
  } else{
    let templateId = 1
    if (['3', '136Stub'].includes(store.getters.printConfig.sheetType)) {
      templateId = 5
    }
    res = await batchPrint_136(models, printerNo, store.getters.encryptionText, sendStubChecked, childMotherChecked, templateId)
  }
  if (res.code != 0) {
    throw res.msg
  }
  let params = {
    mobile: getPhone(),
    companyNo: getCustomerCode(),
    dataList: waybills.map((m, index) => ({ no: index, ydNo: m.ydNo })),
  }
  if (isBatchPrint) {
    await batchPrint(params)
  }

}

//打印标签
export async function printTagByCloudPrinter (tagModels, printerNo) {
  let msg = ''
  if (!printerNo) {
    ({ msg, printerNo } = await checkPrinter())
  }
  if (msg) {
    return msg
  }
  let res = await batchPrint_Tag(tagModels, printerNo)
  if (res.code != 0) {
    throw res.msg
  }
}


/**
 * 返回打印机编号、错误信息
 */
export async function checkPrinter () {
  let sheetType = store.getters.printConfig.sheetType
  if (sheetType != '1' && sheetType != '2') {
    return { msg: '您未设置打印模板' }
  }
  let printConfig = store.getters.printConfig
  if (!printConfig || !printConfig.printModel) {
    return { msg: '您未设置默认打印机' }
  }
  let printerNo = printConfig.printModel
  if (printerNo.includes('跨越云打印机')) {
    printerNo = printerNo.match(/\(([^)]*)\)/)[1]
  }
  const res = await getPrinters()
  if (res.code == 0 && res.data.dataList) {
    if (!res.data.dataList.some(p => p.printerId == printerNo)) {
      return { msg: '您未设置默认打印机' }
    }
    return { printerNo }
  } else {
    return { msg: res.msg }
  }
}

function numberToString (number) {
  const value = Number(number)
  if (!number || value < 0) {
    return ''
  }
  return number + ''
}

/**
 * 转化为云打印模板
 * @param {Array} waybills 
 * @returns 
 */
function convertPrintModelsForCloudPrint (waybills) {
  return waybills.map(val => ({
    YDCode: val.ydNo,
    JJCompanyNa: val.jjCompany,
    SJCompanyNa: val.sjCompany,
    SJAddress: val.sjAddress,
    JJAddress: val.qHAddress,
    ServerModel: val.serviceWay,
    PayType: val.payWay,
    JJPeople: val.jjContactPerson,
    SJPeople: val.sjContactPerson,
    Number: numberToString(val.count) || '0',
    SJQH: val.sjQH,
    SJMobile: val.sjMobile,
    SJTelPhone: val.sjTelephone,
    JJMobile: val.sms,
    JJTelPhone: val.jjTelePhone,
    JJNote: val.jjRemark + (val.mjWay ? ';' + getExtraPacking(val.mjWay, false) : ''),
    IsHD: Number(val.receiptCount) > 0 ? '1' : '0',
    DSAmount: numberToString(val.dsMoney),
    SaveValue: numberToString(val.money),
    BFAmount: numberToString(val.premium),
    DSHKAmount: numberToString(val.dsCommission),
    JJTime: val.jjDateTime,
    BJNO: val.airplaneCode,
    SizeInfoList: val.sizeList,
    Freight: numberToString(val.totalCost),
    IsUrgent: val.isUrgent,
    Article: val.goods,
    Weight: numberToString(val.weight),
    YJCardNo: val.payAccount,
    EndAirportShortName: val.destAirport,
    FirstClassDistFullName: val.destinationTransfer,
    SJOperateDepartShortName: val.SJOperateDepartShortName,
    SJDepot: val.receiptDepotAllName,
    zoneName: val.zoneName,
    destinationCode: (val.destinationCrossCode || '') + '-' + (val.destinationTabletrolleyCode || ''),
    outboundAllocation: val.outboundAllocation,
    regionCode: val.regionCode,
    JDCode: val.JDCode || val.jdCode,
    jdBzDepartName: val.destinationSiteName || val.siteName,
    jdAllCateCenterName: val.targetSortCenterName,
    jdAllCateCenterNo: (val.destinationCrossCode || '') + '-' + (val.destinationTabletrolleyCode || ''),
    jdDepartNumber: val.road,
    siteId: val.siteId,
    targetSortCenterId: val.targetSortCenterId,
    agentCode: val.agentCode,
    cpShortCode: val.cpShortCode,
    cityShortCode: val.cityShortCode,
    cpShortCode_cityShortCode: (val.cpShortCode || '') + '-' + (val.cityShortCode || ''),
    transferType: numberToString(val.transferType),
    productType: val.productType,
    transportType: numberToString(val.transportType),
    temperatureType: val.temperatureType,
    originNodeName: val.originNodeName,
    originNodeCode: val.originNodeCode,
    originCrossCode: val.originNodeCode ? val.originNodeCode.split('-')[0] || '' : '',
    originTabletrolleyCode: val.originNodeCode ? val.originNodeCode.split('-')[1] || '' : '',
    destinationNodeWaterCode: val.destinationNodeWaterCode,
    viewBarCode: val.viewBarCode,
    watermark: val.waterMark,
    depotAndPartition: val.receiptDepotAllName + val.zoneName,
    jdShopCode: val.JDCode || val.jdCode,
    FreezingSign: '',
    ReceiptFlag: val.receiptFlag,
    ReceiptNum: numberToString(val.hdCount),
    ChildYDCodes: val.childYdCodes,
    VipshopCode: val.vipshopCode
  }))
}

/**
 * 转换为本地打印模板
 * @param {Array} waybills 
 * @returns 
 */
export function convertPrintModelsForLocalPrint (waybills) {
  return waybills.map(val => ({
    agentCode: val.agentCode,
    article: val.goods,
    dsAmount: val.dsMoney,
    destinationAirport: val.destAirport,
    jjAddress: val.JJAddress,
    jjCompanyNa: val.jjCompany,
    jjMobile: val.sms,
    jjNote: val.jjRemark + (val.mjWay ? ';' + getExtraPacking(val.mjWay, false) : ''),
    jjPeople: val.jjContactPerson,
    jjTelPhone: val.jjTelePhone,
    number: val.count,
    payType: val.payWay,
    receiptFlag: val.receiptFlag,
    isHD: val.receiptFlag === '10' || val.receiptFlag === '30',
    receiptNum: val.hdCount,
    sjAddress: val.sjAddress,
    sjCompanyNa: val.sjCompany,
    sjMobile: val.sjMobile,
    sjOperateDepartShortName: val.SJOperateDepartShortName,
    sjPeople: val.sjContactPerson,
    saveValue: val.money,
    serverModel: val.serviceWay,
    weight: val.weight,
    ydCode: val.ydNo,
    transferType: val.transferType,
    childYdCodes: val.childYdCodes,
    targetSortCenterName: val.targetSortCenterName,
    originNodeName: val.originNodeName,
    sizeInfoList: val.sizeList.map(item => ({ len: item.len || item.Len, height: item.height || item.Height, width: item.width || item.Width, number: item.number || item.Number })),
    deliveryBarCode: val.JDCode || val.jdCode,
    transportType: val.transportType,
    productType: val.productType,
    waterMark: val.waterMark,
    jfWeight: val.freightWeight,
    yjCardNo: val.payAccount,
    depotPartition: val.zoneName,
    destinationCode: (val.destinationCrossCode || '') + '-' + (val.destinationTabletrolleyCode || ''),
    temperatureType: val.temperatureType,
    siteId: val.siteId,
    destinationRoad: val.road,
    targetSortCenterId: val.targetSortCenterId,
    cityShortCode: val.cityShortCode,
    cpShortCode: val.cpShortCode,
    originCode: val.originNodeCode,
    destinationNodeWaterCode: val.destinationNodeWaterCode,
    vipShopCode: val.vipshopCode,
    destinationTransfer: val.destinationTransfer,
    jjTime: val.jjDateTime,
    freight: val.totalCost,
    receiptAmount: val.receiptAmount,
    endBigAreaName: val.regionCode,
    originatingDistribution: val.outboundAllocation,
    motherWaybillSign: true,
    sjQH: val.sjQH,
    sjDepot: val.receiptDepotAllName,
    destinationSiteName: val.destinationSiteName || val.siteName,

  }))
}

/*
  运单查询结果字段转换
*/
export function convertQueryModels (waybills) {
  if (!waybills) {
    return []
  }
  const result = waybills.map(val => ({
    id: val.id,
    ydNo: val.waybillNumber,
    hhDateTime: val.goodsTime,
    type: val.printStatus,
    goods: val.goodsType,
    sjCompany: val.pickupCompanyName,
    sjContactPerson: val.pickupPerson,
    sjAddress: val.pickupAddress,
    sjMobile: val.pickupMobile,
    weight: val.weight,
    count: val.count,
    serviceMode: val.serviceMode,
    payWay: val.payModeValue,
    payAccount: val.payAccount,
    antcipatedFreight: val.estimatedFreight,
    totalCost: numberToString(val.freightAmount),
    jjRemark: val.waybillRemark,
    customColumnValue_01: val.customColumnValue_01,
    customColumnValue_02: val.customColumnValue_02,
    customColumnValue_03: val.customColumnValue_03,
    jjCompany: val.deliveryCompanyName,
    jjContactPerson: val.deliveryPerson,
    jjDateTime: val.deliveryTime,
    sms: val.deliveryMobile,
    qHContactPerson: val.contactPerson,
    qHContactWay: val.contactPhone,
    receiver: val.receiver,
    receiveDate: val.receiveDate,
    receiptStatus: val.receiptStatus,
    receiptFlag: val.receiptFlag,
    hdCount: val.receiptCount,
    money: val.declarativeValue,
    dsMoney: val.collectionAmount,
    mjWay: val.woodenFrame,
    woodenFrame: val.woodenFrame,
    sendHouseName: val.deliveryWareHouseName,
    receiptHouseName: val.pickupWareHouseName,
    isSignSelf: val.selfSignFlag,
    qHAddress: val.deliveryAddress,
    JJAddress: val.deliveryAddress,
    ydStatus: val.waybillStatus,
    sjTelephone: val.pickupPhone,
    jjTelePhone: val.deliveryPhone,
    serviceWay: val.serviceModeValue,
    payMode: val.payMode,
    uploaTime: val.uploaTime,
    couponPrizeCode: val.couponPrizeCode,
    couponPrizeDesc: val.couponPrizeDesc,
    sizeList: val.preWaybillGoodsSizeList && val.preWaybillGoodsSizeList.map(m => ({
      width: m.width, len: m['length'], height: m.height, number: m.count
    })),
    insuranceValueSource: val.insuranceValueSource,
    vipshopCode: val.vipshopCode,
    goodsInfo: val.goodsInfo,
    sjQH: val.pickupAreaCode,
    isXD: val.hadOrder,
    collectPointId: val.collectPointId,
    SJOperateDepartShortName: val.destOperDepart,//取派点部
    destAirport: val.destAirport,//目的机场
    outboundAllocation: val.outboundAllocation,//始发分拨
    destinationTransfer: val.firstAllocationAName,//目的分拨
    receiptDepotAllName: val.receiptDepotAllName,//收件点部
    zoneName: val.zoneName,
    regionCode: val.regionCode,
    agentCode: val.agentCode,//代理平台
    transferType: val.transferType,//中转方式：1始发转 2目的转
    targetSortCenterName: val.targetSortCenterName,//目的分拣中心（代理商）
    originNodeName: val.originNodeName,
    JDCode: val.JDCode,
    transportType: val.transportType,
    productType: val.productType,
    destinationCrossCode: val.destinationCrossCode, //目的滑道号
    destinationTabletrolleyCode: val.destinationTabletrolleyCode,//目的笼车号
    temperatureType: val.temperatureType, //温区
    siteId: val.siteId,
    road: val.road, //路区
    targetSortCenterId: val.targetSortCenterId,
    cityShortCode: val.cityShortCode, //丹鸟
    cpShortCode: val.cpShortCode,//丹鸟
    originNodeCode: val.originNodeCode,
    destinationNodeWaterCode: val.destinationNodeWaterCode,
    SizeText: val.preWaybillGoodsSizeList && val.preWaybillGoodsSizeList.map(m => (m.length + '*' + m.width + '*' + m.height + '*' + m.count
    )).toString(),
    printTimes: val.printTimes,
    destinationSiteName: val.siteName, //目的营业部名称
    viewBarCode: val.viewBarCode,
    freight: val.freight,
    waybillCustomerSource: val.waybillCustomerSource,//10我发出的，20我收到的
    freightWeight: val.freightWeight,
    orderNumber: val.orderNumber,
    cargoStorageStatus: val.cargoStorageStatus,
    uploadTime: val.uploadTime
  }))
  return result
}

/**
 *  取得分批次上传数据拆分结果
 * @param {Array} arrayData 上传数据
 * @param {Number} maxcount 单次最大上传数量
 * @return {Array<Array>}
 */
export function getSplitData (arrayData, maxcount) {
  if (!arrayData) {
    return []
  }
  if (arrayData.length <= maxcount) {
    return [arrayData]
  }
  arrayData = JSON.parse(JSON.stringify(arrayData))
  const total = arrayData.length
  const times = Math.ceil(total / maxcount) //最多需要上传的次数
  const avg = Math.ceil(total / times) //平均每次上传的数量
  let result = []
  for (let i = 0; i < times; i++) {
    result.push(arrayData.splice(0, avg))
  }
  return result
}

export function getTheRightPayWay (payWay) {
  if (!payWay) {
    return ''
  }
  if (['寄方付', '寄付'].find(f => payWay.includes(f))) {
    return '寄方付'
  }
  if (['收方付', '到付'].find(f => payWay.includes(f))) {
    return '收方付'
  }
  if (payWay.includes('第三方付')) {
    return '第三方付'
  }
}

/**
 * 将包装服务转换为编码或文本
 * @param {String} extraPacking
 * @param {Boolean} isConvertToCode 是否转换成修改
 */
export function getExtraPacking (extraPacking, isConvertToCode = true) {
  if (['打卡板', '打木架', '打木箱'].includes(extraPacking)) {
    extraPacking = '帮我' + extraPacking
  }
  const dict = { 帮我打卡板: '10', 帮我打木架: '20', 帮我打木箱: '30' }
  const keys = Object.keys(dict)
  const values = Object.values(dict)
  if (keys.includes(extraPacking)) {
    return isConvertToCode ? dict[extraPacking] : extraPacking
  }
  if (values.includes(extraPacking + '')) {
    return isConvertToCode ? extraPacking : keys.find(k => dict[k] == extraPacking)
  }
  return ''
}

/**
 * 取得回单标识
 * @param {string} receiptType 回单服务文本
 */
export function getReceiptFlag (receiptType) {
  if (!receiptType) {
    return ''
  }
  if ([10, 30].includes(Number(receiptType))) {
    return receiptType
  }
  const dict = { 回单原件: '10', 回单图片: '30' }
  if (dict[receiptType]) {
    return dict[receiptType]
  }
  return ''
}
/**
 * 取得回单文本
 * @param {string} receiptFlag 回单标识
 */
export function getReceiptText (receiptFlag) {
  if (receiptFlag == '10') {
    return '回单原件'
  } else if (receiptFlag == '30') {
    return '回单图片'
  }
  return ''
}

/**
 * 将尺寸json对象转换为文本
 * @param {String} sizeListJson 尺寸json对象
 * @returns
 */
export function getSizeListText (sizeListJson) {
  if (!sizeListJson) {
    return ''
  }
  try {
    var sizeList = JSON.parse(sizeListJson)
    if (typeof sizeList === 'object' && sizeList) {
      return sizeList.map(s => `${s.length}*${s.width}*${s.height}*${s.count}`).join(';')
    }
  } catch (e) {
    return sizeListJson
  }
}
/**
 * 提取字符串中正确格式的号码，并用逗号分隔连接成字符串返回
 * @param {String} originContactNumber
 */
export function handleContactNumber (originContactNumber) {
  let { phones, telephones } = getContactNumbers(originContactNumber)
  if (phones.length > 0 || telephones.length > 0) {
    phones.push(...telephones)
    return phones.join(',')
  }
  return originContactNumber
}

/**
 * 格式化Model中的收、寄件座机号
 * @param {Object} model 电子运单Model
 */
export function formatTelephoneOfModel (model) {
  const jjTelephoneName = model.hasOwnProperty('jjTelePhone') ? 'jjTelePhone' : 'jjTelephone'
  const sendeLandline = `${model.jjTelephoneAreaNo || ''}-${model[jjTelephoneName] || ''}-${model.jjTelephoneExtension || ''}`
  model[jjTelephoneName] = trim(sendeLandline, '-') || ''
  const receiverLandline = `${model.sjTelephoneAreaNo || ''}-${model.sjTelephone || ''}-${model.sjTelephoneExtension || ''}`
  model.sjTelephone = trim(receiverLandline, '-')
  model.jjTelephoneAreaNo = model.jjTelephoneExtension = ''
  model.sjTelephoneAreaNo = model.sjTelephoneExtension = ''
}
/**
 * 将Model中的数值字段值为空的赋值为null
 * @param {Object} model
 */
export function formatNumberFieldOfModel (model) {
  const numberFields = ['hdCount', 'money', 'premium', 'dsMoney', 'dsCommission', 'count', 'weight']
  const keys = Object.keys(model)
  numberFields.filter(n => keys.includes(n)).forEach(n => {
    if (Number(model[n]) <= 0) {
      model[n] = null
    } else {
      model[n] = Number(model[n]) || null
    }
  })
}

/**
 * 将对象中字段为空的值格式化空字符串
 * @param {Object} obj
 */
export function formatEmptyOfObject (obj) {
  Object.keys(obj).forEach(k => {
    if (!obj[k]) {
      obj[k] = ''
    }
  })
}

//将crm运单加密字段信息转化为字符串
export function convertEncryptListToString (fieldsList) {
  if (!fieldsList || fieldsList.length < 1) {
    return
  }
  const dict = { '10': '3', '20': '1', '30': '0' }
  const fields = ['寄件公司', '寄件人', '寄件电话', '收件公司', '收件人', '收件电话', '收件地址', '月结账号', '声明价值', '寄件地址']
  let encryptString = ''
    ;[10, 20, 30].forEach(type => {
    encryptString += '-'
    fields.forEach(field => {
      let encryptType = fieldsList.find(f => f.titleType == type && f.fieldName == field).encryptType
      encryptString += dict[encryptType] || '3'
    })
  })
  return trim(encryptString, '-')
}


//下载批量导入模板
export function downloadImportExcelTemplate (isSignBySelf) {
  let fileName = '批量发货模板.xls'
  if (isSignBySelf) {
    fileName = '批量发货模板(本人签收).xls'
  }

  if (!native.isClientMode()) {
    window.location.href = `/templates/${fileName}`
    return
  }
  const url = `${window.location.origin}/templates/${fileName}`
  // const url = `http://VER1.ky-express.com/data/Upgrade/Templates/${fileName}`
  const res = native.downLoadFile(url, 'excel', fileName)
  const result = res && JSON.parse(res)
  if (result) {
    if (result.code == 0 && result.msg) {
      Message.success(result.msg)
    } else if (result.code != 0 && result.msg) {
      Message.error(result.msg)
    }
  }
  console.log('res :>> ', res, result)
}

/**
 * 获取文本的手机号、座机号、姓名、地址、公司名
 * @param {String} inputText 输入文本
 * @returns {Object} result
 * @returns {Array} result.mobiles
 * @returns {Array} result.tels
 * @returns {String} result.name
 * @returns {String} result.address
 * @returns {String} result.company
 */
export function smartRecognize (inputText) {
  if (!inputText) {
    return {}
  }
  try {
    const wordsList = inputText.match(/[\u4e00-\u9fa5|0-9|a-z|A-Z]{2,}/g) || []
    const noiseItems = ['收方', '收货', '收件', '客户', '姓名', '联系', '电话', '手机', '地址', '详细']
    const noiseWords = wordsList.filter(w => noiseItems.some(n => w.includes(n)))
    noiseWords.forEach(w => {
      inputText = inputText.replace(new RegExp(w, 'g'), ' ')
    })
    let result = recognizePhone(inputText)
    Object.assign(result, recognizeName(wordsList, result.inputText))
    Object.assign(result, recognizeAddressAndCompany(result.inputText))
    return result
  } catch (ex) {
    console.log('smartRecognize :>> ', ex)
    return {}
  }
}

function recognizePhone (inputText) {
  const mobileReg = /(0|86|17951)?(13\d|15\d|17\d|18\d|19\d|14[057]|165|166|168|199|198)(\d{8}|(\s{0,}|-)\d{4}(\s{0,}|-)\d{4})/g
  const telReg = /(\d{2,}-)?(\d{5,})(-\d{2,})?/g
  const mobiles = inputText.match(mobileReg) || []
  mobiles.forEach(m => {
    inputText = inputText.replace(new RegExp(m, 'g'), ' ')
  })
  const tels = inputText.match(telReg) || []
  tels.forEach(t => {
    inputText = inputText.replace(new RegExp(t, 'g'), ' ')
  })
  return { mobiles, tels, inputText }
}

function recognizeName (wordsList, inputText) {
  if (!wordsList || wordsList.length < 1) {
    return
  }
  const familyName =
    '赵钱孙李周吴郑王冯陈楮卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳酆鲍史唐费廉岑薛雷贺倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐康伍余元卜顾孟平黄和穆萧尹姚邵湛汪祁毛禹狄米贝明臧计伏成戴谈宋茅庞熊纪舒屈项祝董梁杜阮蓝闽席季麻强贾路娄危江童颜郭梅盛林刁锺徐丘骆高夏蔡田樊胡凌霍虞万支柯昝管卢莫经房裘缪干解应宗丁宣贲邓郁单杭洪包诸左石崔吉钮龚程嵇邢滑裴陆荣翁荀羊於惠甄麹家封芮羿储靳汲邴糜松井段富巫乌焦巴弓牧隗山谷车侯宓蓬全郗班仰秋仲伊宫宁仇栾暴甘斜厉戎祖武符刘景詹束龙叶幸司韶郜黎蓟薄印宿白怀蒲邰从鄂索咸籍赖卓蔺屠蒙池乔阴郁胥能苍双闻莘党翟谭贡劳逄姬申扶堵冉宰郦雍郤璩桑桂濮牛寿通边扈燕冀郏浦尚农温别庄晏柴瞿阎充慕连茹习宦艾鱼容向古易慎戈廖庾终暨居衡步都耿满弘匡国文寇广禄阙东欧殳沃利蔚越夔隆师巩厍聂晁勾敖融冷訾辛阚那简饶空曾毋沙乜养鞠须丰巢关蒯相查后荆红游竺权逑盖益桓公万俟司马上官欧阳夏侯诸葛闻人东方赫连皇甫尉迟公羊澹台公冶宗政濮阳淳于单于太叔申屠公孙仲孙轩辕令狐锺离宇文长孙慕容鲜于闾丘司徒司空丌官司寇仉督子车颛孙端木巫马公西漆雕乐正壤驷公良拓拔夹谷宰父谷梁晋楚阎法汝鄢涂钦段干百里东郭南门呼延归海羊舌微生岳帅缑亢况后有琴梁丘左丘东门西门商牟佘佴伯赏南宫墨哈谯笪年爱阳佟第五言福'
  wordsList = wordsList.filter(w => w.length > 1 && w.length < 5)
  let nameList = wordsList.filter(w => w.endsWith('先生') || w.endsWith('小姐') || familyName.includes(w.substr(0, 1)))
  if (nameList.length < 1) {
    const englishNameReg = /[A-Za-z. ]{2,}/g
    nameList = inputText.match(englishNameReg)
    if (nameList && nameList.length > 0) {
      nameList = nameList.filter(n => n.split(' ').length < 2)
    }
  }
  if (!nameList || nameList.length < 1) {
    return
  }
  nameList.sort((a, b) => a.length - b.length)
  return { name: nameList[0], inputText: inputText.replace(new RegExp(nameList[0], 'g'), ' ') }
}

function recognizeAddressAndCompany (inputText) {
  let wordsList = inputText.split(/[,;:，；：。\s]/).filter(f => /[\u4e00-\u9fa5]{2,}/.test(f))
  if (wordsList.length < 1) {
    return
  }
  const addressReg = /['省','市','区','县','镇','乡','街','道']/
  const address = wordsList.find(f => addressReg.test(f))

  wordsList.sort((a, b) => b.length - a.length)
  wordsList = wordsList.filter(f => f != address)
  const company = wordsList.length > 0 && wordsList[0]
  return { address, company }
}
/**
 * 对数组进行分页处理
 * @param {Array} array 需要分页处理的数据
 * @param {Interge} pageIndex 当前所在页，从1开始计数
 * @param {Interge} pageSize 一页的条数
 * @return {Array} 返回当前页的数据
 */
export function pagination (array, pageIndex, pageSize) {
  var offset = (pageIndex - 1) * pageSize
  return offset + pageSize >= array.length ? array.slice(offset, array.length) : array.slice(offset, offset + pageSize)
}

/**
 * 地址智能解析
 * @param {string} addressInfo
 */
export async function parseAddress (addressInfo) {
  if (!addressInfo) {
    return {}
  }
  let result = smartRecognize(addressInfo) || {}
  // let res = await parseAddressInfo(addressInfo)
  if (res.code == 0) {
    let data = res.data[0]
    result.name = data.name
    result.address = data.provice + data.city + data.district + data.detailed_address
    if (data.provice && data.city && data.district) {
      result.districtList = [data.provice, data.city, data.district]
    }
  }
  if (result.address && result.address.includes(result.company)) {
    result.company = ''
  }
  return result
}
