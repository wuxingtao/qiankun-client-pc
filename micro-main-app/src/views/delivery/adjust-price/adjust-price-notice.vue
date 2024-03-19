<template>
  <div class="adjust-price-notice__container" v-if="visible">
    <div class="title">
      <i class="iconfont icon-info" />
      时效延迟提醒
    </div>
    <div class="content">
      <template v-if="delayMessage">
        <span>由于贵司未同意《跨越速运价格调整政策》，上门</span>
        <span class="height-light">{{delayMessage}}</span>
      </template>
      <template v-else>
         {{ message }}
      </template>
    </div>
    <div class="footer">
      <el-button type="primary" @click="handleClose">知道了</el-button>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import deliveryApi from '@api/delivery'

export default {
  setup() {
    const state = reactive({
      visible:false,
      delayMessage: '',
      message:''
    })
    // state.delayMessage = `取货可能会延迟2小时`
    
    const showMessage = message => {
      state.delayMessage = ''
      state.message = message
      state.visible = true
    }

    const loadCustomerAdjustPriceNotice = async () => {
      state.delayMessage = ''
      state.visible = false
      const res = await deliveryApi.getAdjustPriceInfo()
      const { strategyFlag, adjustType, customerTips } = res.data || {}
      // state.visible = true
      if (res.code !== 0 || strategyFlag !== 2 || adjustType !== '10' || !customerTips) {
        return
      }
      state.delayMessage = customerTips
      state.visible = true
    }

    const handleClose = () => {
      state.visible = false
    }

    return {
      ...toRefs(state),
      loadCustomerAdjustPriceNotice,
      handleClose,
      showMessage
    }
  }
}
</script>

<style lang="scss" scoped>
.adjust-price-notice__container {
  z-index: 2;
  background: url('~@/assets/image/global/dialog-header-bg.png') no-repeat;
  background-position-x: right;
  background: #fff;
  position: fixed;
  top: 120px;
  right: 16px;
  padding: 30px 24px 20px;
  border-radius: 4px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  .title {
    padding-bottom: 20px;
    font-size: $--font-size-large;
    font-weight: bold;
    & > i {
      font-size: 18px;
      color: $--color-warning;
    }
  }
  .content{
    color: $--color-text-primary;
    padding-left: 26px;
    width: 286px;
    line-height: 20px;
    .height-light{
      color: $--color-warning;
    }
  }
  .footer{
    margin-top: 16px;
    text-align: right;
  }
}
</style>