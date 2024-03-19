<template>
  <div class="main-service-success">
    <el-row style="background: #fff;" v-loading="data.deliveredLoading" class="el-row-column">
      <template v-if="authTuo">
        <list-title-line class="line" @change="changeTuoMonth" :visibleSelect="isMonth" v-model="tuoDataTime" background="#f5a623">妥投率 <span style="color: #ccc">(票数)</span></list-title-line>
        <ky-echarts ref="tuoRef" v-if="tuoShow&&isTuoData" autoresize :options="tuoData" :style="{'width': '100%', 'flex': 1, 'border-top': '1px solid #EBEBEB'}"></ky-echarts>
        <none-data v-else :style="{'width': '100%', 'flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
      </template>
      <none-data v-else :style="{'width': '100%', 'flex': 1,'border-top': '1px solid #EBEBEB'}"></none-data>
    </el-row>
    <el-row style="background: #fff;margin-top: 10px;" v-loading="data.agingAchievedLoading" class="el-row-column">
      <template v-if="authTime">
        <div class="time-tab-wrap">
          <list-title-line class="line" @change="changeTimeMonth" :visibleSelect="isMonth" v-model="timeDataTime" background="#f5a623">{{timeTitle}} <span style="color: #ccc">(票数)</span></list-title-line>
          <ky-tabs-r v-if="tabs.length>1" class="tabs-item2" :data="tabs" :mini="true" v-model="typeTime" @click="changeTime"></ky-tabs-r>
        </div>
        <ky-echarts ref="timeRef" v-if="isTimeData&&timeShow&& typeTime==='left'" autoresize :options="timeData" :style="{'width': '100%','border-top': '1px solid #EBEBEB', 'flex': 1}"></ky-echarts>
        <ky-echarts ref="timePaiRef" v-else-if="isTimePaiData&&timeShow&& typeTime==='right'" autoresize :options="timePaiData" :style="{'width': '100%','border-top': '1px solid #EBEBEB', 'flex': 1}"></ky-echarts>
        <none-data v-else :style="{'width': '100%', 'flex': 1, 'border-top': '1px solid #EBEBEB'}"></none-data>
      </template>
      <none-data v-else :style="{'width': '100%', 'flex': 1, 'border-top': '1px solid #EBEBEB'}"></none-data>
    </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'
import ListTitleLine from '../../components/list-title-line'
import KyEcharts from '@/components/ky-echarts'
import { color, barLineData } from '../comfig'
import { turnHtml, getAuth, checkSaveMonth } from '@/utils/total'
import { cloneDeep } from "lodash"
import NoneData from '../../components/none-data'
import dayjs from "dayjs"
import kyTabsR from '@/components/ky-tabs-r/index'
export default {
  name: "mainServiceSuccess",
  props: {
    formData: {
      type: Object,
      default: () => ({})
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  watch: {
    'data.agingAchieved': {
      handler () {
        this.isMonth ? this.timeDataTime = 2 : this.timeDataTime = 1
        this.initTab()
        this.getTimeData()
        this.getTimePaiData()
      },
      deep: true,
      immediate: true
    },
    'data.delivered': {
      handler () {
        this.isMonth ? this.tuoDataTime = 2 : this.tuoDataTime = 1
        this.initTab()
        this.getTuoData()
      },
      deep: true,
      immediate: true
    }
  },
  components: {
    KyEcharts,
    ListTitleLine,
    NoneData,
    kyTabsR
  },
  computed: {
    timeTitle () {
      if (this.typeTime === 'left') {
        return '时效达成'
      } else {
        return '派签到及时'
      }
    },
    tabs () {
      let tab = []
      if (getAuth(this, 'reachNumber') || getAuth(this, 'reachRate')) {
        tab.push({ label: '时效达成', name: 'left' })
      }
      if (getAuth(this, 'timelyCheckInNumber') || getAuth(this, 'timelyCheckInRate')) {
        tab.push({ label: '派签到及时', name: 'right' })
      }
      return tab
    },
    isMonth () {
      return checkSaveMonth(this.formData)
    },
    isTimeDataTime () {
      return this.timeDataTime === 2 && this.isMonth
    },
    isTuoDataTime () {
      return this.tuoDataTime === 2 && this.isMonth
    },
    authTime () {
      return getAuth(this, 'reachNumber') || getAuth(this, 'reachRate') || getAuth(this, 'timelyCheckInNumber') || getAuth(this, 'timelyCheckInRate')
    },
    authTuo () {
      return getAuth(this, 'deliveredPoll') || getAuth(this, 'delivereRate')
    },
    tuoShow () {
      return this.data && Object.keys((this.data || {}).delivered || {}).length > 0
    },
    timeShow () {
      return this.data && Object.keys((this.data || {}).agingAchieved || {}).length > 0
    },

  },
  methods: {
    changeTuoMonth () {
      this.getTuoData()
    },
    changeTimeMonth () {
      this.getTimeData()
      this.getTimePaiData()
    },
    getTimeData () {
      /*if (this.$refs.timeRef) {
            this.$refs.timeRef && this.$refs.timeRef.clear()
        }*/
      let line = cloneDeep(barLineData)
      let time = [] // 日期
      let agingAchievedVotes = [] //时效延误票数
      let agingAchievedRate = []// 时效延误率
      let dataInfo = this.data.agingAchieved
      let data = this.isTimeDataTime ? dataInfo.monthList : dataInfo.dayList
      if (data && data.length > 0) {
        data.forEach((item) => {
          let shipingDate = item.shipingDate
          time.push(shipingDate)
          agingAchievedVotes.push(item.agingAchievedVotes)
          agingAchievedRate.push(item.agingAchievedRate)
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
        this.isTimeData = false
        this.timeData = line
        return
      }
      this.isTimeData = true
      let series = []
      line.legend.data = []
      if (getAuth(this, 'reachNumber')) { //时效达成票数
        series.push({
          name: '时效达成票数',
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
          data: agingAchievedVotes
        })
        line.legend.data.push({
          name: '时效达成票数',
          /* icon: 'stack',*/
        })
        line.yAxis[0].interval = Math.ceil(Math.max.apply(null, agingAchievedVotes) / 5) || 1
        line.yAxis[0].max = Math.ceil(Math.max.apply(null, agingAchievedVotes) / 5) * 5 || 5
        line.yAxis[0].min = 0
      }
      if (getAuth(this, 'reachRate')) { //时效达成率
        series.push({
          name: '时效达成率',
          type: 'line',
          itemStyle: {
            color: '#FFB148'
          },
          smooth: true,
          yAxisIndex: 1,
          data: agingAchievedRate
        })
        line.legend.data.push({
          name: '时效达成率',
          /* icon: 'stack',*/
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
      // line.xAxis[0].axisLabel.showMaxLabel = true
      if (this.isTimeDataTime) {
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

      line.series = series || []

      line.series.forEach(item => {
        if (item.type === 'line' && (item.data || []).length === 1) {
          item.showSymbol = true
        } else {
          item.showSymbol = false
        }
      })

      line.tooltip.formatter = params => {
        let arr = []
        params.forEach(item => {
          arr.push({
            backgroundColor: Object.prototype.toString.call(item.color || '') === '[object String]' ? item.color : ((item.color.colorStops || [])[0] || {}).color,
            text: item.seriesName ? `${item.seriesName}: ` : '',
            value: item.value ? `${item.value}${item.seriesType === 'line' ? '%' : '(票)'}` : 0
          })
        })
        return turnHtml((params[0] || {}).name || 0, arr)
      }
      this.timeData = line
      return line
    },
    getTimePaiData () {
      /* if (this.$refs.timePaiRef) {
             this.$refs.timePaiRef && this.$refs.timePaiRef.clear()
         }*/
      let line = cloneDeep(barLineData)
      let time = [] // 日期
      let agingAchievedVotes = [] //时效延误票数
      let agingAchievedRate = []// 时效延误率
      let dataInfo = this.data.agingAchieved
      let data = this.isTimeDataTime ? dataInfo.deiveryInTimeMonthList : dataInfo.deiveryInTimeDayList
      if (data && data.length > 0) {
        data.forEach((item) => {
          let shipingDate = item.shipingDate
          time.push(shipingDate)
          agingAchievedVotes.push(item.deliveryInTimeVotes)
          agingAchievedRate.push(item.deliveryInTimeRate)
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
        this.isTimePaiData = false
        this.timePaiData = line
        return
      }
      this.isTimePaiData = true
      let series = []
      line.legend.data = []
      if (getAuth(this, 'timelyCheckInNumber')) { //时效达成票数
        series.push({
          name: '派签到及时票数',
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
          data: agingAchievedVotes
        })
        line.legend.data.push({
          name: '派签到及时票数',
          /* icon: 'stack',*/
        })
        line.yAxis[0].interval = Math.ceil(Math.max.apply(null, agingAchievedVotes) / 5) || 1
        line.yAxis[0].max = Math.ceil(Math.max.apply(null, agingAchievedVotes) / 5) * 5 || 5
        line.yAxis[0].min = 0
      }
      if (getAuth(this, 'timelyCheckInRate')) { //时效达成率
        series.push({
          name: '派签到及时率',
          type: 'line',
          itemStyle: {
            color: '#FFB148'
          },
          smooth: true,
          yAxisIndex: 1,
          data: agingAchievedRate
        })
        line.legend.data.push({
          name: '派签到及时率',
          /* icon: 'stack',*/
        })
        line.yAxis[1].interval = 100 / 5
        line.yAxis[1].max = 100
        line.yAxis[1].min = 0
      }
      line.xAxis[0].data = time
      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate=28
      line.xAxis[0].axisLabel.fontSize=11

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
      // line.xAxis[0].axisLabel.showMaxLabel = true
      if (this.isTimeDataTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }
      line.series = series || []
      line.series.forEach(item => {
        if (item.type === 'line' && (item.data || []).length === 1) {
          item.showSymbol = true
        } else {
          item.showSymbol = false
        }
      })

      line.tooltip.formatter = params => {
        let arr = []
        params.forEach(item => {
          arr.push({
            backgroundColor: Object.prototype.toString.call(item.color || '') === '[object String]' ? item.color : ((item.color.colorStops || [])[0] || {}).color,
            text: item.seriesName ? `${item.seriesName}: ` : '',
            value: item.value ? `${item.value}${item.seriesType === 'line' ? '%' : '(票)'}` : 0
          })
        })
        return turnHtml((params[0] || {}).name || 0, arr)
      }
      this.timePaiData = line
      return line
    },
    getTuoData () {
      /* if (this.$refs.tuoRef && this.$refs.tuoRef) {
             this.$refs.tuoRef && this.$refs.tuoRef.clear()
         }*/
      /*  let {delivered:data}=this.data*/
      let dataInfo = this.data.delivered || {}
      let line = cloneDeep(barLineData)
      let time = [] // 日期
      let deliveredVotes = [] //妥投票数
      let deliveredRate = []// 妥投率
      let data = this.isTuoDataTime ? dataInfo.monthList : dataInfo.dayList
      if (data && data.length > 0) {
        data.forEach((item) => {
          let shipingDate = item.shipingDate
          time.push(shipingDate)
          deliveredVotes.push(item.deliveredVotes)
          deliveredRate.push(item.deliveredRate)
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
        this.isTuoData = false
        this.tuoData = line
        return
      }
      this.isTuoData = true
      let series = []
      line.legend.data = []
      if (getAuth(this, 'deliveredPoll')) { //妥投票数
        series.push({
          name: '妥投票数',
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
          data: deliveredVotes
        })

        line.legend.data.push({
          name: '妥投票数',
          /*  icon: 'stack',*/
        })
        line.yAxis[0].interval = Math.ceil(Math.max.apply(null, deliveredVotes) / 5) || 1
        line.yAxis[0].max = Math.ceil(Math.max.apply(null, deliveredVotes) / 5) * 5 || 5
        line.yAxis[0].min = 0
      }

      if (getAuth(this, 'delivereRate')) { //妥投率
        series.push({
          name: '妥投率',
          type: 'line',
          itemStyle: {
            color: '#FFB148'
          },
          smooth: true,
          yAxisIndex: 1,
          data: deliveredRate
        })
        line.legend.data.push({
          name: '妥投率',
          /* icon: 'stack',*/
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
      // line.xAxis[0].axisLabel.showMaxLabel = true
      if (this.isTuoDataTime) {
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

      line.series = series || []

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
        return turnHtml((params[0] || {}).name || '', arr)
      }
      this.tuoData = line
      return line
    },
    initTab () {
      if (this.isLoad === true) {
        return
      }
      this.isLoad = true
      if (getAuth(this, 'reachNumber') || getAuth(this, 'reachRate')) {
        this.type = 'left'
      } else {
        if (getAuth(this, 'timelyCheckInNumber') || getAuth(this, 'timelyCheckInRate')) {
          this.type = 'right'
        }
      }
    },
    changeTime (value) {
      console.log(value)
    }
  },
  data () {
    return {
      isTimePaiData: false,
      isTimeData: false,
      isTuoData: false,
      timePaiData: {},
      timeData: {},
      tuoData: {},
      isLoad: false,
      typeTime: 'left',
      timeDataTime: 1,
      tuoDataTime: 1,
      showEchart: true,
      echartHeight: 308,
    }
  }
}
</script>

<style scoped lang="scss">
  .main-service-success {
    flex: 1;
    display: flex;
    flex-direction: column;

    .el-row-column {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .time-tab-wrap {
      position: relative;
      .tabs-item2 {
        position: absolute;
        right: 1rem;
        bottom: 1px;
        /* top: 50%;
                   transform: translateY(-50%);*/
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
  }
</style>
