<template>
  <ky-dialog
      id="notice-pickup__dialog"
      :class="[
      `page-style1 dialog-2021 ${loading ? 'notice-pickup-readonly' : ''}`,
      isClientMode ? 'client-mode' : 'web-mode'
    ]"
      title="完善取货信息"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      width="736px"
      append-to-body
      @confirm="confirm"
      :loading="loading"
  >
    <notice-content
        :showSelectNum="showSelectNum"
        @on-success="handleOnSucess"
        ref="noticeContentRef"
        :loading.sync="loading"
    />
    <notice-agreement slot="footer-left" :agreementChecked.sync="agreementChecked" />
  </ky-dialog>
</template>

<script>
import NoticeContent from './notice-content'
import NoticeAgreement from './notice-agreement'

export default {
  name: 'NoticePickup',
  props: {
    showSelectNum: {
      type: Boolean,
      default: () => true
    }
  },
  components: {
    NoticeContent,
    NoticeAgreement
  },
  data () {
    return {
      loading: false,
      dialogVisible: false,
      // 是否勾选电子运单
      agreementChecked: true,
      resolveResult: Function
    }
  },
  methods: {
    showDialog (waybills, placeOrderFunc, pickupSucessCallback) {
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.noticeContentRef?.loadData(waybills, placeOrderFunc, pickupSucessCallback)
      })
      return new Promise(resolve => {
        this.resolveResult = resolve
      })
    },
    handleOnSucess (saveResult) {
      this.resolveResult && this.resolveResult(saveResult)
      this.resolveResult = null
      this.dialogVisible = false
    },
    confirm () {
      if (!this.agreementChecked) {
        return this.$message('请先勾选电子运单服务协议')
      }
      this.$refs.noticeContentRef?.confirm()
    }
  },
  watch: {
    dialogVisible (val) {
      if (!val) {
        // this.$emit('on-close', this.isSaveSucess)
        this.resolveResult && this.resolveResult(false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
#notice-pickup__dialog /deep/ {
  .el-dialog {
    max-height: calc(100% - 60px);
  }

  .el-dialog__body {
    padding-bottom: 8px !important;
  }

  .el-dialog__footer {
    display: flex;
    align-items: center;
  }

  .notice-content--container {
    padding-bottom: 150px;
  }
}

.notice-pickup-readonly {
  pointer-events: none;
}

.client-mode {
  /deep/ {
    .el-input__suffix,
    .el-radio__inner::after {
      transition: none !important;
    }
  }
}
</style>
