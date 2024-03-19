<template>
  <ky-page-container class="page-list-container" title="列表页示例">
    <!-- 查询条件区域 -->
    <ky-search-container>
      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" class="date-picker">
        </el-date-picker>
      </div>
      <div>
        <span>寄件信息</span>
        <el-input v-model="formData.name" placeholder="寄件公司/寄件人/寄件人号码"></el-input>
      </div>
      <el-button type="primary" round size="medium" @click="queryData">查询</el-button>
      <el-button round size="medium" @click="showDialog">显示弹窗示例</el-button>
      <el-button round size="medium" @click="handleExportData">导出全部运单</el-button>
    </ky-search-container>
    <div class="btn-wrapper">
      <el-button type="text" class="right-border" @click="$router.push('/demo/page-form')">
        <svg-icon icon-class="supplier-add" /> 新增
      </el-button>
      <el-button type="text" @click="showColumnManager">
        <svg-icon icon-class="waybill-setting" /> 自定义排序
      </el-button>
    </div>
    <waybill-table ref="waybillTable" tableConfigName="tableConfigName" :data="tableData" :tableColumns="tableColumns" :pagination="pagination" @pagination-change="queryData" :height="'calc(100vh - 342px)'">
      <el-table-column fixed label="操作" width="200">
        <template v-slot="{row}">
          <el-button @click="modify(row)" type="text" size="small" class="btn-text-border">修改</el-button>
          <el-button type="text" size="small" class="btn-text-border" v-if="row.ddStatus !='1'" @click="handleModifyGoodTime(row.waybillNumber,'2021-09-18',null)">
              修改货好时间
            </el-button>
            <el-button type="text" size="small" class="btn-text-border" @click.native="handleUrgeCollection(row.ydNo)">
              催取
            </el-button>
        </template>
      </el-table-column>
    </waybill-table>
    <waybill-state :waybillModel="model"></waybill-state>
    <waybill-info></waybill-info>
    <ky-dialog :visible.sync="dialogVisible" />
     <modify-goodtime ref="modifyGoodtime" />
  </ky-page-container>

</template>

<script>
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import { exportExcel } from '@utils/clientUtil'
import { getSupplierList } from '@/services/api/supplier'
import WaybillTable from '@/views/waybill/components/waybill-table'
import WaybillState from '@/views/waybill/components/detail/waybill-state'
import WaybillInfo from '@/views/waybill/components/detail/waybill-info'
import {  ModifyGoodtime } from '@client/dialogs'

// const tableColumns = [
//   { prop: 'slot', text: '插槽展示' ,defaultSlot:'slot_link'},
//   { prop: 'slot_button', text: '插槽展示1' ,defaultSlot:'slot_button'},
//   { prop: 'unDeliveryReason', text: '异常原因' },
//   { prop: 'receiver', text: '签收人', width: '150' },
//   { prop: 'receiveDate', text: '签收时间', width: '150' },
//   { prop: 'waybillNumber', text: '运单号', width: '160' },
//   { prop: 'goodsTime', text: '货好时间', width: '150' },
//   { prop: 'goodsType', text: '托寄物', width: '100' },
//   { prop: 'pickupCompanyName', text: '收件公司' },
//   { prop: 'pickupPerson', text: '收件人' },
//   { prop: 'pickupAddress', text: '收件地址' },
// ]

const tableColumns=[
  { prop: 'slot', text: '插槽展示' ,defaultSlot:'column_slot1'},
  { prop: 'slot_button', text: '插槽展示1' ,defaultSlot:'column_slot2'},
  { prop: 'ydNo', text: '运单号', width: '160', visible: true, prohibitSetPosition: true },
  { prop: 'hhDateTime', text: '货好时间', width: '150', visible: true },
  { prop: 'supplierName', text: '供应商', width: '120' },
  { prop: 'ydStatus', text: '运单状态', width: '170', visible: true },
  { prop: 'goods', text: '托寄物', width: '100', visible: true },
  { prop: 'sjCompany', text: '收件公司', width: '150', visible: true },
  { prop: 'sjContactPerson', text: '收件人', width: '100', visible: true },
  { prop: 'uploadTime', text: '创建时间', width: '160', isSort: true },
  { prop: 'sjAddress', text: '收件地址', width: '300', visible: true },
  { prop: 'distance', text: '司机距离我(km)', width: '140' },
  { prop: 'logisticsStatus', text: '物流状态', width: '90' },
  { prop: 'sjMobile', text: '收件手机', width: '120' },
  { prop: 'sjTelephone', text: '收件电话', width: '140' },
  { prop: 'weight', text: '预计重量', width: '90' },
  { prop: 'count', text: '件数', width: '90' },
  { prop: 'serviceWay', text: '服务方式', width: '100' },
  { prop: 'payWay', text: '付款方式', width: '100' },
  { prop: 'payAccount', text: '付款账号', width: '100' },
  { prop: 'totalCost', text: '运费', width: '90' },
  { prop: 'antcipatedFreight', text: '预估运费', width: '90' },
  { prop: 'jjRemark', text: '寄件备注', width: '100' },
  { prop: 'freightWeight', text: '计费重量', width: '90' },
  { prop: 'jjCompany', text: '寄件公司', width: '300' },
  { prop: 'jjContactPerson', text: '寄件人', width: '100' },
  { prop: 'jjDateTime', text: '寄件时间', width: '160', isSort: true },
  { prop: 'sms', text: '寄件手机', width: '150' },
  { prop: 'jjTelePhone', text: '寄件电话', width: '300' },
  // { prop: "backMobile", text: "备用寄件手机", width: "120" },
  { prop: 'qHContactPerson', text: '取货联系人', width: '150' },
  { prop: 'qHContactWay', text: '取货手机', width: '150' },
  { prop: 'qHAddress', text: '寄件地址', width: '120' },
  { prop: 'receiver', text: '签收人', width: '80' },
  { prop: 'receiveDate', text: '签收时间', width: '160', isSort: true },
  { prop: 'proxyStatus', text: '委托书状态', width: '120' },
  { prop: 'vipshopCode', text: '入库号', width: '100' },
  { prop: 'receiptFlag', text: '回单服务', width: '100' }, //TODO:检查字段名称,自定义列
  { prop: 'hdCount', text: '回单份数', width: '100' },
  { prop: 'money', text: '保价声明', width: '100' },
  { prop: 'dsMoney', text: '代收货款', width: '100' },
  { prop: 'mjWay', text: '包装服务', width: '100' },
  { prop: 'sendHouseName', text: '退货仓', width: '100' },
  { prop: 'receiptHouseName', text: '入库仓', width: '100' },
  { prop: 'houseType', text: '仓库类型', width: '100' },
  { prop: 'SizeText', text: '货物尺寸' },
]

import KyDialog from './ky-dialog'
import {getData} from '@/views/waybill/utils/table-config.js'
export default {
  components: {
    KyDialog,
    WaybillTable,
    ModifyGoodtime,
    WaybillState,
    WaybillInfo
  },
  data () {
    return {
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-3, 'month')),
      formData: {
        dateRange: [dayjs().add(-1, 'month'), dayjs()],
        supplierName: '',
      },
      dialogVisible: false,
      tableColumns: tableColumns,
      tableData: [],
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
      model:{},
    }
  },
  mounted(){
    this.queryData ()
  },
  methods: {
    showDialog () {
      this.dialogVisible = true
    },
    modify (row) {
      console.log('row :>> ', row)
    },
    //获取查询入参
    getQueryParams (pageIndex, pageSize) {
      const params = {
        createStartTime: dayjs(this.formData.dateRange[0]).format('YYYY-MM-DD 00:00:00'),
        createEndTime: dayjs(this.formData.dateRange[1]).format('YYYY-MM-DD 23:59:59'),
        supplierName: this.formData.supplier,
        page: pageIndex || this.pagination.pageIndex,
        pageSize: pageSize || this.pagination.pageSize,
      }
      return params
    },
    mockData(size){
      const list = []
      for (let index = 0; index < size; index++) {
        const item = this.tableColumns.reduce((init, cur) => {
          cur.prop && (init[cur.prop] = cur.text + index) 
          return init
        }, {})

        list.push(item)
      }
      return list
    },
    //查询数据
    async queryData () {
      this.tableData = this.mockData(15)
      //this.tableData=getData()
      this.model=this.tableData[0]
      console.log(this.tableData[0].waybillNumber,'0')
      // const params = this.getQueryParams()
      // const res = await getSupplierList(params)
      // if (res.code === 0) {
      //   this.tableData = res.data.rows
      //   this.pagination.totalCount = res.data.rowTotal
      // }
    },
    //点击查询
    handleQueryClick () {
      this.pagination.pageIndex = 1
      this.queryData()
    },
    // //获取一页的导出数据
    // async getExportDataInPage (pageIndex) {
    //   const params = this.getQueryParams(pageIndex, 500)
    //   const res = await getSupplierList(params)
    //   return res
    // },
    //点击导出全部数据
    async handleExportData () {
      // const res = await this.getExportDataInPage(1)
      // if (res.code === 0) {
      //   let data = []
      //   if (res.data.pageTotal < 1) {
      //     this.$message('未查询到数据')
      //     return
      //   } else if (res.data.pageTotal === 1) {
      //     data = res.data.rows
      //   } else {
      //     data = res.data.rows
      //     const promiseList = []
      //     for (let i = 2; i <= res.data.pageTotal; i++) {
      //       promiseList.push(this.getExportDataInPage(i))
      //     }
      //     const resList = await Promise.all(promiseList)
      //     if (resList.every(r => r.code === 0)) {
      //       resList.forEach(r => data.push(...r.data.rows))
      //     }
      //   }
      //   let theadColumns = this.tableColumns.filter(c => c.visible).map(c => c)
      //   try {
      //     exportExcel({
      //       theadColumns,
      //       jsonData: data,
      //       filename: `供应商列表${dayjs().format('YYYY-MM-DD HHmmss')}`,
      //     })
      //   } catch (ex) {
      //     console.log('handleExportData :>> ', ex)
      //   }
      // }
    },
    showColumnManager () {
      console.log(1111)
      this.$refs.waybillTable.showColumnManager()
    },
    //修改货好时间
    handleModifyGoodTime(ydNo, hhDateTime, callback) {
      console.log('object :>> ', ydNo)
      this.$refs.modifyGoodtime.showDialog(ydNo, hhDateTime, callback)
    },
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
  }
</style>