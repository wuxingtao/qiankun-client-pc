<template>
  <div class="waybill-table-abnormal-container">
    <ky-table :data="tableData" class="element-table" :paginationVisible="true" :pagination="pagination" @pagination-change="queryData" :height="400" v-loading="loading" ref="kyTable">
      <div slot="empty" class="empty-wrap">
        <svg-icon icon-class="none-data2" />
        <div>未找到符合条件的数据<br />建议您调整筛选条件再试试</div>
      </div>
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
import { getExpressAbnormalWaybillWithPages, getExpressAbnormalWaybill } from '@/services/api/report'
import { queryGridColumnConfig } from '@/services/api/waybillOld'

const tableColumns = [
  { prop: 'unDeliveryReason', text: '异常原因', width: '150' , visible: true},
  { prop: 'receiver', text: '签收人', width: '150' },
  { prop: 'receiveDate', text: '签收时间', width: '150' },
  { prop: 'waybillNumber', text: '运单号', width: '160', visible: true, prohibitSetPosition: true },
  { prop: 'goodsTime', text: '货好时间', width: '150', visible: true },
  { prop: 'goodsType', text: '托寄物', width: '100', visible: true },
  { prop: 'pickupCompanyName', text: '收件公司', width: '150', visible: true },
  { prop: 'pickupPerson', text: '收件人', width: '100', visible: true },
  { prop: 'pickupAddress', text: '收件地址', width: '300', visible: true },
  // { prop: "distance", text: "司机距离我(km)", width: "140" },
  { prop: 'pickupMobile', text: '收件手机', width: '120' },
  { prop: 'pickupPhone', text: '收件电话', width: '140' },
  { prop: 'weight', text: '重量(kg)', width: '90' },
  { prop: 'count', text: '件数', width: '90' },
  { prop: 'serviceMode', text: '服务方式', width: '100' },
  { prop: 'payMode', text: '付款方式', width: '100' },
  { prop: 'payAccount', text: '付款账号', width: '100' },
  { prop: 'freightAmount', text: '运费', width: '90' },
  { prop: 'waybillRemark', text: '寄件备注', width: '100' },
  { prop: 'deliveryCompanyName', text: '寄件公司', width: '300' },
  { prop: 'deliveryPerson', text: '寄件人', width: '100' },
  { prop: 'deliveryTime', text: '寄件时间', width: '160' },
  { prop: 'deliveryMobile', text: '寄件手机', width: '150' },
  { prop: 'deliveryPhone', text: '寄件电话', width: '300' },
  { prop: 'contactPerson', text: '取货联系人', width: '150' },
  { prop: 'contactPhone', text: '取货手机', width: '150' },
  { prop: 'receiptFlag', text: '回单服务', width: '100' },
  { prop: 'receiptCount', text: '回单份数', width: '100' },
  { prop: 'declarativeValue', text: '保价声明', width: '100' },
  { prop: 'collectionAmount', text: '代收货款', width: '100' },
  { prop: 'woodenFrame', text: '包装服务', width: '100' },
  { prop: 'deliveryWareHouseName', text: '退货仓', width: '100' },
  { prop: 'pickupWareHouseName', text: '入库仓', width: '100' },
  { prop: 'selfSignFlag', text: '本人签收	', width: '80' },
  { prop: 'logisticsStatus', text: '物流状态', width: '100' },
  { prop: 'uploadTime', text: '下单时间	', width: '160' },
  { prop: 'goodsSize', text: '货物尺寸' },
  { prop: 'customColumnValue_01', text: '自定义字段一	' },
  { prop: 'customColumnValue_02', text: '自定义字段二	' },
  { prop: 'customColumnValue_03', text: '自定义字段三	' },
]

export default {
  components: { ColumnBatchFilter, },
  props: {
    formData: {
      type: Object,
      require: true
    },
    gridName: {
      type: String,
      require: true,
    },
    abnormalReason:{
      type: String,
      require: true,
    }
  },
  data () {
    return {
      loading:false,
      tableColumns:  tableColumns.map(a=>Object.assign({visible:false},a)),
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
  mounted () {
    this.getGridConfig()
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
    async queryData () {
      const params = {
        page: this.pagination.pageIndex,
        pageSize: this.pagination.pageSize,
        params: {
          customerCode: getCustomerCode(),
          customerId:getCustomerId(),
          startDate: this.formData.dateRange[0],
          endDate: this.formData.dateRange[1],
          deliveryInfo: this.formData.senderInfo,
          pickupInfo: this.formData.receiverInfo,
          unDeliveryReasonTypes:this.formData.selectedAbnormalReason?[this.formData.selectedAbnormalReason]:[],
          expressType: this.formData.expressType,
          secondReasonType: this.abnormalReason, 
        }
      }
      this.loading=true
      try{
        const res = await getExpressAbnormalWaybillWithPages(params)
        if (res.code === 0) {
          this.tableData = res.data.rows
          this.pagination.totalCount = res.data.rowTotal
          this.$refs.kyTable.$refs.table.doLayout()
        }
      }finally{
        this.loading=false
      }
    },
    async exportWaybillData () {
      const params = {
        customerCode: getCustomerCode(),
        customerId:getCustomerId(),
        startDate: this.formData.dateRange[0],
        endDate: this.formData.dateRange[1],
        deliveryInfo: this.formData.senderInfo,
        pickupInfo: this.formData.receiverInfo,
        unDeliveryReasonTypes:this.formData.selectedAbnormalReason?[this.formData.selectedAbnormalReason]:[],
        expressType: this.formData.expressType,
        secondReasonType: this.abnormalReason, 
      }
      const res = await getExpressAbnormalWaybill(params)
      if (res.code === 0) {
        if(!res.data || res.data.length<1){
          this.$message('未查询到数据')
          return
        }
        let theadColumns = this.tableColumns.filter(c=>c.visible).map(c => c)
        try {
          exportExcel({
            theadColumns,
            jsonData: res.data,
            filename: `异常数据${dayjs().format('YYYYMMDD')}`,
          })
        } catch (ex) {
          console.log('exportWaybills :>> ', ex)
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
      // this.tableColumns.filter(c=>!c.prohibitSetPosition).forEach(c => {
      //   this.$set(c,'visible',checkedColumns.includes(c.prop)) 
      // })
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
  .waybill-table-abnormal-container {
    @import "../../scss/index.scss";
  }
</style>