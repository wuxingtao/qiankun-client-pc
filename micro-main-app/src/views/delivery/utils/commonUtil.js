import numeral from 'numeral'
class CommonUtil {
  /**
   * 检查尺寸格式是否正确
   * @param {Object} sizeItem 尺寸：length, width, height,count
   * @param hideSingleLengthTip 忽略单边长度提醒
   * @returns 格式不正确，则返相应的提示语句
   */
  checkSizeItem (sizeItem) {
    if (!sizeItem) {
      return
    }
    const { length, width, height, count } = sizeItem
    const arr = [length, width, height]
    if(count&&Number(count) > 9999){
      return '单件货物件数不能超过9999'
    }
    if (arr.some(a => Number(a) > 999)) {
      return '您的货物单边超过10米，如需下单请联系您的商务'
    }

    if (arr.filter(a => Number(a)).length !== arr.filter(a => a).length) {
      return '请正确填写长、宽、高尺寸信息'
    }
    const tempLength = arr.filter(a => Number(a)).length
    if (![0, 3].includes(tempLength) || (tempLength === 0 && count)) {
      return '请完整填写长、宽、高尺寸信息'
    }
  }

  getEstimateTotalFreightByRow(row){
    return this.getEstimateTotalFreight(row.coupon.value, row.estimateFreight.value)
  }
  /**
   * 计算使用优惠券后的预估运费
   * coupon 优惠券对象
   * estimateFreight 接口返回的预估运费对象
   */
  getEstimateTotalFreight(coupon, estimateFreight) {
    const { totalAmount, waybillAmount, addedValueAmount } = estimateFreight
    if (!totalAmount || !coupon || !coupon.reduceAmount) {
      return totalAmount ? numeral(totalAmount).format('0,0.00') : '--'
    }

    let result = '--'
    /** 免单券-全免 */
    if (+coupon.lineFreeRange === 10 && +coupon.relieType === 4) {
      /** 全免 */
      result = (waybillAmount + addedValueAmount) - coupon.reduceAmount
      if (result < 0) {
        result = 0
      }
    } else {
      /** 1. 其他券
       *  2. 免单券-只免运单运费 */
      result = waybillAmount - coupon.reduceAmount
      if (result < 0) {
        result = addedValueAmount
      } else {
        result += addedValueAmount
      }
    }
    return numeral(result).format('0,0.00') || '--'
  }
}

export default new CommonUtil()
