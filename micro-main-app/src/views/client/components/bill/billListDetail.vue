<template>
  <div class='client-container' style='background-color:#F1F1F5'>
    <div style='background-color:#fff; padding:6px;'>
      <div class='title'>
        <div class='el-icon-back' @click='returnBack'></div>
        <div>查看账单明细</div>
      </div>
      <div class='content'>
        <div class='content-top'>
          <div class='content-top-bottom'>
            <div style='float:left'>
              <el-input v-model.trim='keyword' style='width:280px;' clearable placeholder='请输入运单号'></el-input>
              <el-button type='primary' style='width:72px; ' icon='el-icon-search' @click='searchBills'>搜索</el-button>
            </div>
            <div style='float:right'>
              <el-button type='plain' style='width:72px;' class='grid-item-right' @click='addAppealAbnormal(null)'>
                异常申诉
              </el-button>
              <el-button type='plain' style='width:72px;' class='grid-item-right' @click='downLoadBill'>下载账单</el-button>
              <el-button type='plain' style='width:72px;' class='grid-item-right' @click='printBill'>打印存根</el-button>
            </div>
          </div>
        </div>
        <div class='content-table'>
          <ky-table ref='kyTable' :data='tableData' height='calc(100vh - 262px)' :pagination='pagination'
                    @pagination-change='searchBills' v-loading='loading' style='width:100%'
                    @selection-change='handleTableSelectionChange'>
            <el-table-column type='selection' width='55'>
            </el-table-column>
            <el-table-column v-for='(item, index) in columns.filter(i=>i.visible)' :key='index'
                             :show-overflow-tooltip='true' :prop='item.prop' :label='item.text' :width="item.width+'px'"
                             :min-width="item.minWidth || 80 +'px'">
              <template slot-scope='{row}'>
                <template v-if="item.prop === 'size'">
                  {{ row[item.prop] && row[item.prop].map(m => `${m["length"]}*${m.width}*${m.height}*${m.count}`).join(",")
                  }}
                </template>
                <template v-else>{{ row[item.prop] }}</template>
              </template>
            </el-table-column>
            <el-table-column fixed='left' width='80px'>
              <template slot='header'>操作<span class='el-icon-setting' @click='setColums'></span></template>
              <template slot-scope='scope'>
                <el-popover placement='right' trigger='click'>
                  <ul class='menu'>
                    <li @click="viewWaybill('查看运单联', scope.row.ydCode,1)">查看运单联</li>
                    <li @click="viewWaybill('查看签收联',scope.row.ydCode,2)">查看签收联</li>
                    <li @click="viewWaybill('查看回单联',scope.row.ydCode,3)">查看回单联</li>
                    <li @click='addAppealAbnormal(scope.row.ydCode)'>异常申诉</li>
                  </ul>
                  <el-button slot='reference' type='text' class='el-icon-caret-bottom' size='small'>
                  </el-button>
                </el-popover>
              </template>
            </el-table-column>
          </ky-table>
        </div>
      
      </div>
    </div>
    <ColumnManager ref='columnManager' @onSaveSuccess='mofidyColums'></ColumnManager>
    <ViewImage ref='viewImage'></ViewImage>
    <BillPrint ref='billPrint'></BillPrint>
    <BillListAbnormalDetail :appealInfo='appealInfo' ref='billListAbnormalDetail'></BillListAbnormalDetail>
    <print-view ref='printView' />
  </div>
</template>

<script>
import {
  searchBillsApi,
  getWaybillImagesApi,
  getGridConfigApi,
  downLoadBillApi
} from '@/services/api/bill'
import { getLoginCompanyName } from '@/utils/clientUtil'
import { getPhone, getCustomerCode } from '@/utils/storage'
import ColumnManager from './components/ColumnManager'
import ViewImage from './components/ViewImage'
import BillPrint from './components/BillPrint'
import BillListAbnormalDetail from './components/BillListAbnormalDetail'
import { PrintView } from '@client/dialogs'
import { parseJson } from '@utils/commonUtil'

export default {
  components: { ColumnManager, ViewImage, BillPrint, BillListAbnormalDetail, PrintView },
  data() {
    return {
      loading: false,
      pagination: {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        layout: 'prev, pager, next,sizes,jumper'
      },
      officialSealId: '',//公章地址ID
      deductionAmount: 0,
      keyword: '',
      selectedMonth: '',
      gridConfigId: '',
      gridName: 'billDetail',
      columns: [
        { prop: 'ydCode', text: '运单号', visible: true, width: '130' },
        { prop: 'sendCompany', text: '寄件公司', visible: true, minWidth: '100' },
        { prop: 'payCompany', text: '付款公司', visible: true, minWidth: '100' },
        // { prop: 'totalFreight', text: '总运费（元）', visible: true, minWidth: '100' },
        { prop: 'waybillMoney', text: '运单运费（元）', visible: true, minWidth: '110' },
        // { prop: 'tax', text: '另补税金（元）', visible: true, minWidth: '120' },
        { prop: 'dis', text: '折扣（%）', visible: true, minWidth: '100' },
        { prop: 'itemCount', text: '件数', visible: true },
        { prop: 'actualWeight', text: '实际重量（KG）', visible: true, minWidth: '120' },
        { prop: 'weight', text: '计费重量（KG）', visible: true, minWidth: '120' },
        { prop: 'sendCity', text: '寄件城市', visible: true },
        { prop: 'receiptCity', text: '收件城市', visible: true, minWidth: '100' },
        
        { prop: 'sendTime', text: '寄件时间', visible: false, minWidth: '100' },
        { prop: 'sendThings', text: '托寄物', visible: false },
        { prop: 'size', text: '抛货尺寸', visible: false },
        { prop: 'cubicNumber', text: '方数', visible: false },
        { prop: 'woodenCost', text: '木架费', visible: false },
        { prop: 'woodenSize', text: '木架尺寸', visible: false },
        { prop: 'sonderzug', text: '专车', visible: false },
        { prop: 'premium', text: '保费', visible: false },
        { prop: 'receiptCost', text: '回单费（元）', visible: false, minWidth: '100' },
        { prop: 'arrairport', text: '取货车牌号', visible: false, minWidth: '100' },
        { prop: 'payTax', text: '代收货款手续费', visible: false, minWidth: '120' },
        { prop: 'sendAddress', text: '始发地', visible: false },
        { prop: 'other', text: '其他', visible: false },
        { prop: 'companyCollect', text: '公司应收', visible: false },
        { prop: 'sendMan', text: '寄件人', visible: false },
        { prop: 'receiptAreaCode', text: '收件代码', visible: false },
        { prop: 'receiptCompany', text: '收件公司', visible: false },
        { prop: 'receivesAddress', text: '收件地址', visible: false },
        { prop: 'receiptMan', text: '收件人', visible: false },
        { prop: 'serviceMode', text: '服务方式', visible: false },
        { prop: 'payType', text: '付款方式', visible: false },
        { prop: 'destionation', text: '目的地城市', visible: false, minWidth: '100' },
        { prop: 'signPeople', text: '签收人', visible: false },
        { prop: 'signingTime', text: '签收时间', visible: false },
        { prop: 'subMoney', text: '代垫款项', visible: false },
        { prop: 'upstairsMoney', text: '爬楼费', visible: false },
        { prop: 'storageGoodsMoney', text: '货物保管费', visible: false, minWidth: '100' },
        { prop: 'sendWayBillNo', text: '联邦运单号', visible: false, minWidth: '100' },
        { prop: 'batchNumber', text: '批次号', visible: false, minWidth: '100' },
        { prop: 'batchFee', text: '批次费', visible: false, minWidth: '100' },
      ],
      tableData: [],
      selectedRows: [],
      appealInfo: {}
    }
  },
  methods: {
    async initData() {
      this.pagination = {
        pageIndex: 1,
        pageSize: 10,
        totalCount: 0,
        layout: 'prev, pager, next,sizes,jumper'
      }
      this.keyword = ''
      this.selectedMonth = this.$route.query.billMonth || ''
      this.appealInfo = parseJson(this.$route.query.appealInfo) || {}
      await this.searchBills()
      await this.getGridConfig()
    },
    getGridConfig() {
      let params = {
        mobile: getPhone(),
        gridName: this.gridName
      }
      getGridConfigApi(params).then(res => {
        if (res.data) {
          this.gridConfigId = res.data.id
          let tempColumns = JSON.parse(res.data.gridAttribute)
          this.columns.forEach(item => {
            let col = tempColumns.find(i => i.prop === item.prop)
            if (col) {
              item.visible = col.visible
            }
          })
          this.$nextTick(() => {
            this.$refs.kyTable.doLayout()
          })
        }
      })
    },
    //查询列表
    async searchBills() {
      window.report.sendClickEvent('clk_bill_total_detail_search')
      this.loading = true
      var res = await this.searchBillsByCondition()
      this.loading = false
      if (res.data) {
        this.officialSealId = res.data.officialSeal
        this.deductionAmount = res.data.deductionAmount
        // const row = res.data.dataList[0]
        // row.waybillMoney = '运费'
        // row.payTax = '代收'
        // row.woodenCost = '木架'
        // row.receiptCost = '回单'
        // row.totalFreight = '合计'
        // row.premium = '保费2'
        res.data.dataList?.forEach(r => {
          r.premium = r.addServiceFee?.premium
        })
        this.tableData = res.data.dataList
        this.pagination.totalCount = res.data.dataCount
      } else {
        this.tableData = []
        this.pagination.totalCount = 0
      }
      this.$nextTick(() => {
        this.$refs.kyTable.doLayout()
      })
    },
    async searchBillsByCondition(accountdate, pageIndex = this.pagination.pageIndex + '', pageSize = this.pagination.pageSize + '') {
      let params = {
        ydCode: this.keyword,
        Accountdate: this.selectedMonth,
        pageIndex: pageIndex,
        pageSize: pageSize,
        mobile: getPhone(),
        companyNo: getCustomerCode()
      }
      let res = await searchBillsApi(params)
      return res
    },
    returnBack() {
      const routeName = 'bill'
      this.$router.push({ name: routeName, params: { selectedBillingMonth: this.selectedMonth } })
    },
    addAppealAbnormal(ydNumbers) {
      window.report.sendClickEvent('clk_bill_total_detail_button', { button_name: '异常申诉' })
      if (ydNumbers === null && this.selectedRows.length > 0) {
        ydNumbers = this.selectedRows.map(r => r.ydCode).join()
      }
      this.$refs.billListAbnormalDetail.showDialog(ydNumbers)
    },
    printBill() {
      window.report.sendClickEvent('clk_bill_total_detail_button', { button_name: '打印存根' })
      if (this.selectedRows.length < 1) {
        this.$message({ message: '请勾选需要打印的数据', type: 'warning' })
        return
      }
      const waybills = this.getPrintModels(this.selectedRows)
      this.$refs.printView.showDialog(waybills, false, null, { isSendStubTemplate: true }, true)
      // this.$refs.billPrint.showDialog(this.selectedRows)
    },
    getPrintModels(rows) {
      if (!rows || rows.lenght < 1) {
        return []
      }
      let models = []
      let customerNo = getCustomerCode()
      rows.forEach(item => {
        let model = {
          ydNo: item.ydCode,
          jjCompany: item.sendCompany,
          jjTelePhone: item.sendPhone,
          jjContactPerson: item.sendMan,
          JJAddress: item.sendAddress,
          qHAddress: item.sendAddress,
          sjMobile: item.receiptPhone,
          sjContactPerson: item.receiptMan,
          sjCompany: item.receiptCompany,
          sjAddress: item.receivesAddress,
          sjQH: item.receiptAreaCode,
          serviceWay: item.serviceMode,
          goods: item.sendThings,
          payWay: item.payType,
          payAccount: customerNo,
          count: item.itemCount + '',
          weight: item.actualWeight,
          money: item.declareAmount + '',
          dsMoney: item.collectAmount + '',
          jjDateTime: item.sendTime,
          freightWeight: item.weight + '',
          freight: item.waybillMoney + '',
          totalCost: item.totalFreight + '',
          BFAmount: item.premium + '',
          DSHKAmount: item.payTax + '',
          JJQH: item.sendAreaCode,
          ReceiptAmount: item.receiptCost + '',
          MJAmount: item.woodenCost + '',
          sizeList: (item.size || []).map(m => ({ len: m.length, width: m.width, height: m.height, number: m.count })),
          jjRemark: '',
        }
        models.push(model)
      })
      return models
    },
    //设置表格列
    setColums() {
      let params = {
        gridConfigId: this.gridConfigId,
        gridName: this.gridName,
        columns: this.columns
      }
      this.$refs.columnManager.showDialog(params)
    },
    //表格列修改后
    mofidyColums(columns, gridConfigId) {
      this.columns = columns
      this.gridConfigId = gridConfigId
    },
    viewWaybill(title, ydCode, imageType) {
      let params = {
        mobile: getPhone(),
        ydCode: ydCode,
        intKndType: imageType,
      }
      getWaybillImagesApi(params).then(res => {
        if (res.data && res.data.base64) {
          this.$refs.viewImage.showDialog({ title: title, ydCode: ydCode, imageType: imageType, imgs: res.data.base64 })
        } else {
          this.$message('查无图片')
        }
      })
    },
    handleTableSelectionChange(val) {
      this.selectedRows = val
    },
    async downLoadBill() {
      window.report.sendClickEvent('clk_bill_total_detail_button', { button_name: '下载账单' })
      let loading = this.$loading()
      let res = await downLoadBillApi({
        'paymentCompanyId': this.appealInfo.paymentCustomerId,
        'inMonth': this.selectedMonth
      })
      loading.close()
      if (res.code == 0) {
        if (this.isClientMode) {
          let excelName = `${getLoginCompanyName()}${this.selectedMonth}账单.xls`
          this.$native.downLoadFile(res.data, 'excel', excelName)
          return
        }
        window.open(res.data)
      }
    },
    
    // // 下载地址簿模板
    // downloadTemplate() {
    //   const fileName = '地址簿模板.xls'
    //   if (!this.isClientMode) {
    //     window.location.href = `/templates/${fileName}`
    //   } else {
    //     // const url = `http://VER1.ky-express.com/data/Upgrade/Templates/${fileName}`
    //     // window.downLoadFile(url , 'excel' , fileName)
    //     const url=`${window.location.origin}/templates/${fileName}`
    //     this.$native.downLoadFile(url, 'excel', fileName)
    //   }
    // }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.initData()
    })
  }
}
</script>

<style lang='scss' scoped>
.title {
  margin-left: -6px;
  font-size: 18px;
  line-height: 50px;
  color: #333333;
  margin: 0 24px;
  border-bottom: 1px solid #f1f1f5;
  
  div {
    display: inline-block;
    font-weight: bold;
  }
  
  .el-icon-back {
    font-size: 17px;
    margin-right: 17px;
    position: relative;
    top: 1px;
    cursor: pointer;
  }
}

.menu {
  width: 100px;
  margin: -12px;
}

.menu li {
  width: 81px;
  padding-left: 19px;
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  color: #333333;
  cursor: pointer;
}

.menu li:hover {
  background-color: #f1f1f5;
}

.content {
  margin: 8px 24px 14px;
  
  .content-top {
    border-bottom: 1px solid #f1f1f5;
    
    > h2 {
      font-size: 12px;
      color: #333333;
      margin-bottom: 8px;
    }
    
    .content-top-bottom {
      margin-bottom: 16px;
      padding-top: 8px;
      
      &::after {
        content: "";
        display: block;
        clear: both;
      }
      
      .el-button {
        margin-left: 12px;
      }
    }
  }
  
  .content-table {
    height: 479px;
    
    .el-icon-setting {
      display: inline-block;
      font-size: 15px;
      position: absolute;
      top: 5px;
      right: 15px;
      cursor: pointer;
    }
    
    .cell .el-button {
      background-color: rgb(232, 230, 238);
      height: 24px;
      width: 24px;
      padding: 0;
      color: rgb(150, 149, 204);
      font-size: 15px;
    }
  }
  
  //滚动条的宽度
  .timeline::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  // 滚动条的滑块
  .timeline::-webkit-scrollbar-thumb {
    background-color: #dedce3;
    border-radius: 3px;
  }
  
  //表格样式
  /deep/ .el-table--border td {
    border-right: none;
  }
  
  /deep/ .el-table th > .cell {
    font-weight: bold;
  }
  
  /deep/ .el-table .cell {
    font-size: 12px;
  }
}

/deep/ .el-input__suffix {
  margin-top: -3px;
}

/deep/ .el-input__inner {
  padding: 0 8px;
}

/deep/ .k__table_r {
  color: #333333;
  
  .kye__table--header_r {
    th {
      background: #f7f8fe;
      font-weight: 500;
      color: #333333;
    }
  }
}
</style>

