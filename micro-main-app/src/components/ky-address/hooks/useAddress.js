import * as addressApi from '@/services/api/address'
import useAddress from '@/hooks/useAddress'
import addressStorage from '@comps/ky-address/utils/addressStorage'
import addressDistrictSession from '@comps/ky-address/utils/addressDistrctList'

export default function () {
  const { parseAddress } = useAddress()
  /**
   * 获取当前行政区域下的下级行政区域
   * @param {String} addressId 当前当前行政区域id
   * @param {int} level 层级
   * @returns
   */
  const getDistrictChildNodesById = async (districtId, level) => {
    let res
    const resSession = addressDistrictSession.getSessionDistrict(districtId)
    if (resSession) {
      res = resSession
    } else {
      res = await addressApi.getMultiLevelSubList(districtId)
    }
    if (res.data && res.data.districtList) {
      if (!resSession) {
        addressDistrictSession.setId(districtId, res.data)
      }
      const nodes = res.data.districtList.map(item => ({
        value: item.districtID,
        label: item.districtName,
        leaf: level === 2
      }))
      if (level === 2) {
        nodes.push({
          value: '',
          label: '暂不选择',
          leaf: true,
          isEmptyNode: true
        })
      }
      return nodes
    }
  }

  /**
   *  通过关键字获取相关省市区
   * @param {String} keyWord 联想关键字
   * @param {Function} callback 回调函数
   */
  const getSuggestDistrictsByKeyword = async (keyWord, callback) => {
    const res = await addressApi.getMultiLevelThinkList(keyWord)
    if (res.code === 0) {
      let list = res.data.districtList.filter(f => !['province', 'city'].includes(f.districtLevel))
      list = list.map(m => m.districtName.split('-')).filter(f => f.length === 3)
      const nodes = list.map(m => ({ labelList: m, displayText: m.join(' / ') }))
      callback(nodes)
    }
  }

  /**
   *
   * @param address 查询地址
   * @param addressType 10 寄件地址 20收件地址
   * @returns {Promise<boolean>} 是否在地图中匹配经纬度
   */
  const addressAnalysis = async ({ address, addressType = '10', pageRemindFlag = '0' }) => {
    let result = true
    if (!address) {
      return result
    }
    // 9位随机数
    const randomNum = Math.floor(100000000 + 100000000 * Math.random())
    const params = {
      addressList: [{
        id: String(randomNum),
        address,
        addressType
      }],
      pageRemindFlag: pageRemindFlag,
      source: '30'
    }
    const res = await addressApi.addressAnalysisTips(params)
    if (res.code === 0 && res.data && res.data.analysisFailList && res.data.remindFlag === '10') {
      result = false
    }

    if (!result) {
      addressStorage.addOne(window.location.pathname)
    }

    return result
  }

  return {
    getDistrictChildNodesById,
    getSuggestDistrictsByKeyword,
    parseAddress,
    addressAnalysis
  }
}
