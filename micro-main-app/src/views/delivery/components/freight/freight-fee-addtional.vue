<template>

  <div class="freight-fee-addtional__container" v-show="additionalFeeDetails.length > 0">
    <div class="detail__item" v-for="(item, index) in additionalFeeDetails" :key="index + 'key' + item.value">
      <span>{{ item.text }}：</span>
      <span>¥{{ formatValue(estimateFreight[item.prop]) }}</span>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'

export default {
  props:{
    additionalFeeDetails:{
      type:Array
    },
    estimateFreight:{
      type:Object
    }
  },
  setup(){
    const formatValue = val => {
      return val ? numeral(val).format('0,0.00') : '0'
    }
    return{
      formatValue
    }
  }
}
</script>

<style lang="scss" scoped>
  .freight-fee-addtional__container {
      display: flex;
      flex-wrap: wrap;
      margin-top: 14px;
      padding: 16px 12px 4px;
      color: #999999;
      background: #eff9ff;
      border-radius: 4px;
      box-sizing: border-box;

      .detail__item {
        display: flex;
        width: 33.3%;
        margin-bottom: 12px;

        span {
          &:first-child {
            width: 72px;
            font-size: 12px;
            font-weight: 400;
            color: #666666;
            text-align: left;
          }

          &:last-child {
            flex-direction: 0;
            font-size: 12px;
            font-weight: 400;
            color: #333333;
          }
        }
      }
    }
</style>