import userApi from '@/services/module/user'
import userUtil from '@/utils/user'
import * as loginApi from '@api/login'
import * as storageUtil from '@/utils/storage'

export default function(vm) {
  /**
   * 绑定客户编码
   * @param {string} param.customerCode 客户编码
   * @param {string} param.password 客户编码密码
   * @param {string} param.message 绑定成功提示语（默认为“绑码成功”）
   */
  const bindCustomerCode = async ({ customerCode, password, isChangCustomerCode }) => {
    const params = {
      customCode: customerCode,
      customPwd: password
    }
    const func = loginApi[isChangCustomerCode ? 'changeBindCustomerCode' : 'bindUserCode']
    let res = await func(params)
    if (res.code === 0) {
      res = await userApi.queryCustomerInfo(customerCode)
      if (res.code === 0) {
        storageUtil.setCustomerData(res.data)
      }
      let msg = '绑码成功'
      if(isChangCustomerCode){
        msg = '换绑成功'
      }
      vm.$message.success(msg)
      userUtil.checkGrayVersion('/admin/user')
      return true
    }
  }

  const unbindCustomerCode = async customerCode => {
    try {
      const res2 = await userApi.getUnbindWarnMessage()
      let msg = '解除绑码无法下单查件，大人请三思啊！'
      if (res2.code === 0 && res2.data) {
        msg = res2.data
      }
      await vm.$confirm(msg, '解除绑定确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
      const params = { customCode: customerCode }
      const res = await loginApi.unbindCode(params)
      if (res.code === 0) {
        setTimeout(()=>{
          storageUtil.setCustomerData({})
          location.reload()
        },1000)
      }
    } catch (ex) {
      console.log('unbind :>> ', ex)
    }
  }

  return {
    bindCustomerCode,
    unbindCustomerCode
  }
}
