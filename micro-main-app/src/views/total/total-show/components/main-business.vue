<template>
  <div ref='refBusiness' class='main-business'>
  <el-row style='background: #fff;' v-loading='(data || {}).ticketDataLoading' class='el-row-column'>
    <template v-if='isPoll'>
      <div class='tabs-wrap'>
        <list-title-line :visibleSelect='isMonth' v-model='ticketTime' @change='changeTicktMonth' background='#3385fa'
                         class='line'>{{ pollTitle.title }} <span style='color: #ccc'>{{ pollTitle.unit }}</span>
        </list-title-line>
        <ky-tabs-r class='tabs-item' :data='tabs' :mini='true' v-model='type'></ky-tabs-r>
      </div>
      <!--票数-->
      <ky-echarts key='ticketLineRef' v-if='ticketLineShow &&isTotalPoll&&isTicketLineData' ref='ticketLineRef'
                  v-show="type==='left'" autoresize :options='ticketLineData'
                  :style="{'width': '100%','height':heightVh,'border-top': '1px solid #EBEBEB'}"></ky-echarts>
      <!--件数-->
      <ky-echarts key='letterLineRef' v-if='letterLineShow && isTotalNumber&&isLetterLineData' ref='letterLineRef'
                  v-show="type==='right'" autoresize :options='letterLineData'
                  :style="{'width': '100%','height':heightVh,'border-top': '1px solid #EBEBEB'}"></ky-echarts>
      <none-data
        v-if='!(ticketLineShow &&isTotalPoll&&isTotalNumber&&letterLineShow&&isLetterLineData&&isTicketLineData)'
        :style="{'width': '100%','height':heightVh,'border-top': '1px solid #EBEBEB'}"></none-data>
    </template>
    <none-data v-else :style="{'width': '100%','border-top': '1px solid #EBEBEB'}"></none-data>
  </el-row>
  <el-row style='background: #fff;margin-top: 1rem;' v-loading='weightLoading' class='el-row-column'>
    <template v-if='isWeight'>
      <div class='list-title-line-header tabs-wrap2' ref='listItem'>
        <list-title-line background='#3385fa' class='line-left_title line-left_title_width'>
          {{ typeWeight === 'left' ? '计费' : '实际' }}重量区间 <span style='color: #ccc'>(KG)</span></list-title-line>
        <list-title-line :visibleSelect='isMonth' @change='changeKgMonth' v-model='kgTime' background='#3385fa'
                         class='line-right_title'>{{ kGlineTitle }}{{ kGlineTitle ? 'KG' : ''
          }}{{ typeWeight === 'left' ? '计费' : '实际' }}重量区间 <span style='color: #ccc'>(票)</span></list-title-line>
        <ky-tabs-r class='tabs-item2' :data='tabsWeight' :mini='true' v-model='typeWeight'
                   @click='changeLgLine'></ky-tabs-r>
      </div>
      <div class='echart-box' key='isBillWeight' v-if="typeWeight === 'left' &&isBillWeight">
        <div class='echart-box-left'>
          <el-row v-if='this.kgData.length>0'>
            <el-col :span='15' class='echart-box-pie'>
              <ky-echarts key='weightRation' ref='kgPieRef' autoresize :options='kgPieData' @click='kgSelect'
                          :style="{'width': '100%','height':heightVh,}"></ky-echarts>
              <div class='echart-box-pie-status'>
                <div class='echart-box-pie-text'>计费重量</div>
                <div class='echart-box-pie-totalWeight'>{{ toWamTons(((data || {}).weightRation)) }}</div>
              </div>
            </el-col>
            <el-col :span='9'>
              <legend-list :data='kgLegend' :title='kgTitle' :active='kgLegendIndex' @change='changeKgLegend'
                           :style="{'width': '100%','height':heightVh,}"></legend-list>
            </el-col>
          </el-row>
          <none-data v-else :style="{'width': '100%','height':heightVh}"></none-data>
        </div>
        <div class='echart-box-right'>
          <ky-echarts v-if='this.kgData.length>0 && kgLineShowNoData' ref='kgLineRef' autoresize :options='kgLineData'
                      :style="{'width': '100%','height':heightVh,}"></ky-echarts>
          <none-data v-else :style="{'width': '100%','height':heightVh}"></none-data>
        </div>
      </div>
      <div class='echart-box' key='isRealTotalWeight' v-else-if='isRealTotalWeight'>
        <div class='echart-box-left'>
          <el-row v-if='this.kgData.length>0'>
            <el-col :span='15' class='echart-box-pie'>
              <ky-echarts key='actualWeightRation' ref='kgPieRef' autoresize :options='kgPieData' @click='kgSelect'
                          :style="{'width': '100%','height':heightVh,}"></ky-echarts>
              <div class='echart-box-pie-status'>
                <div class='echart-box-pie-text'>实际重量</div>
                <div class='echart-box-pie-totalWeight'>{{ toWamTons(((data || {}).actualWeightRation)) }}</div>
              </div>
            </el-col>
            <el-col :span='9'>
              <legend-list :data='kgLegend' :title='kgTitle' :active='kgLegendIndex' @change='changeKgLegend'
                           :style="{'width': '100%','height':heightVh,}"></legend-list>
            </el-col>
          </el-row>
          <none-data v-else :style="{'width': '100%','height':heightVh}"></none-data>
        </div>
        <div class='echart-box-right'>
          <ky-echarts v-if='this.kgData.length>0 && kgLineShowNoData' ref='kgLineRef' autoresize :options='kgLineData'
                      :style="{'width': '100%','height':heightVh}"></ky-echarts>
          <none-data v-else :style="{'width': '100%','height':heightVh}"></none-data>
        </div>
      </div>
    </template>
    <none-data v-else :style="{'width': '100%'}"></none-data>
  </el-row>
  <el-row style='background: #fff;margin-top: 1rem;' v-loading='(data || {}).costRationLoading' class='el-row-column'>
    <template v-if='isTotalCost'>
      <div class='list-title-line-header'>
        <list-title-line background='#3385fa' class='line-left_title line-left_title_width'>费用组成 <span
          style='color: #ccc'>(元)</span></list-title-line>
        <list-title-line :visibleSelect='isMonth' v-model='moneyTime' @change='changeMoneyMonth' background='#3385fa'
                         class='line-right_title'>{{ moneylineTitle }} <span style='color: #ccc'>(元)</span>
        </list-title-line>
      </div>
      <div class='echart-box'>
        <div class='echart-box-left'>
          <el-row v-if='moneyPieShow'>
            <el-col :span='15' class='echart-box-pie'>
              <div class='money-pie' :style="{ 'height':heightVh }">
                <span class='money-pie-total'>总费用</span>
                <div>
                  <span class='money-pie-small'>¥</span>
                  <span class='money-pie-large'>{{ moneyPieData }}</span>
                </div>
              </div>
            </el-col>
            <el-col :span='9'>
              <legend-list :data='moneyLegend' :active='moneyLegendIndex' @change='changeMoneyLegend'
                           :style="{'width': '100%','height':heightVh, 'box-sizing': 'border-box'}"
                           tooltip='true'></legend-list>
            </el-col>
          </el-row>
          <none-data v-else :style="{'width': '100%','height':heightVh}"></none-data>
        </div>
        <div class='echart-box-right'>
          <ky-echarts v-if='moneyLineShow && isMoneyLineData' ref='moneyLineRef' autoresize :options='moneyLineData'
                      @legendselectchanged='moneyLegendMoseSelect'
                      :style="{'width': '100%','height':heightVh}"></ky-echarts>
          <none-data v-else :style="{'width': '100%','height':heightVh}"></none-data>
          <el-select
            v-if="this.costTrendList.length>0&&([activeMoneyEchart.name,activeMoneyEchart.label].includes('增值费') && moneyLegendIndex)"
            class='money-select' @change='changeMoney' size='mini' v-model='moneyType' placeholder='请选择'>
            <el-option style='height: 20px;line-height: 20px;font-size: 12px' v-for='item in moneyOptions'
                       :key='item.value' :label='item.label' :value='item.value'>
            </el-option>
          </el-select>
        </div>
      </div>
    </template>
    <none-data v-else :style="{'width': '100%'}"></none-data>
  </el-row>
  </div>
</template>

<script>
import echarts from 'echarts'

let freight = require('@assets/image/total/freight.svg')
let coupon = require('@assets/image/total/coupon.svg')
let appreciation = require('@assets/image/total/appreciation.svg')
let taxation = require('@assets/image/total/taxation.svg')
import { getAuth } from '@/utils/total'
import ListTitleLine from '../../components/list-title-line'
import LegendList from '../../components/legend-list'
import noneData from '../../components/none-data'
import KyEcharts from '@/components/ky-echarts'
import kyTabsR from '@/components/ky-tabs-r/index'
import { cloneDeep } from 'lodash'
import { pieData, moneyLookUp, kgLegend, moneyLegend, color, kgLegendColor, barLineData } from '../comfig'
import { toLabelValue, weightLevel, numberFixed, turnHtml, toWamTon, toBaiWam } from '@/utils/total'
import * as API from '@/services/api/total.js'
import { checkParams, checkSaveMonth } from '@/utils/total.js'
import dayjs from 'dayjs'

export default {
  name: 'mainBusiness',
  components: {
    KyEcharts,
    ListTitleLine,
    kyTabsR,
    LegendList,
    noneData
  },
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
  data() {
    return {
      activeMoneyEchart: {},
      kgPieData: {}, // 重量段饼图
      letterLineData: {}, // 件数
      isLetterLineData: false,
      ticketLineData: {},// 票数
      isTicketLineData: false,
      moneyTime: 1,
      kgTime: 1,
      ticketTime: 1,
      isLoad: false,
      kgLineShowNoData: true,
      kgTitle: {
        label: '重量区间(KG)',
        value: '票数占比'
      },
      winHeight: 0,
      showEchart: true,
      type: 'left',
      typeWeight: 'left',
      activeIndex: 1,
      weights: [],
      kgLineData: {},
      moneyLineData: {},
      isMoneyLineData: false,
      kGlineTitle: '',
      moneylineTitle: '运费趋势',
      yunData: {},
      costTrendList: [],
      costTrendListCopy: [],
      oldParams: {},
      echartHeight: '205px',
      moneyLegendIndex: '',
      kgLegendIndex: '',
      costRation: {},
      moneyType: '',
      oldMoneyData: {},
      oldWeightsData: {}
    }
  },
  computed: {
    kgData() {
      let weightRation = this.data.weightRation || {}
      let actualWeightRation = this.data.actualWeightRation || {}
      let data = this.typeWeight === 'left' ? weightRation : actualWeightRation
      data = data || {}
      data = this.isKgTime ? data.overviewWeightRatioMonthList : data.overviewWeightRatioList
      data = data || {}
      return data
    },
    /* 判断是否月*/
    isMonth() {
      return checkSaveMonth(this.formData)
    },
    isMoneyTime() {
      return this.moneyTime === 2 && this.isMonth
    },
    isKgTime() {
      return this.kgTime === 2 && this.isMonth
    },
    isTicketTime() {
      return this.ticketTime === 2 && this.isMonth
    },
    moneyOptions() {
      let options = []
      if (this.costTrendList && this.costTrendList.length > 0) {
        this.costTrendList.forEach((item) => {
          let data = {
            label: moneyLookUp[item.feeType] || '',
            value: item.feeType,
            data: item
          }
          options.push(data)
        })
      }
      return options
    },
    weightLoading() {
      return (this.data || {}).weightRationLoading || (this.data || {}).actualWeightRationLoading
    },
    heightVh() {
      return `${63 / 3}vh`
    },
    isTotalNumber() {
      return getAuth(this, 'totalNumber')
    },
    isTotalPoll() {
      return getAuth(this, 'totalPoll')
    },
    tabsWeight() {
      let tab = []
      if (getAuth(this, 'totalBillWeight')) {
        tab.push({ label: '计费重量', name: 'left' })
      }
      if (getAuth(this, 'realTotalWeight')) {
        tab.push({ label: '实际重量', name: 'right' })
      }
      return tab
    },
    tabs() {
      let tab = []
      if (getAuth(this, 'totalPoll')) {
        tab.push({ label: '票数', name: 'left' })
      }
      if (getAuth(this, 'totalNumber')) {
        tab.push({ label: '件数', name: 'right' },)
      }
      return tab
    },
    isTotalCost() {
      return getAuth(this, 'totalCost')
    },
    isRealTotalWeight() {
      return getAuth(this, 'realTotalWeight')
    },
    isBillWeight() {
      return getAuth(this, 'totalBillWeight')
    },
    isWeight() {
      return getAuth(this, 'totalBillWeight') || getAuth(this, 'realTotalWeight')
    },
    pollTitle() {
      if (getAuth(this, 'totalPoll') && this.type === 'left') {
        return {
          title: '票数趋势',
          unit: '(票数)'
        }
      }
      if (getAuth(this, 'totalNumber') && this.type === 'right') {
        return {
          title: '件数趋势',
          unit: '(件数)'
        }
      }
      return {}
    },
    isPoll() {
      return getAuth(this, 'totalPoll') || getAuth(this, 'totalNumber')
    },
    ticketLineShow() {
      return this.data.ticketData && Object.keys(this.data.ticketData).length > 0
    },
    letterLineShow() {
      return this.data.ticketData && Object.keys(this.data.ticketData).length > 0
    },
    moneyPieShow() {
      return ((this.data.costRation || {}).totalDiscountAmounts || []).length > 0
    },
    moneyLineShow() {
      return this.costRation && this.costRation.totalDiscountAmounts && this.costRation.totalDiscountAmounts.length > 0 || this.costTrendListCopy.length > 0
    },
    /*echart Legend*/
    moneyLegend() {
      let costRation = this.data.costRation || {}
      costRation = cloneDeep(costRation)
      if (costRation && Object.keys(costRation).length > 0) {
        let legend = cloneDeep(moneyLegend)
        if (costRation.sumClientTaxAmount && costRation.sumClientFlexDecimal) {
          legend = [...legend, {
            label: '另补税金',
            value: '',
            color: '#66D8FF'
          },
            {
              label: '优惠金额',
              value: '',
              color: '#57CD7C'
            }]
        } else if (costRation.sumClientTaxAmount && !costRation.sumClientFlexDecimal) {
          legend = [...legend, {
            label: '另补税金',
            value: '',
            color: '#66D8FF'
          }]
        } else if (!costRation.sumClientTaxAmount && costRation.sumClientFlexDecimal) {
          legend = [...legend, {
            label: '优惠金额',
            value: '',
            color: '#57CD7C'
          }]
        }
        legend[0].valueOld = numberFixed(costRation.waybillAmount) + '元'
        legend[0].value = toBaiWam(costRation.waybillAmount)
        legend[0].color = color[0]
        legend[0].url = freight
        legend[1].value = toBaiWam(costRation.totalAddedFee)
        legend[1].valueOld = numberFixed(costRation.totalAddedFee) + '元'
        legend[1].value = toBaiWam(costRation.totalAddedFee)
        legend[1].color = color[1]
        legend[1].url = coupon
        if (costRation.sumClientTaxAmount && costRation.sumClientFlexDecimal) {
          legend[2].value = toBaiWam(costRation.sumClientTaxAmount)
          legend[2].valueOld = numberFixed(costRation.sumClientTaxAmount) + '元'
          legend[2].color = color[2]
          legend[2].url = taxation
          legend[3].value = toBaiWam(costRation.sumClientFlexDecimal)
          legend[3].valueOld = numberFixed(costRation.sumClientFlexDecimal) + '元'
          legend[3].color = color[3]
          legend[3].url = appreciation
          return legend
        } else if (costRation.sumClientTaxAmount && !costRation.sumClientFlexDecimal) {
          legend[2].value = toBaiWam(costRation.sumClientTaxAmount)
          legend[2].valueOld = numberFixed(costRation.sumClientTaxAmount) + '元'
          legend[2].color = color[2]
          legend[2].url = taxation
          return [legend[0], legend[1], legend[2]]
        } else if (!costRation.sumClientTaxAmount && costRation.sumClientFlexDecimal) {
          legend[2].value = toBaiWam(costRation.sumClientFlexDecimal)
          legend[2].valueOld = numberFixed(costRation.sumClientFlexDecimal) + '元'
          legend[2].color = color[2]
          legend[2].url = appreciation
          return [legend[0], legend[1], legend[2]]
        } else {
          return [legend[0], legend[1]]
        }
      }
      return []
    },
    /* echart legeng*/
    kgLegend() {
      let legend = cloneDeep(kgLegend)
      if (this.kgData && this.kgData.length > 0) {
        legend.forEach((it) => {
          this.kgData.forEach((item) => {
            if (item.weightLevel && item.weightLevel === it.weightLevel) {
              it.value = numberFixed(item.voteRate) + '%'
              it.color = kgLegendColor[it.weightLevel]
            }
          })
        })
      }
      return legend
    },
    /* 费用组合*/
    moneyPieData() {
      let dataInfo = this.data.costRation || {}
      dataInfo = cloneDeep(dataInfo)
      return toBaiWam(dataInfo.sumAmounts)
    },
  },
  watch: {
    isMonth: {
      handler(n) {
        if (n) {
          this.kgTime = 2
          this.ticketTime = 2
        } else {
          
          this.kgTime = 1
          this.ticketTime = 1
        }
      },
      immediate: true
    },
    // 监听件数和票数
    'data.ticketData': {
      handler() {
        this.isMonth ? this.ticketTime = 2 : this.ticketTime = 1
        this.getTicketLineData()
        this.getLetterLineData()
      },
      deep: true,
      immediate: true
    },
    // 组合费用
    'data.costRation': {
      handler(n = {}) {
        this.initTab()
        this.isMonth ? this.moneyTime = 2 : this.moneyTime = 1
        this.costRation = cloneDeep(n)
        this.moneyLegendIndex = ''
        /* if (this.$refs.moneyLineRef) {
                    this.$refs.moneyLineRef.clear()
                }*/
        if (n.totalDiscountAmounts || n.totalDiscountMonthAmounts) {
          let data = cloneDeep(n) || {}
          let dataInfo = {
            addFeeDeatilList: [],
            addFeeDeatilMonthList: [],
            feeType: '99999999'
          }
          let totalDiscountAmounts = data.totalDiscountAmounts || []
          let totalDiscountMonthAmounts = data.totalDiscountMonthAmounts || []
          if (totalDiscountAmounts && totalDiscountAmounts.length > 0) {
            totalDiscountAmounts.forEach((item) => {
              let it = {
                shipingDate: item.shipingDate,
                feeAmount: item.feeAmount,
                clientFlexDecimal: item.clientFlexDecimal
              }
              dataInfo.addFeeDeatilList.push(it)
              if (!dataInfo.feeType) {
                dataInfo.feeType = item.feeType
              }
              return item.feeType
            })
          }
          if (totalDiscountMonthAmounts && totalDiscountMonthAmounts.length > 0) {
            totalDiscountMonthAmounts.forEach((item) => {
              let it = {
                shipingDate: item.shipingDate,
                feeAmount: item.feeAmount,
                clientFlexDecimal: item.clientFlexDecimal
              }
              dataInfo.addFeeDeatilMonthList.push(it)
              if (!dataInfo.feeType) {
                dataInfo.feeType = item.feeType
              }
              return item.feeType
            })
          }
          this.yunData = cloneDeep(dataInfo)
          this.moneylineTitle = '运费趋势'
          this.initMoneyLineData(dataInfo)
        } else {
          this.initMoneyLineData({})
        }
      },
      deep: true,
      immediate: true
    },
    // 计费重量
    'data.weightRation': {
      handler(newData = {}) {
        this.isMonth ? this.kgTime = 2 : this.kgTime = 1
        this.initTab()
        this.kgLegendIndex = ''
        /* if (this.$refs.kgLineRef) {
                    this.$refs.kgLineRef.clear()
                }*/
        let n = this.isKgTime ? newData.overviewWeightRatioMonthList : newData.overviewWeightRatioList
        if (n && n.length > 0) {
          let lineData = n[n.findIndex(item => item.sumVote === Math.max.apply(Math, n.map(item => {
            return item.sumVote
          })))] || {}
          let data = cloneDeep(lineData)
          this.initKgLineData(data)
        } else {
          this.initKgLineData({})
        }
        this.getKgPieData()
      },
      deep: true,
      immediate: true
    },
    // 实际重量
    'data.actualWeightRation': {
      handler(newData = {}) {
        this.isMonth ? this.kgTime = 2 : this.kgTime = 1
        this.initTab()
        this.kgLegendIndex = ''
        let n = this.isKgTime ? newData.overviewWeightRatioMonthList : newData.overviewWeightRatioList
        if (n && n.length > 0) {
          let lineData = n[n.findIndex(item => item.sumVote === Math.max.apply(Math, n.map(item => {
            return item.sumVote
          })))] || {}
          let data = cloneDeep(lineData)
          this.initKgLineData(data)
        } else {
          this.initKgLineData({})
        }
        this.$nextTick(() => {
          if (this.data.weightRation.length <= 0 || this.data.weightRation) {
            this.getKgPieData()
          }
        })
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /* 重量区间*/
    getKgPieData() {
      let pie = cloneDeep(pieData)
      if (Object.keys(this.kgData).length === 0) {
        pie.title = {
          text: '暂无数据',
          top: 60,
          left: 'center',
          textStyle: {
            color: '#C0C4CC',
            fontStyle: 'normal'
          }
        }
        this.kgPieData = pie
        return
      }
      pie.graphic[0].top = '45%'
      pie.graphic[1].top = '55%'
      pie.series[0].name = '重量区间'
      pie.series[0].data = toLabelValue(this.kgData, 'voteRate', 'weightLevel')
      pie.series[0].itemStyle.color = (param) => {
        if (param) {
          return kgLegendColor[param.data.weightLevel]
        }
        
      }
      pie.tooltip = {
        position: function(point) {
          let x = point[0]
          let y = point[1]
          return [x + 30, y + 30]
        },
        backgroundColor: null,
        extraCssText: 'border: none;',
        formatter: function(params) {
          let data = params.data || {}
          return turnHtml((params || {}).seriesName || '', [{
            backgroundColor: (params || {}).color,
            text: `${(params || {}).name}(KG):`,
            value: data.sumVote ? `${data.sumVote}(票)` : 0
          }, {
            backgroundColor: (params || {}).color,
            text: '票占比:',
            value: data.voteRate ? `${data.voteRate}%` : 0
          }])
        }
      }
      this.kgPieData = pie
      return pie
    },
    //  票数
    getTicketLineData() {
      let ticketData = this.isTicketTime ? this.data.ticketData.monthList : this.data.ticketData.dayList
      let line = cloneDeep(barLineData)
      let trendDate = [] // 日期
      let totalVotes = [] //总票数
      if (ticketData && ticketData.length > 0) {
        ticketData.forEach((item) => {
          let shipingDate = item.shipingDate
          trendDate.push(shipingDate)
          totalVotes.push(item.totalVote)
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
        this.isTicketLineData = false
        this.ticketLineData = line
        return
      }
      this.isTicketLineData = true
      let series = []
      series.push({
        name: '寄件票数',
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
        data: totalVotes
      })
      line.yAxis[0].interval = Math.ceil(Math.max.apply(null, totalVotes) / 5) || 1
      line.yAxis[0].max = Math.ceil(Math.max.apply(null, totalVotes) / 5) * 5 || 5
      line.yAxis[0].min = 0
      switch ((trendDate || []).length) {
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
      line.xAxis[0].data = trendDate
      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate = 28
      line.xAxis[0].axisLabel.fontSize = 11
      if (this.isTicketTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }
      line.series = series
      line.grid = {
        left: 80,
        top: 30,
        right: 30,
        bottom: 40,
      }
      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = function(params) {
        let obj = (params || [])[0] || {}
        return turnHtml(obj.name || '', [{
          backgroundColor: '#61a2ff',
          text: '寄件票数: ',
          value: obj.value ? `${obj.value}(票)` : 0
        }])
      }
      this.ticketLineData = line
      return line
    },
    /*件数数趋势图*/
    getLetterLineData() {
      let series = []
      let line = cloneDeep(barLineData)
      let trendDate = [] // 日期
      let totalVotes = [] //总票数
      let ticketData = this.isTicketTime ? this.data.ticketData.monthList : this.data.ticketData.dayList
      if (ticketData && ticketData.length > 0) {
        ticketData.forEach((item) => {
          let shipingDate = item.shipingDate
          trendDate.push(shipingDate)
          totalVotes.push(item.totalUnit)
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
        this.isLetterLineData = false
        this.letterLineData = line
        return
      }
      this.isLetterLineData = true
      series.push({
        name: '寄件件数',
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
        data: totalVotes
      })
      line.yAxis.interval = Math.ceil(Math.max.apply(null, totalVotes) / 5) || 1
      line.yAxis.max = Math.ceil(Math.max.apply(null, totalVotes) / 5) * 5 || 5
      line.yAxis.min = 0
      switch (trendDate.length) {
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
      line.xAxis[0].data = trendDate
      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate = 28
      line.xAxis[0].axisLabel.fontSize = 11
      if (this.isTicketTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }
      line.series = series
      line.grid = {
        left: 80,
        top: 30,
        right: 30,
        bottom: 40,
      }
      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = function(params) {
        let obj = (params || [])[0] || {}
        return turnHtml(obj.name || '', [{
          backgroundColor: '#61a2ff',
          text: '寄件件数: ',
          value: obj.value ? `${obj.value}(件)` : 0
        }])
      }
      this.letterLineData = line
      return line
    },
    //  切换票数/件数
    changeTicktMonth() {
      this.getTicketLineData()
      this.getLetterLineData()
    },
    //  计费重量 切换年
    changeKgMonth() {
      if (Object.keys(this.oldWeightsData).length <= 0) {
        let data = this.kgData
        let lineData = data[data.findIndex(item => item.sumVote === Math.max.apply(Math, data.map(item => {
          return item.sumVote
        })))] || {}
        this.oldWeightsData = lineData
      }
      if (this.kgData.length > 0) {
        this.kgData.forEach((it) => {
          if (it.weightLevel === this.oldWeightsData.weightLevel) {
            this.initKgLineData(it)
            this.getKgPieData()
          }
        })
      }
    },
    //  组合费用切换年
    changeMoneyMonth() {
      this.initMoneyLineData(this.oldMoneyData)
    },
    //  组合费用点击 list 切换
    changeMoney(value) {
      if (this.costTrendList && this.costTrendList.length > 0) {
        let data = this.costTrendList.find((item) => item.feeType === value)
        this.initMoneyLineData(data)
      }
    },
    //  实际重量转换
    toWamTons(total) {
      return toWamTon((total || {}).totalWeight)
    },
    //  获取tabs 数据
    initTab() {
      if (this.isLoad === true) {
        return
      }
      this.isLoad = true
      if (getAuth(this, 'totalPoll')) {
        this.type = 'left'
      } else {
        if (getAuth(this, 'totalNumber')) {
          this.type = 'right'
        }
      }
      if (getAuth(this, 'totalBillWeight')) {
        this.typeWeight = 'left'
      } else {
        if (getAuth(this, 'realTotalWeight')) {
          this.typeWeight = 'right'
        }
      }
    },
    // 选中KG高亮
    kgHighlight(name) {
      this.$refs.kgPieRef.dispatchAction({ type: 'downplay', seriesIndex: 0, name: this.kgLegendIndex })
      if (this.kgLegendIndex === name) {
        this.kgLegendIndex = ''
        return
      }
      this.kgLegendIndex = name
      this.$refs.kgPieRef.dispatchAction({ type: 'highlight', seriesIndex: 0, name: name })
    },
    // 选中Money高亮
    moneyHighlight(name) {
      this.$refs.moneyPieRef.dispatchAction({ type: 'downplay', seriesIndex: 0, name: this.moneyLegendIndex })
      if (this.moneyLegendIndex === name) {
        this.moneyLegendIndex = ''
        return
      }
      this.moneyLegendIndex = name
      this.$refs.moneyPieRef.dispatchAction({ type: 'highlight', seriesIndex: 0, name: name })
    },
    //  点击 echart list
    changeMoneyLegend({ item }) {
      this.activeMoneyEchart = item
      this.moneyLegendIndex = item.name || item.label
      console.log(this.activeMoneyEchart, this.moneyLegendIndex)
      this.setMoneyEchart(item)
    },
    //  点击 echart list
    changeKgLegend({ item, index }) {
      if (!item.weightLevel) {
        this.kGlineTitle = item.label
        this.kgLineShowNoData = false
        return
      }
      this.kgLineShowNoData = true
      this.kgHighlight(item.label, index)
      if (this.kgData.length > 0) {
        this.kgData.forEach((it) => {
          if (it.weightLevel === item.weightLevel) {
            this.initKgLineData(it)
          }
        })
      }
    },
    //  点击 饼图
    kgSelect(data) {
      if (!data.name) return
      this.kgHighlight(data.name)
      this.weights = data.data || []
      this.initKgLineData(this.weights)
    },
    /*重量区间趋势图*/
    initKgLineData(weightsData) {
      this.oldWeightsData = weightsData
      let line = cloneDeep(barLineData)
      let trendDate = [] // 日期
      let totalVotes = [] //总票数
      if (weightsData && weightsData.weights && weightsData.weights.length > 0) {
        weightsData.weights.forEach((item) => {
          let shipingDate = item.shipingDate
          trendDate.push(shipingDate)
          totalVotes.push(numberFixed(item.votes, 0))
        })
        this.kGlineTitle = weightLevel[weightsData.weightLevel] || ''
      } else {
        this.kGlineTitle = ''
        line.title = {
          text: '暂无数据',
          top: 60,
          left: 'center',
          textStyle: {
            color: '#C0C4CC',
            fontStyle: 'normal'
          }
        }
        this.kgLineData = line
        return
      }
      let series = []
      series.push({
        name: this.kGlineTitle,
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
        data: totalVotes
      })
      line.yAxis[0].interval = Math.ceil(Math.max.apply(null, totalVotes) / 5) || 1
      line.yAxis[0].max = Math.ceil(Math.max.apply(null, totalVotes) / 5) * 5 || 5
      line.yAxis[0].min = 0
      switch ((trendDate || []).length) {
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
      line.xAxis[0].data = trendDate
      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate = 28
      line.xAxis[0].axisLabel.fontSize = 11
      if (this.isKgTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }
      line.series = series
      line.grid = {
        left: 80,
        top: 30,
        right: 30,
        bottom: 40,
      }
      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = (params) => {
        let obj = (params || [])[0] || {}
        return turnHtml(obj.name || '', [{
          backgroundColor: kgLegendColor[weightsData.weightLevel] || '#61a2ff',
          text: `${this.kGlineTitle}(KG):`,
          value: obj.value ? `${obj.value}(票)` : 0
        }])
      }
      this.kgLineData = line
      return line
    },
    changeLgLine() {
      let data = this.kgData
      let lineData = data[data.findIndex(item => item.sumVote === Math.max.apply(Math, data.map(item => {
        return item.sumVote
      })))] || {}
      this.kgLegendIndex = ''
      this.initKgLineData(cloneDeep(lineData))
      this.getKgPieData()
    },
    /*重量区间趋势图*/
    initMoneyLineData(ticketData) {
      this.oldMoneyData = ticketData
      let line = cloneDeep(barLineData)
      let trendDate = [] // 日期
      let totalVotes = [] //总票数
      this.moneyType = ticketData.feeType || ''
      let deatilList = this.isMoneyTime ? ticketData.addFeeDeatilMonthList : ticketData.addFeeDeatilList
      deatilList = deatilList || []
      if (deatilList && deatilList.length > 0) {
        deatilList.forEach((item) => {
          let shipingDate = item.shipingDate
          trendDate.push(shipingDate)
          totalVotes.push(numberFixed(item.feeAmount))
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
        this.isMoneyLineData = false
        this.moneyLineData = line
        return
      }
      this.isMoneyLineData = true
      let series = []
      series.push({
        name: moneyLookUp[ticketData.feeType] || '运费',
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
        data: totalVotes
      })
      line.yAxis[0].interval = Math.ceil(Math.max.apply(null, totalVotes) / 5) || 1
      line.yAxis[0].max = Math.ceil(Math.max.apply(null, totalVotes) / 5) * 5 || 5
      line.yAxis[0].min = 0
      switch ((trendDate || []).length) {
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
      line.xAxis[0].data = trendDate
      line.xAxis[0].axisLabel.showMaxLabel = true
      line.xAxis[0].axisLabel.rotate = 28
      line.xAxis[0].axisLabel.fontSize = 11
      if (this.isMoneyTime) {
        line.xAxis[0].axisLabel.formatter = (name) => {
          if (name) {
            return dayjs(name).format('YYYY-MM')
          }
          return name
        }
      }
      line.series = series
      line.grid = {
        left: 80,
        top: 30,
        right: 30,
        bottom: 40,
      }
      line.tooltip.backgroundColor = null
      line.tooltip.extraCssText = 'border: none;'
      line.tooltip.formatter = function(params) {
        let obj = (params || [])[0] || {}
        return turnHtml(obj.name || '', [{
          backgroundColor: '#61a2ff',
          text: moneyLookUp[ticketData.feeType] || '运费',
          value: obj.value ? `${obj.value}(元)` : 0
        }])
      }
      this.moneyLineData = line
      return line
    },
    // 设置多条echart
    setMoneyEchart(data) {
      let costRation = this.data.costRation || {}
      costRation = cloneDeep(costRation)
      if (data.name === '增值费' || data.label === '增值费') {
        costRation.totalAddedFee && this.getBusinessCostTrendList(this.formData)
      } else if (data.name === '优惠金额' || data.label === '优惠金额') {
        let dataInfo = {
          addFeeDeatilList: [],
          addFeeDeatilMonthList: [],
          feeType: '11111111'
        }
        if (this.yunData.addFeeDeatilList) {
          this.yunData.addFeeDeatilList.forEach(item => {
            dataInfo.addFeeDeatilList.push({
              feeAmount: item.clientFlexDecimal,
              shipingDate: item.shipingDate
            })
          })
        }
        if (this.yunData.addFeeDeatilMonthList) {
          this.yunData.addFeeDeatilMonthList.forEach(item => {
            dataInfo.addFeeDeatilMonthList.push({
              feeAmount: item.clientFlexDecimal,
              shipingDate: item.shipingDate
            })
          })
        }
        this.initMoneyLineData(dataInfo)
      } else if (data.name === '另补税金' || data.label === '另补税金') {
        return
      } else {
        let costData = this.data.costRation || {}
        this.costRation = cloneDeep(costData)
        this.costTrendListCopy = []
        this.initMoneyLineData(this.yunData)
      }
      let str = data.name || data.label || ''
      if ((str === '增值费' || str === '增值费') && !costRation.totalAddedFee) return
      this.moneylineTitle = str + '趋势'
    },
    // 点击 饼图legend
    moneyLegendSelect(data) {
      if (data.name === '增值费') {
        this.getBusinessCostTrendList(this.formData)
      } else {
        this.initMoneyLineData(this.yunData)
      }
    },
    //  点击更多
    moneyLegendMoseSelect(data) {
      if (data.name && data.name.indexOf('更多') > -1) {
        if (this.costTrendList && this.costTrendList.length > 0) {
          if (this.costTrendList && this.costTrendList.length > 0) {
            this.initMoneyLineData(this.costTrendList)
          }
        }
      }
    },
    // 请求数据
    async getBusinessCostTrendList(param) {
      let isChange = checkParams(this.formData, this.oldParams['costTrendList'])
      if (isChange && this.oldParams['costTrendList'] && Object.keys(this.oldParams['costTrendList']).length > 0 && this.costTrendList.length > 0) {
        this.costTrendListCopy = [...this.costTrendList]
        let costTrendList = this.costTrendList[0]
        this.initMoneyLineData(costTrendList)
        return
      }
      this.oldParams['costTrendList'] = cloneDeep(this.formData)
      this.costTrendList = []
      let reg = await API.overviewCostTrendList(param)
      this.costRation = {}
      if (reg.code === 0) {
        let arr = []
        reg.data.forEach(item => {
          if (item.addFeeDeatilList.length) {
            arr.push(item)
          }
        })
        this.costTrendList = arr || []
        this.costTrendListCopy = arr || []
        if (this.costTrendList && this.costTrendList.length > 0) {
          let costTrendList = this.costTrendList[0]
          this.initMoneyLineData(costTrendList)
        }
      }
    },
  }
}
</script>

<style scoped lang='scss'>
.main-business {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.el-row-column {
  display: flex;
  flex-direction: column;
  flex: 1;
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

.tabs-wrap2 {
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

.echart-box {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #fff;
  border-top: 1px solid #ebebeb;
  
  .echart-box-pie {
    position: relative;
    
    .echart-box-pie-status {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      
      .echart-box-pie-text {
        text-align: center;
        font-size: 1.2rem;
        color: #666666;
        margin-bottom: 0.2rem;
      }
      
      .echart-box-pie-totalWeight {
        text-align: center;
        font-size: 1.8rem;
        font-weight: 600;
        color: #0c092b;
      }
    }
  }
  
  .echart-box-left {
    width: 400px;
    
    .money-pie {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      box-sizing: border-box;
      
      .money-pie-total {
        margin-bottom: 8px;
        font-size: 18px;
        color: #7f7e8d;
        font-weight: 500;
      }
      
      .money-pie-small {
        margin-right: 4px;
        font-size: 12px;
        color: #0c092b;
      }
      
      .money-pie-large {
        font-size: 20px;
        color: #0c092b;
        font-weight: 600;
      }
      
      .money-pie-line {
        position: absolute;
        right: 24%;
        top: 50%;
        transform: translateY(-50%);
        width: 1px;
        height: 85px;
        background: #edecf1;
      }
    }
    
    /*.echart-box-left-pie{
                width: 50%;
                display: inline-block;
            }
            .echart-box-left-list{
                width: 50%;
                display: inline-block;
            }*/
  }
  
  .echart-box-right {
    position: relative;
    flex: 1;
    // margin-left: 470px;
  }
  
  .money-select {
    width: 60px;
    position: absolute;
    top: 0;
    right: 10px;
    
    ::v-deep .el-input--mini .el-input__inner {
      height: 18px;
      padding-right: 20px;
      padding-left: 2px;
      line-height: 18px;
      font-size: 12px;
    }
    
    ::v-deep .el-input__suffix {
      right: 0;
    }
    
    ::v-deep .el-input--mini .el-input__icon {
      line-height: 18px;
    }
  }
}

.list-title-line-header {
  width: 100%;
  display: flex;
  background: #fff;
  
  .line-left_title {
    width: 400px;
  }
  
  .line-right_title {
    flex: 1;
  }
}
</style>
