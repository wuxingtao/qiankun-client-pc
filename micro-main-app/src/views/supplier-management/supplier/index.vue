<template>
  <ky-page-container class="page-list-container" title="供应商信息">
    <ky-search-container>
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" class="date-picker">
        </el-date-picker>
      </div>
      <div>
        <span>供应商</span>
        <el-input v-model="formData.supplier" size="medium" placeholder="请输入供应商名称" clearable></el-input>
      </div>
      <el-button type="primary" round size="medium" @click="handleQueryClick">查询</el-button>
      <el-button round size="medium" @click="handleExportData">导出全部数据</el-button>
    </ky-search-container>
    <div class="btn-wrapper">
      <!-- <el-button type="text" class="right-border" @click="$router.push('/supplier/detail')">
        <svg-icon icon-class="supplier-add" /> 新增
      </el-button> -->
      <el-button type="text" @click="visbileOfCustomColum=true">
        <svg-icon icon-class="waybill-setting" /> 自定义排序
      </el-button>
    </div>
    <ky-table ref="kyTable" :key="Math.random()" :data="tableData" :pagination="pagination" @pagination-change="queryData" :height="'calc(100vh - 312px)'" v-loading="loading">
      <!-- <el-table-column fixed label="操作">
        <template v-slot="{row}">
          <el-button @click="modifySupplier(row.id)" type="text">修改</el-button>
        </template>
      </el-table-column> -->
      <el-table-column label="启用状态"  min-width="90px">
        <template v-slot="{row}">
          <div class="switch-wrapper">
            <div class="switch-wrapper__text" :class="{active:row.supplierStatus===1}"> {{row.supplierStatus===1?'开':'关'}}</div>
            <el-switch v-model="row.supplierStatus" active-color="#9378FA" :active-value="1" :inactive-value="0" inactive-color="#BFC5D1" @change="supplierStatusChange(row,$event)">
            </el-switch>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-for="(col,index) in tableColumns.filter((c) => c.text && c.visible)" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text"  :min-width="col.width+'px'">
        <template v-slot="{row}">
          <!-- <el-link v-if="col.prop==='supplierName'" type="primary" :underline="false" @click="viewSupplier(row.id)">{{row[col.prop]}}</el-link>
          <el-link v-else-if="col.prop==='sku'" type="primary" :underline="false" @click="handleViewSku(row)">查看</el-link> -->
          <span>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>
    </ky-table>
    <ky-custom-column :visible.sync="visbileOfCustomColum" :tableConfigName="tableConfigName" :tableColumns.sync="tableColumns" @change="handleColumnChange" />
  </ky-page-container>

</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { getCustomerCode } from '@/utils/storage'
import { exportExcel } from '@utils/clientUtil'
import { getSpecialSupplierList, modifySupplierStatus } from '@/services/api/supplier'

const tableColumns = [
  // { prop: "supplierStatus", text: "启用状态", width: "90", visible: true },
  { prop: 'supplierName', text: '供应商名称', width: '209', prohibitHide: true, visible: true },
  { prop: 'sendTime', text: '寄件时间段', width: '200', visible: true },
  { prop: 'agingAchievedRate', text: '时效达成率', width: '111', visible: true },
  // { prop: 'sku', text: 'SKU库', width: '111', visible: true },
  { prop: 'contactName', text: '联系人', width: '110', visible: true },
  { prop: 'contactPhone', text: '手机号码', width: '153', visible: true },
  { prop: 'supplierAddress', text: '供应商地址', width: '279', visible: true },
  { prop: 'email', text: '电子邮箱', width: '153', visible: true },
  { prop: 'telephone', text: '固定电话', width: '153', visible: true },
  { prop: 'remarks', text: '备注', width: '153', visible: true },
  { prop: 'creationDate', text: '创建时间', width: '153', visible: true },
]
export default {
  data () {
    return {
      // pickerOptions: uiUtil.getPickerOptions(dayjs('2020-01-01'), 1, 'month', dayjs()),
      pickerOptions: {
        tempSelectedDate: '',
        onPick: ({ maxDate, minDate }) => {
          this.pickerOptions.tempSelectedDate = minDate.getTime()
          if (maxDate) {
            this.pickerOptions.tempSelectedDate = ''
          }
        },
        disabledDate: (time) => {
          if (time < dayjs('2020-01-01')) {
            return true
          }
          if (time >dayjs()) {
            return true
          }
          if (this.pickerOptions.tempSelectedDate !== '') {
            const minDate = dayjs(this.pickerOptions.tempSelectedDate).add(-30, 'day')
            const maxDate = dayjs(this.pickerOptions.tempSelectedDate).add(30, 'day')
            return time.getTime() < minDate || time.getTime() > maxDate
          }
        },
      },
      formData: {
        dateRange: [dayjs().add(-1, 'month'), dayjs()],
        supplier: '',
      },
      visbileOfCustomColum: false,
      tableConfigName: 'supplier-main1',
      tableColumns: tableColumns,
      tableData: [],
      loading: false,
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  mounted () {
    if (!this.$route.params.refresh) {
      this.handleQueryClick()
    }
  },
  activated () {
    if (this.$route.params.refresh) {
      this.handleQueryClick()
    }
    this.$refs.kyTable.doLayout()
  },
  methods: {
    handleColumnChange () {
      this.$refs.kyTable.doLayout()
    },
    handleViewSku (row) {
      this.$router.push({ name: 'sku', params: {supplierName:row.supplierName, supplierPhone:row.contactPhone} })
    },
    viewSupplier (id) {
      this.$router.push({ path: '/supplier/detail', query: { id ,type:'view'} })
    },
    modifySupplier (id) {
      this.$router.push({ path: '/supplier/detail', query: { id } })
    },
    async supplierStatusChange (row, supplierStatus) {
      try {
        this.loading = true
        row.supplierStatus = supplierStatus === 1 ? 0 : 1
        const res = await modifySupplierStatus({ id: row.id, supplierStatus })
        if (res.code === 0) {
          row.supplierStatus = supplierStatus
        }
      } finally {
        this.loading = false
      }
    },
    //获取查询入参
    getQueryParams (pageIndex, pageSize) {
      const params = {
        createStartTime: dayjs().add(-1,'month').format('YYYY-MM-DD 00:00:00'),
        createEndTime: dayjs().format('YYYY-MM-DD 23:59:59'),
        sendStartTime: dayjs(this.formData.dateRange[0]).format('YYYY-MM-DD'),
        sendEndTime: dayjs(this.formData.dateRange[1]).format('YYYY-MM-DD'),
        supplierName: this.formData.supplier,
        customerCode: getCustomerCode(),
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
        const res = await getSpecialSupplierList(params)
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.pagination.totalCount = res.data.rowTotal
        }
        this.handleColumnChange()
      }finally{
        this.loading = false
      }
    },
    //点击查询
    handleQueryClick () {
      this.pagination.pageIndex = 1
      this.queryData()
    },
    //获取一页的导出数据
    async getExportDataInPage (pageIndex) {
      const params = this.getQueryParams(pageIndex, 500)
      const res = await getSpecialSupplierList(params)
      return res
    },
    //点击导出全部数据
    async handleExportData () {
      const res = await this.getExportDataInPage(1)
      if (res.code === 0) {
        let data = []
        if (res.data.pageTotal < 1) {
          this.$message('未查询到数据')
          return
        } else if (res.data.pageTotal === 1) {
          data = res.data.rows
        } else {
          data = res.data.rows
          const promiseList = []
          for (let i = 2; i <= res.data.pageTotal; i++) {
            promiseList.push(this.getExportDataInPage(i))
          }
          const resList = await Promise.all(promiseList)
          if (resList.every(r => r.code === 0)) {
            resList.forEach(r => data.push(...r.data.rows))
          }
        }
        let theadColumns = this.tableColumns.filter(c => c.visible && !['sku'].includes(c.prop)).map((c) => c)
        try {
          exportExcel({
            theadColumns,
            jsonData: data,
            filename: `供应商列表${dayjs().format('YYYY-MM-DD HHmmss')}`,
          })
        } catch (ex) {
          console.log('handleExportData :>> ', ex)
        }
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .page-list-container {
    .btn-wrapper {
      float: right;
      padding-top: 8px;
      .el-button + .el-button {
        margin-left: 25px;
      }
    }
    .switch-wrapper {
      position: relative;
      color: white;
      font-size: 12px;
      &__text {
        pointer-events: none;
        position: absolute;
        z-index: 2;
        top: 1px;
        left: 20px;
        &.active {
          left: 7px;
        }
      }
    }
  }
</style>