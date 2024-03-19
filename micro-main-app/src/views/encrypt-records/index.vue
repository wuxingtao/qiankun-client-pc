<template>
  <ky-page-container class="page-list-container" title="">
    <!-- 查询条件区域 -->
    <ky-search-container>
      <div>
        <span>操作时间</span>
        <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" class="date-picker">
        </el-date-picker>
      </div>
      <el-button type="primary" round size="medium" @click="queryData">查询</el-button>
    </ky-search-container>
    <ky-table :data="tableData" :tableColumns="tableColumns" :pagination="pagination" @pagination-change="queryData" :height="'calc(100vh - 215px)'" v-loading="loading">
    </ky-table>
  </ky-page-container>

</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { queryRecords } from '@/services/api/encrypt'
import {  getCustomerCode } from '@/utils/storage'

const tableColumns = [
  { prop: 'name', text: '查看人姓名', width: '120' },
  { prop: 'phone', text: '查看人手机', width: '120' },
  { prop: 'creationDate', text: '操作时间', width: '150' },
  { prop: 'module', text: '查看模块', width: '120' },
  { prop: 'cotent', text: '查看内容', width: '300' },
]

export default {
  data () {
    return {
      loading : false,
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-3, 'month')),
      formData: {
        dateRange: [dayjs().add(-1, 'month'), dayjs()],
      },
      tableColumns: tableColumns,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  mounted(){
    this.handleQueryClick ()
  },
  methods: {
    //获取查询入参
    getQueryParams (pageIndex, pageSize) {
      const params = {
        customerCode:getCustomerCode(),
        startTime: dayjs(this.formData.dateRange[0]).format('YYYY-MM-DD 00:00:00'),
        endTime: dayjs(this.formData.dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        page: pageIndex || this.pagination.pageIndex,
        pageSize: pageSize || this.pagination.pageSize,
      }
      return params
    },
    //查询数据
    async queryData () {
      try{
        this.loading = true
        const params = this.getQueryParams()
        const res = await queryRecords(params)
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.pagination.totalCount = res.data.rowTotal
        }
      }finally{
        this.loading = false
      }
    },
    //点击查询
    handleQueryClick () {
      this.pagination.pageIndex = 1
      this.queryData()
    },     
  },
}
</script>

<style lang="scss" scoped>

</style>