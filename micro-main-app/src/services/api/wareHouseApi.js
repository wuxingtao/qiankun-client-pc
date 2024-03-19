/**
 * @Desc: wareHouseApi
 * @Author: wu xingtao
 * @Date: 2022/4/29
 */
import request from '@api/request'

class WareHouseApi{
  // 报关入仓-更新客户报关入仓确认状态
  updateWarehousingAgreeState(formDataLists) {
    return request({
      headerUrl: 'web.order.updateWarehousingAgreeState',
      method: 'post',
      data: formDataLists,
    })
  }
  // 报关入仓-入仓费查询
  getWarehousingPrice(params) {

    return request({
      headerUrl: 'web.order.getWarehousingPrice',
      method: 'post',
      data: params,
    })
  }
}

const wareHouseApi = new WareHouseApi()
export default wareHouseApi


