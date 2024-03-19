/**
 * @Desc: deliveryUtil
 * @Author: wu xingtao
 * @Date: 2022/1/15
 */

import { isEqual } from 'lodash'

class DeliveryServe {
  constructor() {}

  /**
   *
   * @param data 新数据
   * @param oldData 旧数据
   * @param disabledSave 开启验证无更改设置
   * @param leastOne 开启验证至少选中1个
   * @returns {Promise<unknown>}
   */
  preference_save_valid(data, oldData, { disabledSave = true, leastOne = true }) {
    return new Promise((resolve, reject) => {
      let msgInfo = { type: 'warning', msg: '' }
      if (leastOne && data.options?.length === 0) {
        msgInfo.msg = '请至少选择一个选项'
        resolve({ valid: false, ...msgInfo })
        return
      }
      if (disabledSave && this.isEqualOldData(data, oldData)) {
        msgInfo.msg = data.options?.length === 0 ? '请至少选择一个选项' : '无更改设置'
        resolve({ valid: false, ...msgInfo })
        return
      }
      resolve({ valid: true, ...msgInfo })
    })
  }

  // 检查派送偏好配置是否未改动
  isEqualOldData(settingData, settingDataOnline) {
    const {
      options: options_old,
      noReceiptStartTime: noReceiptStartTime_old,
      noReceiptEndTime: noReceiptEndTime_old,
      disjunctor: disjunctor_old
    } = settingDataOnline
    const { options, noReceiptStartTime, noReceiptEndTime, disjunctor } = settingData
    return (
      isEqual([...options_old].sort(), [...options].sort()) &&
      noReceiptStartTime_old === noReceiptStartTime &&
      noReceiptEndTime_old === noReceiptEndTime &&
      disjunctor_old === disjunctor
    )
  }
}

const deliveryServe = new DeliveryServe()

export default deliveryServe
