
import * as paymentAuthApi from '@/services/api/pyAuth'
import { getPhone } from '@/utils/storage'

export default function({vm,paymentAuthRef,visibleOfpaymentAuth}){
  const handlePaymentAuth = async data => {
    const result = await paymentAuthApi.add({
      customerPayAuths: [
        {
          applyCustomerCode: data.customer,
          applyCustomerName: data.company,
          applyName: data.proposer,
          applyReason: data.jjRemark,
          applyMobile: getPhone(),
        },
      ],
      addType: '20',
      customerCode: data.authorizationAccount,
    })
    if (result && result.code === 0) {
      if (((result.data.infos || [])[0] || {}).executeCode === 20) {
        vm.$message({
          message: `${((result.data.infos || [])[0] || {}).executeResult}`,
          type: 'error',
        })
        return
      }
      paymentAuthRef.value.resertFormData()
      vm.$message({
        message: '提交成功',
        type: 'success',
      })
      visibleOfpaymentAuth.value = false
    }
  }

  const checkPaymentAuth = async payAccount=>{
    return await paymentAuthApi.checkPaymentAuth(payAccount)
  }

  return {
    handlePaymentAuth,
    checkPaymentAuth
  }
}