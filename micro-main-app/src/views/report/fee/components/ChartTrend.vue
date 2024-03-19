<template>
  <div class="fee-chart-trend-container card-wrapper">
    <div class="caption-info">
      <div class="title">费用走势图</div>
    </div>
    <div class="content">
      <div class="links">
        <span :class="{'active':trendBy==='month'}" @click="setTrendType('month')">按月</span>
        <i>/</i>
        <span :class="{'active':trendBy==='quarter'}" @click="setTrendType('quarter')">按季度</span>
      </div>
      <none-data v-if=" !existData" style="padding-top:24px" />
      <div v-else ref="chart" style="height:260px;"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../../mixins/resize'
import NoneData from '@/components/ky-table/none-data.vue'
import { getFeeTrendDataByMonth, getFeeTrendDataByQuarter } from '@/services/api/report'
export default {
  mixins: [resize],
  components: { NoneData },
  props: {
    selectedPayway: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      chart: null,
      trendBy: 'month',
      existData: false
    }
  },
  methods: {
    async setTrendType (type) {
      this.trendBy = type
      this.loadData()
    },
    async loadData () {
      let res, xAxisData
      if (this.trendBy === 'month') {
        res = await getFeeTrendDataByMonth(this.selectedPayway)
        xAxisData = res.data.map(r => r.month)
      } else {
        res = await getFeeTrendDataByQuarter(this.selectedPayway)
        //xAxisData=['第一季度','第二季度','第三季度','第四季度',]
        xAxisData = res.data.map(r => this.convert(r.month))
      }
      if (res.code === 0) {
        this.existData = res.data && res.data.length > 0
        if (!this.existData) {
          return
        }
        this.$nextTick(() => {
          const waybillAmountDatas = res.data.map(r => r.waybillAmount)
          const otherAmountDatas = res.data.map(r => r.otherAmount)
          this.initChart(xAxisData, waybillAmountDatas, otherAmountDatas)
        })
      }
    },
    convert (val) {
      let name = val.slice(0,4)+"年"
      switch (val.slice(4,6)) {
        case "01":
          name += "第一季度"
          break
        case "02":
          name += "第二季度"
          break
        case "03":
          name += "第三季度"
          break
        case "04":
          name += "第四季度"
          break
          
      }
      return name
    },

    initChart (xAxisData, waybillAmountDatas, otherAmountDatas) {
      let that = this
      this.chart = echarts.init(this.$refs.chart, 'light')
      let option = {
        legend: {
          left: 'right',
          icon: 'rect',
          itemWidth: 12,
          itemHeight: 12,
          data: ['运单运费', '其它运费']
        },
        color: ['#9571E9'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'none'
          },
          backgroundColor: 'white',
          textStyle: {
            color: '#999999'
          },
          padding: [15, 20, 15, 26],
          formatter: function (param) {
            const arr = [
              `<span style="color: #333333;font-size: 16px;font-weight:bold">${param[0].axisValue}</span><br/>`,
              `应付费用<span style="color: #333333;;padding-left:33px">  ${that.$formatNumber(Number(param[0].value
              ) + Number(param[1].value))}</span>`,
              ' <div style="border-bottom:1px solid #f1f1f5;margin: 3px 0"></div>'
            ]
            const seriesData = param.map(p => `${p.marker}${p.seriesName}  <span style="color: #333333;padding-left:17px">${that.$formatNumber(p.value)}</span><br/>`)
            arr.push(...seriesData)
            return arr.join('')
          },
          extraCssText: 'box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset;'
        },
        grid: {
          left: '0',
          right: '0',
          bottom: '0',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            data: xAxisData,
            axisLine: {
              lineStyle: {
                //轴线样式
                color: '#e5e5ef',
                // type: 'solid'
              }
            },
            axisTick: {
              show: false,
              alignWithLabel: false
            },
            axisLabel: {
              color: '#666666',
              margin: 16
              // rotate: 45
            },
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
                color: '#e5e5ef',
                type: 'solid'
              }
            }
          }
        ],
        series: [
          {
            name: '运单运费',
            type: 'bar',
            stack: 'one',
            barWidth: '20px',
            data: waybillAmountDatas,
          },
          {
            name: '其它运费',
            type: 'bar',
            stack: 'one',
            barWidth: '20px',
            data: otherAmountDatas,
          },
        ]
      }
      this.chart.setOption(option)
    }
  },
  watch: {
    selectedPayway: {
      handler () {
        this.loadData()
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../scss/card.scss";
  .fee-chart-trend-container {
    flex: 100% !important;
    .content {
      position: relative;
      .links {
        position: absolute;
        font-size: 14px;
        color: #999999;
        z-index: 2;
        & > span {
          cursor: pointer;
          &.active {
            color: #8365f6;
          }
        }
        & > i {
          padding: 0 8px;
        }
      }
    }
  }
</style>