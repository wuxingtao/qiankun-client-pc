<template>
  <div class="waybill-table-container">
    <div class="top-text">
      <el-button type="text" @click="showColumnManager" style="float:right;color:#8365F6;">
        <svg-icon icon-class="waybill-setting" class="icon-tabs" /> 自定义排序
      </el-button>
    </div>
    <ky-table :data="tableData" class="element-table" :paginationVisible="true" :pagination="pagination"  @pagination-change="queryData" :height="'calc(100vh - 514px)'" ref="kyTable" v-loading="loading">
      <div slot="empty" class="empty-wrap">
        <svg-icon icon-class="none-data2" />
        <div>未找到符合条件的数据<br />建议您调整筛选条件再试试</div>
      </div>
      <!-- <el-table-column fixed type="selection" width="55">
      </el-table-column> -->
      <el-table-column v-for="(col,index) in tableColumns.filter(c=>c.text&&c.visible)" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
      </el-table-column>
    </ky-table>
    <ColumnBatchFilter ref="columnManager" @onSaveSuccess="modifyColums" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import ColumnBatchFilter from '@client/components/column-batch-filter'
import { getCustomerCode ,getCustomerId} from '@/utils/storage'
import { exportExcel } from '@utils/clientUtil'
import { getExpressRealtimeWaybills } from '@/services/api/report'
import { queryGridColumnConfig } from '@/services/api/waybillOld'

const tableColumns = [
  { prop: 'waybillNumber', text: '运单号', width: '160', visible: true, prohibitSetPosition: true },
  { prop: 'orderNumber', text: '订单号' , visible: true},
  { prop: 'goodsTime', text: '货好时间', width: '150', visible: true },
  { prop: 'goodsType', text: '托寄物', width: '100', visible: true },
  // { prop: "receiveCustomerCode", text: "收件公司编码" },
  { prop: 'receiveCustomer', text: '收件公司', width: '150', visible: true },
  { prop: 'receivePerson', text: '收件人', width: '100', visible: true },
  { prop: 'receiveAddress', text: '收件地址', width: '300', visible: true },
  // { prop: "distance", text: "司机距离我(km)", width: "140" },
  { prop: 'receiveMobile', text: '收件手机', width: '120' },
  { prop: 'receivePhone', text: '收件电话', width: '140' },
  { prop: 'actualWeight', text: '重量(kg)', width: '90' },
  { prop: 'packetCount', text: '件数', width: '90' },
  { prop: 'serviceType', text: '服务方式', width: '100' },
  { prop: 'payMode', text: '付款方式', width: '100' },
  { prop: 'paymentCustomer', text: '付款账号', width: '100' },
  // { prop: "estimateFreightAmount", text: "预估运费", width: "90" },
  { prop: 'freightAmount', text: '运费', width: '90' },
  { prop: 'shipRemark', text: '寄件备注', width: '100' },
  // { prop: "shipCustomerCode", text: "寄件公司编码", width: "300" },
  { prop: 'shipCustomerName', text: '寄件公司', width: '300' },
  { prop: 'shipPerson', text: '寄件人', width: '100' },
  { prop: 'shipTime', text: '寄件时间', width: '160' },
  { prop: 'shipMobile', text: '寄件手机', width: '150' },
  { prop: 'shipPhone', text: '寄件电话', width: '160' },
  { prop: 'pickupPerson', text: '取货联系人', width: '150' },
  { prop: 'pickupPhone', text: '取货手机', width: '150' },
  { prop: 'reciptDate', text: '签收时间', width: '100' },
  { prop: 'reciptPerson', text: '签收人', width: '100' },
  { prop: 'receiptFlag', text: '回单服务', width: '100' },
  { prop: 'receiptCount', text: '回单份数', width: '100' },
  { prop: 'insuranceValue', text: '保价声明', width: '100' },
  { prop: 'collectAmount', text: '代收货款', width: '100' },
  { prop: 'woodPackService', text: '包装服务', width: '100' },
  { prop: 'shipWareHouse', text: '退货仓', width: '100' },
  { prop: 'signWareHouse', text: '入库仓', width: '100' },
  { prop: 'selfSignFlag', text: '本人签收	', width: '80' },
  { prop: 'routeStep', text: '物流状态', width: '100' },
  { prop: 'orderTime', text: '下单时间	', width: '160' },
  // { prop: "goodsSize", text: "货物尺寸" },
  // { prop: "transportType", text: "运输类型" },
  { prop: 'defineVarchar1', text: '自定义字段一	' },
  { prop: 'defineVarchar2', text: '自定义字段二	' },
  { prop: 'defineVarchar3', text: '自定义字段三	' },
]

export default {
  components: { ColumnBatchFilter, },
  props: {
    formData: {
      type: Object,
      require: true
    },
    status:{
      type: Number,
      require: true
    },
    gridName: {
      type: String,
      require: true,
    },
  },
  data () {
    return {
      loading:false,
      expressType:'10',
      tableColumns: tableColumns.map(a=>Object.assign({visible:false},a)),
      tableData: [],
      gridConfigId: '',
      gridVersion: '1.0.0',
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  activated () {
    this.getGridConfig()
    this.expressType= this.$route.query.expressType||'10'
  },
  methods: {
    doLayout(){
      this.$refs.kyTable.doLayout()
    },
    async getGridConfig () {
      const res = await queryGridColumnConfig(this.gridName)
      if (res.code === 0 && res.data && res.data.gridAttribute) {
        this.gridConfigId = res.data.id
        let tempColumns = JSON.parse(res.data.gridAttribute).columns[0]
        this.tableColumns.forEach(item => {
          let col = tempColumns.find(i => i.prop === item.prop)
          if (col) {
            item.visible = col.visible
          }
        })
      }
    },
    getQueryParams(page,pageSize){
      const params = {
        page,
        pageSize,
        params: {
          customerCode: getCustomerCode(),
          customerId:getCustomerId(),
          startDate: this.formData.dateRange[0],
          endDate: this.formData.dateRange[1],
          deliveryInfo: this.formData.senderInfo,
          pickupInfo: this.formData.receiverInfo,
          paymentCustomerCode: this.formData.paymentCustomerCode,
          serviceMode: this.formData.serviceMode,
          customColumnValue: this.formData.customInfo,
          search:this.status==0?'10':'20',
          flag:this.expressType
        }
      }
      if(this.status!=0){
        params.params.transportType=this.status
      }
      return params
    },
    async queryData () {
      this.loading=true
      try{
        const params = this.getQueryParams(this.pagination.pageIndex,this.pagination.pageSize)
        const res = await getExpressRealtimeWaybills(params)
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.pagination.totalCount = res.data.rowTotal
          this.$nextTick(()=>this.$refs.kyTable.$refs.table.doLayout())
        }
      }finally{
        this.loading=false
      } 
    },
    async exportWaybillData () {
      const params = this.getQueryParams(1,99999)
      const res = await getExpressRealtimeWaybills(params)
      if (res.code === 0) {
        if(!res.data || res.data.rows.length<1){
          this.$message('未查询到数据')
          return
        } 
        let theadColumns = this.tableColumns.filter(c=>c.visible).map(c => c)
        try {
          exportExcel({
            theadColumns,
            jsonData: res.data.rows,
            filename: `快件实时动态详情${dayjs().format('YYYY-MM-DD HHmmss')}`,
          })
        } catch (ex) {
          console.log('exportWaybillData :>> ', ex)
        }
      } 
    },
    showColumnManager () {
      const params = {
        version: this.gridVersion,
        gridConfigId: this.gridConfigId,
        gridName: this.gridName,
        checkedColumns: this.tableColumns.filter(f => f.visible).map(c => c.prop),
        columns: JSON.parse(JSON.stringify(tableColumns))
      }
      this.$refs.columnManager.showDialog(params)
    },
    modifyColums (columns, gridConfigId, checkedColumns) {
      this.tableColumns=columns
      this.gridConfigId = gridConfigId
      this.$nextTick(()=>{
        this.$refs.kyTable.$refs.table.doLayout()
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  .waybill-table-container {
    @import "../../scss/index.scss";
    .top-text {
      font-size: 14px;
      color: #333333;
      button{
        padding-top: 1px;
        padding-bottom: 13px;
      }
    }
  }
</style>