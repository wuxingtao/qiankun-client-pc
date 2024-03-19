import deliveryApi from '@api/delivery'
import { computed } from '@vue/composition-api'

export default function({ vm, formData, shareData }) {
  const queryWareHouses = async queryString => {
    const warehouseType = vm.$store.getters.warehouseType
    if (!warehouseType) {
      return []
    }
    if (!queryString && shareData.allWareHouseList && shareData.allWareHouseList.length > 0) {
      return shareData.allWareHouseList
    }
    let res = await deliveryApi.queryWarehouseList(1, warehouseType, queryString)
    let results = []
    if (res.code === 0 && res.data.rows) {
      results = res.data.rows
    }
    if (!queryString) {
      shareData.allWareHouseList = results
    }
    return results
  }

  const setSenderWareHouse = async item => {
    if (!item) {
      //清除选项
      // shareData.receiverWarehouseDisabled = false
      formData.houseType = ''
      formData.sendHouseName = ''
      return
    }
    // shareData.receiverWarehouseDisabled = true
    formData.sendHouseName = item.warehouseNumber
    formData.houseType = item.warehouseType
    formData.receiptHouseName = ''
    // formData.qhAddress = item.address + item.warehouseNumber
    if(!shareData.waybillModifyStatus){
      const { districtList, detailAddress } = getAddressData(item)
      formData.qhAddressData.districtList = districtList
      formData.qhAddressData.detailAddress = detailAddress
    }
  }

  // const setReceiverWareHouse = async item => {
  //   if (!item) {
  //     //清除选项
  //     shareData.returnWarehouseDisabled = false
  //     formData.houseType = ''
  //     formData.receiptHouseName = ''
  //     return
  //   }
  //   shareData.returnWarehouseDisabled = true
  //   formData.receiptHouseName = item.warehouseNumber
  //   formData.houseType = item.warehouseType
  //   formData.sendHouseName = ''
  //   // formData.sjAddress = item.address + item.warehouseNumber
  //   if(shareData.waybillModifyStatus !== '30'){
  //     const { districtList, detailAddress } = getAddressData(item)
  //     formData.sjAddressData.districtList = districtList
  //     formData.sjAddressData.detailAddress = detailAddress
  //   }
  // }

  const getAddressData = item => {
    const districtList = [item.province, item.city, item.district].filter(f => f)
    const detailAddress = [item.street,item.village,item.doorNumber].filter(f=>f).join('')
    return { districtList, detailAddress }
  }
  const isWareHouseVisible = computed(()=>!vm.$store.getters.authorityIds.includes('049') && vm.$store.getters.warehouseType)
  // const isWareHouseVisible = computed(() => vm.$store.getters.warehouseType)

  return {
    isWareHouseVisible,
    queryWareHouses,
    setSenderWareHouse,
    // setReceiverWareHouse
  }
}
