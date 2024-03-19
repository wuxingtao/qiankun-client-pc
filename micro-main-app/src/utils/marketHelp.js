import * as settingApi from '@api/setting';
import * as storageUtil from '@/utils/storage';

/**
 * @Desc: marketHelp
 * @Author: wu xingtao
 * @Date: 2022/4/27
 */

class MarketHelp{
  /**
   * 查询市场元
   * @param fullAddress 详细地址
   * @returns {Promise<{}>}
   */
  async getMarketingInfoByAddress(fullAddress){
    const params = {
      phone:  storageUtil.getPhone(),
      address: fullAddress,
      origin:'80',//官网
    }
    const res = await settingApi.getMarketingInfoByAddress(params)
    return res.data || {}
  }
}

const marketHelp = new MarketHelp()

export default marketHelp
