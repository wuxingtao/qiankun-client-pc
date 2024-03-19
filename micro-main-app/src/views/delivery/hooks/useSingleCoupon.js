import { computed, ref, watch } from '@vue/composition-api'
import * as couponApi from '@/services/api/coupon'

export default function ({ formData, visibleOfCoupon }) {
  const couponList = ref([]) //优惠券
  const selectedCoupon = ref(null)

  const getAllCoupons = async () => {
    if (visibleOfCoupon) {
      const result = await couponApi.queryCouponList(null, 0)
      couponList.value = result || []
    }
  }

  const handleSelectCoupon = couponInfo => {
    selectedCoupon.value = couponInfo
  }

  const isShowCoupon = computed(() => {
    let flag = visibleOfCoupon && formData.payWay === '10'
    flag = (flag && couponList.value.length > 0) || selectedCoupon.value
    return flag
  })
  watch(
    () => formData.payWay,
    () => {
      if (formData.payWay != '10') {
        selectedCoupon.value = null
      }
    }
  )
  watch(
    () => formData.serviceWay,
    () => {
      if (!selectedCoupon.value) {
        return
      }
      const scope = selectedCoupon.value.scope
      if (!scope || !scope.includes(formData.serviceWay)) {
        selectedCoupon.value = null
      }
    }
  )
  const canUseCoupon = () => {
    if (!visibleOfCoupon) {
      return false
    }
    if (
      !couponList.value ||
      couponList.value.length < 1 ||
      !formData.serviceWay ||
      formData.payWay != '10'
    ) {
      return false
    }
    const flag = couponList.value.some(c => c.scope.includes(formData.serviceWay))
    return flag
  }

  // const saveCouponInfo = async  (ydNo, prizeCode,payWay,serviceWay)=> {
  //   if (oldCouponPrizeCode == prizeCode) {
  //     return true
  //   } else if (oldCouponPrizeCode) {
  //     // 优惠券解绑
  //   } else if (!prizeCode) {
  //     return true
  //   }
  //   const analysisResult = shareData.analysisAddressInfoResult||{}
  //   let res = await couponApi.bindCouponWithWaybill(ydNo, prizeCode,analysisResult.sendAreaCode,analysisResult.areaCode,payWay,serviceWay)
  //   if (res.code !== 0) {
  //     const msg = `优惠券${oldCouponPrizeCode ? '变更' : '绑定'}失败`
  //     this.$message.error(msg)
  //     return false
  //   }
  //   return true
  // }

  return {
    getAllCoupons,
    isShowCoupon,
    canUseCoupon,
    selectedCoupon,
    handleSelectCoupon,
  }
}
