<template>
  <div class="client-container" style="background-color:#F1F1F5;width:98%">
    <div style="background-color:#fff; padding:6px;">
      <div class="title">埋点统计</div>

      <el-row :gutter="49">
        <el-col :span="12">
          <div class="chart-area">
            <div class="chart-header">
              <span style="cursor:pointer;" @click="viewDetail('page')"
                >页面统计</span
              >
              <el-date-picker
                class="date-picker-style"
                v-model="pageStatisticDates"
                type="daterange"
                size="small"
                :clearable="false"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="pageDateChange"
              >
              </el-date-picker>
            </div>
            <div>
              <div v-if="!existsPageData" class="none-data">
                <img src="@/assets/image/bill/none-data.png" />
              </div>
              <div v-show="existsPageData" class="echart" ref="chartPage"></div>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="chart-area">
            <div class="chart-header">
              <span style="cursor:pointer;" @click="viewDetail('event')"
                >事件统计</span
              >
              <el-date-picker
                class="date-picker-style"
                v-model="eventStatisticDates"
                type="daterange"
                size="small"
                :clearable="false"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="eventDateChange"
              >
              </el-date-picker>
            </div>

              <div>
              <div v-if="!existsEventData" class="none-data">
                <img src="@/assets/image/bill/none-data.png" />
              </div>
              <div v-show="existsEventData" class="echart" ref="chartEvent"></div>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-row style="margin-top:37px">
        <el-col :span="24">
          <div class="chart-area">
            <div class="chart-header">用户统计</div>

            <div>
              <div v-if="!existsPersonData" class="none-data">
                <img src="@/assets/image/bill/none-data.png" />
              </div>
              <div v-show="existsPersonData" class="echart" ref="chartUser"></div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import dayjs from "dayjs"
import echarts from 'echarts'
import {
  queryEventTrackingStatisticByTypeApi,
  queryEventTrackingStatisticPersonApi,
  getEventTrackingTypes
} from '@/services/api/bill'


export default {
  data() {
    return {
      pageStatisticDates: [dayjs().add(-7, 'd'), dayjs()],
      eventStatisticDates: [dayjs().add(-7, 'd'), dayjs()],
      existsPageData: false,
      existsEventData: false,
      existsPersonData: false
    }
  },
  async mounted() {
    this.loadPageStatisticData()
    this.loadEventStatisticData()
    this.loadPersonStatisticData()
  },
  methods: {
    viewDetail(type) {
      this.$router.push({ name: 'eventTrackingData', params: { type } })
    },
    pageDateChange() {
      this.loadPageStatisticData()
    },
    eventDateChange() {
      this.loadEventStatisticData()
    },
    async loadPersonStatisticData() {
      let xAxisData = []
      for (let i = 1; i < 13; i++) {
        xAxisData.push(i + '月')
      }

      let res = await queryEventTrackingStatisticPersonApi(dayjs().year() + '')
      let legendData = []
      let yAxisSeriesData = []
      this.existsPersonData = res.data
      if (res.data) {
        for (let eventName in res.data) {
          let eventText = await this.getEventText(eventName)
          legendData.push(eventText)
          let serie = {
            name: eventText,
            data: res.data[eventName].map(r => r.personCount),
            type: 'line',
            smooth: true,
          }
          yAxisSeriesData.push(serie)
        }
        yAxisSeriesData[0].color='#68D1E2'
        yAxisSeriesData[1].color='#FAA500'
        yAxisSeriesData[2].color='#66ADF8'
      }
      this.setLinechartOption(
        this.$refs.chartUser,
        legendData,
        xAxisData,
        yAxisSeriesData
      )
    },
    async getEventText(eventName) {
      let dict = await getEventTrackingTypes()
      if (!dict) {
        return eventName
      }
      let item = dict.filter(d => d.code == eventName)
      if (item && item.length > 0) {
        return item[0].name
      }
      return eventName
    },
    async loadPageStatisticData() {
      let res = await queryEventTrackingStatisticByTypeApi(
        this.pageStatisticDates[0],
        this.pageStatisticDates[1],
        10
      )
      let xAxisData = []
      let yAxisData = []
      this.existsPageData = res.data && res.data.length > 0
      if (res.data) {
        xAxisData = res.data.map(m => m.name)
        yAxisData = res.data.map(m => m.operateCount)
      }
      this.setBarchartOption(this.$refs.chartPage, xAxisData, yAxisData)
    },
    async loadEventStatisticData() {
      let res = await queryEventTrackingStatisticByTypeApi(
        this.eventStatisticDates[0],
        this.eventStatisticDates[1],
        20
      )
      let xAxisData = []
      let yAxisData = []
      this.existsEventData = res.data && res.data.length > 0
      if (res.data) {
        xAxisData = res.data.map(m => m.name)
        yAxisData = res.data.map(m => m.operateCount)
      }
      this.setBarchartOption(this.$refs.chartEvent, xAxisData, yAxisData)
    },
    setBarchartOption(echartDom, xAxisData, yAxisData) {
      const myChart = echarts.init(echartDom)
      myChart.setOption({
        color: ['#9571E9'],
        // tooltip: {
        //   trigger: 'axis',
        //   axisPointer: {            // 坐标轴指示器，坐标轴触发有效
        //     type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        //   }
        // },
        title: {
          text: '访问次数',
          padding: 20,
          textStyle: {
            color: '#333',
            fontSize: 12,
            fontWeight: 'normal'
            // lineHeight: 50,
          }
        },
        grid: {
          left: '3%',
          right: '1%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: xAxisData,
            axisLine: {
              lineStyle: {
                //轴线样式
                color: '#DCDAE2'
              }
            },
            axisTick: {
              show: false,
              alignWithLabel: true
            },
            axisLabel: {
              color: '#333333',
              rotate: 45
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              textStyle: {
                color: '#999999'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#DCDAE2',
                type: 'dashed'
              }
            }
          }
        ],
        series: [
          {
            name: '访问量',
            type: 'bar',
            // barWidth: "60%",
            barMaxWidth: 36,
            data: yAxisData,
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  position: 'top',
                  textStyle: {
                    color: '#333333',
                    fontSize: 12
                  }
                }
              }
            }
          }
        ]
      })
      window.addEventListener('resize', () => {
        myChart.resize()
      })
      setTimeout(() => {
        myChart.resize()
      }, 200)
    },
    setLinechartOption(echartDom, legendData, xAxisData, yAxisSeriesData) {
      const myChart = echarts.init(echartDom, 'light')
      myChart.setOption({
        legend: {
          left: 'right',
          data: legendData //["在线对账", "申请开票"]
        },
        color: ['#9571E9'],
        tooltip: {
          trigger: 'axis'
          // axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          //   type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
          // }
        },
        title: {
          text: '客户数量',
          padding: 20,
          textStyle: {
            color: '#333',
            fontSize: 12,
            fontWeight: 'normal'
            // lineHeight: 50,
          }
        },
        grid: {
          left: '3%',
          right: '1%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: xAxisData,
            axisLine: {
              lineStyle: {
                //轴线样式
                color: '#DCDAE2'
              }
            },
            axisTick: {
              show: false,
              alignWithLabel: true
            },
            axisLabel: {
              color: '#333333',
              rotate: 45
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#DCDAE2',
                type: 'solid'
              }
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              textStyle: {
                color: '#999999'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#DCDAE2',
                type: 'dashed'
              }
            }
          }
        ],
        series: yAxisSeriesData
        // series: [
        //   {
        //     name: "在线对账",
        //     data: [820, 932, 901, 934, 1290, 1330, 1320],
        //     type: "line",
        //     smooth: true
        //   },
        // ]
      })
      window.addEventListener('resize', () => {
        myChart.resize()
      })

      this.$nextTick(() => {
        myChart.resize()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  height: 51px;
  line-height: 51px;
  padding-left: 24px;
  font-size: 18px;
  font-weight: bold;
  color: rgba(51, 51, 51, 0.93);
}

.date-picker-style {
  float: right;
  top: 6px;
  width: 216px;
}
.chart-area {
  border: 1px solid #ededed;
  .chart-header {
    line-height: 44px;
    border-bottom: 1px solid #ededed;
    padding: 0 19px;
    font: {
      weight: bold;
      size: 14px;
    }
  }
  .none-data {
    height: 270px;
    display: flex;
    justify-content: center; /*水平居中对齐*/
    align-items: center; /*垂直居中对齐*/
  }
  .echart {
    height: 270px;
  }
}

// /deep/ .el-date-editor {
//   .el-range-separator,
//   .el-range-input {
//     color: #aaaaaa;
//   }
// }
</style>
