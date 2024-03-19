import { exportExcel } from "@utils/clientUtil"

/**
 * 导出产品服务数据
 */
const SERVICE_COLUMNS = [
  { prop: 'index', text: '序号' },
  { prop: 'serviceModeName', text: '服务方式' },
  { prop: 'totalPollA', text: '总票数' },
  { prop: 'pickupTimeoutRatio', text: '取超时率' },
  { prop: 'externalCauseRatio', text: '内部履约率' },
  { prop: 'innerEfficacyRatio', text: '外因超时率' },
  { prop: 'timeoutRatio', text: '超时率' },
  { prop: 'signAnalysis012Ratio', text: '(1-12h]' },
  { prop: 'signAnalysis1224Ratio', text: '(12-24h]' },
  { prop: 'signAnalysis2448Ratio', text: '(24-48h]' },
  { prop: 'signAnalysis4872Ratio', text: '(48-72h]' },
  { prop: 'signAnalysis72Ratio', text: '72h以上' },
  { prop: 'exceptionPollMissRatio', text: '拉货' },
  { prop: 'deliveryTimelongPollRatio', text: '提货耗时长' },
  { prop: 'pickTimelongPollRatio', text: '派干耗时长' },
]

const SERVICE_HEAD = [
  ['序号', '服务方式', '总票数', '取超时率', '内部履约率', '外因超时率', '超时率', '寄-签耗时（票占比）', '', '', '', '', '超时原因（票占比）', '', ''],
  ['', '', '', '', '', '', '', '(1-12h]', '(12-24h]', '(24-48h]', '(48-72h]', '72h以上', '拉货', '提货耗时长', '派干耗时长']
]

const SERVICE_CELL_MERGE = ['A1:A2', 'B1:B2', 'C1:C2', 'D1:D2', 'E1:E2', 'F1:F2', 'G1:G2', 'H1:I1:J1:K1:L1', 'M1:N1:O1']

const exportServiceData = (data, filename = '各服务方式时效明细') => {
  let jsonData = data.map(item => {
    let obj = {...item}
    for (const key of Object.keys(obj)) {
      if (!['index', 'serviceModeName', 'totalPollA'].includes(key)) {
        obj[key] += '%'
      }
    }
    return obj
  })
  exportExcel({
    theadColumns: SERVICE_COLUMNS,
    jsonData,
    customizeThead: SERVICE_HEAD,
    cellMerges: SERVICE_CELL_MERGE,
    filename
  })
}


/**
 * 导出线路数据
 */
const LINE_COLUMNS = [
  { prop: 'index', text: '序号' },
  { prop: 'startCity', text: '发货城市' },
  { prop: 'endCity', text: '收货城市' },
  { prop: 'totalPollA', text: '总票数' },
  { prop: 'pickupTimeoutRatio', text: '取超时率' },
  { prop: 'externalCauseRatio', text: '内部履约率' },
  { prop: 'innerEfficacyRatio', text: '外因超时率' },
  { prop: 'timeoutRatio', text: '超时率' },
  { prop: 'signAnalysis012Ratio', text: '(1-12h]' },
  { prop: 'signAnalysis1224Ratio', text: '(12-24h]' },
  { prop: 'signAnalysis2448Ratio', text: '(24-48h]' },
  { prop: 'signAnalysis4872Ratio', text: '(48-72h]' },
  { prop: 'signAnalysis72Ratio', text: '72h以上' },
  { prop: 'exceptionPollMissRatio', text: '拉货' },
  { prop: 'deliveryTimelongPollRatio', text: '提货耗时长' },
  { prop: 'pickTimelongPollRatio', text: '派干耗时长' },
]

const LINE_HEAD = [
  ['序号', '发货城市', '收货城市', '总票数', '取超时率', '内部履约率', '外因超时率', '超时率', '寄-签耗时（票占比）', '', '', '', '', '超时原因（票占比）', '', ''],
  ['', '', '', '', '', '', '', '', '(1-12h]', '(12-24h]', '(24-48h]', '(48-72h]', '72h以上', '拉货', '提货耗时长', '派干耗时长']
]

const LINE_CELL_MERGE = ['A1:A2', 'B1:B2', 'C1:C2', 'D1:D2', 'E1:E2', 'F1:F2', 'G1:G2', 'H1:H2', 'I1:J1:K1:L1:M1', 'N1:O1:P1']

const exportLineData = (data, filename = '各线路时效明细') => {
  let jsonData = []
  for (let i = 0; i < data.length; i++) {
    let obj = {...data[i]}
    obj.index = i + 1
    for (const key of Object.keys(obj)) {
      if (!['index', 'startCity', 'endCity', 'totalPollA'].includes(key)) {
        obj[key] += '%'
      }
    }
    jsonData.push(obj)
  }
  exportExcel({
    theadColumns: LINE_COLUMNS,
    jsonData,
    customizeThead: LINE_HEAD,
    cellMerges: LINE_CELL_MERGE,
    filename
  })
}


/**
 * 导出月趋势图数据
 */
const MONTH_COLUMNS = [
  { prop: 'index', text: '序号' },
  { prop: 'month', text: '月份' },
  { prop: 'totalPollA', text: '总票数' },
  { prop: 'totalPollChainRatio', text: '总票数环比' },
  { prop: 'totalLineA', text: '线路' },
  { prop: 'totalLineChainRatio', text: '线路环比' },
  { prop: 'pickupTimeoutRatio', text: '取超时率' },
  { prop: 'pickupTimeoutChainRatio', text: '取超时率涨幅' },
  { prop: 'externalCauseRatio', text: '内部履约率' },
  { prop: 'externalCauseChainRatio', text: '内部履约率涨幅' },
  { prop: 'innerEfficacyRatio', text: '外因超时率' },
  { prop: 'innerEfficacyChainRatio', text: '外因超时率涨幅' },
  { prop: 'timeoutRatio', text: '超时率' },
  { prop: 'timeoutChainRatio', text: '超时率涨幅' }
]

const exportMonthData = (data, filename = '时效月趋势') => {
  let jsonData = data.map(item => {
    let obj = {...item}
    for (const key of Object.keys(obj)) {
      if (!['index', 'month', 'totalPollA', 'totalLineA'].includes(key)) {
        obj[key] += '%'
      }
    }
    return obj
  })
  exportExcel({
    theadColumns: MONTH_COLUMNS,
    jsonData,
    filename
  })
}

/**
 * 导出详情数据
 */
const DETAIL_COLUMNS = [
  { prop: 'index', text: '序号' },
  { prop: 'waybillNumber', text: '运单号' },
  { prop: 'serviceType', text: '服务方式' },
  { prop: 'consumingPromiseDuration', text: '承诺时长（h）' },
  { prop: 'actualConsumingTime', text: '实际耗时（h）' },
  { prop: 'timeoutTime', text: '超时时长（h）' },
  { prop: 'delayReason', text: '超时原因' },
  { prop: 'customerPayName', text: '付款公司' },
  { prop: 'piece', text: '件数' },
  { prop: 'deliveryAreaCode', text: '发货城市' },
  { prop: 'pickupAreaCode', text: '收货城市' },
  { prop: 'deliveryTime', text: '寄件时间' },
  { prop: 'deliverySign', text: '签到时间' },
  { prop: 'agentDeliveryAging', text: '承诺时间' },
  { prop: 'goodsType', text: '托寄物' }
]

const exportDetailData = (data, filename = '时效分析运单明细') => {
  exportExcel({
    theadColumns: DETAIL_COLUMNS,
    jsonData: data,
    filename
  })
}

export {
  exportServiceData,
  exportLineData,
  exportMonthData,
  exportDetailData
}