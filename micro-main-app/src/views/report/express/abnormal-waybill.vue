<template>
  <div class="abnormal-waybill-container">
    <div class="header-wrapper">
      <return>异常运单</return>
      <div class="categories">
        <span v-for="(item,index) in expressTypes" :key="index" :class="{'active':formData.expressType===item.value}" @click="formData.expressType=expressTypes[index].value">
          {{item.label}}
        </span>
      </div>
      <div class="search-condition">
        <div>
          <span>寄件时间</span>
          <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd" class="date-picker">
          </el-date-picker>
        </div>
        <div>
          <span>寄件信息</span>
          <el-input v-model="formData.senderInfo" placeholder="寄件公司/寄件人/寄件人号码"></el-input>
        </div>
        <div>
          <span>收件信息</span>
          <el-input v-model="formData.receiverInfo" placeholder="收件公司/收件人/收件人号码"></el-input>
        </div>
        <div>
          <span>异常原因</span>
          <el-select v-model="formData.selectedAbnormalReason" placeholder="请选择" size="medium" clearable="">
            <el-option v-for="(item,index) in abnormalReasonList" :key="index" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </div>
        <el-button type="primary" round size="medium" @click="loadData">查询</el-button>
        <!-- <el-button round size="medium">导出全部运单</el-button> -->
      </div>
    </div>
    <chart-abnormal :formData="formData" ref="chartAbnormal" class="wrapper" />
    <div class="bottom-wrapper wrapper">
      <div class="btn-wrapper">
        <el-button type="text" @click="exportWaybillData">
          <svg-icon icon-class="icon-export" class="icon-tabs" /> 导出
        </el-button>
        <el-button type="text" @click="showColumnManager">
          <svg-icon icon-class="waybill-setting" class="icon-tabs" /> 自定义排序
        </el-button>
      </div>
      <el-tabs v-model="activeTab" class="tab-wrapper">
        <el-tab-pane v-for="item in abnormalReasonList2" :key="item.label" :label="item.label" :name="item.value">
          <waybill-table-abnormal :abnormalReason="item.value" :gridName="'report-express-waybill-abnormal-table'+item.value" :ref="'waybillTableAbnormal'+item.value" :formData="formData" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import Return from '../components/Return.vue'
import ChartAbnormal from './components/ChartAbnormal.vue'
import WaybillTableAbnormal from './components/WaybillTableAbnormal.vue'
export default {
  components: { Return, ChartAbnormal, WaybillTableAbnormal },
  data () {
    return {
      expressTypes: [{ label: '我发出的', value: 0 }, { label: '我收到的', value: 1 }],
      abnormalReasonList: [{ label: '收方要求等通知派送', value: '120' }, { label: '收方要求改地址', value: '340' },
        { label: '寄方指定时间派送', value: '60' }, { label: '收方指定时间派送', value: '110' }, { label: '节假日不上班，节后派送', value: '450' },
        { label: '客户要求自提', value: '260' }, { label: '联系不上收方', value: '180' }, { label: '等预约单、报关单派送', value: '240' },
        { label: '客户未预约', value: '390' }, { label: '预约信息与货物不符', value: '370' }, { label: '航班取消、延误、备降、失事、返航', value: '540' }],
      abnormalReasonList2: [{ label: '客户指定', value: '20' }, { label: '联系不上客户', value: '30' }, { label: '预约异常', value: '40' }, { label: '客观原因', value: '50' }],
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      formData: {
        expressType: 0,
        dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
        senderInfo: '',
        receiverInfo: '',
        selectedAbnormalReason: ''
      },
      activeTab: '20',
      waybillTableRef: null,
    }
  },
  activated () {
    this.formData = Object.assign(this.formData, this.$options.data().formData)
    this.activeTab = '20'
    const dateRange = this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.formData.dateRange = dateRange
    }
    this.waybillTableRef = this.$refs['waybillTableAbnormal' + this.activeTab][0]
    this.loadData()
  },
  methods: {
    loadData () {
      this.$refs.chartAbnormal.loadData()
      this.waybillTableRef.queryData()
    },
    exportWaybillData () {
      this.waybillTableRef.exportWaybillData()
    },
    showColumnManager () {
      this.waybillTableRef.showColumnManager()
    }
  },
  watch: {
    activeTab (val) {
      this.waybillTableRef = this.$refs['waybillTableAbnormal' + val][0]
      this.waybillTableRef.queryData()
      this.$nextTick(() => { this.waybillTableRef.doLayout() })
    },
    'formData.expressType' () {
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
  .abnormal-waybill-container {
    height: 100%;
    background-color: #f5f7fb;
    .header-wrapper {
      @import "../scss/index.scss";
      /deep/.el-input {
        width: 264px !important;
      }

      background-color: #fff;
      border-radius: 0 0 12px 12px;
      .categories {
        height: 48px;
        margin: 0 20px;
        border-bottom: 1px solid #f1f1f5;
        font-weight: 400;
        color: rgba(51, 51, 51, 0.93);
        & > span {
          display: inline-block;
          margin-right: 64px;
          padding: 16px 0;
          cursor: pointer;
          font-weight: bold;
          &.active {
            color: #8365f6;
            &::after {
              content: "";
              display: block;
              height: 4px;
              background-color: #8365f6;
              border-radius: 4px;
              position: relative;
              top: 12px;
            }
          }
        }
      }
      .search-condition {
        padding: 20px 20px 8px;
      }
    }
    .wrapper {
      margin: 20px 0;
      padding: 28px 20px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0px 6px 20px 0px rgba(29, 26, 33, 0.05);
    }
    .bottom-wrapper {
      @import "../scss/index.scss";
      position: relative;
      .btn-wrapper {
        position: absolute;
        top: 5px;
        right: 20px;
        z-index: 2;
        color: #8365f6;
        & > button:first-of-type {
          padding-right: 12px;
        }
      }
      .tab-wrapper {
        padding: 0;
      }
    }
  }
</style>