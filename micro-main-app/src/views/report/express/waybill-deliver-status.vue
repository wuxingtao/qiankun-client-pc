<template>
  <div class="abnormal-waybill-container">
    <return>运单详情</return>
    <div class="search-condition">
      <div>
        <span>寄件信息</span>
        <el-input v-model="formData.senderInfo" placeholder="寄件公司/寄件人/寄件人号码" style="width:264px"></el-input>
      </div>
      <div>
        <span>收件信息</span>
        <el-input v-model="formData.receiverInfo" placeholder="收件公司/收件人/收件人号码" style="width:264px"></el-input>
      </div>
      <div>
        <span>付款公司</span>
        <el-select v-model="formData.paymentCustomerCode" multiple collapse-tags size="medium" value-key="customerShortName" placeholder="付款公司">
          <el-option v-for="(item, index) in payCustomerInfo" :key="`0-${index}`" :label="item.customerShortName" :value="item">
          </el-option>
        </el-select>
      </div>
      <div>
        <span>服务方式</span>
        <el-select v-model="formData.serviceMode" size="medium" clearable>
          <el-option v-for="(item, index) in serviceWay" :key="`0-${index}`" :label="item.displayText" :value="item.value">
          </el-option>
        </el-select>
      </div>

      <div>
        <span>寄件时间</span>
        <el-date-picker v-model="formData.dateRange" size="medium" :editable="false" :clearable="false" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" format="yyyy/MM/dd" value-format="yyyy-MM-dd" class="date-picker" style="width:264px">
        </el-date-picker>
      </div>
      <div>
        <span>自定义搜索</span>
        <el-input v-model="formData.customInfo" placeholder="搜索自定义字段名" style="width:264px"></el-input>
      </div>
      <el-button type="primary" round size="medium" @click="queryData">查询</el-button>
      <el-button round size="medium" @click="exportWaybillData" :loading="loadingOfExport">导出全部运单</el-button>
    </div>
    <el-tabs v-model="activeTab" class="tab-wrapper" @tab-click="handleTabClick">
      <el-tab-pane :label="'待取货'+ formateSummaryCount(countSummary.unpickupCount)" name="0">
        <waybill-table-delivery-status ref="waybillTable" :formData="formData" :status="0" gridName="report-express-waybill-deliver-unpickup" />
      </el-tab-pane>
      <el-tab-pane :label="'运输中'+ formateSummaryCount(countSummary.transitCount)" name="1">
        <waybill-table-delivery-status ref="waybillTable1" :formData="formData" :status="1" gridName="report-express-waybill-deliver-transit" />
      </el-tab-pane>
      <el-tab-pane :label="'派送中'+ formateSummaryCount(countSummary.deliveringCount)" name="2">
        <waybill-table-delivery-status ref="waybillTable2" :formData="formData" :status="2" gridName="report-express-waybill-deliver-delivering" />
      </el-tab-pane>
      <el-tab-pane :label="'已签收'+ formateSummaryCount(countSummary.signedCount)" name="3">
        <waybill-table-delivery-status ref="waybillTable3" :formData="formData" :status="3" gridName="report-express-waybill-deliver-signed" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import uiUtil from '@/utils/uiUtil'
import Return from '../components/Return.vue'
import WaybillTableDeliveryStatus from './components/WaybillTableDeliveryStatus.vue'
import { getCustomerCode ,getCustomerId} from "@/utils/storage"
import { getExpressRealtimeWaybillsCountInfo } from '@/services/api/report'

export default {
  components: { Return, WaybillTableDeliveryStatus },
  data () {
    return {
      loadingOfExport:false,
      pickerOptions: uiUtil.getPickerOptions(dayjs().add(-31, 'day')),
      activeTab: '',
      expressType:'10',
      tableData: [],
      countSummary:{
        unpickupCount:0,
        transitCount:0,
        deliveringCount:0,
        signedCount:0
      },
      formData: {
        senderInfo: '',
        receiverInfo: '',
        serviceMode: '',
        paymentCustomerCode: [],
        dateRange: [dayjs().add(-30, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
        customInfo: '', 
      },
    }
  },
  activated () {
    this.expressType= this.$route.query.expressType||'10'
    this.activeTab = this.$route.query.status
    this.formData=Object.assign(this.formData,this.$options.data().formData)
    this.queryData()
  },
  methods: {
    handleTabClick(){
      const waybillTableRef = this.getCureentwaybillTableRef()
      waybillTableRef.queryData()
      this.$nextTick(()=>waybillTableRef.doLayout())
    },
    formateSummaryCount(num){
      if(Number(num)>0){
        return `(${num})`
      }
      return ''
    },
    getCureentwaybillTableRef () {
      let waybillTableRef = this.$refs.waybillTable
      if(Number(this.activeTab)>0){
        waybillTableRef = this.$refs['waybillTable'+this.activeTab]
      }
      return waybillTableRef
    },
    async queryData () {
      const  params= {
        customerCode: getCustomerCode(),
        customerId:getCustomerId(),
        startDate: this.formData.dateRange[0],
        endDate: this.formData.dateRange[1],
        deliveryInfo: this.formData.senderInfo,
        pickupInfo: this.formData.receiverInfo,
        paymentCustomerCode: this.formData.paymentCustomerCode,
        serviceMode: this.formData.serviceMode,
        customColumnValue: this.formData.customInfo,
        expressType:this.expressType
      }
      const res=await getExpressRealtimeWaybillsCountInfo(params)
      if(res.code===0){
        const data=res.data[0]||{}
        this.countSummary={
          unpickupCount:data.waitdeliverywaybillcount,
          transitCount:data.intransitwaybillcount,
          deliveringCount:data.indeliverywaybillcount,
          signedCount:data.alreadyreceiptwaybillcount
        }
      }
      const waybillTableRef = this.getCureentwaybillTableRef()
      waybillTableRef.queryData()
    },
    async exportWaybillData () {
      this.loadingOfExport=true
      try{
        const waybillTableRef = this.getCureentwaybillTableRef()
        await waybillTableRef.exportWaybillData()
      }finally{
        this.loadingOfExport=false
      }     
    }
  },
  computed: {
    ...mapGetters([
      'serviceWay',
      'payCustomerInfo',
    ]),
  },
}
</script>

<style lang="scss" scoped>
  .abnormal-waybill-container {
    height: 100%;
    background-color: #f5f7fb;
    @import "../scss/index.scss";
    background-color: #fff;
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
      margin: 0 20px;
      padding: 20px 0 8px;
      border-bottom: 2px solid #f1f1f5;
    }
    .wrapper {
      margin: 20px 0;
      padding: 20px;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0px 6px 20px 0px rgba(29, 26, 33, 0.05);
    }
  }
</style>