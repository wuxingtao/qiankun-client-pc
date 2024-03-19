import deliveryApi from '@api/delivery'
import commonUtil from '../../utils/commonUtil'

export default function({ vm, tableEditableRef, totalEstimateFreight }) {
  const estimateFreightFields = [
    'sjAddress',
    'qhAddress',
    'payWay',
    'payAccount',
    'serviceWay',
    'weight',
    'count',
    'sizeList',
    'dsMoney',
    'declaredValue',
    'receiptFlag',
    'mjWay',
    'checkedCustomsCharge'
  ]

  //重置表格中的预估运费
  const resetEstimateFreightInTable = modelList =>{
    if (!vm.$store.getters.hasFrightFeeAuth) {
      return
    }
    const editableTableData = tableEditableRef.value.editableTableData
    const modelNoList = modelList.map(m=>m.no)
    editableTableData.filter(row => modelNoList.includes(row.no.value))
      .forEach(row => {
        // const reduceAmount = row.estimateFreight.value?.reduceAmount
        // row.estimateFreight.value = reduceAmount?{reduceAmount}: {}
        if(!row.estimateFreight.value ){
          row.estimateFreight.value = {}
        }
        const freight = row.estimateFreight.value 
        Object.keys(freight).forEach(k=>{freight[k] = 0})
      })
  }

  const setEstimateFreightByBatchApi = async (modelList, fields) => {
    if (!vm.$store.getters.hasFrightFeeAuth) {
      return
    }
    if (fields?.length > 0 && !estimateFreightFields.find(f => fields.includes(f))) {
      return
    }
    try{
      vm.$store.commit('delivery/setLoadingOfBatchFreight',true)
      resetEstimateFreightInTable(modelList)
 
      const editableTableData = tableEditableRef.value.editableTableData
      const modelNoList = modelList.map(m=>m.no)
    
      const noList = editableTableData.filter(row => modelNoList.includes(row.no.value))
        .filter(row=>!row.sjAddress.errorInfo && !row.qhAddress.errorInfo)
        .map(row=>row.no.value)
      if (noList.length > 0) {
        const tempModelList = modelList.filter(m => noList.includes(m.no))
        const result = await deliveryApi.getEstimateFreight(tempModelList)
      result?.forEach(r => {
        const row = editableTableData.find(d => d.no.value == r.onlyOne)
        Object.assign(row.estimateFreight.value,r.feeResponse)
        // row.estimateFreight.value = r.feeResponse
      })
      }
      calculateTotalEstimateFreight()
    }finally{
      vm.$store.commit('delivery/setLoadingOfBatchFreight',false)
    }
  }

  //计算合计预估运费
  const calculateTotalEstimateFreight = () => {
    if (!vm.$store.getters.hasFrightFeeAuth) {
      return
    }
    const editableTableData = tableEditableRef.value.editableTableData
    const freight = {}
    let count = 0
    let lessThanLowest = false // 判断是否存在某一单运费比最低运费低
    editableTableData.forEach(row => {
      const freightInfo = row.estimateFreight.value || {}
      const exsitEstmateFreight = /\d/.test(commonUtil.getEstimateTotalFreightByRow(row))
      if(row.payWay.value === '10' && !exsitEstmateFreight){
        count++
        return
      }
      // 单票存在最低费用大于等于预估运费标识判断
      if(Number(freightInfo.waybillAmount) <= Number(freightInfo.singleLowestAmount)) {
        lessThanLowest = true
      }
      if(freightInfo.waybillAmount ==0 ){
        return
      }
      Object.keys(freightInfo).forEach(key => {
        // 最低批次运费同一个客户编码只有一个固定值，不能累加
        if(key !== 'lowestBatchCharge') {
          freight[key] = (freight[key] || 0) + (freightInfo[key] || 0)
        } else {
          freight[key] = freightInfo[key] || 0
        }
      })
    })
    vm.$store.commit('delivery/setRowCountWithoutFreight',count)
    const afterDiscountAmount = freight.totalAmount - (freight?.reduceAmount || 0)
    freight.afterDiscountAmount = afterDiscountAmount
    freight.lessThanLowest = lessThanLowest
    // freight.lessThanLowest = true
    totalEstimateFreight.value = freight
  }
  
  return {
    calculateTotalEstimateFreight,
    resetEstimateFreightInTable,
    setEstimateFreightByBatchApi
  }
}
