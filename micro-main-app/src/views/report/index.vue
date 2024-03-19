<template>
  <div class="report-container">
    <div class="main-title">
      <span>统计报表</span>
    </div>
    <express-realtime v-if="isPermission('expressRealTimeState')" />

    <div class="date-selector">
      <el-form :model="formData" label-width="72px" label-position="left">
        <el-form-item label="寄件时间：" prop="dateRange">
          <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" class="date-picker" value-format="yyyy-MM-dd" @change="activeDateSpan=''">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <span v-for="(item,index) in dateSpans" :key="index" @click="setDatePicker(item.value)" :class="{active:activeDateSpan===item.value}">{{item.label}}</span>
    </div>

    <div class="card-list">
      <fee-overview v-if="isPermission('freeGroup')" :dateRange="formData.dateRange">
        <template v-slot:tip>
          <div class="updatetime-tip">{{updateTimeTip}}</div>
        </template>
      </fee-overview>
      <express-overview v-if="isPermission('expressGroup')" :dateRange="formData.dateRange">
        <template v-slot:tip>
          <div class="updatetime-tip">{{updateTimeTip}}</div>
        </template>
      </express-overview>
      <whole-view v-if="isPermission('wholeDeliveredFlag')" :dateRange="formData.dateRange" ref="wholeOverview">
        <template v-slot:tip>
          <div class="updatetime-tip">{{updateTimeTip}}</div>
        </template>
      </whole-view>
      <prescription-view v-if="isPermission('timeDeliveredFlag')" :dateRange="formData.dateRange" ref="prescriptionOverview">
        <template v-slot:tip>
          <div class="updatetime-tip">{{updateTimeTip}}</div>
        </template>
      </prescription-view>
      <flow-overview v-if="isPermission('flowToFlag')" :dateRange="formData.dateRange" ref="flowOverview">
        <template v-slot:tip>
          <div class="updatetime-tip">{{updateTimeTip}}</div>
        </template>
      </flow-overview>
      <weight-overview v-if="isPermission('weightFlag')" :dateRange="formData.dateRange" ref="weightOverview">
        <template v-slot:tip>
          <div class="updatetime-tip">{{updateTimeTip}}</div>
        </template>
      </weight-overview>
      <div v-if="visibleOfDefaulCard" class="card-default card-wrapper"></div>
    </div>
    <time-analysis-overview v-if="isPermission('timeReport')&&(authorityIds.indexOf('118')>=0)" :dateRange="formData.dateRange" ref="timeAnalysisOverview"></time-analysis-overview>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { isElementInViewport } from '@/utils'
import _ from 'lodash'
import FeeOverview from './fee/components/FeeOverview'
import ExpressOverview from './express/components/ExpressOverview.vue'
import WeightOverview from './weight/components/WeightOverview.vue'
import WholeView from './delivered/componets/WholeView'
import FlowOverview from './flow-analyse/components/FlowOverview.vue'
import ExpressRealtime from './express/components/ExpressRealtime.vue'
import PrescriptionView from './delivered/componets/PrescriptionView'
import TimeAnalysisOverview from './time-analysis/overview.vue'
import { getDataUpdateTime } from '@/services/api/report'

export default {
  components: {
    FeeOverview,
    ExpressOverview,
    WeightOverview,
    WholeView,
    FlowOverview,
    ExpressRealtime,
    PrescriptionView,
    TimeAnalysisOverview
  },
  data () {
    return {
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      updateTimeTip: '',
      activeDateSpan: 'one week',
      dateSpans: [{ label: '近一周', value: 'one week' }, { label: '近一月', value: 'one month' },
        { label: '近三月', value: 'three month' }, { label: '近半年', value: 'six month' }, { label: '近一年', value: 'one year' }],
      timer: null,
      formData: {
        dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      },
    }
  },
  activated () {
    this.setUpdateTimeTip()
    this.timer = setInterval(this.setUpdateTimeTip, 2 * 60 * 60 * 1000)
    window.addEventListener('scroll', this.scrollHandler, true)
  },
  destroyed () {
    clearInterval(this.timer)
    window.removeEventListener('scroll', this.scrollHandler, true)
  },
  deactivated () {
    clearInterval(this.timer)
    window.removeEventListener('scroll', this.scrollHandler, true)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      vm.$nextTick(() => {
        const dict = {
          '/admin/report/fee': 'fee-overview-container',
          '/admin/report/express': 'express-overview-container',
          '/admin/report/waybill-payment': 'express-overview-container',
          '/admin/report/waybill-deliver-status': 'express-realtime-container',
          '/admin/report/abnormal-waybill': 'express-overview-container',
          '/admin/report/delivered': 'whole-overview-container',
          '/admin/report/PrescriptionIndex': 'prescription-overview-container',
          '/admin/report/weight': 'weight-overview-container',
          '/admin/report/flow-analyse': 'flow-overview-container',
          '/admin/report/time-analysis': 'time-analysis-overview',
        }
        const className = dict[from.path]
        if (!className) return
        const el = document.querySelector('.' + className)
        el.scrollIntoView({ behavior: "smooth" })
      })
    })
  },
  methods: {
    async setUpdateTimeTip () {
      const res = await getDataUpdateTime()
      if (res.code === 0) {
        const updateTime = dayjs(res.data[0].endTime)
        this.updateTimeTip = `更新时间：${updateTime.format('YYYY/MM/DD HH:mm:ss')}`
      }
    },
    scrollHandler: _.throttle(function () {
      this.lazyLoadData()
    }, 500),
    lazyLoadData () {
      const refNameClass = {
        'weightOverview': '.weight-overview-container',
        'flowOverview': '.flow-overview-container',
        'prescriptionOverview': '.prescription-overview-container',
        'wholeOverview': '.whole-overview-container',
      }
      Object.entries(refNameClass).forEach(([refName, className]) => {
        const el = document.querySelector(className)
        const flag = isElementInViewport(el)
        if (flag) {
          this.$refs[refName].overviewDateRange = this.formData.dateRange
        }
      })
    },
    setDatePicker (value) {
      let beginDate
      this.activeDateSpan = value
      switch (value) {
        case 'one week':
          beginDate = dayjs().add(-7, 'day'); break
        case 'one month':
          beginDate = dayjs().add(-30, 'day'); break
        case 'three month':
          beginDate = dayjs().add(-90, 'day'); break
        case 'six month':
          beginDate = dayjs().add(-180, 'day'); break
        case 'one year':
          beginDate = dayjs().add(-1, 'year'); break
      }
      this.formData.dateRange = [beginDate.format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]
    },
    isPermission (val) {
      const permission = this.$store.state.client.customerizedPermission
      let result = false
      let model = permission && permission[val]
      if (model && model === '10') {
        result = true
      }
      return result
    }
  },
  computed: {
    visibleOfDefaulCard () {
      const cards = ['freeGroup', 'flowToFlag', 'wholeDeliveredFlag', 'timeDeliveredFlag', 'expressGroup', 'weightFlag']
      const permission = this.$store.state.client.customerizedPermission
      if (!permission) {
        return false
      }
      return (cards.filter(f => permission[f] === '10').length % 2) === 1
    },
    ...mapGetters(["authorityIds"])
  },
  watch: {
    'formData.dateRange': {
      handler () {
        this.$nextTick(() => {
          this.lazyLoadData()
        })
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss" scoped>
  .report-container {
    @include scroll-bar;
    position: relative;
    height: 100%;
    background-color: #f5f7fb;
    overflow: auto;
    .main-title {
      padding: 0 20px;
      font-size: 18px;
      color: #333333;
      height: 49px;
      line-height: 49px;
      background-color: white;
      & > span {
        font-weight: bold;
      }
    }
    .date-selector {
      margin-top: 16px;
      padding: 12px 20px;
      border-radius: 12px;
      background-color: white;
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      & > :first-child {
        margin-right: 26px;
      }
      & > span {
        margin-right: 26px;
        cursor: pointer;
        &:hover,
        &.active {
          color: #9378fa;
        }
      }
      .el-form-item {
        margin-bottom: 0;
        /deep/ .el-form-item__label {
          padding-right: 0;
          color: #333333;
        }
      }
      @import "./scss/index.scss";
    }

    .card-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      & > div {
        flex: 40%;
        overflow: auto;
        &:nth-child(2n) {
          margin-left: 20px;
        }
      }
      .card-default {
        @import "./scss/card.scss";
        min-height: 507px;
        background: url("~@assets/image/report-default.png") no-repeat;
        background-position: center;
        background-color: white;
      }
    }
  }
</style>
