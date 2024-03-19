/* eslint-disable semi */
import request from './request'
import { getLoginData, getCustomerCode, getPhone } from '@/utils/storage'
import dayjs from 'dayjs'

//联系账务
export function contactFinancial() {
  return request({
    headerUrl: 'PC-GetFinanceContactWay',
    method: 'post',
    data: { mobile: getPhone(), companyNo: getCustomerCode() },
  })
}

//下载账单
export function downLoadBillApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'fms.billMonthlyOnlineCheck.getBillMonthlyDownloadFileUrl',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
    hideErrMsg: false,
  })
}

//下载批次報表
export function downLoadReportApi(params) {
  return request({
    headerUrl: 'gw.account.statistics.statisticsBizCode',
    method: 'post',
    data: params,
  })
}

//查询埋点统计类型
export function queryEventTrackingStatisticsTypesApi(params) {
  return request({
    headerUrl: 'gw.account.statistics.queryStatisticsTypes',
    method: 'post',
    data: params,
  })
}

//查询埋点总量统计数据
export function queryEventTrackingStatisticDataApi(params) {
  return request({
    headerUrl: 'gw.account.statistics.statisticsBizCode',
    method: 'post',
    data: params,
  })
}

//查询埋点账号统计数据
export function queryEventTrackingStatisticAccountDataApi(params) {
  return request({
    headerUrl: 'gw.account.statistics.statisticsCustomerCodeByPage',
    method: 'post',
    data: params,
  })
}

//查询埋点用户统计图表数据
export function queryEventTrackingStatisticPersonApi(year) {
  const params = {
    year: year,
  }
  return request({
    headerUrl: 'gw.account.statistics.statisticsPerson',
    method: 'post',
    data: params,
  })
}

//查询埋点页面或事件统计图表数据
export function queryEventTrackingStatisticByTypeApi(startTime, endTime, biztype = 10) {
  const loginInfo = getLoginData()
  let startTimer = startTime ? dayjs(startTime).format('YYYY-MM-DD 00:00:00') : ''
  let endTimer = endTime ? dayjs(endTime).format('YYYY-MM-DD 23:59:59') : ''
  const params = {
    customerCode: loginInfo.customerCode,
    startTime: startTimer,
    endTime: endTimer,
    bizType: biztype, //10:页面，20：事件
  }
  return request({
    headerUrl: 'gw.account.statistics.statisticsByBizType',
    method: 'post',
    data: params,
  })
}

// //查询埋点数据
// export function queryEventTrackingApi() {
//     const loginInfo = getLoginData();
//     const params = {
//         customerCode: loginInfo.customCode,
//         startTime: "2019-12-07 10:00:00",
//         endTime: "2019-12-07 23:59:59",
//         bizType: null,
//         bizCode: "",
//         operator: "",
//         pageNo: 1,
//         pageSize: 100
//     };
//     return request({
//         headerUrl: "gw.account.statistics.queryByPage",
//         method: "post",
//         data: params
//     });
// }

//新增埋点数据
export function addEventTrackingApi(bizType, bizCode) {
  const loginInfo = getLoginData()
  const params = {
    customerCode: loginInfo.customerCode,
    bizType: bizType,
    bizCode: bizCode,
    operator: loginInfo.phone,
    marketingStaff: loginInfo.marketer,
  }
  return request({
    headerUrl: 'gw.account.statistics.record',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//地址联想
export function addressSuggestApi(params) {
  return request({
    headerUrl: 'map.bsm.suggest.findsuggest',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}
//上传文件
export function uploadFileApi(params) {
  return request({
    headerUrl: 'gw.upload.file',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}
//开票推送
export function pushMakeInvoiceMessageApi(params) {
  return request({
    headerUrl: 'gw.invoice.iaaPush',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//开票资料申请推送
export function pushAddInvoiceInfoMessageApi(params) {
  return request({
    headerUrl: 'gw.billing.iaaPush',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//异常申诉推送
export function pushAddAppealMessageApi(params) {
  return request({
    headerUrl: 'gw.appeal.iaaPush',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//发票签收
export function signInvoiceApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'fms.invoice.signInvoice',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
    hideErrMsg: true,
  })
}
//申请开票
export function makeInvoiceApi(params) {
  return request({
    headerUrl: 'gw.account.applyInvoice',
    method: 'post',
    data: params,
  })
}
//发票记录查询
export function getInvoiceRecordInfosApi(params) {
  return request({
    headerUrl: 'web.frontFms.invoiceAppInvoiceQuery',
    method: 'post',
    data: params,
  })
  // return request({
  //     headerUrl: "gw.foward.api-auth",
  //     data: {
  //         method: "fms.invoice.appInvoiceQuery",
  //         param: JSON.stringify(params)
  //     },
  //     method: "post",
  //     token: false,
  //     hideErrMsg: true
  // });
}

// 查询客户开票标识
export function getInvoiceFlagApi(params) {
  return request({
    headerUrl: 'gw.account.queryInvoiceFlag',
    method: 'post',
    data: params,
  })
}

//异常申诉查询
export function getAppealInfosApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'fms.billMonthlyOnlineCheck.query', //fms.billMonthlyOnlineCheck.search
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
    hideErrMsg: true,
  })
}
//异常申诉汇总信息查询
export function getAppealSummaryInfoApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'fms.billMonthlyOnlineCheck.queryByPageStatistics',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
    hideErrMsg: true,
  })
}

//异常申诉详情查询
export function getAppealInfoDetailApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'fms.billMonthlyOnlineCheck.getByBatchNumber',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
    hideErrMsg: true,
  })
}

//新增或修改申诉
export function addOrModifyAppealApi(params) {
  return request({
    headerUrl: 'gw.waybill.apealSaveOrModify',
    method: 'post',
    data: params,
  })
}

//账单汇总信息查询
export function getBillSummaryInfoApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth', //'gw.foward.api',
    data: {
      method: 'fms.billBase.selectBillReconciliationInfoList',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
    hideErrMsg: true,
  })
}

// 查询账单状态
export function queryBillStatus(params) {
  return request({
    headerUrl: 'PC-GetReconciliationsMonths',
    method: 'post',
    data: params,
  })
}

// 查询账单明细或下载
export async function searchBillsApi(params) {
  const res = await request({
    headerUrl: 'PC-GetReconciliationsDetailList',
    method: 'post',
    data: params,
  })
  if(res.code === 0 && res.data?.dataList){
    res.data.dataList.forEach(item=>{
      item.premium = item.addServiceFee.premium
    })
  }
  return res
}

// 确认账单
export function confirmBillsApi(params) {
  return request({
    headerUrl: 'PC-ConfirmReconciliations',
    method: 'post',
    data: params,
  })
}
//客户财务信息查询
export function getCustomerFinanceInfoApi(params) {
  return request({
    headerUrl: 'gw.foward.api-auth', //'gw.foward.api',
    data: {
      method: 'crm.customer.finance.get',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
  })
}

// 下载账单明细excel
export function downLoadBillExcelApi(params) {
  return request({
    headerUrl: 'PC-ExportBill',
    method: 'post',
    data: params,
  })
}
// 下载账单pdf
export function downLoadBillPdfApi(params) {
  return request({
    headerUrl: 'gw.account.download.pdf',
    method: 'post',
    data: params,
  })
}
//获取路由详情
export function getRoutesApi(params) {
  return request({
    headerUrl: 'E-AWBRoute',
    method: 'post',
    data: params,
  })
}

//获取运单图片
export function getWaybillImagesApi(params) {
  return request({
    headerUrl: 'PC-DownloadWaybillPic',
    method: 'post',
    data: params,
  })
}

//新增开票资料
export function addInvoiceInfoApi(params) {
  return request({
    headerUrl: 'gw.account.invoice.save',
    method: 'post',
    data: params,
  })
}

//查询开票资料
export function getInvoiceInfoListApi(params) {
  return request({
    headerUrl: 'gw.account.invoice.list',
    method: 'post',
    data: params,
  })
}

//获取表格配置
export function getGridConfigApi(params) {
  return request({
    headerUrl: 'gw.gridConfig.queryGridConfig',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//新增表格配置
export function addGridConfigApi(params) {
  return request({
    headerUrl: 'gw.gridConfig.addGridConfig',
    method: 'post',
    data: params,
  })
}

//修改表格配置
export function modifyGridConfigApi(params) {
  return request({
    headerUrl: 'gw.gridConfig.updateGridConfig',
    method: 'post',
    data: params,
  })
}

// 获取打印机列表
export function getPrinters(params) {
  return request({
    headerUrl: 'KYE_GetPrinters',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//确认账单，发送邮件
export function sendEmail(params) {
  return request({
    headerUrl: 'gw.foward.api-auth', //'gw.foward.api',
    data: {
      method: 'fms.billMonthlyOnlineCheck.sendEmail',
      param: JSON.stringify(params),
    },
    method: 'post',
    token: false,
  })
}

// 申诉回复查询
export function getAppealTips(params) {
  return request({
    headerUrl: 'gw.appealTip.getAppealTips',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

// 申诉回复修改
export function updateAppealTip(params) {
  return request({
    headerUrl: 'gw.appealTip.updateAppealTip',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//下载账单
export function getFileUrls(params) {
  return request({
    headerUrl: 'web.financeInvoice.getFileUrls',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//查询埋点统计类型
export async function getEventTrackingTypes() {
  let items = localStorage.getItem('EventTrackingTypes-Data')
  if (items) {
    return JSON.parse(items)
  }
  let res = await queryEventTrackingStatisticsTypesApi({
    customerCode: getCustomerCode(),
  })
  if (res.data && res.data.length > 0) {
    localStorage.setItem('EventTrackingTypes-Data', JSON.stringify(res.data))
    return res.data
  }
}
