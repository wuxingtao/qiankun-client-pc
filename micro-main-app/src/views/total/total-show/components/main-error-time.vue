<template>
  <div class="main-error-time">
    <el-row style="background: #fff;" v-loading="data.unAgingAchievedLoading || data.deliveryOuttimesLoading" class="el-row-column">
      <template v-if="timeErrorAuth">
        <div class="tabs-wrap">
          <list-title-line :visibleSelect="isMonth" v-model="timeErrorTime" @change="changeTimeError" background="#3385fa" class="line">{{type === 'left' ? '时效延误' : '派签到延误' }} <span style="color: #ccc">(票数)</span></list-title-line>
          <ky-tabs-r class="tabs-item" :data="tabs" :mini="true" v-model="type" v-if="tabs.length > 1"></ky-tabs-r>
        </div>
        <!-- 时效延误 -->
        <ky-echarts v-if="timeErrorShow && isTimeErrorData" v-show="type === 'left'" autoresize :options="timeErrorData" :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></ky-echarts>
        <none-data v-else v-show="type === 'left'" :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
        <!-- 派签到延误 -->
        <ky-echarts v-if="deliveryOuttimesShow && isDeliveryOuttimesData" v-show="type === 'right'" autoresize :options="deliveryOuttimesData" :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></ky-echarts>
        <none-data v-else v-show="type === 'right'" :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
      </template>
      <none-data v-else :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
    </el-row>
    <el-row style="background: #fff;margin-top: 1rem;" v-loading="data.collectTimeoutLoading" class="el-row-column">
        <template v-if="showErrorAuth">
            <list-title-line class="line" :visibleSelect="isMonth" v-model="showTime" @change="changeShowError" background="#ff5050">揽收超时 <span style="color: #ccc">(票数)</span></list-title-line>
            <ky-echarts ref="showErrorRef" v-if="showErrorShow&&isShowErrorData" autoresize :options="showErrorData" :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></ky-echarts>
            <none-data v-else :style="{'width': '100%','flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
        </template>
        <none-data v-else :style="{'width': '100%','border-top': '1px solid #EBEBEB'}"></none-data>
    </el-row>
  </div>
</template>

<script>
import ListTitleLine from '../../components/list-title-line'
import NoneData from '../../components/none-data'
import KyEcharts from '@/components/ky-echarts'
import kyTabsR from '@/components/ky-tabs-r/index'
import echarts from 'echarts'
import { barLineData } from '../comfig'
import { turnHtml, getAuth, checkSaveMonth } from '@/utils/total'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'

export default {
  name: 'mainErrorTime',
  props:{
    formData:{
      type: Object,
      default:()=>({})
    },
    data:{
      type: Object,
      default:()=>({})
    }
  },
  mounted() {
    if (getAuth(this,'delayRate') || getAuth(this,'delayNumber')) {
      this.type = 'left'
    } else if(getAuth(this,'delayCheckInRate')|| getAuth(this,'delayCheckInNumber')) {
      this.type = 'right'
    }
  },
  watch:{
    'data.unAgingAchieved': {
      handler() {
        this.isMonth ? this.timeErrorTime = 2 : this.timeErrorTime = 1
        this.getTimeErrorData()
      },
      deep:true,
      immediate: true
    },
    'data.deliveryOuttimes': {
      handler() {
        this.isMonth ? this.timeErrorTime = 2 : this.timeErrorTime = 1
        this.getDeliveryOuttimesData()
      },
      deep: true,
      immediate: true
    },
    'data.collectTimeout': {
      handler() {
        this.isMonth ? this.showTime = 2 : this.showTime = 1
        this.getShowErrorData()
      },
      deep: true,
      immediate: true
    }
  },
  components:{
    KyEcharts,
    kyTabsR,
    ListTitleLine,
    NoneData
  },
  computed:{
    isMonth(){
      return checkSaveMonth(this.formData)
    },
    isTimeErrorTime(){
      return this.timeErrorTime === 2 && this.isMonth
    },
    isShowTime(){
      return this.showTime===2&&this.isMonth
    },
    timeErrorAuth(){
      return getAuth(this,'delayRate') || getAuth(this,'delayNumber') || getAuth(this,'delayCheckInRate') || getAuth(this,'delayCheckInNumber')
    },
    showErrorAuth(){
      return getAuth(this,'collectedTimeoutRate') || getAuth(this,'collectedTimeoutNumber')
    },
    timeErrorShow() {
      return this.data&&Object.keys(this.data.unAgingAchieved).length>0
    },
    deliveryOuttimesShow() {
      return this.data && Object.keys(this.data.deliveryOuttimes).length > 0
    },
    showErrorShow(){
      return this.data&&Object.keys(this.data.collectTimeout).length>0
    },
    tabs () {
      let tab = []
      if (getAuth(this, 'delayRate') || getAuth(this,'delayNumber')) {
        tab.push({ label: '时效延误', name: 'left' })
      }
      if (getAuth(this,'delayCheckInRate') || getAuth(this,'delayCheckInNumber')) {
        tab.push({ label: '派签到延误', name: 'right' },)
      }
      return tab
    }
  },
  data(){
    return {
      // 揽收超时
      showErrorData: {},
      isShowErrorData: false,
      // 时效延误
      timeErrorData: {},
      isTimeErrorData: false,
      // 派签到延误
      deliveryOuttimesData: {},
      isDeliveryOuttimesData: false,

      timeErrorTime: 1,
      showTime  : 1,
      showEchart:true,
      echartHeight: 308,
      type: 'left'
    }
  },
  methods:{
    getShowErrorData() {
      let dataInfo = this.data.collectTimeout || {}
      let line = cloneDeep(barLineData)
      let time = [] // 日期
      let collectTimeoutVotes = [] //揽收超时票数
      let collectTimeoutRate = []// 揽收超时率
      let data = this.isShowTime ? dataInfo.monthList : dataInfo.dayList
      if (data && data.length > 0) {
        data.forEach((item) => {
          let shipingDate = item.shipingDate
          time.push(shipingDate)
          collectTimeoutVotes.push(item.collectTimeoutVotes)
          collectTimeoutRate.push(item.collectTimeoutRate)
        })
      } else {
        line.title = {
          text: '暂无数据',
          top: 60,
          left: 'center',
          textStyle: {
            color: '#C0C4CC',
            fontStyle: 'normal'
          }
        }
        this.isShowErrorData = false
        this.showErrorData = line
        return line
      }
      this.isShowErrorData = true
      let series = []
      line.legend.data = []
      if (getAuth(this, 'collectedTimeoutNumber')) {
        series.push({
          name: '揽收超时票数',
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#8cbbff'
              }, {
                offset: 1,
                color: '#cee2ff'
              }]),
            }
          },
          data: collectTimeoutVotes
        })
        line.legend.data.push({
          name: '揽收超时票数'
        },)
        line.yAxis[0].interval = Math.ceil(Math.max.apply(null, collectTimeoutVotes) / 5) || 1
        line.yAxis[0].max = Math.ceil(Math.max.apply(null, collectTimeoutVotes) / 5) * 5 || 5
        line.yAxis[0].min = 0
      }
      if (getAuth(this, 'collectedTimeoutRate')) {
        series.push({
          name: '揽收超时率',
          type: 'line',
          itemStyle: {
            color: '#FF7B7B'
          },
          smooth: true,
          yAxisIndex: 1,
          data: collectTimeoutRate
        })
        line.legend.data.push({
          name: '揽收超时率'
        })
        line.yAxis[1].interval = 100 / 5
        line.yAxis[1].max = 100
        line.yAxis[1].min = 0
      }
      line.xAxis[0].data = time
      switch ((time || []).length) {
        case 365:
          line.xAxis[0].axisLabel.interval = 30
          break
        case 180:
          line.xAxis[0].axisLabel.interval = 15
          break
        case 90:
          line.xAxis[0].axisLabel.interval = 7
          break
      }
      //line.xAxis[0].axisLabel.showMaxLabel = true
      if (this.isShowTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }

      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate=28
      line.xAxis[0].axisLabel.fontSize=11

      line.series = series

      line.series.forEach(item => {
        if (item.type === 'line' && (item.data || []).length === 1) {
          item.showSymbol = true
        } else {
          item.showSymbol = false
        }
      })

      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = params => {
        let arr = []
        params.forEach(item => {
          arr.push({
            backgroundColor: Object.prototype.toString.call(item.color || '') === '[object String]' ? item.color : ((item.color.colorStops || [])[0] || {}).color,
            text: item.seriesName ? `${item.seriesName}: ` : '',
            value: item.value ? `${item.value}${item.seriesType === 'line' ? '%' : '(票)'}` : 0
          })
        })
        return turnHtml(params[0].name || '', arr)
      }
      this.showErrorData = line
      return line
    },
    getTimeErrorData() {
      let dataInfo = this.data.unAgingAchieved || {}
      let line = cloneDeep(barLineData)
      let time = [] // 日期
      let unAgingAchievedVotes = [] //时效延误票数
      let unAgingAchievedRate = []// 时效延误率
      let data = this.isTimeErrorTime ? dataInfo.monthList : dataInfo.dayList
      if (data && data.length > 0) {
        data.forEach((item) => {
          let shipingDate = item.shipingDate
          time.push(shipingDate)
          unAgingAchievedVotes.push(item.unAgingAchievedVotes)
          unAgingAchievedRate.push(item.unAgingAchievedRate)
        })
      } else {
        line.title = {
          text: '暂无数据',
          top: 60,
          left: 'center',
          textStyle: {
            color: '#C0C4CC',
            fontStyle: 'normal'
          }
        }
        this.isTimeErrorData = false
        this.timeErrorData = line
        return line
      }
      this.isTimeErrorData = true
      let series = []
      line.legend.data = []
      if (getAuth(this, 'delayNumber')) {
        series.push({
          name: '时效延误票数',
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#8cbbff'
              }, {
                offset: 1,
                color: '#cee2ff'
              }]),
            }
          },
          data: unAgingAchievedVotes
        })
        line.legend.data.push({
          name: '时效延误票数'
        })
        line.yAxis[0].interval = Math.ceil(Math.max.apply(null, unAgingAchievedVotes) / 5) || 1
        line.yAxis[0].max = Math.ceil(Math.max.apply(null, unAgingAchievedVotes) / 5) * 5 || 5
        line.yAxis[0].min = 0
      }
      if (getAuth(this, 'delayRate')) {
        series.push({
          name: '时效延误率',
          type: 'line',
          itemStyle: {
            color: '#FF7B7B'
          },
          smooth: true,
          yAxisIndex: 1,
          data: unAgingAchievedRate
        })
        line.legend.data.push({
          name: '时效延误率'
        })
        line.yAxis[1].interval = 100 / 5
        line.yAxis[1].max = 100
        line.yAxis[1].min = 0
      }
      line.xAxis[0].data = time

      switch ((time || []).length) {
        case 365:
          line.xAxis[0].axisLabel.interval = 30
          break
        case 180:
          line.xAxis[0].axisLabel.interval = 15
          break
        case 90:
          line.xAxis[0].axisLabel.interval = 7
          break
      }
      if (this.isTimeErrorTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }

      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate=28
      line.xAxis[0].axisLabel.fontSize=11

      line.series = series

      line.series.forEach(item => {
        if (item.type === 'line' && (item.data || []).length === 1) {
          item.showSymbol = true
        } else {
          item.showSymbol = false
        }
      })

      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = params => {
        let arr = []
        params.forEach(item => {
          arr.push({
            backgroundColor: Object.prototype.toString.call(item.color || '') === '[object String]' ? item.color : ((item.color.colorStops || [])[0] || {}).color,
            text: item.seriesName ? `${item.seriesName}: ` : '',
            value: item.value ? `${item.value}${item.seriesType === 'line' ? '%' : '(票)'}` : 0
          })
        })
        return turnHtml(params[0].name || '', arr)
      }
      this.timeErrorData = line
      return line
    },
    // 派签到延误
    getDeliveryOuttimesData() {
      let dataInfo = this.data.deliveryOuttimes || {}
      let line = cloneDeep(barLineData)
      let time = []
      let deliveryOuttimesVotes = []
      let deliveryOuttimesdRate = []
      let data = this.isTimeErrorTime ? dataInfo.monthList : dataInfo.dayList
      if (data && data.length > 0) {
        data.forEach((item) => {
          let shipingDate = item.shipingDate
          time.push(shipingDate)
          deliveryOuttimesVotes.push(item.deliveryOuttimeVotes)
          deliveryOuttimesdRate.push(item.deliveryOuttimeRate)
        })
      } else {
        line.title = {
          text: '暂无数据',
          top: 60,
          left: 'center',
          textStyle: {
            color: '#C0C4CC',
            fontStyle: 'normal'
          }
        }
        this.isDeliveryOuttimesData = false
        this.deliveryOuttimesData = line
        return line
      }
      this.isDeliveryOuttimesData = true
      let series = []
      line.legend.data = []
      if (getAuth(this, 'delayCheckInNumber')) {
        series.push({
          name: '派签到延误票数',
          type: 'bar',
          barMaxWidth: 20,
          itemStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: '#8cbbff'
              }, {
                offset: 1,
                color: '#cee2ff'
              }]),
            }
          },
          data: deliveryOuttimesVotes
        })
        line.legend.data.push({
          name: '派签到延误票数'
        })
        line.yAxis[0].interval = Math.ceil(Math.max.apply(null, deliveryOuttimesVotes) / 5) || 1
        line.yAxis[0].max = Math.ceil(Math.max.apply(null, deliveryOuttimesVotes) / 5) * 5 || 5
        line.yAxis[0].min = 0
      }
      if (getAuth(this, 'delayCheckInRate')) {
        series.push({
          name: '派签到延误率',
          type: 'line',
          itemStyle: {
            color: '#FF7B7B'
          },
          smooth: true,
          yAxisIndex: 1,
          data: deliveryOuttimesdRate
        })
        line.legend.data.push({
          name: '派签到延误率'
        })
        line.yAxis[1].interval = 100 / 5
        line.yAxis[1].max = 100
        line.yAxis[1].min = 0
      }
      line.xAxis[0].data = time

      switch ((time || []).length) {
        case 365:
          line.xAxis[0].axisLabel.interval = 30
          break
        case 180:
          line.xAxis[0].axisLabel.interval = 15
          break
        case 90:
          line.xAxis[0].axisLabel.interval = 7
          break
      }
      if (this.isTimeErrorTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }

      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate=28
      line.xAxis[0].axisLabel.fontSize=11

      line.series = series

      line.series.forEach(item => {
        if (item.type === 'line' && (item.data || []).length === 1) {
          item.showSymbol = true
        } else {
          item.showSymbol = false
        }
      })

      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = params => {
        let arr = []
        params.forEach(item => {
          arr.push({
            backgroundColor: Object.prototype.toString.call(item.color || '') === '[object String]' ? item.color : ((item.color.colorStops || [])[0] || {}).color,
            text: item.seriesName ? `${item.seriesName}: ` : '',
            value: item.value ? `${item.value}${item.seriesType === 'line' ? '%' : '(票)'}` : 0
          })
        })
        return turnHtml(params[0].name || '', arr)
      }
      this.deliveryOuttimesData = line
      return line
    },
    changeTimeError() {
      this.getTimeErrorData()
      this.getDeliveryOuttimesData()
    },
    changeShowError() {
      this.getShowErrorData()
    }
  }
}
</script>

<style scoped lang="scss">
    .main-error-time{
      flex: 1;
      display: flex;
      flex-direction: column;

      .el-row-column {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
    }

  .tabs-wrap {
    position: relative;
    .tabs-item {
      position: absolute;
      right: 1rem;
      bottom: 1px;
      /deep/ .el-tabs .el-tabs__header .el-tabs__nav-wrap .el-tabs__item {
        height: 3rem !important;
        line-height: 3rem !important;
        font-size: 12px;
      }
      /deep/ .el-tabs__active-bar {
        width: 2.8rem;
      }
    }
  }
</style>




