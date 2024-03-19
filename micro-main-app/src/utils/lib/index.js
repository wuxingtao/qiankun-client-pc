
/** 加密字段顺序 */
const ENCRYPT_PROPS = ['sendPeople','sendPhone', 'sendMobile', 'sendAdd', 'sendCompany', 'receiptPeople','receiptPhone','receiptMobile', 'receiptAdd', 'receiptCompany']

/** 
 * 根据接口返回加密键值对，组合成由0(不加密)和1(加密)组成的10位字符串 
 * 10位字符串对应顺序:寄件人(sendPeople)，寄件电话(sendPhone)，寄件手机(sendMobile)，寄件地址(sendAdd)，寄件公司(sendCompany)，收件人(receiptPeople)，收件电话(receiptPhone)，收件手机(receiptMobile)，收件地址(receiptAdd)，收件公司(receiptCompany)
 * */
export const computedPrintSet = (data) => {
  let result = '0000000000'

  /** data=null 表示无加密配置，按照不加密处理 */
  if(!data) return result

  result = ENCRYPT_PROPS.reduce((shields, item, index) => {
    shields[index] = data[item] ? 1 : 0
    return shields
  }, [])
  return result.join('')
}