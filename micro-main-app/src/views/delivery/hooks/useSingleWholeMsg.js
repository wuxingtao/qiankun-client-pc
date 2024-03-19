import deliveryUtil from '@/utils/deliveryUtil'

export default function({
  singleInfoSenderRef,
  singleInfoReceiverRef,
  singleInfoBaseAddtionalRef,
  singleInfoRemarksRef
}) {
  const getAllRefs = () => {
    const senderRef = singleInfoSenderRef?.value
    const receiverRef = singleInfoReceiverRef.value
    const baseAddtionalRef = singleInfoBaseAddtionalRef.value
    const remarksRef = singleInfoRemarksRef.value
    const refs = [senderRef, receiverRef, baseAddtionalRef, remarksRef].filter(f => f)
    return refs
  }

  const resetErrorAndWarningMsgs = refs => {
    refs.forEach(r => {
      r.errorMsgs &&
        Object.keys(r.errorMsgs).forEach(key => {
          r.errorMsgs[key] = ''
        })
      r.warningMsgs &&
        Object.keys(r.warningMsgs).forEach(key => {
          r.warningMsgs[key] = ''
        })
    })
  }

  //将表格行的数据赋值到单票组件上
  const assignToSingleByTableRow = row => {
    if(!row){
      return
    }
    const addtionalRef = singleInfoBaseAddtionalRef.value.$refs.singleInfoAddtionalRef
    if(addtionalRef){
      addtionalRef.customsChargeInfo = row.checkedCustomsCharge.data || {}
    }
  }
  //将单票组件数据赋值到表格行上
  const setTableRowBySingle = row => {
    if(!row){
      return
    }
    const addtionalRef = singleInfoBaseAddtionalRef.value.$refs.singleInfoAddtionalRef
    if(addtionalRef){
      row.checkedCustomsCharge.data = addtionalRef.customsChargeInfo || {}
    } 
  }

  //批量导入或填写修改时展示错误信息
  const displayErrorAndWarningInfoByTableRow = row => {
    if (!row) {
      return
    }
    assignToSingleByTableRow(row)
    const refs = getAllRefs()
    const baseAddtionalRef = singleInfoBaseAddtionalRef.value
    baseAddtionalRef.serviceWayTip = row.serviceWay.data
    baseAddtionalRef.validAddtionalForm()
    resetErrorAndWarningMsgs(refs)
    setTimeout(() => {
      refs.forEach(r => {
        r.errorMsgs &&
          Object.keys(r.errorMsgs).forEach(key => {
            const error = row[key]?.errorInfo
            error && (r.errorMsgs[key] = error)
          })
        r.warningMsgs &&
          Object.keys(r.warningMsgs).forEach(key => {
            const warning = row[key]?.warningInfo
            warning && (r.warningMsgs[key] = warning)
          })
      })
    }, 10)

    const addtionalRef = singleInfoBaseAddtionalRef.value
    addtionalRef.canEditPayCompany = !['10','20'].includes(row.paymentCustomerName?.queryPayAuthSource)
  }

  //批量导入或填写修改时把错误信息回写至表格数据行中(暂时只用于批量导入修改多条数据切换时)
  const setTableRowErrorAndWarningInfo = row => {
    setTableRowBySingle(row)
    const refs = getAllRefs()
    const getRowKey = key => {
      if (['sjAddressRestrict', 'qhAddressRestrict'].includes(key)) {
        return key.replace('Restrict', '')
      }
      return key
    }
    const addtionalRef = singleInfoBaseAddtionalRef.value
    row.serviceWay.options = addtionalRef.serviceWayOptions
    refs.forEach(r => {
      r.errorMsgs &&
        Object.keys(r.errorMsgs).forEach(key => {
          const rowKey = getRowKey(key)
          row[rowKey].errorInfo = r.errorMsgs[key]
        })
      r.warningMsgs &&
        Object.keys(r.warningMsgs).forEach(key => {
          const rowKey = getRowKey(key)
          row[rowKey].warningInfo = r.warningMsgs[key]
        })
    })
  }

  const setErrorAndWarningMsgsByValidteData = async resData => {
    const refs = getAllRefs()
    resetErrorAndWarningMsgs(refs)
    await deliveryUtil.sleep(10)
    refs.forEach(r => {
      if (resData.errorResult?.length > 0 && r.errorMsgs) {
        Object.keys(r.errorMsgs).forEach(key => {
          const msg = resData.errorResult.find(f => f.field === key)?.msg || ''
          r.errorMsgs[key] = msg
        })
      }
      if (resData.warnResult?.length > 0 && r.warningMsgs) {
        Object.keys(r.warningMsgs).forEach(key => {
          const msg = resData.warnResult.find(f => f.field === key)?.msg || ''
          r.warningMsgs[key] = msg
        })
      }
    })
  }

  return {
    displayErrorAndWarningInfoByTableRow,
    setTableRowErrorAndWarningInfo,
    setErrorAndWarningMsgsByValidteData
  }
}
