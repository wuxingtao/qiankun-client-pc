<template>
  <div class="exhibition-waybills-container">
    <div class="index-title">
      国际会展
    </div>
    <div class="search-condition">
      <div>
        <span>运单号</span>
        <el-input v-model="formData.waybillNumber" placeholder="运单号" style="width:200px"></el-input>
      </div>
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd"  class="ky-date-picker" style="width:264px">
        </el-date-picker>
      </div>
      <el-button type="primary" round size="medium" @click="queryData">查询</el-button>
      <el-button round size="medium" @click="exportWaybillData" :loading="loadingOfExport">导出全部运单</el-button>
    </div>
      <div class="waybill-table-wrapper">
    <waybill-table ref="waybillTable" :formData="formData"  />
      </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import WaybillTable from './components/WaybillTable.vue' 

export default {
  components: {  WaybillTable },
  data () {
    return {
      loadingOfExport: false,
      pickerOptions: uiUtil.getPickerOptions(null,6),
      activeTab: '',
      tableData: [],
      countSummary: {
        paidBySenderCount: 0,
        paidByReceiverCount: 0,
        paidByThirdPartCount: 0,
      },
      formData: {
        waybillNumber: '',
        dateRange: [dayjs().add(-15, 'd'), dayjs()],
      },
    }
  },
  mounted () {
    this.queryData()
  },
  methods: {
    async queryData () {
      this.$refs.waybillTable.queryData()
    },
    async exportWaybillData () {
      this.loadingOfExport = true
      try {
        await this.$refs.waybillTable.exportWaybillData()
      } finally {
        this.loadingOfExport = false
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .exhibition-waybills-container {
    height: 100%;
    .search-condition {
      padding: 8px 20px 20px;
      font-size: 14px;
      color: #333333;
      &>button{
        margin-top: 12px;
      }
      & > div {
        display: inline-block;
        padding-right: 12px;
        margin-top: 12px;
        & > :first-child {
          padding-right: 8px;
        }
      }
      /deep/.el-input {
        display: inline-block;
        width: 166px;
        & > input {
          border: none;
          border-radius: 19px;
          padding: 0 12px;
          background: #eef3fc;
        }
      } 
 
      .el-button--medium.is-round {
        padding: 10px 27px;
      }
    }
    .waybill-table-wrapper{
      margin: 0 20px;
      padding-top: 20px  ;
      border-top: 1px solid #f1f1f5;
    }
  }
</style>