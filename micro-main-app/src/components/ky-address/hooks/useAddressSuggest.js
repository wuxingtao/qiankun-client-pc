import * as addressApi from '@/services/api/address'
import { parseThirdAddress } from '@/services/api/address'
// import * as commonUtil from '@utils/commonUtil'

export default function() {
  /**
   *
   * @param {Array} districtList 二级或三级地址，如['广东省','深圳市','宝安区']
   * @param {String} queryString 联想关键字
   * @returns
   */
  const getAddressSuggestions = async (districtList, queryString) => {
    if (!queryString) {
      return
    }
    let district = ''
    let sepecialDistrict = [
      '东莞市',
      '中山市',
      '三沙市',
      '儋州市',
      '嘉峪关市',
      '潜江市',
      '仙桃市',
      '神农架林区',
      '天门市'
    ]
    if (districtList?.length > 2) {
      if (sepecialDistrict.includes(districtList[1])) {
        district = districtList[1]
      } else {
        district = districtList[2]
      }
      district = (district + '').replace(/\s/g, '')
    }
    if(district === '' && districtList?.length > 0){
      district = districtList[districtList.length - 1]
    }
    let keyword = queryString.replace(/\s/g, '')
    let params = {
      keyword,
      region: district,
      page_index: 1,
      page_size: 20,
      region_fix: district ? 1 : 0
    }
    const res = await addressApi.addressSuggestApi(params)
    if (res.data && res.data.data) {
      let results = res.data.data.map(item => {
        let fomatedItem = {
          title_origin: item.title,
          address_origin: item.address,
          address: item.address.replace(
            new RegExp(`(${keyword})`, 'ig'),
            '<span style=\'color:#8365f6\'>$1</span>'
          ),
          title: item.title.replace(
            new RegExp(`(${keyword})`, 'ig'),
            '<span style=\'color:#8365f6\'>$1</span>'
          )
        }
        return { value: item.address + item.title, item: Object.assign(item, fomatedItem) }
      })
      return results
    }
    return []
  }

  // 根据经纬度获取四级地址
  async function getThirdAddress({longitude,latitude}){
    let result = []
    const params = {longitude,latitude}
    let res = await addressApi.parseThirdAddress(params)
    if(res.code === 0 &&  res.data){
      const {province,city,district,town} = res.data
      result = Array.from(new Set([province.name, city.name, district.name,town.name]))
    }

    return result
  }

  return {
    getAddressSuggestions,
    getThirdAddress
  }
}
