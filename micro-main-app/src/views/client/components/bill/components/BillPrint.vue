<template>
  <div class="clientdialog">
    <el-dialog :title="title" :visible.sync="dialogVisible" :close-on-click-modal="false" width="520px" height="594px">
      <div class="content">
        <div class="caption">请选择打印机</div>
        <el-select class="printer" size="small" v-model="selectedPrinter" placeholder="请选择打印机" @change="selectPrinterChanged">
          <el-option v-for="(item,index) in printerList" :key="index" :value="item">
          </el-option>
        </el-select>
        <div class="caption">请选择存根模板</div>
        <div class="content-imgs">
          <div class="content-imgs-left">
            <img @click="printTemplate='136Stub'"
                 src="@/assets/image/bill/template136.jpg">
            <div class="template">
              <el-radio v-model="printTemplate" label="136Stub">单联存根</el-radio>
            </div>
          </div>
          <div class="content-imgs-right">
            <img @click="isSelectedCloudPrinter?'': printTemplate='A4Stub'"
                 src="@/assets/image/bill/templateA4Stub.png" />
            <div class="template">
              <el-radio :disabled="isSelectedCloudPrinter" v-model="printTemplate" label="A4Stub">A4存根</el-radio>
            </div>
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="isConfirmButtonDisable" @click="print" v-eventTracting="'E011'">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>




<script>
import { getPrinters } from '@/services/api/bill'
import  printApi from '@/services/api/print'
import { getCustomerCode } from '@/utils/storage'
export default {
  data () {
    return {
      dialogVisible: false,
      title: '打印',
      printdata: [],
      printTemplate: '136Stub',
      selectedPrinter: '',
      // isSelectedCloudPrinter: true,
      printerList: [],
      isConfirmButtonDisable: false
    }
  },
  created () {
    this.loadPrinters()
  },
  methods: {
    showDialog (rows) {
      this.dialogVisible = true
      this.title = `共打印${rows.length}票`
      this.printdata = rows
      if (this.printerList.length > 0) {
        this.selectedPrinter = this.printerList[0]
      }
    },
    //查询打印机信息
    async loadPrinters () {
      let res = await getPrinters({ companyNo: getCustomerCode() })
      if (res.data && res.data.dataList.length > 0) {
        res.data.dataList.forEach(item => {
          this.printerList.push(item.printerId)
        })
      }

      if (typeof getlocationPrinters != 'undefined') {
        // console.log(typeof JSON.parse(getlocationPrinters()))
        let printersString = getlocationPrinters()
        JSON.parse(printersString).forEach(item => {
          this.printerList.push(item)
        })
      }
    },
    selectPrinterChanged (val) {
      if (val && val.toLowerCase().startsWith('y100')) {
        this.printTemplate = '136Stub'
      }
    },
    async print () {
      if (!this.selectedPrinter) {
        this.$message('请选择打印机')
        return
      }
      if (!this.printdata || this.printdata.lenght < 1) {
        this.$message({ message: '不存在打印的数据', type: 'warning' })
        return
      }
      this.isConfirmButtonDisable = true
      setTimeout(() => {
        this.isConfirmButtonDisable = false
      }, 1000)
      var printModels = this.getPrintModels(this.printdata)
      if (this.isSelectedCloudPrinter) {
        await this.batchPrint_136(this.selectedPrinter, printModels)
      } else {
        if (typeof printLogisticsBill != '') {
          printLogisticsBill(this.selectedPrinter, JSON.stringify(printModels), this.printTemplate)
        }
      }

      this.dialogVisible = false

    },
    //两联运单打印
    async batchPrint_136 (printerId, models) {
      let params = {
        'CompanyNo': getCustomerCode(),
        'TemplateType': 5,
        'PrinterNo': printerId,
        'EncryptFieldStr': this.$store.getters.encryptionText,
        'BatchModels': models,
        'PrintSource': 0
      }
      let result = await printApi.batchPrint_136(params)
      if (result.code === 0) {
        this.$message({
          message: '打印任务已发送到您的打印机请检查',
          type: 'success'
        })
      }
    },
    getPrintModels (rows) {
      if (!rows || rows.lenght < 1) {
        return []
      }
      let models = []
      let customerNo = getCustomerCode()
      rows.forEach(item => {
        let model = {
          YDCode: item.ydCode,
          JJCompanyNa: item.sendCompany,
          SJCompanyNa: item.receiptCompany,
          SJAddress: item.receivesAddress,
          JJAddress: item.sendAddress,
          SJQH: item.receiptAreaCode,
          ServerModel: item.serviceMode,
          Article: item.sendThings,
          PayType: item.payType,
          YJCardNo: customerNo,
          SJTelPhone: item.receiptPhone,
          JJTelPhone: item.sendPhone,
          JJPeople: item.sendMan,
          SJPeople: item.receiptMan,
          Number: item.itemCount + '',
          Weight: item.actualWeight,
          SaveValue: item.declareAmount + '',
          BFAmount: item.supportValue + '',
          DSAmount: item.collectAmount + '',
          DSHKAmount: item.payTax + '',
          JJTime: item.sendTime,
          JJQH: item.sendAreaCode,
          JFWeight: item.weight + '',
          Freight: item.waybillMoney + '',
          ReceiptAmount: item.receiptCost + '',
          MJAmount: item.woodenCost + '',
          TotalCost: item.totalFreight + '',
        }
        models.push(model)
      })
      return models
    }
  },
  computed: {
    isSelectedCloudPrinter () {
      return this.selectedPrinter && this.selectedPrinter.toLowerCase().startsWith('y100')
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    .caption {
      background: #f5f5fa;
      height: 28px;
      line-height: 28px;
      font-size: 14px;
      font-weight: bold;
      color: #333333;
      padding-left: 12px;
    }
    .printer {
      margin: 16.5px auto 24px;
      width: 268px;
    }
    .content-imgs {
      margin: 16px 10px 9px;
      &::after {
        content: "";
        display: block;
        clear: both;
      }
      img {
        width: 212px;
        height: 279px;
        cursor: pointer;
      }
      .content-imgs-left {
        float: left;
      }
      .content-imgs-right {
        float: right;
      }
      .template {
        text-align: center;
        margin-top: 13px;
      }
    }
  }
</style>
