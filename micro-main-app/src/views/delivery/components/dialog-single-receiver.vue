<template>
  <ky-dialog :title="(isModify?'修改':'新增')+'收件信息'" :visible.sync="dialogVisible" width="820px">
     <single-info-whole ref="singleInfoWholeRef" :visibleOfSender="false" :tempFormData.sync='formData' :tempShareData.sync='shareData'  @loading-change="loading=$event"/>
     <dialog-waybill-footer ref="dialogWaybillFooterRef" slot="footer" :visible.sync="dialogVisible" :loading="loading" :shareData="shareData" :confirmButtonEvent="saveData" />
  </ky-dialog>
</template>

<script>
import { watch, ref, reactive, nextTick } from '@vue/composition-api'
import * as formDataUtil from '../utils/formData'
import SingleInfoWhole from './single-info-whole'
import DialogWaybillFooter from './dialog-waybill-footer'
import useSingleFee from '../hooks/useSingleFee'


export default {
  components: {
    SingleInfoWhole,
    DialogWaybillFooter
  },
  setup(props, { emit }) {
    const isModify = ref(false)
    const loading = ref(false)
    const dialogWaybillFooterRef = ref(null)
    const dialogVisible = ref(false)
    const singleInfoWholeRef = ref(null)
    const formData = reactive(formDataUtil.getFormData())
    const shareData = reactive(formDataUtil.getShareData())
    let resolveDialog = null

    const { setFeeByField } = useSingleFee({
      formData , shareData
    })
    watch(dialogVisible,flag => {
      if (!flag) {
        resolveDialog&&resolveDialog(false)
      }
    })

    const showDialog = (tempFormData, row, filterCoupons,qhFormData)=>{
      formData.sjAddressData.districtList = []
      formData.sjAddressData.detailAddress = ''
      isModify.value = !!row
      dialogVisible.value = true
      nextTick(async () => {
        const wholeRef = singleInfoWholeRef.value
        wholeRef.resetData()
        const tempShareData = formDataUtil.getShareData()
        Object.keys(shareData).forEach(k => {
          shareData[k] = tempShareData[k]
        })
        Object.keys(tempFormData).forEach(k => {
          formData[k] = tempFormData[k]
        })
        formData.qhAddressData = qhFormData?.qhAddressData
        shareData.planeListInfo = row?.planeListInfo?.value
    
        /** 批量下单-修改/新增-过滤已选优惠券列表 */
        if (filterCoupons) {
          wholeRef.singleInfoCouponRef.setSelectedList(filterCoupons)
        }
        
        shareData.estimateFreight = tempFormData.estimateFreight
        /** 修改 */
        if (row) {
          wholeRef.singleInfoCouponRef.fetchCouponList(formData, null, tempFormData.estimateFreight)
        } else {
          wholeRef.setVolumetricWeightRatio('payWay') //设置抛重系数
          /** 新增 */
          const dialogClipboardNativeRef =  wholeRef.singleInfoReceiverRef.dialogClipboardNativeRef
          dialogClipboardNativeRef.readClipboardContent()
        }
        const temp = formData.payAccount 
        await wholeRef.loadServiceWayOption(row?.serviceWay.options)
         
        setFeeByField('dsMoney')
        row && setTimeout(() => { 
          formData.payAccount = temp
          shareData.disabledCollectionPrice = (row.businessData?.value?.feature != 0)
          wholeRef.displayErrorAndWarningInfoByTableRow(row)
        }, 0) 
      })
      return new Promise(resolve => {
        resolveDialog = resolve
      })
    }

    const saveData = async () => {
      const flag = await singleInfoWholeRef.value.checkFormData(true)
      if(!flag){
        return
      }
      const coupon = singleInfoWholeRef.value.wholeGetActiveCoupon()
      formData.estimateFreight = shareData.estimateFreight
      formData.coupon = coupon || {}
      // if (coupon) {
      //   formData.coupon = { ...coupon, estimateFreight: true }
      //   if (formData.estimateFreight) {
      //     const result = commonUtil.getEstimateTotalFreight(coupon, formData.estimateFreight)
      //     /** 减去优惠金额后的预估运费 */
      //     formData.estimateFreight.afterDiscountAmount = result
      //     /** 优惠金额 */
      //     formData.estimateFreight.reduceAmount = coupon.reduceAmount
      //   }
      // } else {
      //   formData.coupon = {}
      //   if (formData.estimateFreight) {
      //     /** 无优惠券，使用接口返回预估运费 */
      //     formData.estimateFreight.afterDiscountAmount = formData.estimateFreight.totalAmount
      //     /** 无优惠券，优惠金额=0 */
      //     formData.estimateFreight.reduceAmount = 0
      //   }
      // }
      const serviceWayOptions = singleInfoWholeRef.value.getServiceWayOptions()
      resolveDialog({formData,serviceWayOptions})
      dialogVisible.value = false
      /** 保存后清空优惠券数据 */
      singleInfoWholeRef.value.singleInfoCouponRef.resetData()
    }
    return {
      isModify,
      loading,
      dialogWaybillFooterRef,
      singleInfoWholeRef,
      formData,
      shareData,
      dialogVisible,
      showDialog,
      saveData,
    }
  },
}
</script>

<style lang="scss" scoped>
  .ky-dialog {
    /deep/.el-dialog__body {
      padding: 12px 0 !important;
      margin: 0 !important;

      .single-info-whole--container{
        background-color: #fff;
        .notice-container{
        min-width: 708px;
      }
      .notices {
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }
</style>
