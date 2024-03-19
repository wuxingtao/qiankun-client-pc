<template>
  <div class="clientdialog">
    <el-dialog :title="title"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="520px">
      <div class="content">

        <div class="content-top">
          <div>是否确认账单并申请开发票？</div>
          <div>开票总金额：{{invoiceTotalAmount}}元，开票资料如下：</div>
        </div>
        <div v-if="invoiceInfos.length<1"
             class="noInvoice-container">
          <div class="noInvoice">
            <img src="@/assets/image/bill/noInvoiceInfo.png" />
            <div style="margin-top:4px;padding-left:15px;">暂无开票资料</div>
          </div>
        </div>

        <div v-else
             class="content-invoices">
          <MakeInvoiceItem v-for="(item, index) in invoiceInfos"
                           :key="index"
                           isShowMore="false"
                           :index="index"
                           :invoiceInfo="item"
                           :remainingAmount="remainingAmount"
                           @onDeletedItem="deletedItem"
                           @onInvoiceAmountChanged="invoiceAmountChanged"></MakeInvoiceItem>
        </div>
        <div class="addInvoice">
          <el-button size="small"
                     :type="invoiceInfos.length<1?'primary':''"
                     icon="el-icon-plus"
                     style=" width: 222px;"
                     @click="addInvoiceInfos"
                     v-eventTracting="{bizCode:'P007'}">添加开票资料</el-button>
        </div>
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary"
                   @click="saveData">确 定</el-button>
      </span>
    </el-dialog>
    <InvoiceInfoList ref="invoiceInfoList"
                     @onConfirmSelect="afterSelectedInvoices"></InvoiceInfoList>
  </div>
</template>

<script>
import MakeInvoiceItem from "./MakeInvoiceItem"
import InvoiceInfoList from "./InvoiceInfoList"
import { makeInvoiceApi, pushMakeInvoiceMessageApi} from "@/services/api/bill"
import { getContactNumbers } from '../../../assets/common'
import { getLoginCompanyName } from '@/utils/clientUtil'
import { getPhone, getCustomerCode} from "@/utils/storage"


export default {
  props: {
    billNumber: { type: String, required: true },
  },
  components: {
    MakeInvoiceItem,
    InvoiceInfoList,
  },
  data () {
    return {
      title: "申请开票",
      dialogVisible: false,
      invoiceTotalAmount: 0,
      remainingAmount: this.invoiceTotalAmount,
      invoiceInfos: [],
    }
  },
  methods: {
    async showDialog (ableMakeInvoiceAmount) {
      Object.assign(this.$data, this.$options.data())
      let tempInvoiceList = await this.$refs.invoiceInfoList.getInvoiceInfoList()
      this.invoiceInfos = tempInvoiceList.filter(i => i.auditStatus === '20')
      this.invoiceInfos.forEach(item => {
        this.$set(item, 'invoiceAmount', '0')
      })
      this.invoiceTotalAmount = ableMakeInvoiceAmount
      this.dialogVisible = true
    },
    deletedItem (index) {
      this.invoiceInfos.splice(index, 1)
      // let index = this.invoiceInfos.indexOf(invoiceInfo);
      // if (index > -1) {
      //   this.invoiceInfos.splice(index - 1, 1);
      // }
    },
    invoiceAmountChanged (amount) {
      let sum = this.invoiceInfos.reduce((tempSum, cur) => {
        let amount = parseFloat(cur.invoiceAmount) || 0
        amount = isNaN(amount) ? 0 : amount
        return tempSum + amount
      }, 0)
      this.remainingAmount = this.invoiceTotalAmount - parseFloat(sum) + parseFloat(amount)
    },
    addInvoiceInfos () {
      this.$refs.invoiceInfoList.showDialog()
    },
    afterSelectedInvoices (invoices) {
      if (!invoices || invoices.length < 1) {
        return
      }
      this.invoiceInfos.push(...invoices)
      invoices.forEach(item => {
        this.$set(item, 'invoiceAmount', '0')
      })
    },
    saveData () {
      if (!this.invoiceInfos || this.invoiceInfos.length < 1) {
        this.$message('请选择需要开票的开票资料')
        return
      }
      if (this.invoiceInfos.some(item => item.invoiceAmount <= 0)) {
        this.$message('开票金额必须大于0')
        return
      }
      let promiseList = this.invoiceInfos.map(info => {
        let promise = new Promise((resolve, reject) => {
          let param = this.getSaveParam(info)
          makeInvoiceApi(param).then(res => {
            if (res.data) {
              resolve(res.data)
            } else {
              reject(false)
            }
          })
        })
        return promise
      })
      var result = Promise.all(promiseList).then(res => {
        let failCount = res.filter(r => !r).length
        let ids = res.filter(i => i).join()
        if (failCount === res.length) {
          this.$message.error('开票失败')
          return
        } else if (failCount === 0) {
          this.$message({
            message: '开票成功',
            type: 'success'
          })
        } else {
          let msg = `已成功申请开具${res.length - failCount}张发票，失败${failCount}张，发票预计在1-2工作日内寄出，请注意查收。`
          this.$message.error(msg)
        }
        this.pushMakeInvoiceMessage(ids)
      })
      this.$emit('onMakeInvoiceSuccess')
      this.dialogVisible = false
    },
    getSaveParam (info) {
      let contacts = getContactNumbers(info.phoneAddress)
      let phone = contacts.telephones[0] || contacts.phones[0]
      let amount = parseFloat(info.invoiceAmount)
      let param = {
        customerCode: info.customerCode || getCustomerCode(),
        invoiceAmount: amount,
        invoiceContent: '收派服务费',
        invoiceRise: info.deductionCompany,
        deductionTaxNumber: info.deductionTax,
        companyAddress: info.phoneAddress.replace(phone, ''),
        companyTel: phone,
        bankName: info.invoiceOpenBank,
        account: info.invoiceOpenAccount,
        name: info.invoiceReceiver,
        mobileNumber: info.invoiceReceiverPhone,
        receiveAddress: info.province + info.city + info.district + info.doorNumber,
        expressFee: 0,
        appInvoiceDetailExList: [{
          waybillNumber: this.billNumber,
          invoiceAmount: amount
        }],
        provinceId: info.provinceId,
        provinceName: info.province,
        cityId: info.cityId,
        cityName: info.city,
        areaId: info.districtId,
        areaName: info.district,
        loginMobile: getPhone()
      }
      return param
    },
    pushMakeInvoiceMessage (id) {
      let params = {
        companyName: getLoginCompanyName(),
        companyCode: getCustomerCode(),
        bilingId: id,
      }
      try {
        pushMakeInvoiceMessageApi(params).then(res => {
          console.log(res)
        })
      }
      catch{ }
    }
  }
}
</script>

<style lang="scss" scoped>
  .content {
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #dedce3;
      border-radius: 3px;
    }
    .noInvoice-container {
      width: 480px;
      height: 195px;
      background: rgba(216, 216, 216, 0);
      border: 1px solid #dcdae2;
      border-radius: 4px;
      margin-top: 16px;
      position: relative;
      .noInvoice {
        width: 120px;
        padding: 60px 190px;
        font-size: 12px;
        color: #999999;
      }
    }

    width: 100%;
    .content-top {
      font-size: 12px;
      color: #333333;
      // margin-left: 16px;
      div {
        margin-bottom: 5px;
      }
    }
    .content-invoices {
      max-height: 384px;
      overflow-y: auto;
      overflow-x: hidden;
      margin-right: -16px;
      // margin-left: 16px;
      // margin: 0 auto;
    }
    .addInvoice {
      text-align: center;
      margin: 12px auto 7px;
    }
  }
  /deep/ .el-dialog .el-dialog__body {
    padding-left: 0;
    padding-right: 0;
  }
</style>
