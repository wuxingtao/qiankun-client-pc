import * as supplierApi from '@/services/api/supplier'
import { getFormData } from '../utils/formData'

export default function() {
  //批量导入时加载供应商订单信息
  const loadSupplierOrdersInBatchImport = supplierOrderList => {
    if (!supplierOrderList || supplierOrderList.length < 1) {
      return
    }
    if (new Set(supplierOrderList.map(m => m.supplierName)).size <= 1) {
      return
    }
    const rows = supplierOrderList.map(item => {
      const row = { ...getFormData() }
      //寄方信息
      setSenderData(row, item)
      //收方信息
      setReceiverData(row, item)
      return row
    })
    return rows
  }

  //批量填写时加载供应商订单信息
  const loadSupplierOrdersInBatchFill = (formData, supplierOrderList) => {
    if (!supplierOrderList || supplierOrderList.length < 1) {
      return
    }
    setSenderData(formData, supplierOrderList[0])
    const rows = supplierOrderList.map(item => {
      //收方信息
      const row = { ...formData }
      setReceiverData(row,item)
      return row
    })
    return rows
  }

  //单票时加载供应商订单信息
  const loadSupplierOrderInfo = (formData, item) => {
    if (!item) {
      return
    }
    setSenderData(formData, item)
    setReceiverData(formData, item)
  }

  const setSenderData = (inFormData, supplierItem) => {
    //寄方信息
    inFormData.jjCompany = supplierItem.supplierName
    inFormData.jjContactPerson = supplierItem.supplierContract
    inFormData.sms = supplierItem.supplierPhone
    inFormData.qhAddress = supplierItem.supplierAddress
  }

  const setReceiverData = (inFormData, supplierItem) => {
    inFormData.allocationId = supplierItem.id
    //收方信息
    inFormData.sjCompany = supplierItem.reveiverCompany
    inFormData.sjContactPerson = supplierItem.receiverContract
    inFormData.sjMobile = supplierItem.receiverPhone
    inFormData.sjAddress = supplierItem.reveiverAddress
    //托寄物
    const goods = supplierItem.itemInfoVos
      ?.map(m => `${m.itemName}(${m.nums}${m.itemUnit})`)
      .join('];[')
    if (goods) {
      inFormData.goods = `[${goods}]`
    }
  }

  const updateAllocationWaybillNumber = formDataList => {
    try {
      if (!Array.isArray(formDataList)) {
        formDataList = [formDataList]
      }
      const params = formDataList
        .filter(f => f.allocationId)
        .map(m => ({ waybillNumber: m.ydNo, id: m.allocationId }))
      if (params.length > 0) {
        supplierApi.updateAllocationWaybillNumber(params)
      }
    } catch {
      // console.log(object);
    }
  }

  return {
    loadSupplierOrderInfo,
    loadSupplierOrdersInBatchFill,
    loadSupplierOrdersInBatchImport,
    updateAllocationWaybillNumber,
  }
}
