<template>
  <ky-page-container class="page-list-container" title="供应商下单">
    <ky-search-container>
      <div>
        <span>要求到货时间</span>
        <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy/MM/dd" class="date-picker">
        </el-date-picker>
      </div>
      <div>
        <span>发货状态</span>
        <el-select v-model="formData.deliveryStatus" size="medium" placeholder="请选择发货状态" clearable>
          <el-option v-for="item in deliveryStatusOptions" :key="item.label" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>供应商</span>
        <el-input v-model="formData.supplier" size="medium" placeholder="请输入供应商名称" clearable></el-input>
      </div>
      <el-button type="primary" round size="medium" @click="handleQueryClick">查询</el-button>
    </ky-search-container>
    <div class="btn-wrapper">
      <el-button v-if="customerCode" round size="medium" :type="haveDeliveryPermission()?'primary':''" :disabled="!haveDeliveryPermission()" @click="handlePlaceOrder">去下单</el-button>
      <div class="btn-wrapper__right">
        <el-button type="text" class="right-border" @click="$router.push('/supplier/allocation-detail')">
          <svg-icon icon-class="supplier-add" /> 新增
        </el-button>
        <el-button type="text" @click="visbileOfCustomColum=true">
          <svg-icon icon-class="waybill-setting" /> 自定义排序
        </el-button>
      </div>
    </div>
    <ky-table ref="kyTable" :data="tableData" :pagination="pagination" @pagination-change="queryData" :height="'calc(100vh - 334px)'" v-loading="loading">
      <el-table-column type="selection" :selectable="selectable" width="30"></el-table-column>
      <el-table-column fixed label="操作" min-width="100px">
        <template slot-scope="{row}">
          <el-button @click.stop="modifyAllocation(row.id,row.distrId)" v-if="row.distrStatus===0" type="text" class="btn-text-border">修改</el-button>
          <el-button @click.stop="deleteAllocation(row.id,row.distrId)" v-if="row.distrStatus===0" type="text" class="btn-text-border">删除</el-button>
        </template>
      </el-table-column>
      <el-table-column v-for="(col,index) in tableColumns.filter((c) => c.text && c.visible)" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text">
        <template v-slot="{row}">
          <el-link v-if="col.prop==='orderId'" type="primary" :underline="false" @click.stop="viewWaybill(row.orderId)"> {{row.orderId}}</el-link>
          <span v-else-if="col.prop==='deliveryTime'">{{formatDateTime(row.deliveryTime)}}</span>
          <span v-else>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>
    </ky-table>
    <ky-custom-column :visible.sync="visbileOfCustomColum" :tableConfigName="tableConfigName" :tableColumns.sync="tableColumns" @change="handleColumnChange" />
  </ky-page-container>

</template>

<script>
import dayjs from 'dayjs'
import { getPhone, getCustomerCode } from '@/utils/storage'
import { getLoginCompanyName } from '@utils/clientUtil'
import { getAllocationList, deleteAllocation } from '@/services/api/supplier'
const tableColumns = [
  { prop: 'distrId', text: '订单号', width: '120', visible: true },
  { prop: 'supplierName', text: '供应商', width: '120', visible: true },
  { prop: 'skuStr', text: 'SKU(数量)', width: '120', visible: true },
  { prop: 'deliveryTime', text: '要求到货时间', width: '180', visible: true },
  { prop: 'distrStatusStr', text: '发货状态', width: '100', visible: true },
  { prop: 'orderId', text: '运单号', width: '150', visible: true },
  { prop: 'reveiverCompany', text: '收件公司', width: '120', visible: true },
  { prop: 'orderCompany', text: '下单公司', width: '120', visible: true },
  { prop: 'loginCompany', text: '创建公司', width: '90', visible: true },
  { prop: 'createdBy', text: '创建人', width: '90', visible: true },
  { prop: 'creationDate', text: '创建时间', width: '150', visible: true },
]
export default {
  data() {
    return {
      loading: false,
      // pickerOptions: uiUtil.getPickerOptions(null,null,null,dayjs()),
      formData: {
        dateRange: [dayjs().add(-1, 'month'), dayjs()],
        supplier: '',
        deliveryStatus: '',
      },
      deliveryStatusOptions: [
        { label: '待下单', value: 0 },
        { label: '待通知司机', value: 1 },
        { label: '待取货', value: 2 },
        { label: '待签收', value: 3 },
        { label: '已签收', value: 4 },
      ],
      visbileOfCustomColum: false,
      tableConfigName: 'allocation-main2',
      tableColumns: tableColumns,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  activated() {
    this.handleQueryClick()
    this.$refs.kyTable.doLayout()
  },
  methods: {
    selectable(row) {
      if (row.distrStatus !== 0) {
        return false
      }
      if (
        row.supplierName === getLoginCompanyName(true) ||
          row.supplierPhone === getPhone()
      ) {
        return true
      }
      return this.$store.getters.canModifySenderCompany
    },
    formatDateTime(dateTime) {
      return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss')
    },
    handleColumnChange() {
      this.$nextTick(() => {
        this.$refs.kyTable.doLayout()
      })
    },
    haveDeliveryPermission() {
      if (!this.$refs.kyTable) {
        return false
      }
      const selectedRows = this.$refs.kyTable.selectedRows
      if (!selectedRows || selectedRows.length < 1) {
        return false
      }
      if (selectedRows.some(row => row.distrStatus !== 0)) {
        return false
      }
      const flag = selectedRows.every(row => {
        if (
          row.supplierName === getLoginCompanyName(true) ||
            row.supplierPhone === getPhone()
        ) {
          return true
        }
      })
      if (flag) {
        return true
      }
      return this.$store.getters.canModifySenderCompany
    },
    handlePlaceOrder() {
      const orderList = this.$refs.kyTable.selectedRows
      // if(new Set(orderList.map(m=>m.supplierName)).size>1){
      //   this.$message.warning('不能选择不同的供应商批量下单')
      //   return
      // }
      // this.$router.push({ name: 'order', params: { orderList } })
      this.$router.push({ name: 'delivery', params: { orderList } })
    },
    modifyAllocation(id, distrId) {
      this.$router.push({
        path: '/supplier/allocation-detail',
        query: { id, distrId },
      })
    },
    async deleteAllocation(id, distrId) {
      await this.$confirm('请确认是否删除数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
      const res = await deleteAllocation({ id, distrId })
      if (res.code === 0) {
        this.$message.success('删除成功')
        this.handleQueryClick()
      }
    },
    viewWaybill(orderId) {
      this.$router.push({
        // path: '/admin/waybill-detail',
        path: '/admin/waybill-v3-detail',
        query: { ydNo: orderId, isAllocation: true },
      })
    },
    //获取查询入参
    getQueryParams(pageIndex, pageSize) {
      const params = {
        deliveryStartTime: dayjs(this.formData.dateRange[0]).format(
          'YYYY-MM-DD 00:00:00'
        ),
        deliveryEndTime: dayjs(this.formData.dateRange[1]).format(
          'YYYY-MM-DD 23:59:59'
        ),
        distrStatus: this.formData.deliveryStatus,
        supplierName: this.formData.supplier,
        page: pageIndex || this.pagination.pageIndex,
        pageSize: pageSize || this.pagination.pageSize,
      }
      return params
    },
    //查询数据
    async queryData() {
      try{
        this.loading = true
        const params = this.getQueryParams()
        const res = await getAllocationList(params)
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
    handleQueryClick() {
      this.pagination.pageIndex = 1
      this.queryData()
    },
  },
  computed: {
    customerCode() {
      return getCustomerCode()
    },
  },
}
</script>

<style lang="scss" scoped>
  .page-list-container {
    .btn-wrapper {
      display: flex;
      align-items: center;
      margin: 5px 0;
      padding: 10px 0;
      &__right {
        margin-left: auto;
        .el-button + .el-button {
          margin-left: 25px;
        }
      }
    }
  }
</style>