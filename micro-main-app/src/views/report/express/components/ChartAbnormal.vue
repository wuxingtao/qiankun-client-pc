<template>
  <div class="chart-abnormal-container">
    <div class="chart-wrapper">
        <div class="top-wrapper">
        <div class="number-box" :class="{active:activeIndex===1}" @click="activeIndex=1">
          <div>异常总票</div>
          <div>{{summaryData.ticketsCount}}</div>
        </div>
        <div class="number-box" :class="{active:activeIndex===2}" @click="activeIndex=2">
          <div>异常总件</div>
          <div>{{summaryData.packagesCount}}</div>
        </div>
      </div>
      <none-data v-if=" !existData" style="padding-top:0px" />
      <div v-else ref="chart" style="height:300px;"></div>
    </div>
    <ky-table style="overflow:hidden" :data="tableData" :height="401">
      <el-table-column prop="unDeliveryReason" label="异常原因"></el-table-column>
      <el-table-column prop="waybillCountAndPersent" label="票数/占比"> </el-table-column>
      <el-table-column prop="packetCountAndPersent" label="件数/占比"></el-table-column>
    </ky-table>

  </div>
</template>

<script>
import echarts from 'echarts'
import resize from '../../mixins/resize'
import NoneData from '@/components/ky-table/none-data.vue'
import { getExpressAbnormalOverview, getExpressAbnormalProportion } from '@/services/api/report'
export default {
  mixins: [resize],
  components: { NoneData },
  props: {
    formData: {
      type: Object,
      require: true
    }
  },
  data () {
    return {
      chart: null,
      dataSource: {},
      activeIndex: 1,
      summaryData: {},
      tableData: [],
      existData: false
    }
  },
  methods: {
    getParams () {
      const params = {
        expressType: this.formData.expressType,
        startDate: this.formData.dateRange[0],
        endDate: this.formData.dateRange[1],
        deliveryInfo: this.formData.senderInfo,
        pickupInfo: this.formData.receiverInfo,
        unDeliveryReasonTypes: this.formData.selectedAbnormalReason ? [this.formData.selectedAbnormalReason] : []
      }
      return params
    },
    async loadData () {
      const params = this.getParams()
      const res = await getExpressAbnormalOverview(params)
      if (res.code === 0) {
        const data = res.data[0]
        this.summaryData = {
          ticketsCount: this.$formatNumber(data.waybillCountTotal, 0),
          packagesCount: this.$formatNumber(data.packetCountTotal, 0)
        }
        this.dataSource = data || {}
        this.initChart(this.dataSource)
      }
    },
    initChart (dataSource) {
      const formatNumber=this.$formatNumber
      let data = [{ name: '客户指定', value: this.activeIndex === 1 ? dataSource.waybillCountByCustomerDesign : dataSource.packetCountByCustomerDesign },
        { name: '联系不上客户', value: this.activeIndex === 1 ? dataSource.waybillCountByUnableContact : dataSource.packetCountByUnableContact },
        { name: '预约异常', value: this.activeIndex === 1 ? dataSource.waybillCountByAppointment : dataSource.packetCountByAppointment },
        { name: '客观原因', value: this.activeIndex === 1 ? dataSource.waybillCountByObjective : dataSource.packetCountByObjective },]
      data.forEach(d => {
        const totalCount = this.activeIndex === 1 ? dataSource.waybillCountTotal : dataSource.packetCountTotal
        if (totalCount <= 0) {
          d.proportion = 0
        } else {
          d.proportion = this.$formatNumber(parseInt(d.value * 100) / totalCount) + '%'
        }
      })
      data = data.filter(d => parseFloat(d.proportion) > 0)
      this.existData = data.length > 0
      if (!this.existData) {
        this.tableData = []
        return
      }
      const option = {
        tooltip: {
          trigger: 'item',
          backgroundColor: 'white',
          textStyle: {
            color: '#666666'
          },
          padding: [16, 18],
          formatter: function (param) {
            return `${param.marker}${param.name}  <span style="color: #333333;padding-left:17px">${formatNumber(param.data.value, 0)}(${param.data.proportion})</span><br/>`
          },
          extraCssText: 'box-shadow: 0px 20px 34px 0px rgba(75,93,146,0.31), 0px 0px 5px 0px rgba(255,255,255,0.28) inset;'
        },
        legend: {
          right: 10,
          top: 30,
          orient: 'vertical',
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            rich: {
              name: {
                // verticalAlign: 'right',
                // align: 'left',
                // width: 60,
                fontSize: 12
              },
              proportion: {
                // align: 'left',
                // width: 60,
                fontSize: 12
              },
            }
          },
          formatter: function (name) {
            if (data && data.length) {
              const item = data.find(d => d.name === name)
              return (`{name| ${name}} {proportion| ${item.proportion}}`)
            }
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['30%', '60%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            // itemStyle: {
            //   borderColor: 'white',
            //   borderWidth: data.length>1? 3:0
            // },
            labelLine: {
              show: false
            },
            data
          }
        ]
      }
      this.$nextTick(() => {
        this.chart = echarts.init(this.$refs.chart, 'light')
        this.chart.setOption(option)
        this.chart.off('click')
        this.chart.on('click', params => {
          this.loadTableData(params.name)
        })
        this.loadTableData('客户指定')
      })
    },
    async loadTableData (reasonType) {
      const reasons = { '客户指定': '20', '联系不上客户': '30', '预约异常': '40', '客观原因': '50' }
      const params = this.getParams()
      params.secondReasonType = reasons[reasonType]
      const res = await getExpressAbnormalProportion(params)
      if (res.code === 0) {
        this.tableData = res.data
      }
    },
  },
  watch: {
    activeIndex () {
      this.initChart(this.dataSource)
    }
  }
}
</script>

<style lang="scss" scoped>
  .chart-abnormal-container {
    font-size: 14px;
    display: flex;
    & > div {
      flex: 1;
      &:first-of-type {
        margin-right: 40px;
      }
    }
    .chart-wrapper {
      // &>div:first-of-type{
      //  display: flex;
      //  justify-content: center;
      // }
      .top-wrapper {
        display: flex;
         justify-content:space-evenly;
        color: #999999;
        & > div:first-of-type {
          margin-right: 20px;
        }
        .number-box {
          height: 100px;
          width: 270px;
          box-sizing: border-box;
          border: 1px solid #dfe7f7;
          border-radius: 13px;
          padding: 25px 0 0 40px;
          cursor: pointer;
          &.active {
            background: #f7f8fe;
            border: 1px solid #8365f6;
          }
          & > :last-child {
            padding-top: 5px;
            font-size: 32px;
            font-weight: bold;
            color: #333333;
          }
        }
      }
    } 
  }
</style>