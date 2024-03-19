import * as addressApi from '@/services/api/address'

export default function () {
  /**
   * 解析地址
   * @param {String} address 地址全称
   * @returns 返回三级地址及明细地址
   */
  const parseAddress = async address =>{
    if (!address || address.length < 11) {
      return {
        detailAddress: address,
        districtList: null
      }
    }
    const res = await addressApi.aiAddrAnalysis(address)
    if (res.code === 0 && res.data) {
      const data = res.data
      const districtList = [data.province, data.city, data.district].filter(f => f)
      const detailAddress = data.detailAddress
      return {
        districtList,
        detailAddress
      }
    }
  }
  return{
    parseAddress
  }
}
