<template>
  <div class="clientdialog">
    <el-dialog title="下载账单"
               custom-class="downloadDialog"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               width="560px"
               height="357px">
      <div class="content">
        <ul class="clearfix">
          <li @click="downloadExcel"
              v-eventTracting="'E004'">
            <img src="@/assets/image/bill/excel.png">
            <p style=" padding-left: 38px;"> Excel</p>
          </li>
          <li @click="downloadPdf"
              v-eventTracting="'E005'">
            <img src="@/assets/image/bill/pdf.png">
            <p style=" padding-left: 45px;"> PDF</p>
          </li>
        </ul>
      </div>
      <span slot="footer"
            class="dialog-footer">
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getPhone, getCustomerCode,getCustomerId } from "@/utils/storage"
import { searchBillsApi, downLoadBillPdfApi, getCustomerFinanceInfoApi ,downLoadBillApi} from "@/services/api/bill"
import { getLoginCompanyName } from '@/utils/clientUtil'
export default {
  props: {
    appealInfo: { type: Object, required: true },
  },
  data () {
    return {
      dialogVisible: false,
      selectedMonth: '',
      customerColumns: [],
      officialSealId: '',
      deductionAmount: 0,
    }
  },
  methods: {
    showDialog (values) {
      this.getCustomerColumns()
      this.dialogVisible = true
      this.selectedMonth = values.selectedMonth
    },
    async  searchBillsByCondition (accountdate) {
      let params = {
        Accountdate: accountdate,
        pageIndex: '1',
        pageSize: '99999',
        mobile: getPhone(),
        companyNo: getCustomerCode()
      }
      let res = await searchBillsApi(params)
      return res
    },
    getCustomerColumns () {
      let params = {
        customerId: getCustomerId()
      }
      getCustomerFinanceInfoApi(params).then(res => {
        if (!res.data) {
          return
        }
        let colMappings = []
        let cols = [{ filedName: 'billSquares', prop: 'cubicNumber', text: '方数' },
          { filedName: 'billReceiveAddress', prop: 'receivesAddress', text: '收件地址' },
          { filedName: 'billGoods', prop: 'sendThings', text: '托寄物' },
          { filedName: 'billSignTime', prop: 'signingTime', text: '签收时间' },
          { filedName: 'billWaybillNo', prop: 'ydCode', text: '运单号' },
          // { filedName: 'billSendAreaCode', prop: 'cubicNumber', text: '寄件区号' },
          // { filedName: 'billOriginAddress', prop: 'cubicNumber', text: '原寄地' },
          { filedName: 'billSize', prop: 'size', text: '抛货尺寸' },
          { filedName: 'billActualWeight', prop: 'actualWeight', text: '实际重量' },
          // { filedName: 'billStatementPrice', prop: 'cubicNumber', text: '声明价值' },
          { filedName: 'billSendTime', prop: 'sendTime', text: '寄件时间' },
          // { filedName: 'billThrowWeight', prop: 'cubicNumber', text: '抛重' },
          // { filedName: 'billFreightAmountFormula', prop: 'cubicNumber', text: '运费公式' },
          //{ filedName: 'billPackingAmount', prop: 'cubicNumber', text: '包材费' },
          { filedName: 'billObjectiveCity', prop: 'destionation', text: '目的地城市' },
          { filedName: 'billSigner', prop: 'signPeople', text: '签收人' }]
        cols.forEach(item => {
          if (res.data[item.filedName] === '10') {
            colMappings.push({ "ExcelColName": item.text, "ExcelTemplatePropName": item.prop, "ModelPropName": item.prop, "UIColName": item.text, "IsDefault": false, "IsShow": true })
          }
        })
        this.customerColumns = colMappings
      })
    },
    async  downloadExcel () {
      let res=await    downLoadBillApi({'paymentCompanyId':this.appealInfo.paymentCustomerId,'inMonth':this.selectedMonth})
      if(res.code==0){
        if (this.isClientMode) {
          let excelName = `${getLoginCompanyName()}${this.selectedMonth}账单.xls`
          this.$native.downLoadFile(res.data, "excel", excelName)
          return
        }
        window.open(res.data)
      }
      return
    },
    async downloadPdf () {
      let loading = this.$loading({
        target: '.downloadDialog',
      })
      let params = {
        inMonth: this.selectedMonth,
        customerCode: getCustomerCode()
      }
      let fileName = `${getLoginCompanyName()}${this.selectedMonth}账单.pdf`
      let res = await downLoadBillPdfApi(params)
      if (res.data) {
        if (this.isClientMode) {
          const result=await  this.$native.downloadFileByBase64(res.data, fileName,true)
          if(result!==-1){
            if(result===1){
              this.$message.success('下载成功')
            }if(result===0){
              this.$message.error('下载失败')
            }
          }
          loading.close()
          return
        }
        let file = this.b64toFile(res.data, 'test', 'application/pdf;charset=utf-8')
        this.downFile(file, fileName)
        loading.close()
      }
    },
    downFile (blob, fileName) {//blob就是一中返回的文件,fileName是下载文件名
      if (window.navigator.msSaveOrOpenBlob) {//msSaveOrOpenBlob方法返回bool值
        navigator.msSaveBlob(blob, fileName)//本地保存
      } else {
        var link = document.createElement('a')//a标签下载
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName
        link.click()
        window.URL.revokeObjectURL(link.href)
      }
    },
    b64toFile (b64Data, filename, contentType) {
      let sliceSize = 512
      let byteCharacters = atob(b64Data)
      let byteArrays = []
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize)
        let byteNumbers = new Array(slice.length)

        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }
        let byteArray = new Uint8Array(byteNumbers)
        byteArrays.push(byteArray)
      }
      let file = new File(byteArrays, filename, { type: contentType })
      return file
    },
  }
}
</script>

<style lang="scss" scoped>
  .clearfix {
    &::after {
      content: "";
      display: block;
      clear: both;
    }
  }
  ul {
    margin-left: 87px;
    margin-top: 52px;
    li {
      cursor: pointer;
      &:first-child {
        margin-right: 98px;
      }
      float: left;
      img {
        width: 120px;
        height: 120px;
      }
      p {
        padding-top: 6px;
        padding-bottom: 49px;
      }
    }
  }
  /deep/.el-dialog .el-dialog__footer {
    border-top: none !important;
  }
</style>
