<template>
  <div class="weight-table-container">
    <div class="search-condition">
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="dateRange" class="date-picker" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd">
        </el-date-picker>
      </div>
    </div>
    <div class="links">
      <span :class="{'active':dataBy==='bar'}" @click="setDataBy('bar')">柱状图</span>
      <i>/</i>
      <span :class="{'active':dataBy==='table'}" @click="setDataBy('table')">表格</span>
    </div>
    <div style="margin-top:20px;" v-loading="loading">
      <div v-show="dataBy==='bar'" style="height:calc(100vh - 390px)">
        <none-data v-show="tableData.length<=0" style="padding-top:8%" />
        <div ref="chart" style="height:80%">
        </div>
      </div>

      <ky-table v-show="dataBy==='table'" class="element-table" :data="tableData" style="width: 100%;margin-top:50px" :height="'calc(100vh - 390px)'" ref="table">
        <el-table-column prop="idx" label="序号"></el-table-column>
        <el-table-column prop="serviceName" label="服务方式"></el-table-column>
        <el-table-column prop="totalVotes" label="总票数"></el-table-column>
        <el-table-column prop="investmentAverage" label="平均妥投时长"></el-table-column>
        <el-table-column prop="investmentRateShow" label="妥投率"></el-table-column>
      </ky-table>
    </div>

  </div>
</template>

<script>
import echarts from 'echarts'
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import resize from '../../mixins/resize'
import { getInvestmentByServiceModeList, getPrescriptionByServiceModeList } from '@/services/api/report'
import NoneData from '@/components/ky-table/none-data.vue'

export default {
  mixins: [resize],
  components: { NoneData },
  props: {
    category: {
      tyep: String,
      require: true
    },
    datatype: {
      tyep: String,
      require: true
    },
  },
  data () {
    return {
      // pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      pickerOptions:{
        disabledDate(v) {
          return v.getTime() >dayjs().add(1,'day') - 86400000
        }
      },
      dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      tableData: [],
      dataBy: 'bar',
      loading: false,
      chart: null,
    }
  },
  activated() {
    const dateRange=this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.dateRange = dateRange
    }
    // this.loadData ()
  },
  methods: {
    setDataBy (val) {
      this.dataBy = val
    },
    async loadData () {
      this.loading = true
      let res
      const params = {
        startDate: this.dateRange[0],
        endDate: this.dateRange[1],
        search: '10'
      }
      switch (this.datatype) {
        case '0':
          res = await getInvestmentByServiceModeList(params)
          break
        case '1':
          res = await getPrescriptionByServiceModeList(params)
          break
      }
      let arr = []
      if (res.code === 0) {
        res.data.forEach((item, index) => {
          arr.push({
            ...item,
            idx: index + 1
          })
        })
        this.tableData = arr && arr.map(el => Object.assign(el, { investmentRateShow: (this.$formatNumber(el.investmentRate*100,2)) + '%',investmentAverage:this.$formatNumber(el.investmentAverage) }))
      } else {
        this.tableData = []
      }
      this.initData()
      this.loading = false
    },
    initData () {
      this.chart = echarts.init(this.$refs.chart)
      if (this.tableData.length > 0) {
        let option = {
          grid: {
            left: '4%',
            right: '4%'
          },
          tooltip: {
            trigger: 'axis',
            backgroundColor: 'white',
            // axisPointer: {
            //   type: 'cross',
            //   crossStyle: {
            //     color: '#999'
            //   }
            // },
            textStyle: {
              color: '#666666'
            },
            padding: [16, 18],
            extraCssText: 'box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset;',
            formatter: function (data) {
              return data[0].name+ '<br/>'+
              '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#8A8DF8;"></span>'+ data[0].seriesName + '：' + data[0].value + '<br/>' +
              '<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:#FFC979;"></span>'+ data[1].seriesName + '：' + Math.round(data[1].value * 100) + '%'
            }
          },
          legend: {
            
            itemHeight: 12,
            itemWidth: 12,
            data: [
              {name:'总票数',icon: 'rect',},{name:'妥投率',icon: 'rect',}],
            right: 20
          },
          xAxis: [
            {
              type: 'category',
              data: this.tableData.map((el) => {
                return el.serviceName
              }),
              // axisPointer: {
              //   type: 'shadow'
              // },
              axisTick: {
                show: false,
              },
              axisLine: {
                lineStyle: {
                  color: '#E5E5EF'
                }
              },
              axisLabel: {
                color: '#666666'
              }
            }
          ],

          yAxis: [
            {
              type: 'value',
              min: 0,
              axisLabel: {
                formatter: '{value}',
                color: '#999999',
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              },
              splitLine: {
                lineStyle: {
                  color: '#E5E5EF'
                }
              }
            },
            {
              type: 'value',
              min: 0,
              splitLine: {
                show: false
              },
              axisLabel: {
                formatter: function (value) {
                  return value * 100 + '%'
                },
                color: '#999999'
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              }
            }
          ],
          series: [
            {
              name: '总票数',
              type: 'bar',
              data: this.tableData.map((el) => {
                return el.totalVotes
              }),
              color: ['#8A8DF8'],
              barWidth: '20'
            },
            {
              name: '妥投率',
              type: 'line',
              smooth: true,
              yAxisIndex: 1,
              data: this.tableData.map((el) => {
                return el.investmentRate
              }),
              color: ['#FFC979']
            }
          ]
        }
        this.chart.setOption(option)
      } else {
        this.chart.clear()
      }

    },
    doLayout(){
      this.$refs['table'].doLayout()
    }
  },
  watch: {
    dateRange: function () {
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
  .weight-table-container {
    position: relative;
    @import "../../scss/index.scss";
    .search-condition {
      height: 56px;
      border-bottom: solid 2px #f1f1f5;
    }
    .links {
      margin: 20px 0;
      font-size: 14px;
      color: #999999;
      z-index: 2;
      position: absolute;
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
    // .element-table {
    //   margin-top: 20px;
    // }
  }
</style>