<template>
  <ky-dialog custom-class="print-view--container" :title="title" class="page-style1" :visible.sync="dialogVisible" :close-on-click-modal="false" width="736px" :loading="loading" append-to-body :confirmText='confirmText' @confirm="confirm" :show-close="!loading" @cancel="handleClose">
    <div v-if="currentStep > 0" class="steps-wrapper">
      <div class="line-wrapper">
        <div class="active">
          <i></i>
        </div>
        <div :class="currentStep > 1?'active':''">
          <i></i>
        </div>
      </div>
      <div class="text-wrapper">
        <div class="active">通知司机取货</div>
        <div :class="currentStep > 1?'active':''">打印运单</div>
      </div>
    </div>
    <!-- <div slot="footer-left" v-if="currentStep !== 1" class="footer">
      <div class="select">
        <div v-if='viewWord'>
          <el-checkbox v-model='childMotherChecked'></el-checkbox>
          <span class='detail'>{{ viewWord }}</span>
        </div>
        <div class='right' v-if="showSendSub">
          <el-checkbox v-model='sendStubChecked'></el-checkbox>
          <span class='detail'>打印寄件存根</span>
        </div>
      </div>
    </div> -->
    <notice-content v-show="currentStep === 1" ref="noticeContentRef" :loading.sync="loading" />
    <print-waybill v-show="currentStep !== 1" ref="printWaybillRef" :waybills="waybills" :loading.sync="loading" :isNoticePickup="isNoticePickup"  />

    <notice-agreement v-if="currentStep === 1" slot="footer-left" :agreementChecked.sync="agreementChecked" />

  </ky-dialog>
</template>

<script>
import NoticeContent from '@/views/waybill/components/notice-pickup/notice-content'
import PrintWaybill from './print-waybill.vue'
import NoticeAgreement from '../notice-pickup/notice-agreement'
import { getUserPreference } from '@/utils/storage'
const childMother_KEY = 'childMotherChecked'
const sendStub_KEY = 'sendStubChecked'

export default {
  name: 'print-view',
  components: {
    NoticeContent,
    PrintWaybill,
    NoticeAgreement
  },
  data () {
    return {
      loading: false,
      dialogVisible: false,
      title: '打单',
      confirmText: '确定',
      agreementChecked: true,
      waybills: [],
      currentStep: 0, //非0时才展示通知司机取货模块
      resolveResult: null,
      isSucessNoticePickup: false,
      noticePickupResult: null,//通知司机取货后保存失败和成功等运单数据
      isNoticePickup: false,
      childMotherChecked: false,
      sendStubChecked: false,
      showSendSub: '',
      viewWord: '',
      waybillNumber: '',//用于排查问题(用户反馈单票保存并打印时,保存的单号和打印的运单号不一致)
    }
  },
  methods: {
    handleOnSucess () {
      this.resolveResult && (this.resolveResult(true))
      this.resolveResult = null
      this.dialogVisible = false
    },
    showDialogNew ({ waybills, placeOrderFunc, pickupSucessCallback, waybillNumber }) {
      this.waybillNumber = waybillNumber
      return this.showDialog(waybills, placeOrderFunc, pickupSucessCallback)
    },
    showDialog (waybills, placeOrderFunc, pickupSucessCallback) {
      this.dialogVisible = true
      this.isSucessNoticePickup = false
      this.noticePickupResult = null
      const isNoticePickup = !!(placeOrderFunc || pickupSucessCallback)
      this.isNoticePickup = isNoticePickup
      this.currentStep = isNoticePickup ? 1 : 0
      this.title = isNoticePickup ? '通知取货并打印' : '打单'
      this.confirmText = isNoticePickup ? '下一步' : '确定'
      this.waybills = waybills
      this.$nextTick(() => {
        if (isNoticePickup) {
            this.$refs.noticeContentRef?.loadData(waybills, placeOrderFunc, pickupSucessCallback)
        } else {
          this.loadPrintData()
        }

      })
      return new Promise(resolve => {
        this.resolveResult = resolve
      })
    },
    loadPrintData () {
      this.$refs.printWaybillRef.initialization()
      // this.$refs.printWaybillRef.getPrintViewImages(true)
      // this.$refs.printWaybillRef.getPrinters()
    },
    async confirm () {

      switch (this.currentStep) {
        case 0: //打印
          if (await this.$refs.printWaybillRef?.confirm()) {
            this.handleOnSucess()
            this.$emit('printCallback')
          }
          break
        case 1: //通知司机取货并打印第一步
          this.noticePickupAndToPrint()
          break
        case 2: //通知司机取货并打印第二步
          if (! await this.$refs.printWaybillRef.checkData()) {
            return
          }
          await this.$refs.printWaybillRef.confirm()
          this.dialogVisible = false
      }
    },
    async noticePickupAndToPrint () {
      if (!this.agreementChecked) {
        return this.$message('请先勾选电子运单服务协议')
      }
      if (! await this.$refs.noticeContentRef.checkData()) {
        return
      }
      this.noticePickupResult = await this.$refs.noticeContentRef.confirm()
      if (this.noticePickupResult) {
        const { sucessModelList } = this.noticePickupResult
        this.isSucessNoticePickup = true
        if (sucessModelList) { //批量通知司机取货并打印
          this.waybills.forEach(w => {
            const model = sucessModelList.find(f => f.no === w.no)
            w.waybillNumber = model?.waybillNumber
          })
          this.waybills.forEach(function (item, index, arr) {
            if (!item.waybillNumber) {
              arr.splice(index, 1)
            }
          })
        }
        this.loadPrintData()
        this.confirmText = '确定'
        this.currentStep = 2
      }
    },
    updateViewWord (data) {
      this.viewWord = data
    },
    updateSendSub (data) {
      this.showSendSub = data
    },
    async init () {
      try {
        this.childMotherChecked = await getUserPreference(childMother_KEY)
        this.sendStubChecked = await getUserPreference(sendStub_KEY)
      } catch {
        console.log()
      }

    },
    handleClose(){
      if(!this.isNoticePickup){
        window.report.sendClickEvent('clk_search_order_print',{button_name:'取消'})
      }
    }
  },
  watch: {
    dialogVisible (val) {
      if (!val) {
        this.resolveResult && (this.resolveResult(this.noticePickupResult))
        this.$emit('on-close', this.isPrintSucess)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .print-view--container {
    .steps-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 16px;
      padding-top: 6px;
      .line-wrapper {
        display: flex;
        margin-bottom: 9px;
        & > div {
          position: relative;
          width: 159px;
          height: 2px;
          border-radius: 6px;
          background: #d3d3d3;
          & > i {
            display: inline-block;
            width: 10px;
            height: 10px;
            background: #acacac;
            border: 3px solid #fafafa;
            border-radius: 50%;
            position: absolute;
            top: -7px;
            left: -10px;
            z-index: 2;
          }
          &.active {
            &,
            & > i {
              background: #8365f6;
            }
          }
          &:last-child {
            & > i {
              left: unset;
              right: -16px;
            }
          }
        }
      }
      .text-wrapper {
        display: flex;
        & > div {
          font-size: 14px;
          color: #999999;
          line-height: 20px;
          &:first-of-type {
            padding-right: 261px;
          }
          &.active {
            color: #03050d;
            font-weight: bold;
          }
        }
      }
    }

    .footer {
      .select {
        display: flex;
        line-height: 30px;
        // margin-top: 16px;
        // margin-bottom: 26px;

        .right {
          margin-left: 20px;
        }

        .detail {
          color: #333333;
          margin-left: 8px;
        }
      }
    }
  }
  /deep/.el-dialog__body {
    padding: 0 20px 24px !important;
    margin: 12px 0 0 !important;
  }
  /deep/.el-dialog__footer {
    display: flex;
    align-items: center;
  }
</style>
