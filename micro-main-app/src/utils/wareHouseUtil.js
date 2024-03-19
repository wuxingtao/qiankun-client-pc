import wareHouseApi from '@api/wareHouseApi'
import { getCustomerCode } from '@/utils/storage'

/**
 * @Desc: wareHouseUtil
 * @Author: wu xingtao
 * @Date: 2022/4/29
 */
class WareHouseUtil {
  getPointEditTableData(modelList) {
    if(!modelList || modelList.length < 1){
      return []
    }
    // 命中数据
    return modelList.filter(item => item.checkedCustomsCharge === '10').map(f=>{
      return {
        ...f,
        ...f.clientOrderWarehouseResponse
      }
    })
  }

  /**
   *
   * @param pointEditTableData 命中数据
   * @returns {{warehousingList: *}}
   */
  batchWaybillFormat(pointEditTableData) {
    const sendCustomerCode = getCustomerCode()
    const warehousingList = pointEditTableData.map(item => {
      const { payWay, serviceWay, qhAddress, sjAddress, ydNo='' } = item
      return {
        id: item.no,
        payMode: payWay,
        serviceType: serviceWay,
        beginAddress: qhAddress,
        endAddress: sjAddress,
        // waybillNumber: ydNo,
        sendCustomerCode
      }
    })
    return { warehousingList }
  }

  /**
   * 报关入仓库-费用提醒参数获取-单票/修改运单
   * @param formData
   * @param waybillNumber
   * @returns {{warehousingList: [{serviceType, beginAddress, waybillNumber, payMode, id: number, endAddress}]}}
   */
  singleWaybillFormat(formData, waybillNumber = '') {
    const { payWay, serviceWay, qhAddress, sjAddress, ydNo } = formData
    const warehousingList = [
      {
        id: 1,
        payMode: payWay,
        serviceType: serviceWay,
        beginAddress: qhAddress,
        endAddress: sjAddress,
        // waybillNumber: ydNo,
        sendCustomerCode: getCustomerCode()
      }
    ]
    return {
      warehousingList
    }
  }

  async handleBatchWaybillWareHouse(modelList) {
    const params = this.batchWaybillFormat(modelList)
    return await wareHouseApi.getWarehousingPrice(params)
  }
}

const wareHouseUtil = new WareHouseUtil()
export default wareHouseUtil
