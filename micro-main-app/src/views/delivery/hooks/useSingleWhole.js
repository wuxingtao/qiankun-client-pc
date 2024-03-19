import deliveryApi from '@/services/api/delivery'
import * as storageUtil from '@/utils/storage'
import { nextTick } from '@vue/composition-api'

export default function({ vm, formData, shareData, singleInfoSenderRef, singleInfoReceiverRef,singleInfoBaseAddtionalRef }) {
  const getModel = async () => {
    if (!formData.ydNo) {
      await setWaybillNo()
    }
    let model = Object.assign({}, formData)
    if (model.payWay === '10') {
      model.payAccount = storageUtil.getCustomerCode()
    }
    model.receiptFlag = model.receiptFlag || '20'
    return model
  }

  const setWaybillNo = async () => {
    let res = await deliveryApi.getWaybillNos()
    if (res.code === 0 && res.data) {
      formData.ydNo = res.data[0]
    }
  }

  //清除地址的错误提示，isRestrict为true时同时清除限取派的提示
  const resetAddressErrorAndWaningMsg = isRestrict => {
    const senderRef = singleInfoSenderRef.value
    const receiverRef = singleInfoReceiverRef.value
    if (senderRef) {
      senderRef.errorMsgs.qhAddress = ''
      senderRef.warningMsgs.qhAddress = ''
      if(isRestrict){
        senderRef.errorMsgs.qhAddressRestrict = ''
        senderRef.warningMsgs.qhAddressRestrict = ''
      }
    }
    receiverRef.errorMsgs.sjAddress = ''
    receiverRef.warningMsgs.sjAddress = ''
    if(isRestrict){
      receiverRef.errorMsgs.sjAddressRestrict = ''
      receiverRef.warningMsgs.sjAddressRestrict = ''
    }
  }

  //设置限取派提示
  const setAddressRestrictMsgs = resData =>{
    if(!resData){
      return 
    }
    const senderRef = singleInfoSenderRef.value
    const receiverRef = singleInfoReceiverRef.value
    resData?.errorResult?.forEach(e => {
      switch (e.field) {
        case 'sjAddress':
          receiverRef.errorMsgs.sjAddressRestrict = e.msg
          break
        case 'qhAddress':
          senderRef && (senderRef.errorMsgs.qhAddressRestrict = e.msg)
          break
      }
    })
    resData?.warnResult?.forEach(e => {
      switch (e.field) {
        case 'sjAddress':
          receiverRef.warningMsgs.sjAddressRestrict = e.msg
          break
        case 'qhAddress':
          senderRef && (senderRef.warningMsgs.qhAddressRestrict = e.msg)
          break
      }
    })
  }

  const setAddressErrorMsg = errorResult => {
    if (!errorResult) {
      return
    }
    const senderRef = singleInfoSenderRef.value
    const receiverRef = singleInfoReceiverRef.value
    errorResult.filter(e=>['sjAddress','qhAddress'].includes(e.field)&&e.msg!=='详细地址不可为空').forEach(e => {
      switch (e.field) {
        case 'sjAddress':
          receiverRef.errorMsgs.sjAddress = e.msg
          break
        case 'qhAddress':
          senderRef && (senderRef.errorMsgs.qhAddress = e.msg)
          break
      }
    })
  }

  const setAddressWarningMsg = warnResult => {
    const senderRef = singleInfoSenderRef.value
    const receiverRef = singleInfoReceiverRef.value
    const getWarnMsg = field => {
      const msgs = warnResult?.filter(f => f.field === field).map(m => m.msg)
      if (!msgs) {
        return ''
      }
      if (msgs.length === 1) {
        return msgs[0]
      } else if (msgs.length > 1) {
        return msgs.reduce((init, cur, index) => {
          init += `${index + 1}.${cur}</br>`
          return init
        }, '')
      }
    }
    const qhAddressMsg = getWarnMsg('qhAddress')
    const sjAddressMsg = getWarnMsg('sjAddress')
    senderRef && qhAddressMsg && (senderRef.warningMsgs.qhAddress = qhAddressMsg)
    sjAddressMsg && (receiverRef.warningMsgs.sjAddress = sjAddressMsg)
  }

  const setdCollectionPriceDisableStatus = resData => {
    shareData.disabledCollectionPrice = false
    const businessData = resData?.businessData
    if (businessData && businessData.feature != 0) {
      shareData.disabledCollectionPrice = true
      formData.dsMoney = ''
      formData.dsCommission = ''
    }
  }
  
  /**
   * 设置地址和代收货款校验结果
   * @param {Object} resData 校验接口返回的数据res.data
   * @param {Array} warnResult 提示信息，结构与res.data.warnResult一致
   */
  const setAddressValidateResultTip = (resData, warnResult) => {
    resetAddressErrorAndWaningMsg()
    setdCollectionPriceDisableStatus(resData)
    nextTick(()=>{
      setAddressErrorMsg(resData?.errorResult)
      const tempWarnResult = resData?.warnResult || []
      warnResult && tempWarnResult.push(...warnResult)
      setAddressWarningMsg(tempWarnResult)
    })
  }

  const setGoodsInfoValidateResultTip = (fields,resData)=>{
    const ref = singleInfoBaseAddtionalRef.value
    fields.forEach(f=>{
      if(ref.errorMsgs.hasOwnProperty(f)){
        ref.errorMsgs[f] = ''
      }
    })
    nextTick(()=>{
      resData?.errorResult?.filter(f=>ref.errorMsgs.hasOwnProperty(f.field))?.forEach(r=>{
        ref.errorMsgs[r.field] = r.msg
      })
    })
  }

  return {
    getModel,
    setWaybillNo,
    setGoodsInfoValidateResultTip,
    setAddressValidateResultTip,
    resetAddressErrorAndWaningMsg,
    // setAddressErrorMsg,
    setAddressRestrictMsgs,
    setdCollectionPriceDisableStatus
    // setAddressWarningMsg
  }
}
