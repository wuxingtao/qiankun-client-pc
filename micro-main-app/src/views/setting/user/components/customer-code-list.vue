<template>
  <div class="customer-code-list__container">
    <div class="caption">
      请选择切换当前绑定客户编码
    </div>
    <div class="list--wrapper">
      <div
        :class="['list-item', { active: selectedCustomerCode === item.customerCode }]"
        v-for="(item, index) in customerList"
        :key="index"
        @click="selectedCustomerCode = item.customerCode"
      >
        <el-radio v-model="selectedCustomerCode" :label="item.customerCode"><i /></el-radio>
        <div class="list-item--right">
          <div>{{ item.customerShortName }}</div>
          <div>客户编码：{{ item.customerCode }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
export default {
  props: {
    customerList: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const state = reactive({
      selectedCustomerCode: props.customerCode
    })

    const getSelectedItem = () => {
      const item = props.customerList?.find(f => f.customerCode === state.selectedCustomerCode)
      return item
    }
    return {
      ...toRefs(state),
      getSelectedItem
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-code-list__container {
  .caption{
    color: $--color-text-primary;
    font-size: $--font-size-large;
    font-weight: bold;
    margin-bottom: 15px;
  }
  .list--wrapper {
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    padding: 6px;
    overflow-y: auto;
    .list-item {
      // border: 1px solid;
      padding: 12px 10px;
      display: flex;
      font-size: $--font-size-medium;
      border-radius: 4px;
      &:hover {
        background-color: $--background-color-base;
      }
      &.active {
        background: #f7f5ff;
      }
      .el-radio {
        display: flex;
        align-items: center;
        margin-right: 0px;
      }
      .list-item--right > div {
        &:first-of-type {
          color: $--color-text-primary;
          font-weight: bold;
          margin-bottom: 12px;
          @include overflow-ellipsis;
        }
        &:last-of-type {
          color: $--color-text-secondary2;
        }
      }
    }
    & > div:not(:last-of-type) {
      position: relative;
      margin-bottom: 13px;
      &::after {
        content: '';
        width: calc(100% - 36px);
        height: 1px;
        background-color: #f1f1f5;
        position: absolute;
        bottom: -7px;
        left: 24px;
      }
    }
  }
}
</style>
