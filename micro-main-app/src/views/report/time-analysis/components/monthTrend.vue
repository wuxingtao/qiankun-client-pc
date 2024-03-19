<template>
  <div class="month-trend">
    <div class="title">
      <div class="text">
        统计时间 {{timeRange}}
        <el-button round size="medium" v-show="displayType === 'table'" @click="exportData">导出</el-button>
      </div>
      <div class="tab">
        <span :class="{active: displayType === 'chart'}" @click="displayType = 'chart'">图表</span>
        <span>/</span>
        <span :class="{active: displayType === 'table'}" @click="displayType = 'table'">表格</span>
      </div>
    </div>
    <div class="content">
      <div class="chart" v-show="displayType === 'chart'">
        <MixLineBar :option="monthTrendOption"></MixLineBar>
      </div>
      <div class="table" v-show="displayType === 'table'">
        <!-- 汇总 -->
        <div class="total">
          <div class="title">汇总</div>
          <div class="data">
            <div v-for="item in totalList" :key="item.key" class="item">
              <span class="name">{{item.name}}</span>
              <span slot="reference" class="value" :class="item.class">
                {{ total && total[item.key] || item.value}}{{item.unit}}
              </span>
            </div>
          </div>
        </div>
        <!-- 表格 -->
        <ky-table class="element-table" :data="data" style="width: 100%" height="270px">
          <el-table-column prop="index" label="序号" width="60"></el-table-column>
          <el-table-column prop="month" label="月份"></el-table-column>
          <el-table-column prop="totalPollA" label="总票数"></el-table-column>
          <el-table-column label="总票数环比" width="90">
            <template slot-scope="scope">{{scope.row.totalPollChainRatio}}%</template>
          </el-table-column>
           <el-table-column prop="totalLineA" label="线路"></el-table-column>
          <el-table-column label="线路环比">
            <template slot-scope="scope">{{scope.row.totalLineChainRatio}}%</template>
          </el-table-column>
          <el-table-column label="取超时率">
            <template slot-scope="scope">{{scope.row.pickupTimeoutRatio}}%</template>
          </el-table-column>
          <el-table-column label="取超时率涨幅" width="100">
            <template slot-scope="scope">{{scope.row.pickupTimeoutChainRatio}}%</template>
          </el-table-column>
          <el-table-column label="内部履约率" width="100">
            <template slot-scope="scope">{{scope.row.externalCauseRatio}}%</template>
          </el-table-column>
          <el-table-column label="内部履约率涨幅" width="120">
            <template slot-scope="scope">{{scope.row.externalCauseChainRatio}}%</template>
          </el-table-column>
          <el-table-column label="外因超时率" width="100">
            <template slot-scope="scope">{{scope.row.innerEfficacyRatio}}%</template>
          </el-table-column>
          <el-table-column label="外因超时率涨幅" width="120">
            <template slot-scope="scope">{{scope.row.innerEfficacyChainRatio}}%</template>
          </el-table-column>
          <el-table-column label="超时率">
            <template slot-scope="scope">{{scope.row.timeoutRatio}}%</template>
          </el-table-column>
          <el-table-column label="超时率涨幅" width="90">
            <template slot-scope="scope">{{scope.row.timeoutChainRatio}}%</template>
          </el-table-column>
        </ky-table>
      </div>
    </div>
  </div>
</template>

<script>
import MixLineBar from './mixLineBar.vue'
import NoneData from '@/components/ky-table/none-data.vue'
import { setUpMonthTrendOption } from '../echart-option'

export default {
  components: {
    MixLineBar,
    NoneData
  },
  props: ['data', 'total', 'title'],
  data() {
    return {
      totalList: [
        { name: '总数票:', key: 'totalPollA', value: '0', class: '', riseFlag: 'green', downFlag: 'orange', ratioKey: ['totalPollChainRatio'] },
        { name: '取重数(T):', key: 'totalWeightA', value: '0', class: '', riseFlag: 'green', downFlag: 'orange', ratioKey: ['totalWeightChainRatio'] },
        { name: '线路(条):', key: 'totalLineA', value: '0' },
        { name: '取超时率:', key: 'pickupTimeoutRatio', value: '0.0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', ratioKey: ['pickupTimeoutChainRatio'] },
        { name: '内部履约率:', key: 'externalCauseRatio', value: '0.0', unit: '%', class: '', riseFlag: 'green', downFlag: 'orange', ratioKey: ['externalCauseChainRatio'] },
        { name: '外因超时率:', key: 'innerEfficacyRatio', value: '0.0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', ratioKey: ['innerEfficacyChainRatio'] },
        { name: '超时率:', key: 'timeoutRatio', value: '0.0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', ratioKey: ['timeoutChainRatio'] },
      ],
      displayType: 'chart'
    }
  },
  methods: {
    exportData() {
      this.$emit('export', this.title + '时效月趋势' + this.timeRange)
    }
  },
  computed: {
    monthTrendOption() {
      return setUpMonthTrendOption(this.data)
    },
    timeRange() {
      if (this.data.length > 0) {
        return `(${this.data[0].month}~${this.data[this.data.length - 1].month})`
      }
      return ''
    }
  },
  watch: {
    total: {
      handler () {
        if (!this.total) return
        this.totalList.forEach(item => {
          let ratioValue = this.total[item.ratioKey]
          // 上升/下降箭头
          item.class = ''
          if (item.riseFlag && item.downFlag && ratioValue && ratioValue !== '--' && Number(ratioValue) !== 0) {
            item.class = ratioValue.startsWith('-') ? `${item.downFlag}-down` : `${item.riseFlag}-up`
          }
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
.month-trend {
  .title {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    line-height: 60px;
    .text {
      color: #333333;
      font-weight: bold;
      .el-button {
        margin-left: 15px;
      }
    }
    .tab {
      color: #999999;
      > span {
        padding: 0 5px;
        &:hover {
          cursor: pointer;
          color: #9378FA;
        }
      }
      .active {
        color: #9378FA;
      }
    }
  }
  .content {
    height: 360px;
    .chart {
      padding-top: 20px;
      height: 320px;
      border: 1px solid #f1f1f5;
    }
    .table {
      .total {
        background: #f9faff;
        border-radius: 16px;
        padding: 20px;
        display: flex;
        align-items: center;
        margin-bottom: 15px;

        .title {
          font-size: 14px;
          line-height: 20px;
          color: #333333;
          font-weight: 600;
          width: 40px;
        }

        .data {
          display: flex;
          flex-wrap: wrap;
          border-left: 1px solid #DADCE3;
          padding-left: 15px;
          margin-left: 15px;

          .item {
            margin-right: 25px;
            .name {
              text-align: right;
              font-size: 12px;
              color: #8888AC;
              display: inline-block;
              margin-right: 5px;
            }

            .value {
              cursor: pointer;
              font-size: 12px;
              color: #333333;
              font-weight: 600;
              display: inline-block;
              padding-left: 10px;
            }

            .green-up {
              background: url("~@assets/image/report/arrow_green_up.svg") no-repeat;
            }

            .green-down {
              background: url("~@assets/image/report/arrow_green_down.svg") no-repeat;
            }

            .orange-up {
              background: url("~@assets/image/report/arrow_orange_up.svg") no-repeat;
            }

            .orange-down {
              background: url("~@assets/image/report/arrow_orange_down.svg") no-repeat;
            }
          }   
        }
      }
    }
  }
}
</style>