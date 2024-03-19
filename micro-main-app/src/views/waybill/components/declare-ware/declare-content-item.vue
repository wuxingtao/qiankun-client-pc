<template>
  <div class="declare-ware-content__item">
    <div class="declare-ware-user">
      <div class="declare-ware-user-address declare-ware-user-jj">
        <p class="name fs_12--strict f_w_b c_03050d mb_4">{{ formData.jjContactPerson }}</p>
        <div class="address">{{ formData.qhAddress }}</div>
      </div>
      <div class="plr_20">
        <div class="declare-ware-arrow"></div>
      </div>
      <div class="declare-ware-user-address declare-ware-user-sj">
        <p class="name fs_12--strict f_w_b c_03050d mb_4">{{ formData.sjContactPerson }}</p>
        <div class="address">{{ formData.sjAddress }}</div>
      </div>
    </div>
    <div class="confirm-status">
      <el-radio-group
        @change="handleRadioChange"
        v-model="formData.checkedCustomsCharge"
        size="medium"
        style="padding-top: 8px"
      >
        <el-radio label="10">
          <div class="inline-block">
            <span class="radio-title">需要并同意</span
            ><span
              v-show="formData.checkedCustomsCharge === '10' && formData.totalAmount"
              class="c_666"
              >入仓调价费<span class="high-amount">{{ formData.totalAmount }}</span>元/票</span
            >
          </div>
        </el-radio>
        <el-radio label="20"
          ><div class="inline-block">
            <span class="radio-title">无需报关服务</span>
            <el-popover
              placement="bottom"
              trigger="hover"
              :disabled="formData.excTips.length < 45"
              :width="360"
              popper-class="default-popover"
            >
              <span
                class="exc-tip c_03050d"
                v-show="formData.checkedCustomsCharge === '20' && formData.excTips"
                v-html="excTipsRender(formData.excTips)"
              ></span>
              <span
                slot="reference"
                class="exc-tip ellipsis"
                v-show="formData.checkedCustomsCharge === '20' && formData.excTips"
                v-html="excTipsRender(formData.excTips)"
              ></span>
            </el-popover></div
        ></el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from '@vue/composition-api'

export default {
  name: 'declare-content-item',
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  setup(props, { emit }) {
    const state = reactive({
      formData: props.item
    })

    watch(
      () => props.item.checkedCustomsCharge,
      val => {
        state.formData.checkedCustomsCharge = val
      }
    )

    function excTipsRender(str) {
      if (!str) {
        return ''
      }
      const value1 = props.item['excTotalAmount']
      return str.replace(new RegExp(`(${value1})`, 'ig'), '<span style="color: #FF706D;font-size:12px">$1</span>')
    }

    function handleRadioChange(val) {
      emit('update:radio', val)
    }

    return { ...toRefs(state), excTipsRender, handleRadioChange }
  }
}
</script>

<style lang="scss" scoped>
.declare-ware-content__item {
  background: #f4f7fe;
  border-radius: 3px;
  padding: 10px 20px;
  margin-bottom: 14px;
  border: 1px solid #e3e3e3;
  overflow: hidden;
  *{
    font-size: 12px;
  }
  .declare-ware-user {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 16px;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      background-color: #e3e3e3;
      height: 1px;
      bottom: 0;
      left: -20px;
      right: -20px;
    }
  }
  .declare-ware-user-address {
    flex: 1;
  }
  .name {
    line-height: 16px;
  }
  .address {
    color: #8f8fa8;
    text-align: left;
    line-height: 16px;
  }
  .declare-ware-arrow {
    width: 108px;
    height: 10px;
    background: url('~@assets/image/waybill/ware-arrow.png') no-repeat center center/100%;
  }

  .confirm-status {
    /deep/ .el-radio-group {
      padding-top: 10px !important;
      width:100%;
      .el-radio {
        display: block;
        &:first-child {
          margin-bottom: 8px;
        }
      }
      .radio-title {
        color: #03050d;
        margin-right: 8px;
      }
      .el-radio__label{
        width: 100%;
        display: inline-block;
        overflow: hidden;
        vertical-align: middle;
        >div{
          overflow: hidden;
          width: 100%;
        }
      }
    }
  }
  .high-amount {
    color: #FF706D;
  }
  .exc-tip {
    display: inline-block;
    width: calc(100% - 100px);
    color: #666666;
    vertical-align: middle;
  }
}
</style>
