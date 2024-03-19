<template>
  <el-container style="height: 100%;background-color:#f5f7fb" v-loading="billLoading">
    <el-header height="null" style="padding: 0;" >
      <div style="background-color:#fff; padding:6px;">
        <div v-if="adConfigs&&adConfigs.length>0" :style="{'paddingRight':(marqueeIndex<0?'240px':'41px')}" class="marque-container">
          <marquee loop="-1" direction="left" ref="marquee" height="25" scrollamount="5" onMouseOut="this.start()" onMouseOver="this.stop()">
            <span v-for="(item,index) in adConfigs" :key="index">
              <a href="#" @click.prevent="handleAdClick(item.jumpContent)">{{item.configContent}}</a>
            </span>
          </marquee>
          <span class="marque-close" @click="adConfigs=[]"></span>
        </div>
        <div class="banner">
          <!-- <img :src="'url('+ getStatusImageUrl(status)+')'"/> -->
          <div :style=" {width:'510px',height:'251px',float: 'right', backgroundImage: 'url('+ getStatusImageUrl(status)+')'}"></div>
          <div class="banner-months">
            <span style="font-size: 12px;color: #333333;">请选择月份：</span>
            <el-select style="width:100px;height:32px;" ref="billingMonths" :disabled="!haveCheckBillingPermission" v-model="selectedBillingMonth" @change="handleSelectBillingPeriod" v-eventTracting="'E001'">
              <el-option v-for="(item, index) in billingMonths" :key="index" :label="item" :value="item">{{item}}</el-option>
            </el-select>
          </div>
          <div class="status" :style="{backgroundImage: 'url('+ getStatusImageUrl(status,'status')+')'}">{{ formatStatus(status)}}</div>
          <div v-if="!haveCheckBillingPermission" class="noneBillingTip">您暂无查看账单权限，请联系市场员为您授权哦~</div>
          <div v-else-if="existsBill" class="bill">
            <div style="font-size:16px;color:#666666">本期应付：</div>

            <div style="height:75px;line-height:75px;display:flex;">
              <div style="font-size:54px;color:#333333;">¥{{billTotalAmount}}</div>

              <div v-if=" (isNeedMakeInvoice&&status==='10')||status==='20'" style="height:26px;line-height:26px;border-left:1px solid #C5C5F5;margin:24px 30px;"></div>
              <div v-if="status==='20'">
                <el-button size="small" type="primary" @click="confirmBill" v-eventTracting="'E002'">确认账单</el-button>
              </div>
              <div v-else-if="isNeedMakeInvoice&&status==='10'">
                <el-button size="small" type="primary" @click="makeInvoice" v-eventTracting="'E022'">申请开票</el-button>
              </div>
            </div>

            <div style="font-size:12px;color:#333333">
              <span v-if="status==='20'">
                请于
                <span style="color:#934FF4">{{billEndDate | formatBillEndDate}}</span>前完成对账并开票
              </span>
              <span v-else>
                请于
                <span style="color:#7352BF">{{ dateOfPayment | formatDateOfPayment}}</span>前完成付款。
                <span style="cursor: pointer;color:#7352BF" @click="viewBankInfo" v-eventTracting="'E007'">查看付款账户</span>
              </span>
            </div>
            <div style="display:flex;margin-top:12px;">
              <el-button size="small" class="button-plain" @click="downloadBill" v-eventTracting="{bizCode:'P003'}">下载账单</el-button>
              <el-button size="small" class="button-plain" @click="viewBillListDetail" v-eventTracting="'E006'">账单明细</el-button>
            </div>
          </div>
          <div v-else class="noneBillingTip">本期账单未出账或已付款</div>
        </div>
      </div>
    </el-header>
    <el-main style="padding: 0;background: #fff;margin-top: 15px;" ref="billTabs">
      <div class="listContainer">
        <el-button v-if="haveCheckBillingPermission&&existsBill" class="btnAppeal" type="primary" size="small" @click="addAppeal" v-eventTracting="'E009'">
          <img style="vertical-align: middle;" src="@/assets/image/bill/icon_edit.png" />
          异常申诉
        </el-button>
        <el-tabs class="client-tabs" v-model="selectedTabPage" type="card">
          <el-tab-pane :label="'异常总量('+abnormalCount+')'" name="abnormal">
            <BillListAbnormal ref="billListAbnormal" bizCode="E015" :appealInfo="appealInfo" tableHeight="calc(100vh - 523px)" :complaintStatus="['10','20']" @onSaveSuccess="handleAddAbnormal"></BillListAbnormal>
          </el-tab-pane>
          <el-tab-pane :label="'处理中('+processingCount+')'" name="processing">
            <BillListAbnormal ref="billListProcessing" bizCode="E016" :appealInfo="appealInfo" tableHeight="calc(100vh - 523px)" :complaintStatus="['10']" @onSaveSuccess="handleAddAbnormal"></BillListAbnormal>
          </el-tab-pane>
          <el-tab-pane :label="'已处理('+processedCount+')'" name="processed">
            <BillListAbnormal ref="billListProcessed" bizCode="E017" :appealInfo="appealInfo" tableHeight="calc(100vh - 523px)" :complaintStatus="['20']" @onSaveSuccess="handleAddAbnormal"></BillListAbnormal>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-main>
    <MakeInvoice ref="makeInvoice" @onMakeInvoiceSuccess="makeInvoiceSuccess" :billNumber="appealInfo.billNumber"></MakeInvoice>
    <InvoiceInfoList ref="invoiceInfoList"></InvoiceInfoList>
    <InvoiceDetail ref="invoiceDetail"></InvoiceDetail>
    <BillDownload :appealInfo="appealInfo" ref="billDownload"></BillDownload>
    <BillListAbnormalDetail :appealInfo="appealInfo" @onSaveSuccess="handleAddAbnormal" ref="billListAbnormalDetail"></BillListAbnormalDetail>
    <BankAccount ref="bankAccount" :bankAccountInfo="bankAccountInfo"></BankAccount>
  </el-container>
</template>

<script>
import BillListAbnormal from './components/BillListAbnormal'
import BillListAbnormalDetail from './components/BillListAbnormalDetail'
import BillListProcessing from './components/BillListProcessing'
import MakeInvoice from './components/invoice/components/MakeInvoice'
import InvoiceInfoList from './components/invoice/components/InvoiceInfoList'
import InvoiceDetail from './components/invoice/components/InvoiceDetail'
import BillDownload from './components/BillDownload'
import BankAccount from './components/BankAccount'

import { getPhone, getCustomerCode, getCustomerId } from '@/utils/storage'
import {
  confirmBillsApi,
  getBillSummaryInfoApi,
  getInvoiceFlagApi,
  getAppealSummaryInfoApi,
  sendEmail,
} from '@/services/api/bill'
import {
  isMonthlyPaymentCustomer,
} from './assets/common'
import { getPopularizeConfig } from '@/services/api/login'
import dayjs from 'dayjs'
import './assets/common.scss'
export default {
  components: {
    BillListAbnormal,
    BillListAbnormalDetail,
    BillListProcessing,
    MakeInvoice,
    InvoiceInfoList,
    InvoiceDetail,
    BillDownload,
    BankAccount
  },
  data () {
    return {
      billLoading: false,
      adConfigs: [],
      marqueeIndex: -1,
      status: '',
      unpaidMonths: [], //未付款月份
      isNeedMakeInvoice: false, //是否需要开票
      // statusImgUrl: '@/assets/image/bill/status-background-1.png',
      selectedTabPage: 'abnormal',
      selectedBillingMonth: '',
      ableMakeInvoiceAmount: 0,
      billingMonths: [],
      processingCount: 0,
      processedCount: 0,
      billTotalAmount: 0, //本期应付
      unreceivedAmount: 0, //未收款额
      dateOfPayment: '', //协议付款日期
      billStartDate: '', //月结开始日期
      billEndDate: '',
      overdueDays: 0,
      existsBill: false, //是否存在账单
      bankAccountInfo: {
        publicBankAccount: '',
        publicBankAccountName: '',
        publicBankName: ''
      },
      abnormalListData: {},
      appealInfo: {
        inMonth: '',
        billNumber: '', //应收编码
        paymentCustomerId: '', //付款公司ID
        paymentCustomerName: '' //付款公司
      }
    }
  },
  created () {
    this.getAdConfig()
    setTimeout(() => {
      this.marqueeIndex = 1
    }, 500)
  },
  async mounted () {
    this.initBillMonth()
    await this.getBillSummaryInfo()
    this.getInvoiceFlag()
    // await this.refreshAbnormalData();
  },
  watch: {
    selectedTabPage () {
      this.refreshAbnormalData()
    },
  },
  computed: {
    abnormalCount () {
      return this.processingCount + this.processedCount
    },
    haveCheckBillingPermission(){
      return (this.$store.state.auth.authCodeList || []).includes('allowCheckFlag')
    }
  },
  filters: {
    formatDateOfPayment (timeStamp) {
      if (timeStamp) {
        return dayjs(timeStamp).format('YYYY-MM-DD')
      }
    },
    formatBillEndDate (timeStamp) {
      if (timeStamp) {
        return dayjs(timeStamp)
          .add(7, 'days')
          .format('YYYY-MM-DD')
      } else {
        return '-'
      }
    }
  },
  methods: {
    formatStatus (status) {
      if (!this.haveCheckBillingPermission) {
        return '无权限'
      }
      if (this.existsBill) {
        if (status === '20') {
          return '待确认'
        } else if (status === '10') {
          return '已对账'
        }
      }
      return '未出账'
    },
    getStatusImageUrl (status, type) {
      let bannerImageName = 'billBanner_paying'
      let statusImageName = 'status_paying'
      if (!this.haveCheckBillingPermission) {
        bannerImageName = 'billBanner_nonePermission'
        statusImageName = 'status_nonePermission'
      } else if (!this.existsBill) {
        bannerImageName = 'billBanner_noneBilling'
        statusImageName = 'status_noneBilling'
      } else if (status === '20') {
        bannerImageName = 'billBanner_confirmBilling'
        statusImageName = 'status_confirmBilling'
      }
      // let url = `@/assets/image/bill/${type ? statusImageName : bannerImageName}.png`;
      // let url = `@/assets/image/bill/${bannerImageName}.png`;
      if (type) {
        return require(`@/assets/image/bill/${statusImageName}.png`)
      }
      return require(`@/assets/image/bill/${bannerImageName}.png`)
    },
    initBillMonth () {
      if (this.unpaidMonths && this.unpaidMonths.length > 0) {
        this.billingMonths = this.unpaidMonths.sort().reverse()
      }
      for (let i = 0; i > -6; i--) {
        let month = dayjs()
          .add(i, 'M')
          .format('YYYY-MM')
        if (this.billingMonths.findIndex(m => m == month) < 0) {
          this.billingMonths.push(month)
        }
      }
      if (this.$route.params.selectedBillingMonth) {
        this.selectedBillingMonth = this.$route.params.selectedBillingMonth
      } else {
        this.selectedBillingMonth = this.billingMonths[0]
      }
      this.handleSelectBillingPeriod(this.selectedBillingMonth)
    },
    //账单汇总信息
    async getBillSummaryInfo () {
      this.appealInfo.inMonth = this.selectedBillingMonth
      this.appealInfo.existsBill = false
      this.appealInfo.billNumber = ''
      this.status = ''
      this.existsBill = false
      this.overdueDays = 0
      let params = {
        inMonth: this.selectedBillingMonth,
        customerId: getCustomerId(),
        customerType: isMonthlyPaymentCustomer() ? 0 : 1
      }
      this.billLoading = true
      await getBillSummaryInfoApi(params).then(res => {
        this.existsBill = res.data && res.data.length > 0
        if (this.existsBill) {
          this.unpaidMonths = res.data.map(m => m.inMonth)
          if (!this.selectedBillingMonth) {
            return
          }
          let data = res.data[0]
          this.status = data.reconciliationStatus
          this.ableMakeInvoiceAmount = data.unInvoiceAmount
          this.billTotalAmount = data.billTotalAmount || 0
          this.unreceivedAmount = data.unreceivedAmount
          this.dateOfPayment = data.agreePayDate
          this.billStartDate = data.billStartDate
          this.billEndDate = data.billEndDate
          this.bankAccountInfo.publicBankAccount = data.publicBankAccount
          this.bankAccountInfo.publicBankAccountName =
              data.publicBankAccountName
          this.bankAccountInfo.publicBankName = data.publicBankName
          this.appealInfo.existsBill = this.existsBill
          this.appealInfo.inMonth = data.inMonth
          this.appealInfo.billNumber = data.billNumber
          this.appealInfo.paymentCustomerId = data.paymentCustomerId
          this.appealInfo.paymentCustomerName = data.paymentCustomerName
          if (this.status === '10') {
            let days = dayjs().diff(dayjs(this.dateOfPayment), 'days')
            this.overdueDays = days > 0 ? days : 0
          }
        }
        this.getAppealSummaryInfo()
        this.refreshAbnormalData()
        this.billLoading = false
      }).catch(() => {
        this.billLoading = false
      })
    },
    //获取开票标识，为true为能开票
    async getInvoiceFlag () {
      this.isNeedMakeInvoice = false
      let params = { customerCode: getCustomerCode() }
      await getInvoiceFlagApi(params).then(res => {
        if (res.data) {
          this.isNeedMakeInvoice = res.data.invoiceFlag === '10'
        }
      })
    },
    //选择账单日期
    handleSelectBillingPeriod (month) {
      // Object.assign(this.$data, this.$options.data())
      this.selectedBillingMonth = month
      this.getBillSummaryInfo()
      // this.$refs.billingMonths.blur();
      // this.$refs.billingMonths.$el.querySelector('input').blur();
    },
    viewBankInfo () {
      this.$refs.bankAccount.showDialog()
    },
    //确认对账
    confirmBill () {
      this.$confirm('是否确认账单信息？', '确认账单').then(() => {
        let params = {
          month: this.selectedBillingMonth,
          mobile: getPhone(),
          companyNo: getCustomerCode(),
          isHasAccount: '有'
        }
        confirmBillsApi(params).then(res => {
          if (res.success) {
            this.getBillSummaryInfo()
            //发送邮件
            sendEmail({
              paymentCompanyId: this.appealInfo.paymentCustomerId,
              inMonth: this.selectedBillingMonth
            })
            this.$message({
              message: '账单确认成功',
              type: 'success'
            })
          }
        })
      })
    },
    makeInvoice () {
      if (this.isNeedMakeInvoice) {
        if (this.ableMakeInvoiceAmount <= 0) {
          this.$message({
            message: '剩余可开票金额为0，无法开票',
            type: 'warning'
          })
          return
        }
        this.$refs.makeInvoice.showDialog(this.ableMakeInvoiceAmount)
      }
    },
    makeInvoiceSuccess () {
      this.getBillSummaryInfo()
    },
    //刷新异常表格数据
    refreshAbnormalData () {
      switch (this.selectedTabPage) {
        case 'abnormal':
          this.$refs.billListAbnormal.getAppealInfos(this.selectedBillingMonth)
          break
        case 'processing':
          this.$refs.billListProcessing.getAppealInfos(
            this.selectedBillingMonth
          )
          break
        case 'processed':
          this.$refs.billListProcessed.getAppealInfos(
            this.selectedBillingMonth
          )
          break
      }
    },
    //刷新异常统计数据
    getAppealSummaryInfo () {
      this.processingCount = this.processedCount = 0
      if (!this.appealInfo.billNumber) {
        return
      }
      let params = {
        elasticsearchFlag: 'N',
        generic: {
          vos: []
        },
        vo: {
          paymentCompanyNumber: getCustomerCode(),
          billNumber: this.appealInfo.billNumber
        },
        ERPSearchCacheFlag: true,
        forceCache: true
      }
      getAppealSummaryInfoApi(params).then(res => {
        if (res.data) {
          this.processingCount = res.data.noHandleNum || 0
          this.processedCount = res.data.existHandleNum || 0
        }
      })
    },
    //添加异常申诉后刷新数据
    handleAddAbnormal () {
      this.getAppealSummaryInfo()
      this.refreshAbnormalData()
    },
    downloadBill () {
      this.$refs.billDownload.showDialog({
        selectedMonth: this.selectedBillingMonth
      })
    },
    viewBillListDetail () {
      let routerName = 'billListDetail'
      this.$router.push({
        name: routerName,
        query: {
          billMonth: this.selectedBillingMonth,
          appealInfo: JSON.stringify(this.appealInfo)
        }
      })
    },
    addAppeal () {
      this.$refs.billListAbnormalDetail.showDialog()
    },
    async getAdConfig () {
      if (this.isClientMode) {
        return
      }
      const res = await getPopularizeConfig({
        portCode: 'bill'
        // pageCode: "tagNav"
      })
      if (res.code === 0) {
        const configs = res.data.filter(f => f.pageCode.startsWith('tagNav'))
        if (configs && configs.length > 0) {
          for (let i = 1; i < 151; i++) {
            this.adConfigs.push(...configs)
          }
        }
      }
    },
    handleAdClick (url) {
      let routerName = 'advertising'
      this.$router.push({
        name: routerName,
        query: { url }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
 /deep/{
   @include loading;
 }
  // @import url("./assets/common.scss");
  .list {
    margin-top: 20px;
  }
  .marque-container {
    display: inline-block;
    height: 31px;
    line-height: 31px;
    width: 330px;
    border: 1px solid #f4a2a2;
    border-radius: 4px;
    margin-left: 335px;
    position: relative;
    top: -2px;
    font-family: PingFangSC-Regular;
    font-size: 14px;
    color: #e25555;
    background: #fefadc url("../../../../assets/image/bill/icon_loudspeaker.png")
      no-repeat 17px 5px;
    padding: 0 35px 0 44px;
    box-sizing: border-box;
    overflow: hidden;
    marquee {
      a {
        color: #e25555;
        display: inline-block;
        margin-right: 17px;
      }
    }
    .marque-close {
      background: url("../../../../assets/image/bill/icon_close.png") no-repeat;
      width: 16px;
      height: 16px;
      position: absolute;
      right: 14px;
      top: 9px;
      cursor: pointer;
    }
  }
  .banner {
    background-image: url("../../../../assets/image/bill/billBanner_background.png");
    background-repeat: no-repeat;
    background-size: 100% 100%;
    height: 240px;
    width: 100%;
    position: relative;
    .banner-months {
      position: relative;
      top: 13px;
      left: 18px;
      width: 300px;
      /deep/ .el-input__suffix {
        background: url("../../../../assets/image/bill/date.png") no-repeat center;
        .el-input__suffix-inner {
          visibility: hidden;
        }
      }
    }
    .status {
      background-repeat: no-repeat;
      position: absolute;
      top: 68px;
      left: -6px;
      height: 40px;
      width: 100px;
      line-height: 34px;
      font-size: 16px;
      font-weight: bold;
      color: white;
      padding-left: 20px;
    }

    .bill {
      padding: 33px 0 0 165px;

      .el-button--primary {
        background-color: #7352bf;
        border-color: #7352bf;
        font-size: 14px;
      }
      .button-plain {
        background-color: transparent;
        border-color: #dcdae2;
        color: #333333;
        font-size: 12px;
        height: 32px;
        margin-right: 6px;
      }
    }

    .noneBillingTip {
      font-size: 26px;
      font-weight: bold;
      color: #6643b8;
      padding: 63px 0 0 159px;
    }
  }
  .listContainer {
    margin-left: -1px;
    padding-top: 1px;
    background-color: #fff;
    position: relative;
    .btnAppeal {
      z-index: 22;
      position: absolute;
      right: 24px;
      top: 4px;
    }
  }
</style>
