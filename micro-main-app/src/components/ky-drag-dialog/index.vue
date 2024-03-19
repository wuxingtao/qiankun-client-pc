<template>
  <el-dialog
    v-if='visible'
    v-drag v-bind='$attrs' v-on='$listeners'
    class='ky-drag-dialog-wrapper'
    custom-class='ky-drag-dialog'
    :title='title'
    :visible.sync='dialogVisible'
    :close-on-click-modal='false'
  >
    <slot></slot>
  </el-dialog>
</template>

<script>

export default {
  name: 'ky-drag-dialog',
  props: {
    loading: { type: Boolean },
    title: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
      this.$emit('cancel')
      this.dialogVisible = false
    },
    handleConfirm() {
      this.$emit('confirm')
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
      if (val) {
        // 处理客户端中的层级问题
        this.$nextTick(() => {
          const kyDragDialogWrapper = document.querySelector('.ky-drag-dialog-wrapper')
          const kyDragDialog = document.querySelector('.ky-drag-dialog')
          kyDragDialog.style.zIndex = kyDragDialogWrapper.style.zIndex
        })
      }
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
.client-mode {
  .ky-dialog {
    .el-dialog__footer {
      min-height: 48px;
    }
  }
}

.ky-drag-dialog-wrapper {
  position: unset !important;
}


.ky-drag-dialog {
  margin: 0;
  position: fixed;
  right: 0;
  z-index: inherit;
  
  /deep/ {
    @import './index.scss';
    
    .el-dialog__header {
      font-size: 14px;
      border-bottom: 1px solid #f1f1f5;
      
      .el-dialog__title {
        line-height: 1;
        color: #333333;
        font-weight: bold;
      }
    }
    
    .el-dialog__body {
      padding: 20px;
      font-size: 12px;
    }
    
    .el-dialog__footer {
      border-top: 1px solid #f1f1f5;
      background-color: #fff;
      border-radius: 0 0 4px 4px;
      // display: flex;
      // align-items: center;
      .btns--wrapper {
        margin-left: auto;
      }
      
      .el-button {
        padding: 8px 20px;
      }
    }
  }
}
</style>

