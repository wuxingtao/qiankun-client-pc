<template>
  <div class="freight-description__container">
    <div class="caption">
      <i class="iconfont icon-description" />
      <span>费用说明</span>
      <span class="link" @click="handleFold('isFoldAll')">
        {{isFoldAll?'展开':'折叠'}}
        <i class="iconfont icon-arrow-down3" :class="{ 'is-reverse': !isFoldAll }" />
      </span>
    </div>
    <div v-show="!isFoldAll" :class="['content',isRowFlex?'is-row-flex':'is-column-flex']">
      <div class="formula">
        <div class="formula-title">
          <i class="iconfont icon-formula" />
          <span>运单总计公式</span>
          <span>({{freightFormula.feeWeightTips}})</span>
        </div>
        <div class="formula-content">
          <div>
            <span>总费用{{totalAmount}}元 = </span>
            <span>{{freightFormula.totalFeeFormula}} {{reduceAmount>0 ? ` - 优惠金额${formatValue(reduceAmount)}元` : ''}}</span>
          </div>
          <div>
            <span>运单费用{{estimateFreight.beforeDiscountAmount}}元 = </span>
            <span>{{freightFormula.freightFormula}}</span>
          </div>
          <div>
            <span>增值费用{{estimateFreight.addedValueAmount}}元 = </span>
            <span>{{freightFormula.valueAddedFeeFormula}}</span>
          </div>
          <!-- <div v-for="(item,index) in freightFormula.amountFormulaList" :key="index">
            <span>{{item.feeName}} = </span>
            <span>{{item.feeFormula}}</span>
          </div> -->
        </div>
      </div>
      <div class="description">
        <div class="description-title">运单运费说明</div>
        <div :class="['description-item',isFoldExample?'fold-example':'']">
          <span>a.收费形式：</span>
          <span>
            {{getChargeTypeText()}} （{{freightFormula.chargeDesc}}）
            <span class="link" @click="handleFold('isFoldExample')">
              {{isFoldExample ? '展开' : '折叠'}}
              <i class="iconfont icon-arrow-down3" :class="{ 'is-reverse': !isFoldExample }" />
            </span>
          </span>
        </div>
        <div v-show="!isFoldExample" class="description-spans">
          <div class="description-spans__example">
            <div>{{getChargeTypeText()}}举例说明</div>
            <div>{{freightFormula.exampleRemark}}</div>
          </div>
          <div class="description-spans__list" v-show="freightFormula.chargeType !== '50'">
            <div class="spans-list__title">
              <span>分段区间收费标准：</span>
            </div>
            <div class="spans-list__rows">
              <div class="row title">
                <div>分段区间(kg)</div>
                <div>单价(元/kg)</div>
              </div>
              <div class="row" v-for="(span,index) in freightFormula.amountExampleList" :key="index">
                <div>{{span.start}}~{{span.end}}</div>
                <div>{{span.price}}</div>
              </div>
            </div>
          </div>
          <div class="description-spans__text">
            {{freightFormula.exampleFormula}}
          </div>
        </div>
        <div class="description-item" v-show="freightFormula.surchargeAmount>0">
          <span>b.附加费：</span>
          <span>针对无网点的始发城市，会加收附加费</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import { reactive, toRefs, computed } from '@vue/composition-api'

export default {
  props: {
    estimateFreight: {
      type: Object
    },
    reduceAmount:{
      type:[String,Number]
    },
    isRowFlex: {
      type: Boolean,
      default: true
    }
  },
  setup (props, { emit }) {
    const state = reactive({
      isFoldAll: true,//全部折叠
      isFoldExample: false,
    })
    const handleFold = key => {
      state[key] = !state[key]
      emit('height-change')
    }
    const formatValue = val => {
      return val ? numeral(val).format('0,0.00') : '0'
    }
    const freightFormula = computed(()=> props.estimateFreight?.freightFormula || {})
    const toNumber = n => Number(n) || 0
    const totalAmount = computed(()=>{
      const amount = toNumber(props.estimateFreight.totalAmount ) - toNumber(props.reduceAmount) 
      return amount
    })
    const chargeTypes = { '10': '对段收费', '20': '分段收费', '30': '对段加首重', '50': '按方收费' }
    const getChargeTypeText = () => chargeTypes[freightFormula.value.chargeType]

    // const spanList = [{ start: 1, end: 2, price: 11 },{ start: 1, end: 2, price: 11 }]
    // const list = [{ amount: '总费用', detail: '运单费用' }, { amount: '总费用', detail: '运单费用' }]

    return {
      ...toRefs(state),
      formatValue,
      freightFormula,
      getChargeTypeText,
      handleFold,
      totalAmount
      // list,
      // spanList
    }
  }
}
</script>

<style lang="scss" scoped>
  .freight-description__container {
    padding-top: 25px;
    font-size: 13px;
    color: $--color-text-primary;
    max-width: 800px;
    .link {
      font-size: 12px;
      color: #8365f6;
      white-space: nowrap;
      cursor: pointer;
      .icon-arrow-down3 {
        font-size: 12px;
        position: relative;
        top: 0px;
        &.is-reverse {
          top: 0px;
          position: relative;
          display: inline-block;
          transform: rotateX(180deg);
        }
      }
    }

    .caption {
      display: flex;
      align-items: center;
      & > span:first-of-type {
        padding: 0 4px 0 8px;
        font-weight: bold;
        font-size: 15px;
      }
    }
    .content {
      background: #f4f7fe;
      border-radius: 4px;
      padding: 12px;
      margin-top: 20px;
      display: flex;
      &.is-row-flex {
        flex-direction: row;
        .formula {
          margin-right: 20px;
          flex: 3;
        }
        .description {
          flex: 2;
          padding-top: 18px;
          .description-title{
            padding-bottom: 21px;
          }
        }
      }
      &.is-column-flex {
        flex-direction: column;
        .formula {
          order: 1;
        }
        .description {
          order: 0;
        }
      }
      .formula {
        background: #ffffff;
        border-radius: 5px;
        padding: 16px;
        &-title {
          padding-bottom: 12px;
          display: flex;
          align-items: center;
          font-size: 14px;
          & > span {
            &:first-of-type {
              font-weight: bold;
              padding: 0 8px;
            }
            &:last-of-type {
              color: #8f8fa8;
            }
          }
        }
        &-content {
          & > div {
            padding: 14px 0;
            line-height: 20px;
            font-size: 13px;
            color: #666666;
            &:first-of-type{
              color: $--color-text-primary;
            }
            &:not(:first-of-type) {
              border-top: 2px dashed #dbdbec;
            }
            &:last-of-type {
              padding-bottom: 0;
            }
            & > span {
              &:first-of-type {
                color: $--color-text-primary;
                font-weight: bold;
              }
            }
          }
        }
      }
      .description {
        color: #8f8fa8;
        &-title {
          padding-bottom: 24px;
          font-weight: bold;
        }
        &-item {
          line-height: 23px;
          &.fold-example{
            margin-bottom: 24px;
          }
          & > span:first-of-type {
            font-weight: bold;
          }
        }
        &-spans {
          margin: 12px 0;
          padding: 12px;
          border: 1px dashed #dbdbec;
          border-radius: 4px;
          position: relative;
          &::before {
            position: absolute;
            top: -8px;
            content: '';
            width: 23px;
            height: 8px;
            background: url('~@assets/image/delivery/icon-arrow.png');
          }
          &__example {
            & > div:last-of-type {
              padding: 8px 0 16px;
              font-weight: bold;
              line-height: 17px;
            }
          }
          &__list {
            font-size: 12px;
            .spans-list__title {
              &>span{
                display: inline-block;
                transform: translateX(-6px) scale(0.9);
              }
            }
            .spans-list__rows {
              margin-top: 4px;
              border: 1px solid #dbdbec;
              .row {
                display: flex;
                height: 28px;
                line-height: 28px;
                padding-left: 8px;
                & > div {
                  &:first-of-type {
                    flex: 2;
                  }
                  &:last-of-type {
                    flex: 1;
                  }
                }
                &:not(:last-child) {
                  border-bottom: 1px solid #dbdbec;
                }
                &.title {
                  font-weight: bold;
                }
              }
            }
          }
          &__text {
            padding-top: 12px;
            line-height: 18px;
          }
        }
      }
    }
  }
</style>