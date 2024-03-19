<template>
  <ky-dialog
    title='自提信息'
    width='400px'
    :visible.sync='dialogVisible'
    :close-on-click-modal='false'
    @close='handlerClose'
  >
    <div class='info-wrapper' v-if='selfSufficiencyMobile'>
      <div class='icon'>
        <img src='@assets/image/waybill/phone.png' />
      </div>
      <div class='info'>
        <p class='title'>自提人手机号</p>
        <p class='content'>
          {{ selfSufficiencyMobile }}
          <i class='iconfont icon-copy' v-clipboard='selfSufficiencyMobile'></i>
        </p>
      </div>
    </div>
    <div class='info-wrapper'>
      <div class='icon'>
        <img src='@assets/image/waybill/branch.png' />
      </div>
      <div class='info'>
        <p class='title'>{{ selfSufficiencyBranch }}
          <span v-if='selfSufficiencyBranchDistance'>{{ selfSufficiencyBranchDistance }}km</span>
        </p>
        <p class='content'>
          {{ selfSufficiencyBranchAddress }}
          <i class='iconfont icon-copy' v-clipboard='selfSufficiencyBranchAddress'></i>
        </p>
      </div>
    </div>
    <div class='info-wrapper'>
      <div class='icon'>
        <img src='@assets/image/waybill/pick-goods.png' />
      </div>
      <div class='info'>
        <p class='title'>提货联系手机号</p>
        <p class='content'>
          {{ pickupContactMobile }}
          <i class='iconfont icon-copy' v-clipboard='pickupContactMobile'></i>
        </p>
      </div>
    </div>
    <div slot='footer' class='dialog-footer'>
      <el-button type='primary' @click='cancelPick'>取消自提</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import {
  defineComponent,
  reactive,
  toRef,
  toRefs,
  ref,
  computed,
  provide,
  onActivated,
} from "@vue/composition-api"
import waybillApi from "@api/waybill"

export default defineComponent({
  name: "branch-pick-info",
  props: {
    waybillNumber: String
  },
  setup(props, { root, emit }) {
    const dialogVisible = ref(false)
    let state = reactive({
      selfSufficiencyMobile: "",
      selfSufficiencyBranch: "",
      selfSufficiencyBranchAddress: "",
      selfSufficiencyBranchDistance: "",
      pickupContactMobile: ""
    })
    
    const showDialog = ({
      selfSufficiencyMobile, // 自提手机号
      selfSufficiencyBranch,  // 自提网点名称
      selfSufficiencyBranchAddress, // 自提网点地址
      selfSufficiencyBranchDistance, // 自提网点离收货地址距离
      pickupContactMobile // 提货联系手机号
    }) => {
      state.selfSufficiencyMobile = selfSufficiencyMobile
      state.selfSufficiencyBranch = selfSufficiencyBranch
      state.selfSufficiencyBranchAddress = selfSufficiencyBranchAddress
      state.selfSufficiencyBranchDistance = selfSufficiencyBranchDistance
      state.pickupContactMobile = pickupContactMobile
      
      dialogVisible.value = true
    }
    
    const handlerClose = () => {
      dialogVisible.value = false
    }
    
    const cancelPick = () => {
      const msg = "您确认是否取消网点自提，取消后需送货上门，请稍后选择派送时间"
      root.$kye_message.confirm(msg, {
        confirmButtonText: "暂不取消",
        cancelButtonText: "修改派送时间",
        closeOnClickModal: false,
        showClose: false
      })
        .then(() => {
        })
        .catch(async () => {
          const res = await waybillApi.cancelSelfPickup({
            waybillNumber: props.waybillNumber
          })
          if (res.code === 0) {
            emit("updateDeliveryTime")
            root.$message.success("取消自提成功")
          }
          dialogVisible.value = false
        })
        .finally(() => {
        })
    }
    
    return {
      dialogVisible,
      showDialog,
      handlerClose,
      cancelPick,
      ...toRefs(state)
    }
  }
})
</script>

<style lang='scss' scoped>
.info-wrapper {
  display: flex;
  margin-bottom: 32px;
  
  .icon {
    width: 24px;
    height: 24px;
    margin-right: 12px;
    
    img {
      display: inline-block;
      width: 24px;
    }
  }
  
  .info {
    
    .title {
      font-size: 16px;
      font-weight: bold;
      text-align: left;
      color: #03050d;
      line-height: 22px;
      margin-bottom: 6px;
      
      span {
        font-size: 16px;
        text-align: left;
        color: #8f8fa8;
        line-height: 16px;
        margin-left: 12px;
      }
    }
    
    .content {
      font-size: 13px;
      text-align: left;
      color: #6d6d72;
      line-height: 18px;
      
      .icon-copy {
        color: #8365F6;
      }
    }
  }
}
</style>