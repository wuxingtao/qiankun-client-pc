import deliveryApi from '@api/delivery'
import { reactive } from '@vue/composition-api'
import * as storageUtil from '@/utils/storage'

export default function ({vm,tableEditableRef,dialogSuperZoneRef}) {
  const  superZoneOptions =  reactive( { '20': '送货上门', '10': '网点自提' })

  const checkSuperZone = async row => {
    if (!row.payWay.value) {
      vm.$message.warning('请先选择付款方式')
      return
    }
    const payWay = row.payWay.value 
    let payAccount = storageUtil.getCustomerCode()
    const paymentCustomerCode = row.paymentCustomerCode.value
    if(payWay === '20' && paymentCustomerCode){
      payAccount = paymentCustomerCode
    }else if(payWay === '30'){
      payAccount = row.payAccount.value || payAccount
    }
    const qhAddress = row.qhAddress.value
    const sjAddress = row.sjAddress.value
    let msg = payAccount ? '' : '请先输入付款账号' 
    msg = msg || (qhAddress ? '' : '请先输入取货地址')
    msg = msg || (sjAddress ? '' : '请先输入收件地址')
    if(msg){
      vm.$message.warning(msg)
      return
    }
    const res = await deliveryApi.querySuperzoneInfo(qhAddress, sjAddress, payAccount)
    if (res.code === 0) {
      row.superZoneDistance = {value:res.data&&res.data['length']}
      row.deliveryMode = {value:''}
      if ( res.data.superZone === 1) {
        if (res.data.superAreaDeliverFlag === 0) {
          row.superZoneTip.value = ''
          row.superZoneTip.errorInfo = '当前地址不支持派送,请切换收件地址'
        } else if (res.data.selfLiftingAddress) {
          const sjMobile = row.selfPickupMobile?.value || row.sjMobile.value 
          const payWay = row.payWay.value
          const result = await dialogSuperZoneRef.value.showDialog(res.data,{sjAddress,sjMobile,payWay})
          if(!result){
            return false
          }
          row.deliveryMode = {value:result.deliveryMode}
          row.selfPickupMobile = {value:result.selfPickupMobile}
          const deliveryModeText = superZoneOptions[result.deliveryMode]
          row.superZoneTip.value = `您已选择【${deliveryModeText}】`
          row.superZoneTip.errorInfo = ''
          tableEditableRef.value.setErrorCount()    
          return true
        } else {
          row.superZoneTip.value = ''
          row.superZoneTip.errorInfo = '当前地址没维护自提网点地址,请切换收件地址'
        }
      } else {
        row.superZoneTip.value = ''
        row.superZoneTip.errorInfo = ''
        return true
      }
    }
  }

  return {
    checkSuperZone
  }
  
}