import request from "./request"

/**
 *在线发票-查询待开票列表 (V1.0)
 * @param {*} param
 *  waybillNumber    运单号    string    否        运单号
 * deliveryStartDate    寄件起始时间    string    否        寄件起始时间
 * deliveryEndDate    寄件结束时间    string    否        寄件结束时间
 * pageSize    分页展示条数    number    是        分页展示条数
 * page    分页位置    number    是        分页位置
 * customerCode    客户编码    string    否        客户编码
 */
export const getStayList = param => {
  return request({
    headerUrl: 'web.financeInvoice.getStayList',
    method: 'post',
    hideErrMsg: true,
    data: {
      ...param
    }
  })
}

/* 在线发票-查询开票记录列表 (V1.0)
*  * @param {*} param
*  invoiceType	发票类型 1-普通增值发票6% 2-专用增值发票6%	number	否		发票类型 1-普通增值发票6% 2-专用增值发票6%
 *  waybillNumber	运单号	string	否		运单号
 *  invoiceSerialNumber	发票管理编码	string	否		发票管理编码
 *  invoiceStatus	发票状态 0-作废 10-开票中 20-已红冲 30-开票成功 50-待支付 60-已取消	number	否		发票状态 0-作废 10-开票中 20-已红冲 30-开票成功 50-待支付 60-已取消
 *  invoiceStartDate	开票起始时间	string	否		开票起始时间
 *  invoiceEndDate	开票结束时间	string	否		开票结束时间
 *  page	分页位置	number	是		分页位置
 *  pageSize	分页展示条数	number	是		分页展示条数
 *  customerCode	客户编码	string	否		客户编码
*
* */
export const getRecordList = param => {
  return request({
    headerUrl: 'web.financeInvoice.getRecordList',
    method: 'post',
    hideErrMsg: true,
    data: {
      ...param
    }
  })
}

/*在线发票-查询发票详情接口 (V1.0)
* @param {*} param
*  invoiceSerialNumber	发票管理编码	string	是		发票管理编码
*  waybillNumber	运单号	string	否		运单号
*  customerCode	客户编码	string	否		客户编码
* */
export const getDetail = param => {
  return request({
    headerUrl: 'web.financeInvoice.getDetail',
    method: 'post',
    hideErrMsg: true,
    data: {
      ...param
    }
  })
}


/*在线发票-申请电子发票 (V1.0)
* @param {*} param
*   invoiceTitleType	抬头类型 10-企业，20-个人	number	是		抬头类型 10-企业，20-个人
 email	电子邮箱	string	是		电子邮箱
 sendWaybillFlag	是否发送运单明细 1-是，2-否	number	是		是否发送运单明细 1-是，2-否
 personPhone	电子发票抬头类型为个人时，输入手机号	string	否		电子发票抬头类型为个人时，输入手机号
 excludeWaybillList	排除的运单号集合，全选时入参	array[string]	否		排除的运单号集合，全选时入参
 deliveryDateList	寄件时间范围，多个月份全选时，则传入多个时间范围	array[object]	否		寄件时间范围，多个月份全选时，则传入多个时间范围
 invoiceType	发票类型 1-普通增值发票6% 2-专用增值发票6%	number	是		发票类型 1-普通增值发票6% 2-专用增值发票6%
 invoiceTitle	发票抬头	string	是		发票抬头
 taxpayerIdentifierNumber	纳税人识别号	string	是		纳税人识别号
 invoiceContent	发票内容	string	是		发票内容
 invoiceAmount	发票金额	number	是		发票金额
 appInvoiceDetailExList	开票明细，非全选时入参	array[object]	否		开票明细，非全选时入参
 companyAddress	公司地址	string	否		公司地址
 companyPhoneNumber	公司电话	string	否		公司电话
 bankName	开户银行	string	否		开户银行
 bankAccountNumber	银行账号	string	否		银行账号
 phone	如申请人就是登录用户，则无需传	string	否		申请人就是登录用户，则无需传
* */
export const submitEleInvoice = param => {
  return request({
    headerUrl: 'web.financeInvoice.submitEleInvoice',
    method: 'post',
    hideErrMsg: true,
    data: {
      ...param
    }
  })
}


