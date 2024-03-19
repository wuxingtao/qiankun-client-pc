/**
 * @Desc: AddressDistrictSession 地址组件缓存
 * @Author: wu xingtao
 * @Date: 2021/11/13
 */
import StorageBase from '@comps/ky-address/utils/StorageBase'


class AddressDistrictSession extends StorageBase{
  constructor (props) {
    super(props)
  }

  getSessionDistrict (districtId){
    const sessionId = districtId || 'province'
    const item = this.getById(sessionId)
    if(!item){
      return null
    }else{
      return {
        code: 0,
        data: {districtList: item.value }
      }
    }
  }
  // 仅存储省市区
  setId (districtId,data){
    if(data.districtLevel === 'province'){
      districtId = 'province'
    }
    if (data?.districtLevel && ['province', 'city', 'zone'].indexOf(data.districtLevel) !== -1) {
      this.setById(districtId || 'province', data.districtList)
    }
  }

}


const addressDistrictSession = new AddressDistrictSession({ key: 'districtLists', sessionName: 'address_district_session' })


export default addressDistrictSession
