<template>
  <ky-page-container class="unmontyly-payment--container" v-loading="loading">
    <none-data v-if="!hasPermission" msg="您暂无查看账单权限，请联系市场员为您授权" />
    <template v-else>
      <bill-summary :summary-data="summaryData" :billStatus.sync="billStatus" @on-month-change="monthChange" />
      <div class="table-wrapper">
        <div class="title--wrapper">
          <div class="title">账单明细 <span>共计{{pagination.totalCount}}票运单</span></div>
          <div class="btn-wrapper">
            <el-button type="text" class="right-border" @click="exportTheBill" :disabled="this.pagination.totalCount<1" :loading="loadingExport">
              <i class="iconfont icon-export"> </i>导出账单
            </el-button>
            <el-button type="text" @click="visbileOfCustomColum=true">
              <i class="iconfont icon-column"></i>自定义排序
            </el-button>
          </div>
        </div>

        <ky-table ref="kyTable" v-loading="loadingTable" :data="tableData" :pagination="pagination" @pagination-change="paginationChange" :height="'calc(100vh - 342px)'">
          <el-table-column v-for="(col,index) in tableColumns.filter((c) => c.text && c.visible)" :fixed="col.fixed" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.minWidth+'px'">
            <template slot-scope="{row}">
              <template v-if="col.prop === 'size'">
                {{row[col.prop]&&row[col.prop].map(m=>`${m['length']}*${m.width}*${m.height}*${m.count}`).join(',')}}
              </template>
              <template v-else>{{row[col.prop]}}</template>
            </template>
          </el-table-column>

          <el-table-column fixed width="120px" label="操作">
            <template slot-scope="scope">
              <el-link :underline="false" type="primary" @click="viewWaybill('查看运单联', scope.row.ydCode,1)">查看运单联</el-link>
              <el-popover placement="right" trigger="click" popper-class="unmonthly-payment--popover">
                <ul>
                  <li @click="viewWaybill('查看签收联',scope.row.ydCode,2)">查看签收联</li>
                  <li @click="viewWaybill('查看回单联',scope.row.ydCode,3)">查看回单联</li>
                </ul>
                <el-button slot="reference" icon="iconfont icon-arrow-down"></el-button>
              </el-popover>
            </template>
          </el-table-column>
        </ky-table>
      </div>
    </template>
    <ky-custom-column :visible.sync="visbileOfCustomColum" :tableConfigName="tableConfigName" :tableColumns.sync="tableColumns" @change="handleColumnChange" />
    <view-image ref="viewImage" />
  </ky-page-container>
</template>

<script>
import dayjs from 'dayjs'
import {
  searchBillsApi,
  getWaybillImagesApi,
  queryBillStatus
} from '@/services/api/bill'
import { exportExcelByApi } from '@/utils/commonUtil'
import { getCustomerCode, getPhone } from '@utils/storage'
import BillSummary from './components/bill-summary.vue'
import  ViewImage  from '@client/components/bill/components/ViewImage'

const tableColumns = [
  { prop: 'ydCode', text: '运单号', visible: true, minWidth: '140' },
  { prop: 'sendCompany', text: '寄件公司', visible: true, minWidth: '100' },
  { prop: 'payCompany', text: '付款公司', visible: true, minWidth: '100' },
  // { prop: 'totalFreight', text: '总运费（元）', visible: true, minWidth: '100' },
  { prop: 'waybillMoney', text: '运单运费（元）', visible: true, minWidth: '120' },
  // { prop: 'tax', text: '另补税金（元）', visible: true, minWidth: '120' },
  { prop: 'dis', text: '折扣（%）', visible: true, minWidth: '90' },
  { prop: 'itemCount', text: '件数', visible: true },
  { prop: 'actualWeight', text: '实际重量（KG）', visible: true, minWidth: '120' },
  { prop: 'weight', text: '计费重量（KG）', visible: true, minWidth: '120' },
  { prop: 'sendCity', text: '寄件城市', visible: true },
  { prop: 'receiptCity', text: '收件城市', visible: true, minWidth: '100' },

  { prop: 'sendTime', text: '寄件时间', visible: false, minWidth: '150' },
  { prop: 'sendThings', text: '托寄物', visible: false },
  { prop: 'size', text: '抛货尺寸', visible: false },
  { prop: 'cubicNumber', text: '方数', visible: false },
  { prop: 'woodenCost', text: '木架费', visible: false },
  { prop: 'woodenSize', text: '木架尺寸', visible: false },
  { prop: 'sonderzug', text: '专车', visible: false },
  { prop: 'premium', text: '保费', visible: false },
  { prop: 'receiptCost', text: '回单费（元）', visible: false, minWidth: '100' },
  { prop: 'arrairport', text: '取货车牌号', visible: false, minWidth: '110' },
  { prop: 'payTax', text: '代收货款手续费', visible: false, minWidth: '120' },
  { prop: 'sendAddress', text: '始发地', visible: false, minWidth: '200' },
  { prop: 'other', text: '其他', visible: false },
  { prop: 'companyCollect', text: '公司应收', visible: false },
  { prop: 'sendMan', text: '寄件人', visible: false },
  { prop: 'receiptAreaCode', text: '收件代码', visible: false },
  { prop: 'receiptCompany', text: '收件公司', visible: false },
  { prop: 'receivesAddress', text: '收件地址', visible: false, minWidth: '200' },
  { prop: 'receiptMan', text: '收件人', visible: false },
  { prop: 'serviceMode', text: '服务方式', visible: false },
  { prop: 'payType', text: '付款方式', visible: false },
  { prop: 'destionation', text: '目的地城市', visible: false, minWidth: '100' },
  { prop: 'signPeople', text: '签收人', visible: false },
  { prop: 'signingTime', text: '签收时间', visible: false },
  { prop: 'subMoney', text: '代垫款项', visible: false },
  { prop: 'upstairsMoney', text: '爬楼费', visible: false },
  { prop: 'storageGoodsMoney', text: '货物保管费', visible: false, minWidth: '100' },
  // { prop: 'sendWayBillNo', text: '联邦运单号', visible: false, minWidth: '100' },
  { prop: 'batchNumber', text: '批次号', visible: false, minWidth: '100' },
  { prop: 'batchFee', text: '批次费', visible: false, minWidth: '100' },
]

export default {
  components: {
    BillSummary,
    ViewImage,
  },
  data () {
    return {
      visbileOfCustomColum: false,
      tableConfigName: 'unmonthly-payment4',
      loading: false,
      loadingTable: false,
      loadingExport: false,
      tableColumns: tableColumns,
      selectedMonth: '',
      billStatus: '',
      tableData: [],
      summaryData: {
        monthInfo: '',
        totalCost: 0,//总费用
        paidUpAmount: 0,//公司实收,
        additionalTax: 0,//另补税金，
        receiptFee: 0,//回单费用
      },
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
      },
    }
  },
  methods: {
    async monthChange (month) {
      this.pageIndex = 1
      this.selectedMonth = month
      try {
        this.loading = true
        await this.getBillStatus()
        if (this.billStatus) {
          await this.queryData()
        } else {
          this.initBillSummaryData()
        }
      } finally {
        this.loading = false
      }
    },
    initBillSummaryData () {
      this.tableData = []
      this.pagination.totalCount = 0
      this.summaryData = {
        monthInfo: '本月无帐单，无需对帐',
        totalCost: 0,//总费用
        paidUpAmount: 0,//公司实收,
        additionalTax: 0,//另补税金，
        receiptFee: 0,//回单费用
      }
    },
    getQueryApiParams (pageSize) {
      const params = {
        ydCode: '',
        Accountdate: this.selectedMonth,
        pageIndex: this.pagination.pageIndex,
        pageSize: pageSize || this.pagination.pageSize,
        mobile: getPhone(),
        companyNo: getCustomerCode()
      }
      return params
    },
    async queryData () {
      const params = this.getQueryApiParams()
      let res = await searchBillsApi(params)
      if (res.code === 0) {
        const item = res.data.dataList[0]
        const startDate = dayjs(item.monKnotStartDate).format('YYYY年MM月DD')
        const endDate = dayjs(item.monKnotEndDate).format('YYYY年MM月DD')
        const paymentDate = dayjs(item.paymentDate).format('YYYY年MM月DD')
        this.summaryData = {
          totalCost: res.data.totalCost,
          paidUpAmount: res.data.totalCollect,
          additionalTax: res.data.totalTax,
          receiptFee: res.data.totalHD,
          monthInfo: `这是您${startDate}至${endDate}发货账单情况，请于${paymentDate}前完成付款`
        }
        this.tableData = res.data.dataList
        this.pagination.totalCount = res.data.dataCount
        this.$nextTick(() => { this.$refs.kyTable.doLayout() })
      } else {
        this.initBillSummaryData()
      }
    },
    async getBillStatus () {
      const params = {
        accountdate: this.selectedMonth,
        companyNo: getCustomerCode()
      }
      const res = await queryBillStatus(params)
      if (res.code === 0) {
        this.billStatus = res.data.months[0].checkState
      } else {
        this.billStatus = ''
      }
    },
    async paginationChange () {
      this.loadingTable = true
      try {
        await this.queryData()
      } finally {
        this.loadingTable = false
      }
    },
    async viewWaybill (title, ydCode, imageType) {
      const params = {
        mobile: getPhone(),
        ydCode: ydCode,
        intKndType: imageType,
      }
      const res = await getWaybillImagesApi(params)
      if (res.data && res.data.base64) {
        console.log( res.data.base64,'64')
        this.$refs.viewImage.showDialog({ title: title, ydCode: ydCode, imageType: imageType, imgs: res.data.base64 })
      } else {
        this.$message('查无图片')
      }
    },
    async exportTheBill () {
      this.loadingExport = true
      const params = {
        requestFunc: searchBillsApi,
        params: this.getQueryApiParams(200),
        tableColumns: this.tableColumns,
        filename: '账单明细',
        pageIndexName: 'pageIndex',
        totalCountName: 'dataCount',
        rowsName: 'dataList'
      }
      try {
        await exportExcelByApi(params)
      } finally {
        this.loadingExport = false
      }
    },
    handleColumnChange () {
      this.$nextTick(() => {
        this.$refs.kyTable.doLayout()
      })
    },
  },
  computed: {
    hasPermission () {
      return this.$store.getters.permissionCodes.includes('allowCheckFlag')
      // return this.$store.getters.authorityIds.includes('074')
    }
  }
}
</script>

<style lang="scss">
  .unmonthly-payment--popover {
    ul {
      width: 100px;
      margin: -12px;
      li {
        width: 81px;
        padding-left: 19px;
        height: 32px;
        line-height: 32px;
        font-size: 12px;
        color: #333333;
        cursor: pointer;
        &:hover {
          background-color: #f1f1f5;
        }
      }
    }
  }
</style>
<style lang="scss" scoped>
  .unmontyly-payment--container {
    padding: 0;
    background-color: #f5f7fb;
    .empty-wrapper {
      background-color: #fff;
      height: calc(100vh - 96px);
      /deep/.svg-icon {
        margin-bottom: 10px;
      }
    }
    .table-wrapper {
      padding: 0 20px;
      background-color: #fff;
      .title--wrapper {
        border-bottom: 1px solid #f1f1f5;
        box-sizing: border-box;
        margin-bottom: 12px;
        display: flex;
        height: 40px;
        align-items: center;
        .title {
          font-size: 16px;
          font-weight: bold;
          color: rgba(51, 51, 51, 0.93);
          & > span {
            padding-left: 24px;
            font-size: 14px;
            font-weight: normal;
            color: #666666;
          }
        }
        .btn-wrapper {
          margin-left: auto;
          .el-button {
            & > span .iconfont {
              padding-right: 8px;
            }
          }
          .el-button + .el-button {
            margin-left: 25px;
          }
        }
      }
      /deep/ {
        .el-table {
          .el-popover__reference-wrapper {
            .el-button {
              border-width: 0;
              padding: 8px 4px;
              color: #8365f6;
              margin-left: 4px;
              & > .iconfont {
                font-size: 10px;
              }
            }
          }
        }
      }
    }

    /deep/ {
      @include loading;
    }
  }
</style>
