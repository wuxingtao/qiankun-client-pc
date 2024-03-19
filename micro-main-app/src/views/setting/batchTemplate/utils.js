// companyNo: "02155839657"
// dateType: 0
// excelname: "收件公司,收件地址,收件人,收件手机,收件座机,寄件公司,寄件地址,寄件人,寄件手机,寄件座机,服务方式,付款方式,付款账号,代收货款,保价声明,回单服务,托寄物,件数,重量(kg),寄件备注"
// guid: ""
// headerLine: 1
// mobile: "13632521700"
// source: 0
// sys_guid: ""
// templateName: "1111"

const sendMap = new Map([
  ['templateName', 'templateName'],
  ['sjCompanyNa', 'receiveCompanyName'],
  ['sjAddress', 'receiveAddress'],
  ['sjPeople', 'receivePeople'],
  ['sjTelPhone', 'receivePhone'],
  ['sjMobile', 'receiveMoblie'],
  ['jjCompanyNa', 'sendCompanyName'],
  ['jjAddress', 'sendAddress'],
  ['jjPeople', 'sendPeople'],
  ['jjTelPhone', 'sendPhone'],
  ['jjMobile', 'sendMobile'],
  ['jjNote', 'sendRemark'],
  ['serverModel', 'serviceModel'],
  ['payType', 'payModel'],
  ['payCardNo', 'payAccount'],
  ['dSHKAmount', 'collectionMoney'],
  ['saveValue', 'insuredAmount'],
  ['isHD', 'signReceipt'],
  ['article', 'goodsName'],
  ['number', 'number'],
  ['hwWeight', 'weight'],
  ['remark', 'remark'],
  ['excelname', 'excelColumn'],
  ['headerLine', 'headerIndex'],
  // ['sys_guid', 'id'],
  ['defaultSate', 'defaultSate']
])

const receiptMap = new Map([
  ['templateName', 'templateName'],
  ['receiveCompanyName', 'sjCompanyNa'],
  ['receiveAddress', 'sjAddress'],
  ['receivePeople', 'sjPeople'],
  ['receivePhone', 'sjTelPhone'],
  ['receiveMoblie', 'sjMobile'],
  ['sendCompanyName', 'jjCompanyNa'],
  ['sendAddress', 'jjAddress'],
  ['sendPeople', 'jjPeople'],
  ['sendPhone', 'jjTelPhone'],
  ['sendMobile', 'jjMobile'],
  ['sendRemark', 'jjNote'],
  ['serviceModel', 'serverModel'],
  ['payModel', 'payType'],
  ['payAccount', 'payCardNo'],
  ['collectionMoney', 'dSHKAmount'],
  ['insuredAmount', 'saveValue'],
  ['signReceipt', 'isHD'],
  ['goodsName', 'article'],
  ['number', 'number'],
  ['weight', 'hwWeight'],
  ['remark', 'remark'],
  ['excelColumn', 'excelName'],
  ['headerIndex', 'headerLine'],
  ['id', 'sys_guid'],
  ['defaultSate', 'defaultSate']
])

/**
 * 新旧接口参数差异太大
 * 提供值
 * */
export const paramsSpecife = (type, params) => {
  let map = null
  if (type === 'send') {
    map = sendMap
  } else {
    map = receiptMap
  }
  let result = {}
  for (let key in params) {
    if (map.has(key)) {
      result[map.get(key)] = params[key]
    }
  }
  return result
}
