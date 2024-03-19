<template>
  <div class="fee-index-container">
    <div class="header-wrapper">
      <return>费用统计</return>
      <div class="payways">
        <span v-for="(item,index) in payways" :key="item.label" :class="{'active':selectedPayway===item.value}" @click="selectedPayway=payways[index].value">
          {{item.label}}
        </span>
      </div>
    </div>
    <chart-trend :selectedPayway="selectedPayway"></chart-trend>
    <div class="card-wrapper">
      <div class="caption-info">
        <div class="title">产品服务分布占比</div>
      </div>
      <div class="content">
        <div class="top">
          寄件时间
          <el-date-picker v-model="dateRange" class="date-picker" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd">
          </el-date-picker>
        </div>
        <div class="bottom">
          <chart-service-way :dateRange="dateRange" :payway="selectedPayway"></chart-service-way>
          <table-service-way :dateRange="dateRange" :payway="selectedPayway"></table-service-way>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChartTrend from './components/ChartTrend.vue'
import Return from '../components/Return.vue'
import uiUtil from '@/utils/uiUtil'
import dayjs from 'dayjs'
import ChartServiceWay from './components/ChartServiceWay.vue'
import TableServiceWay from './components/TableServiceWay.vue'
export default {
  components: { Return, ChartTrend, ChartServiceWay, TableServiceWay },
  data () {
    return {
      payways: [{label:'寄付',value:10}, {label:'到付',value:20}, {label:'第三方付',value:30}],
      selectedPayway: 10,
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    }
  },
  activated() {
    this.selectedPayway=10
    const dateRange=this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.dateRange = dateRange
    }
  },
}
</script>

<style lang="scss" scoped>
  .fee-index-container {
    @import "../scss/card.scss";
     height: 100%;
    background-color: #f5f7fb;
    font-size: 16px;
    color: #333333;
    .header-wrapper {
      background-color: #fff;
      border-radius: 0 0 12px 12px;
      .payways {
        height: 48px;
        padding: 0 20px;
        color: rgba(51, 51, 51, 0.93);
        & > span {
          display: inline-block;
          margin-right: 64px;
          padding: 16px 0;
        font-weight: bold;
          cursor: pointer;
          &.active {
            color: #8365f6;
            &::after {
              content: "";
              display: block;
              height: 4px;
              background-color: #8365f6;
              border-radius: 4px;
              position: relative;
              top: 12px;
            }
          }
        }
      }
    }
    .content {
      @import "../scss/index.scss";
      .top {
        color: #333333;
        border-bottom: 1px solid #f1f1f5;
        padding-bottom: 20px;
        .date-picker {
          margin-left: 8px;
        }
      }
      .bottom {
        display: flex;
        height: 420px;
        &>div{
          flex: 1;
          &:last-of-type{
            flex: 2;
          }
        } 
      }
    }
  }
</style>