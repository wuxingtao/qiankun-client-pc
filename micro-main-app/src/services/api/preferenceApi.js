import request from '@api/request'

/**
 * @Desc: preferenceApi
 * @Author: wu xingtao
 * @Date: 2022/1/10
 */
class PreferenceApi {
  // 个人中心：查询收方个人/收方公司偏好设置 (V1.0) <10 个人, 20 公司>
  delivery_preference_get(type = 10) {
    return request({
      headerUrl: 'web.client.deliveryPreference.getPreference',
      method: 'post',
      data: { type },
      hideErrMsg: false
    })
  }

  // 个人中心：修改收方个人/收方公司偏好设置 (V1.0)
  delivery_preference_update(params = {}) {
    return request({
      headerUrl: 'web.client.deliveryPreference.updatePreference',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  // <弃用> 修改派送时间前获取需派时效 (V1.0) <用于修改派送时间 时间可选范围控制>
  delivery_preference_getFinalAging(waybillNumber) {
    return request({
      headerUrl: 'web.client.deliveryPreference.getFinalAging',
      method: 'post',
      data: {waybillNumber},
      hideErrMsg: false
    })
  }

  // 运单路由：查询偏好设置 (V1.0)
  delivery_preference_waybill(waybillNumber) {
    return request({
      headerUrl: 'web.client.deliveryPreference.getWaybillNumberPreference',
      method: 'post',
      data: { waybillNumber },
      hideErrMsg: false
    })
  }

  // DELETE 弃用-运单路由：是否需要修改派送时间并获取需派时效 (V1.0)
  // delivery_preference_validFinalAging() {
  //   return request({
  //     headerUrl: 'web.client.deliveryPreference.vaildUpdateFinalAging',
  //     method: 'post',
  //     data: {},
  //     hideErrMsg: false
  //   })
  // }

  // 运单路由：运单偏好设置修改 (V1.0)
  delivery_preference_waybill_update(params = {}) {
    return request({
      headerUrl: 'web.client.deliveryPreference.updateWaybillNumberPreference',
      method: 'post',
      data: {
        ...params,
        source: 30
      },
      hideErrMsg: true
    })
  }

  getUserExternalType() {
    return request({
      headerUrl: 'web.uam.net.appUser.getUserExternalType',
      method: 'post',
      data: {},
      hideErrMsg: false
    })
  }

  //获取偏好设置权限及提示
  getPreferenceSetting(params) {
    return request({
      headerUrl: 'web.query.preference.getPreference',
      data: params,
      method: 'post',
    })
  }


}

const preferenceApi = new PreferenceApi()
export default preferenceApi
