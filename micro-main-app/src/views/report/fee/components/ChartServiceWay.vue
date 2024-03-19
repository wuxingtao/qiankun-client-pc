<template>
  <div class="fee-chart-service-way-container">
    <div class="title">分布占比</div>
    <div class="content">
      <div class="links">
        <span :class="{'active':type==='total'}" @click="setType('total')">总费用</span>
        <i>/</i>
        <span :class="{'active':type==='avg'}" @click="setType('avg')">单票均价</span>
      </div>
      <none-data v-if=" !existData" style="padding-top:71px"/>
      <div v-else ref="chart" style="height:342px;"></div>
    </div>
  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../../mixins/resize'
import {color} from '@utils/index'
import { getFeeServiceWayProportion } from '@/services/api/report'
import NoneData from '@/components/ky-table/none-data.vue'
export default {
  mixins: [resize],
  components:{NoneData},
  props: {
    dateRange: {
      type: Array,
      require: true
    },
    payway: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      chart: null,
      type: 'total',
      existData:false
    }
  },
  methods: {
    async setType (type) {
      this.type = type
      this.loadData()
    },
    async loadData () {
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        payMode: this.payway,
        type: this.type === 'total' ? '10' : '20'
      }
      const res = await getFeeServiceWayProportion(params)
      if (res.code === 0) {
        this.existData=res.data&&res.data.length>0 
        if(! this.existData){
          return 
        }
        const data = res.data.map(d => Object.assign(d,{ name: d.serviceType, value:d.amount,proportion: d.proportion}))
        this.$nextTick(()=>{
          if (this.type === 'total') {
            this.setTotalFeeChart(data)
          } else {
            this.setAverageFeeChart(data)
          }
        })
      }
    },
    setTotalFeeChart (data) {
      const formatNumber=this.$formatNumber
      const colorList = ['#8676ff','#71dbff','#ffc979','#5fa9ff','#90e3a9','#fd716b','#ed8a6a','#B9757D','#C280FF','#FC3D5A']
      if(data&&data.length>colorList.length){
        for(let i=data.length-colorList.length;i<=data.length;i++){
          colorList.push( color())
        }
      }
      data.sort((a,b)=>b.amount-a.amount)
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'white',
          textStyle: {
            color: '#666666'
          },
          padding: [16, 18],
          formatter: function (param) {
            return `${param.marker}${param.name}  <span style="color: #333333;padding-left:17px">${formatNumber(param.data.value)}(${formatNumber(param.data.proportion*100)+'%'})</span><br/>`
          },
          extraCssText: 'box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset;'
        },
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 30,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            rich: {
              name: {
                verticalAlign: 'right',
                align: 'left',
                width: 60,
                fontSize: 12
              },
              proportion: {
                align: 'left',
                width: 60,
                fontSize: 12
              },
            }
          },
          formatter: function (name) {
            if (data && data.length) {
              const item = data.find(d => d.name === name)
              return (`{name| ${name}} {proportion| ${formatNumber(item.proportion*100)+'%'}}`)
            }
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['30%', '60%'],
            center: ['30%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            itemStyle: {
              color: (params) => {
                return colorList[params.dataIndex]
              }, 
              // borderColor: 'white',
              // borderWidth: 3
            },
            labelLine: {
              show: false
            },
            data
          }
        ]
      }
      this.chart&&this.chart.clear()
      this.chart = echarts.init(this.$refs.chart, 'light')
      this.chart.setOption(option)
    },
    setAverageFeeChart (data) {
      const formatNumber=this.$formatNumber
      const option = {
        grid: {
          left: 80,
          right: 120,
          top: 20,
          // bottom: 0, 
        },
        tooltip: {
          trigger: 'item',
          backgroundColor: 'white',
          textStyle: {
            color: '#666666'
          },
          padding: [16, 18],
          formatter: function (param) {
            return `${param.marker}${param.name}  <span style="color: #333333;padding-left:17px">${formatNumber(param.data.value)}</span><br/>`
          },
          extraCssText: 'box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset;'
        },
        xAxis: {
          splitLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLine: {
            show: false
          }
        },
        yAxis: {
          type: 'category',
          inverse: true,
          // max : 8, 
          axisLine: {
            lineStyle: {
              color: '#e5e5ef',
            }
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: true,
            color: '#666666',
            margin: 70,
            align: 'left',
          },
          data: data.map(d => d.name),
        },
        series: [{
          type: 'bar',
          barWidth: '16px',
          data: data.map(d => {
            return {
              ...d,
              itemStyle: { color: '#8a8df8' }
            }
          }),
          label: {
            show: true,
            position: 'right',
            color: '#333333',
            fontSize: 14,
            offset: [10, 0],
            formatter: function (param) {
              return formatNumber(param.data.value)
            },
          }
        }]
      }
      this.chart&&this.chart.clear()
      this.chart = echarts.init(this.$refs.chart, 'light')
      this.chart.setOption(option)
    },
  },
  watch: {
    dateRange: {
      handler () {
        this.$nextTick(() => { this.loadData() })
      },
      immediate: true
    },
    payway () {
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
  .fee-chart-service-way-container {
    flex: 1 0 440px;
    border-right: 1px solid #f1f1f5;
    .title {
      padding: 20px 0;
      font-size: 16px;
      font-weight: bold;
      color: #333333;
    }
    .content {
      height: 342px;
      padding: 10px 0;
      .links {
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