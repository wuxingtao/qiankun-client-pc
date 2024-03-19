import request from '@/services/api/request'

class selfSign{
  //查询收方本人签收
  getWebPickup() {
    return request({
      headerUrl: 'web.uam.selfSign.getWebPickup',
      data: {},
      method: 'post',
    })
  }

  //修改收方本人签收（弹窗）
  updateWebPickup(params) {
    return request({
      headerUrl: 'web.uam.selfSign.updateWebPickup',
      data: params,
      method: 'post',
    })
  }

  //修改运单本人签收状态（保存）
  updateWaybillPickup(params) {
    return request({
      headerUrl: 'web.uam.selfSign.updateWaybillPickup',
      data: params,
      method: 'post',
    })
  }

  //查询（个人/公司）已下单未签收运单数量
  getPickupWaybillNumberCount(params) {
    return request({
      headerUrl: 'web.uam.selfSign.getPickupWaybillNumberCount',
      data: params,
      method: 'post',
    })
  }

  //.获取运单本人签收
  getPreference(params) {
    return request({
      headerUrl: 'web.query.preference.getPreference',
      data: params,
      method: 'post',
    })
  }

  //获取用户权限
  getUserExternalType() {
    return request({
      headerUrl: 'web.uam.net.appUser.getUserExternalType',
      data: {},
      method: 'post',
      hideErrMsg:true
    })
  }
}

export default new selfSign()