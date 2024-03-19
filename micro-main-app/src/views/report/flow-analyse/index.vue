<template>
  <div class="main-container">
    <div class="main-title" @click="back">
      <div class="title">
        <el-image :src="backImg" class="icon-back"></el-image>流向分析
      </div>
    </div>
    <div class="date-selector">
      <el-form :model="formData" label-width="72px" label-position="left">
        <el-form-item label="寄件时间" prop="dateRange">
          <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd">
          </el-date-picker>
        </el-form-item>
      </el-form>
    </div>
    <div class="flow-pc">
      <div class="flow-title">
        流向图
      </div>
      <chart-flow-pc :dateRange="formData.dateRange"></chart-flow-pc>
    </div>
    <div class="tab-wrapper">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="按收件公司" name="3">
          <table-company :dateRange="formData.dateRange"  ref="table3"/>
        </el-tab-pane>
        <el-tab-pane label="按省份" name="1">
          <table-address category="省份" :dateRange="formData.dateRange" ref="table1"/>
        </el-tab-pane>
        <el-tab-pane label="按城市" name="2">
           <table-address category="城市" :dateRange="formData.dateRange"  ref="table2"/>
        </el-tab-pane>
      </el-tabs>
    </div>

  </div>
</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import ChartFlowPc from './components/ChartFlowPc'
import TableAddress from './components/TableAddress.vue'
import TableCompany from './components/TableCompany.vue'

export default {
  components: { ChartFlowPc,TableAddress,TableCompany },
  data () {
    return {
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-12, 'month')),
      formData: {
        dateRange: [dayjs().add(-1, 'week').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
      },
      backImg: require('@assets/image/back-waybill.png'),
      activeTab: '3',
    }
  },
  activated() {
    const dateRange=this.$route.query.dateRange && JSON.parse(this.$route.query.dateRange)
    if (dateRange) {
      this.formData.dateRange = dateRange
    }
  },
  methods: {
    back () {
      this.$router.push({ path: '/admin/report' })
    }
  },
  watch:{
    activeTab(val){
      this.$nextTick(()=>this.$refs['table'+val].doLayout())
    }
  }
}
</script>

<style lang="scss" scoped>
  .main-container {
    @import "../scss/index.scss";
    height: 100%;
    background-color: #f5f7fb;
    .main-title {
      padding: 0 20px;
      background: #fff;
      .title {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e5e5ef;
        color: rgba(51, 51, 51, 0.93);
        font-size: 16px;
        font-weight: bold;
        box-sizing: border-box;
        padding: 16px 0;
        cursor: pointer;
      }
      .icon-back {
        margin-right: 13px;
      }
    }
    .date-selector {
      padding: 12px 20px;
      border-radius: 0 0 12px 12px;
      background-color: white;
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
      & > .el-form {
        margin-right: 26px;
      }
      & > span {
        margin-right: 26px;
        cursor: pointer;
        &:hover {
          color: #9378fa;
        }
      }
      .el-form-item {
        margin-bottom: 0;
      }
    }
    .flow-pc {
      margin: 16px 0;
      padding: 0 20px;
      background: #fff;
      border-radius: 8px;

      .flow-title {
        padding: 17px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        border-bottom: 1px solid #f1f1f5;
      }
    }
    .tab-wrapper {
      border-radius: 8px;
      box-shadow: 0px 6px 20px 0px rgba(29, 26, 33, 0.05);
      margin-top: 16px;
      padding: 0 20px;
      background-color: #fff;
    }
  }

  /deep/ {
    .el-form-item__label {
      text-align: left;
      padding-right: 0;
      color: #333333;
    }
    .el-range-editor.el-input__inner {
      width: 270px;
    }

    .el-input--suffix .el-input__inner {
      padding-right: 26px;
    }

    .el-input__inner {
      border-radius: 18px;
      background: #eef3fc;
      border: 0 !important;
    }
    .ml_12 {
      border-radius: 19px;
    }
    .el-range-separator {
      font-size: 0;
      width: 12px;
      height: 13px;
      background: url("~@/assets/image/date-arrow.png") no-repeat top left;
      background-size: contain;
    }
    .el-range-input {
      border: 0 !important;
      background-color: transparent;
    }
    .el-icon-date {
      position: absolute;
      right: 16px;
      color: #7556ed;
    }
  }
</style>