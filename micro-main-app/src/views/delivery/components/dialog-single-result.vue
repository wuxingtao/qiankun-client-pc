<template>
  <ky-dialog class='dialog-signle-result_container' title='' :visible.sync='dialogVisible' :show-close='false'
             confirm-text='' cancel-text='' width='360px' append-to-body :close-on-press-escape="false">
    <svg-icon icon-class='icon-success' class='icon-circle-check' />
    <span class='sucess-msg'>{{ msg }}</span>
    <span>您可以</span>
    <div class='btn-wrapper'>
      <el-button size='small' @click="handleClose('waybill')">返回运单查询</el-button>
      <el-button type='primary' size='small' @click="handleClose('single')">继续填单</el-button>
    </div>
  </ky-dialog>
</template>

<script>
export default {
  props: {
    resetFormData: { type: Function }
  },
  data() {
    return {
      dialogVisible: false,
      msg: '运单已保存',
      resolveResult: Function,
      isBatch: false, //是否是批量
      operationType: ''//操作类型：通知司机取货等
    }
  },
  methods: {
    showDialog(msg, isBatch, operationType) {
      this.isBatch = isBatch
      this.operationType = operationType
      this.dialogVisible = true
      msg && (this.msg = msg)
      return new Promise(resolve => {
        this.resolveResult = resolve
      })
    },
    handleClose(type) {
      this.dialogVisible = false
      setTimeout(() => {
        if (!this.isBatch) {
          this.resetFormData && this.resetFormData(true, true)
        }
        if (type === 'waybill') {
          this.$router.push({ name: 'waybill-v3', params: { refreshData: true, operationType: this.operationType } })
        } else if (this.isBatch) {
          this.resolveResult({ continue: true })
          this.resolveResult = null
        } else {
          this.$router.push('/admin/delivery')
        }
      }, this.$native.isClientMode() ? 100 : 0) //针对壳里没立即关闭问题
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.resolveResult && (this.resolveResult())
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.dialog-signle-result_container {
  font-size: 14px;
  color: #333;
  
  /deep/ {
    .el-dialog__header,
    .el-dialog__footer {
      display: none;
    }
    
    .el-dialog__body {
      margin-top: 24px !important;
      padding-bottom: 20px !important;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .icon-circle-check {
        width: 144px;
        height: 144px;
      }
      
      .sucess-msg {
        padding: 0 0 12px;
        font-size: 16px;
        font-weight: bold;
        color: #333333;
      }
      
      .btn-wrapper {
        padding-top: 28px;
        
        .el-button {
          width: 130px;
          height: 44px;
          border-radius: 4px;
          
          &:first-child {
            border: 1px solid #8365f6;
            font-size: 14px;
            font-weight: 500;
            color: #8365f6;
          }
          
          &:last-child {
            font-size: 14px;
            font-weight: 500;
            background: #8365f6;
            border: 1px solid #8365f6;
          }
          
          span {
            font-size: 14px;
          }
        }
        
        .el-button + .el-button {
          margin-left: 16px;
        }
      }
    }
  }
}
</style>