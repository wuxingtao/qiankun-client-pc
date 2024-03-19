<template>
  <div>
    <branch-pick-fill ref='branchPickFillRef' :waybillNumber='waybillNumber'
                      :pickupAddress='pickupAddress' :branchInfo='branchInfo'
                      @refresh='refresh'></branch-pick-fill>
    <branch-pick-info ref='branchPickInfoRef' :waybillNumber='waybillNumber'
                      @updateDeliveryTime='updateDeliveryTime'></branch-pick-info>
  </div>
</template>

<script>
import branchPickFill from "./branch-pick-fill"
import branchPickInfo from "./branch-pick-info"
import waybillApi from "@api/waybill"

import {
  defineComponent,
  nextTick,
  toRef,
  reactive,
  toRefs,
  ref,
  onMounted,
  computed,
  provide,
  onActivated
} from "@vue/composition-api"

export default defineComponent({
  name: "branch-pick",
  components: {
    branchPickFill,
    branchPickInfo
  },
  setup(props, { root, emit }) {
    
    const branchPickFillRef = ref(null)
    const branchPickInfoRef = ref(null)
    const waybillNumber = ref("")
    
    const showPoppoer = (waybillNo, canSelfSufficiency, hasSelfSufficiencyInfo) => {
      /**
       * canSelfSufficiency 判断是否可以填写自提信息，已填写为0
       * hasSelfSufficiencyInfo 判断是否已经填写自提信息
       * */
      waybillNumber.value = waybillNo
      
      if (!canSelfSufficiency && !hasSelfSufficiencyInfo) {
        return root.message.warning("该单无法提供网点自提服务")
      }
      if (hasSelfSufficiencyInfo === 0) {
        // 没有自提信息
        getSelfPickupBranchButtonInfo()
      } else if (canSelfSufficiency === 0) {
        getSelfPickupButtonInfo()
      }
    }
    
    const pickupAddress = ref("")
    const pickupMobile = ref("")
    const branchInfo = ref([])
    
    const getSelfPickupBranchButtonInfo = async () => {
      const res = await waybillApi.getSelfPickupBranchButtonInfo({ waybillNumber: waybillNumber.value })
      if (res.data && res.data.branchInfo.length) {
        pickupAddress.value = res.data.pickupAddress
        pickupMobile.value = res.data.pickupMobile
        branchInfo.value = res.data.branchInfo
        branchPickFillRef.value.showDialog()
      } else {
        root.$message.warning("暂无可自提网点，请联系商务")
      }
    }
    
    const getSelfPickupButtonInfo = async () => {
      const res = await waybillApi.getSelfPickupButtonInfo({ waybillNumber: waybillNumber.value })
      if (res.code === 0 && res.data) {
        const {
          selfSufficiencyMobile,
          selfSufficiencyBranch,
          selfSufficiencyBranchAddress,
          selfSufficiencyBranchDistance,
          pickupContactMobile
        } = res.data
        branchPickInfoRef.value.showDialog({
          selfSufficiencyMobile, // 自提手机号
          selfSufficiencyBranch,  // 自提网点名称
          selfSufficiencyBranchAddress, // 自提网点名称
          selfSufficiencyBranchDistance, // 自提网点离收货地址距离
          pickupContactMobile // 提货联系手机号
        })
      }
    }
    
    const showFill = () => {
      this.$refs.branchPick.value.showDialog()
    }
    
    const updateDeliveryTime = () => {
      emit("updateDeliveryTime")
    }
    
    const refresh = () => {
      emit("refresh")
    }
    
    return {
      showFill,
      branchPickFillRef,
      branchPickInfoRef,
      getSelfPickupBranchButtonInfo,
      getSelfPickupButtonInfo,
      updateDeliveryTime,
      showPoppoer,
      waybillNumber,
      pickupAddress,
      pickupMobile,
      branchInfo,
      refresh
    }
  }
  
  
})
</script>

<style scoped>

</style>