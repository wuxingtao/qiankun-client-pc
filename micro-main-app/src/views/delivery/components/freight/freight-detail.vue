<template>
  <div class='freight-detail__container' :class="isBatch ? '' : 'single__container'">
    <freight-description-route v-if='isBatch' :isInTable='isInTable' :row='row' />
    <div :class="['summary',isBatch ? 'is-column-flex' : 'is-row-flex']">
      <div class='text'>
        <i class='iconfont icon-fee1'></i>
        <div class='item'>
          <span>
            运费
            <span v-if='feeWeightTips' class='remark'>({{ feeWeightTips }})</span>
            <span v-if='lessThanLowest && isBatch' class='remark'>部分运单运费不足最低运费，按最低运费收取</span>
          </span>
          <span>¥{{ formatValue(estimateFreight.waybillAmount) }}</span>
  
          <span v-if='isBatch && !!detailContent' class='detail-warning'>
            <i class='iconfont icon-warn'></i>
            {{ detailContent }}
          </span>
        </div>
      </div>
      <div class='text' v-if='visibleDiscounted'>
        <i class='iconfont icon-fee3'></i>
        <div class='item'>
          <span>优惠金额</span>
          <span>¥{{ formatValue(reduceAmount) }}</span>
        </div>
      </div>
      <div class='text'>
        <i class='iconfont icon-fee2'></i>
        <div class='item'>
          <span>增值费用</span>
          <div class='addedValueAmount'>
            <span>¥{{ formatValue(estimateFreight.addedValueAmount) }}</span>
            <!-- <span class="link-fold" v-if="Number(estimateFreight.addedValueAmount) > 0" @click="showAddtionalFeeDetails">
              {{ visibleAddtionalFeeDetail ? '折叠' : '展开' }}</span> -->
          </div>
        </div>
        <!-- <freight-fee-addtional v-if="isBatch" v-show="visibleAddtionalFeeDetail" :additionalFeeDetails="additionalFeeDetails" :estimateFreight="estimateFreight" /> -->
      </div>
    </div>
    <div v-if='!isBatch && detailContent' class='detail-warning'>
      <i class='iconfont icon-warn'></i>
      {{ detailContent }}
    </div>
    <!-- <freight-fee-addtional v-if="!isBatch" v-show="visibleAddtionalFeeDetail" :additionalFeeDetails="additionalFeeDetails" :estimateFreight="estimateFreight" /> -->
    <freight-description :estimateFreight='estimateFreight' :reduceAmount='reduceAmount' :isRowFlex='!isBatch'
                         @height-change="$emit('height-change')" v-show='!isBatch || isInTable' />
  
  </div>
</template>

<script>
import numeral from "numeral"
import { reactive, toRefs, watch, computed, onUpdated } from "@vue/composition-api"
import FreightDescription from "./freight-description"
// import FreightFeeAddtional from './freight-fee-addtional'
import FreightDescriptionRoute from "./freight-description-route"

const detailFeeFields = [
  { prop: "receiptMoneyFee", text: "回单费" }, // 回单费
  { prop: "statementPriceFee", text: "保价费" }, // 保价费
  { prop: "collectionFee", text: "代收货款费" }, // 代收货款服务费
  { prop: "overLengthFee", text: "超长费" }, // 超长费
  { prop: "woodenFrameFee", text: "木架费" }, // 木架费
  { prop: "superAreaFee", text: "超区费" }, // 超区费
  { prop: "offerAdjustPrice", text: "调价费" }, // 调价费
  { prop: "nightPickupFee", text: "夜间取货费" }, // 夜间取货费
  // { prop: 'coldTransportPickUpFee', text: '冷链零担取货费' },
  // { prop: 'coldTransportDeliveryFee', text: '冷链零担派货费' },
]

export default {
  components: {
    FreightDescription,
    // FreightFeeAddtional,
    FreightDescriptionRoute
  },
  props: {
    estimateFreight: {
      type: Object
    },
    visibleDiscounted: {
      type: Boolean
    },
    row: { type: Object }, // 批量表格行数据
    coupon: {
      type: Object
    },
    isBatch: { type: Boolean }, //是否是批量
    isInTable: { type: Boolean },
    detailContent: { type: String },
    isInDialog: { type: Boolean },
    lessThanLowest: { type: Boolean } // 是否存在某单预估运费小于最小运费
  },
  setup(props, { emit }) {
    const state = reactive({
      visibleAddtionalFeeDetail: true,
      additionalFeeDetails: [],
    })
    // const additionalFeeDetails = computed(() => {
    //   if (!props.estimateFreight) {
    //     return []
    //   }
    //   const fees = detailFeeFields
    //     .map(f => Object.assign(f, { value: (props.estimateFreight[f.prop]) || 0 }))
    //     .filter(f => f.value > 0)
    //   console.log('fees :>> ', fees)
    //   return fees
    // })
    const feeWeightTips = computed(() => props.estimateFreight.freightFormula?.feeWeightTips)
    watch(() => state.visibleAddtionalFeeDetail, () => {
      emit("height-change")
    })
    
    const formatValue = val => {
      return val ? numeral(val).format("0,0.00") : "0"
    }
    const showAddtionalFeeDetails = () => {
      state.visibleAddtionalFeeDetail = !state.visibleAddtionalFeeDetail
    }
    
    const freshAddtionalFeeDetails = () => {
      if (!props.estimateFreight) {
        return
      }
      const fees = detailFeeFields
        .map(f => Object.assign(f, { value: props.estimateFreight[f.prop] || 0 }))
        .filter(f => f.value > 0)
      // console.log('fees :>> ', fees)
      state.additionalFeeDetails = fees
    }
    
    return {
      ...toRefs(state),
      formatValue,
      showAddtionalFeeDetails,
      freshAddtionalFeeDetails,
      feeWeightTips
    }
  },
  computed: {
    reduceAmount() {
      const reduceAmount = this.estimateFreight?.reduceAmount
      /** 表格内编辑的优惠金额 */
      if (reduceAmount && this.isBatch && !this.coupon?.estimateFreight) {
        return reduceAmount
      }
      const val = this.coupon && this.coupon.reduceAmount
      return val ? numeral(val).format("0,0.00") : 0
    },
  },
}
</script>

<style lang='scss'>
.freight-detail--popper {
  padding-top: 16px !important;
}
</style>
<style lang='scss' scoped>
.freight-detail__container {
  .remark {
    font-size: 12px;
    padding-bottom: 16px;
    color: #8f8fa8;
  }
  .summary {
    display: flex;
    &.is-row-flex {
      .text {
        &:nth-child(2) {
          padding-left: 40px;
        }
        
        &:nth-child(3) {
          padding-left: 40px;
        }
        
        .item span {
          &:first-child {
            padding-bottom: 0px;
          }
        }
      }
    }
    &.is-column-flex {
      flex-direction: column;
      
      .text {
        align-items: unset;
        margin-bottom: 28px;
        flex-wrap: wrap;
      }
      /deep/.freight-fee-addtional__container {
        flex-basis: 100%;
      }
      
    }
    .text {
      display: flex;
      flex: 1;
      align-items: center;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: -22px;
        width: 1px;
        height: 20px;
        background: #f1f1f5;
      }
      
      i {
        font-size: 38px;
        &.icon-fee1 {
          color: #f9bb84;
        }
        &.icon-fee2 {
          color: #8bd2ff;
        }
        &.icon-fee3 {
          color: #f8a089;
        }
      }
      
      .item {
        display: flex;
        flex-direction: column;
        margin-left: 12px;
        
        & > span {
          &:first-child {
            font-weight: 400;
            color: #333333;
            padding-bottom: 8px;
          }
          
          &:last-child {
            font-size: 18px;
            font-weight: 500;
            color: $--color-text-primary;
          }
        }
        
        .addedValueAmount {
          display: flex;
          align-items: center;
          
          & > span {
            &:first-child {
              font-size: 18px;
              font-weight: 500;
              color: $--color-text-primary;
            }
          }
          
          .link-fold {
            padding-left: 4px;
            font-size: 12px;
            color: #8365f6;
            cursor: pointer;
          }
        }
      }
    }
    
    .text:last-child:after {
      width: 0;
    }
  }
}

.single__container {
  width: 1045px;
  
  .summary {
    
    &.is-row-flex {
      .text {
        align-items: center;
  
        &:first-of-type {
          .item {
            width: 348px;
          }
        }
  
        .item span {
          &:first-child {
            flex: 0;
          }
        }
      }
    }
    
    
    
    .text {
      align-items: unset;

      .item {
        .addedValueAmount {
          display: block;
        }
      }
    }
  }
}

.detail-warning {
  display: inline-block;
  margin-top: 6px;
  color: #ff8038 !important;
  font-size: 12px !important;
  line-height: 14px;

  .iconfont {
    margin-right: 8px;
    font-size: 14px !important;
  }
}
</style>