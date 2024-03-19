<template>
  <div class="customer-code-header__container">
    <div v-if="customerCode" class="customer-code-info">
      <div class="title">当前绑定</div>
      <div class="info-wrapper">
        <div class="info">
          <span>公司名称</span>
          <span class="company-name">{{ customerInfo.customerName }}</span>
        </div>
        <div class="info">
          <span>客户编码</span>
          <span>{{ customerInfo.customerCode }}</span>
        </div>
        <el-button type="primary" size="small" @click="unbind" :loading="loading">解除绑定</el-button>
      </div>
    </div>
    <div v-else class="none-customer-code">
      <div>
        未绑定任何公司的客户编码
      </div>
      <div>
        客户编码关系到下单/对账等重要信息，请谨慎选择
      </div>
    </div>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from '@vue/composition-api'
import useCustomerCode from '../hooks/useCustomerCode'

export default {
  props: {
    customerInfo: { type: Object }
  },
  setup(props, {root}) {
    const state = reactive({
      loading:false
    })
    const customerCode = computed(() => props.customerInfo?.customerCode)
    const { unbindCustomerCode } = useCustomerCode(root) 
    const unbind = async () => {
      state.loading = true
      await unbindCustomerCode(customerCode.value)
      state.loading = false
    }

    return {
      ...toRefs(state),
      customerCode,
      unbind
    }
  }
}
</script>

<style lang='scss' scoped>
.customer-code-header__container {
  background: url('~@/assets/image/setting/user/customer-code-bg.png') no-repeat top left;
  .customer-code-info {
    width: 600px;
    height: 110px;
    border-radius: 4px;
    box-sizing: border-box;
    
    .title {
      width: 134px;
      height: 26px;
      line-height: 26px;
      text-align: left;
      padding-left: 10px;
      box-sizing: border-box;
      background-image: url('~@assets/image/setting/customer-info-header.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100%;
      color: #fff;
    }

    .info-wrapper {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;

      .info {
        display: flex;
        flex-direction: column;
        .company-name{
          @include overflow-ellipsis;
          max-width: 360px;
        }
        span:first-of-type {
          font-size: 12px;
          line-height: 1;
          text-align: left;
          color: #8f8fa8;
          margin-bottom: 12px;
        }

        span:last-of-type {
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          color: #03050d;
        }
      }
      button{
        align-self: center;
      }
    }
  }
  .none-customer-code{
    padding: 33px 24px;
    &>div{
      color: $--color-text-secondary2;
      &:first-of-type{
        font-weight: bold;
        font-size: $--font-size-large;
        color: $--color-text-primary;
        margin-bottom: 8px;
      }
    }
  }
}
</style>