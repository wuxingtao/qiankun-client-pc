<template>
  <!-- 时效分析报表 -->
  <div class="time-analysis-overview card-wrapper">
    <!-- 标题 -->
    <div class="caption-info">
      <card-title title="时效分析报表"/>
      <div class="detail" @click="$router.push({name: 'time-analysis', params: { dateRange: dateRange, companyType: companyType }})">详情<i class="el-icon-arrow-right"></i></div>
    </div>
    <!-- 内容 -->
    <div class="content">
      <div class="select-wrapper">
        <span>快件类型：</span>
        <el-select v-model="companyType" placeholder="请选择" size="small" @change="loadData">
          <el-option v-for="(item, index) in companyTypeList" :key="index" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <!-- 汇总 -->
      <div class="total">
        <div class="title">汇总</div>
        <div class="data">
          <div v-for="item in totalList" :key="item.key" class="item">
            <span class="name">{{item.name}}</span>
            <el-popover placement="right" trigger="hover">
              <span class="report-timeanalysis-pop" v-html="item.pop"></span>
              <span slot="reference" class="value" :class="item.class">
                {{item.value}}{{item.unit}}
              </span>
            </el-popover>
          </div>
        </div>
      </div>
      <!-- 线路趋势图 -->
      <div class="charts">
        <div class="charts-header">
          <div class="title">
            <span class="line"></span>
            <span class="text">线路趋势图</span>
          </div>
          <div class="option">
            <el-radio-group v-model="trendDimType">
              <el-radio-button :label="1">始发地</el-radio-button>
              <el-radio-button :label="2">目的地</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div class="charts-content">
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
    </div>
  </div>
</template>

<script>
import CardTitle from '../components/CardTitle.vue'
import MixLineBar from './components/mixLineBar.vue'
import NoneData from '@/components/ky-table/none-data.vue'
import TimeAnalysisService from '@/services/module/timeAnalysis'
import { setUpProvinceTrendOption, setUpCityTrendOption } from './echart-option'

// 统计维度：1-省 2-城市
const TREND_DATA_TYPE_PROVINCE = 1
const TREND_DATA_TYPE_CITY = 2

export default {
  components: {
    CardTitle,
    MixLineBar,
    NoneData
  },
  props: {
    dateRange: {
      type: Array,
      require: true
    }
  },
  data() {
    return {
      // 省市显示: chart-图表、table-表格
      provinceDisplayType: 'chart',
      cityDisplayType: 'chart',
      // 快件类型: 2-我发出的、3-我收到的
      companyType: 2,
      companyTypeList: [
        { label: '我发出的', value: 2 },
        { label: '我收到的', value: 3 }
      ],
      // 统计维度：1-始发地 2-目的地
      trendDimType: 2,
      // 汇总数据
      totalList: [
        { name: '总数票：', key: 'totalPollA', value: '0', class: '', riseFlag: 'green', downFlag: 'orange', popKeys: ['totalPollChainRatio'], popTemp: '环比(%)：{{totalPollChainRatio}}' },
        { name: '线路(条)：', key: 'totalLineA', value: '0', class: '', riseFlag: 'green', downFlag: 'orange', popKeys: ['totalLineChainRatio'], popTemp: '环比(%)：{{totalLineChainRatio}}' },
        { name: '取超时率：', key: 'pickupTimeoutRatio', value: '0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', popKeys: ['pickupTimeoutChainRatio', 'pickupTimeoutA'], popTemp: '涨幅(%)：{{pickupTimeoutChainRatio}}<br>超时票：{{pickupTimeoutA}}'},
        { name: '内部履约率：', key: 'externalCauseRatio', value: '0', unit: '%', class: '', riseFlag: 'green', downFlag: 'orange', popKeys: ['externalCauseChainRatio', 'timeoutA'], popTemp: '涨幅(%)：{{externalCauseChainRatio}}<br>超时票：{{timeoutA}}' },
        { name: '外因超时率：', key: 'innerEfficacyRatio', value: '0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', popKeys: ['innerEfficacyChainRatio', 'externalCauseTotalPollA', 'customerTimeoutA', 'accidentTimeoutA'], popTemp: '涨幅(%)：{{innerEfficacyChainRatio}}<br>外因超时票：{{externalCauseTotalPollA}}<br>客户原因票：{{customerTimeoutA}}<br>不可抗力票：{{accidentTimeoutA}}' },
        { name: '超时率：', key: 'timeoutRatio', value: '0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', popKeys: ['timeoutChainRatio', 'innerTimeoutTotalPollA'], popTemp: '涨幅(%)：{{timeoutChainRatio}}<br>内因超时票：{{innerTimeoutTotalPollA}}' },
        { name: '(0-12h]：', key: 'signAnalysis012Ratio', value: '0', unit: '%', popKeys: ['signAnalysis012ChainRatio', 'signAnalysis012A'], popTemp: '涨幅(%)：{{signAnalysis012ChainRatio}}<br>票数：{{signAnalysis012A}}' },
        { name: '(12-24h]：', key: 'signAnalysis1224Ratio', value: '0', unit: '%', popKeys: ['signAnalysis1224ChainRatio', 'signAnalysis1224A'], popTemp: '涨幅(%)：{{signAnalysis1224ChainRatio}}<br>票数：{{signAnalysis1224A}}'},
        { name: '(24-48h]：', key: 'signAnalysis2448Ratio', value: '0', unit: '%', popKeys: ['signAnalysis2448ChainRatio', 'signAnalysis2448A'], popTemp: '涨幅(%)：{{signAnalysis2448ChainRatio}}<br>票数：{{signAnalysis2448A}}'},
        { name: '(48-72h]：', key: 'signAnalysis4872Ratio', value: '0', unit: '%', popKeys: ['signAnalysis4872ChainRatio', 'signAnalysis4872A'], popTemp: '涨幅(%)：{{signAnalysis4872ChainRatio}}<br>票数：{{signAnalysis4872A}}'},
        { name: '72h以上：', key: 'signAnalysis72Ratio', value: '0', unit: '%', popKeys: ['signAnalysis72ChainRatio', 'signAnalysis72A'], popTemp: '涨幅(%)：{{signAnalysis72ChainRatio}}<br>票数：{{signAnalysis72A}}'},
        { name: '拉货：', key: 'exceptionPollMissRatio', value: '0', unit: '%', popKeys: ['exceptionPollMissChainRatio', 'exceptionPollMissA'], popTemp: '涨幅(%)：{{exceptionPollMissChainRatio}}<br>票数：{{exceptionPollMissA}}'},
        { name: '提货耗时长：', key: 'deliveryTimelongPollRatio', value: '0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', popKeys: ['deliveryTimelongPollChainRatio', 'deliveryTimelongPollA'], popTemp: '涨幅(%)：{{deliveryTimelongPollChainRatio}}<br>票数：{{deliveryTimelongPollA}}'},
        { name: '派干耗时长：', key: 'pickTimelongPollRatio', value: '0', unit: '%', class: '', riseFlag: 'orange', downFlag: 'green', popKeys: ['pickTimelongPollChainRatio', 'pickTimelongPollA'], popTemp: '涨幅(%)：{{pickTimelongPollChainRatio}}<br>票数：{{pickTimelongPollA}}'},
      ],
      // 省数据
      provinceList: [],
      // 市数据
      cityList: []
    }
  },
  methods: {
    // 加载数据
    loadData() {
      this.requestTotalList()
      this.requestProvinceTrendData()
      this.requestCityTrendData()
    },
    /**
     * 获取汇总数据
     */
    requestTotalList() {
      TimeAnalysisService.totalList(this.dateRange, this.companyType).then((res) => {
        if (!res.data || res.data.length < 1) return
        const data = res.data[0]
        this.totalList.forEach(item => {
          // 显示数值
          item.value = data[item.key]
          // 显示气泡数据
          item.pop = item.popTemp
          item.popKeys.forEach((popKey, index) => {
            const popValue = data[popKey]
            item.pop = item.pop.replace(`{{${popKey}}}`, popValue)
            // 上升/下降箭头
            if (index === 0 && item.riseFlag && item.downFlag && popValue && popValue !== '--') {
              item.class = popValue.startsWith('-') ? `${item.downFlag}-down` : `${item.riseFlag}-up`
            }
          })
        })
      })
    },
    /**
     * 获取省数据
     */
    requestProvinceTrendData() {
      TimeAnalysisService.totalLineTrend(this.dateRange, this.companyType, TREND_DATA_TYPE_PROVINCE, this.trendDimType).then(res => {
        if (!res.data || !res.data.rows) return
        // 清空省数据
        this.provinceList = []
        // 加载数据
        const rows = res.data.rows
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          let provinceItem = {...row}
          provinceItem.index = i + 1
          this.provinceList.push(provinceItem)
        }
      })
    },
    /**
     * 获取市数据
     */
    requestCityTrendData() {
      TimeAnalysisService.totalLineTrend(this.dateRange, this.companyType, TREND_DATA_TYPE_CITY, this.trendDimType).then(res => {
        if (!res.data || !res.data.rows) return
        // 清空省数据
        this.cityList = []
        // 加载数据
        const rows = res.data.rows
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          let cityItem = {...row}
          cityItem.index = i + 1
          this.cityList.push(cityItem)
        }
      })
    }
  },
  computed: {
    provinceTrendOption() {
      return setUpProvinceTrendOption(this.provinceList)
    },
    cityTrendOption() {
      return setUpCityTrendOption(this.cityList)
    }
  },
  watch: {
    dateRange: {
      handler () {
        this.loadData()
      },
      immediate: true
    },
    trendDimType: {
      handler () {
        this.requestProvinceTrendData()
        this.requestCityTrendData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../scss/card.scss";

.time-analysis-overview {
  .content {
    .select-wrapper {
      margin-bottom: 20px;
    }

    .total {
      background: #f9faff;
      border-radius: 16px;
      padding: 25px 30px;
      display: flex;
      align-items: center;

      .title {
        font-size: 14px;
        line-height: 20px;
        color: #333333;
        font-weight: 600;
        width: 14px;
      }

      .data {
        display: flex;
        flex-wrap: wrap;
        border-left: 1px solid #DADCE3;
        padding-left: 15px;
        margin-left: 15px;

        .item {
          margin: 10px 40px 10px 0;

          /deep/ .pop {
            font-size: 10px;
          }

          .name {
            width: 75px;
            text-align: right;
            font-size: 12px;
            color: #8888AC;
            display: inline-block;
            margin-right: 5px;
          }

          .value {
            cursor: pointer;
            width: 40px;
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

    .charts {
      &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;

        .title {
          display: flex;
          align-items: center;

          .line {
            display: inline-block;
            width: 4px;
            height: 14px;
            background: #9378FA;
            margin-right: 8px;
          }

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

      &-content {
        display: flex;
        margin-top: 20px;

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
  }
}
</style>