<template>
  <div class="line-trend">
    <div class="header">
      <div class="title">
        <span class="text">服务方式：{{serviceModeName}}</span>
      </div>
      <div class="option">
        <el-radio-group v-model="trendDimType">
          <el-radio-button :label="1">始发地</el-radio-button>
          <el-radio-button :label="2">目的地</el-radio-button>
        </el-radio-group>
      </div>
    </div>
    <div class="content">
      <!-- 省 -->
      <div class="province">
        <!-- 标题与切换 -->
        <div class="title">
          <div class="text">{{provinceDisplayType === 'table' ? '全部省' : '省TOP10'}}</div>
          <div class="tab">
            <span :class="{active: provinceDisplayType === 'chart'}" @click="provinceDisplayType = 'chart'">图表</span>
            <span>/</span>
            <span :class="{active: provinceDisplayType === 'table'}" @click="provinceDisplayType = 'table'">表格</span>
          </div>
        </div>
        <!-- 图标容器 -->
        <div class="container">
          <!-- 图表 -->
          <div class="chart" v-show="provinceDisplayType === 'chart'">
            <MixLineBar :option="provinceTrendOption" v-show="provinceList.length > 0"></MixLineBar>
            <none-data v-show="provinceList.length === 0"></none-data>
          </div>
          <!-- 表格 -->
          <div class="table" v-show="provinceDisplayType === 'table'">
            <ky-table class="element-table" :data="provinceList" style="width: 100%" height="300px">
              <el-table-column prop="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="province" label="省份"></el-table-column>
              <el-table-column prop="totalPollA" label="总票数"></el-table-column>
              <el-table-column label="总票数占比">
                <template slot-scope="scope">{{scope.row.totalPollRatio}}%</template>
              </el-table-column>
              <el-table-column label="取超时率">
                <template slot-scope="scope">{{scope.row.pickupTimeoutRatio}}%</template>
              </el-table-column>
              <el-table-column label="取超时率涨幅">
                <template slot-scope="scope">{{scope.row.pickupTimeoutChainRatio}}%</template>
              </el-table-column>
              <el-table-column label="超时率">
                <template slot-scope="scope">{{scope.row.timeoutRatio}}%</template>
              </el-table-column>
              <el-table-column label="超时率涨幅">
                <template slot-scope="scope">{{scope.row.timeoutChainRatio}}%</template>
              </el-table-column>
              <el-table-column label="内部履约率">
                <template slot-scope="scope">{{scope.row.externalCauseRatio}}%</template>
              </el-table-column>
              <el-table-column label="内部履约率涨幅">
                <template slot-scope="scope">{{scope.row.externalCauseChainRatio}}%</template>
              </el-table-column>
              <el-table-column label="外因超时率">
                <template slot-scope="scope">{{scope.row.innerEfficacyRatio}}%</template>
              </el-table-column>
              <el-table-column label="外因超时率涨幅">
                <template slot-scope="scope">{{scope.row.innerEfficacyChainRatio}}%</template>
              </el-table-column>
            </ky-table>
          </div>
        </div>
      </div>
      <!-- 市 -->
      <div class="city">
        <!-- 标题与切换 -->
        <div class="title">
          <div class="text">{{cityDisplayType === 'table' ? '全部市' : '市TOP10'}}</div>
          <div class="tab">
            <span :class="{active: cityDisplayType === 'chart'}" @click="cityDisplayType = 'chart'">图表</span>
            <span>/</span>
            <span :class="{active: cityDisplayType === 'table'}" @click="cityDisplayType = 'table'">表格</span>
          </div>
        </div>
        <!-- 图标容器 -->
        <div class="container">
          <!-- 图表 -->
          <div class="chart" v-show="cityDisplayType === 'chart'">
            <MixLineBar :option="cityTrendOption" v-show="cityList.length > 0"></MixLineBar>
            <none-data v-show="cityList.length === 0"></none-data>
          </div>
          <!-- 表格 -->
          <div class="table" v-show="cityDisplayType === 'table'">
            <ky-table class="element-table" :data="cityList" style="width: 100%" height="300px">
              <el-table-column prop="index" label="序号" width="60"></el-table-column>
              <el-table-column prop="city" label="城市"></el-table-column>
              <el-table-column prop="totalPollA" label="总票数"></el-table-column>
              <el-table-column label="总票数占比">
                <template slot-scope="scope">{{scope.row.totalPollRatio}}%</template>
              </el-table-column>
              <el-table-column label="取超时率">
                <template slot-scope="scope">{{scope.row.pickupTimeoutRatio}}%</template>
              </el-table-column>
              <el-table-column label="取超时率涨幅">
                <template slot-scope="scope">{{scope.row.pickupTimeoutChainRatio}}%</template>
              </el-table-column>
              <el-table-column label="超时率">
                <template slot-scope="scope">{{scope.row.timeoutRatio}}%</template>
              </el-table-column>
              <el-table-column label="超时率涨幅">
                <template slot-scope="scope">{{scope.row.timeoutChainRatio}}%</template>
              </el-table-column>
              <el-table-column label="内部履约率">
                <template slot-scope="scope">{{scope.row.externalCauseRatio}}%</template>
              </el-table-column>
              <el-table-column label="内部履约率涨幅">
                <template slot-scope="scope">{{scope.row.externalCauseChainRatio}}%</template>
              </el-table-column>
              <el-table-column label="外因超时率">
                <template slot-scope="scope">{{scope.row.innerEfficacyRatio}}%</template>
              </el-table-column>
              <el-table-column label="外因超时率涨幅">
                <template slot-scope="scope">{{scope.row.innerEfficacyChainRatio}}%</template>
              </el-table-column>
            </ky-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getServiceMode } from '../constants'
import MixLineBar from './mixLineBar.vue'
import NoneData from '@/components/ky-table/none-data.vue'
import { setUpProvinceTrendOption, setUpCityTrendOption } from '../echart-option'

export default {
  components: {
    MixLineBar,
    NoneData
  },
  props: ['serviceMode', 'provinceList', 'cityList'],
  data() {
    return {
      // 省市显示: chart-图表、table-表格
      provinceDisplayType: 'chart',
      cityDisplayType: 'chart',
      // 统计维度：1-始发地 2-目的地
      trendDimType: 2
    }
  },
  computed: {
    serviceModeName() {
      return getServiceMode(this.serviceMode)
    },
    provinceTrendOption() {
      return setUpProvinceTrendOption(this.provinceList)
    },
    cityTrendOption() {
      return setUpCityTrendOption(this.cityList)
    }
  },
  watch: {
    trendDimType: {
      handler () {
        this.$emit('dimtype-change', this.trendDimType)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.line-trend {
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;

    .title {
      display: flex;
      align-items: center;

      .text {
        font-size: 14px;
        color: #333333;
        font-weight: 600;
      }
    }

    .option {
      /deep/ .el-radio-button:first-child .el-radio-button__inner {
        border-radius: 19px 0 0 19px;
      }
      /deep/ .el-radio-button:last-child .el-radio-button__inner {
        border-radius: 0 19px 19px 0;
      }
    }
  }

  .content {
    display: flex;
    padding: 20px 0;

    > div {
      width: 50%;
      height: 375px;
      border: 1px solid #f1f1f5;
      box-sizing:border-box;   

      .title {
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;
        border-bottom: 1px solid #f1f1f5;
        line-height: 20px;
        font-size: 14px;

        .text {
          color: #333333;
          font-weight: 600;
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

      .container {
        .table {
          padding: 20px;
        }
        .chart {
          padding: 20px;
          height: 310px;
        }
      }
    }

    .city {
      border-left: none;
    }
  }
}
</style>