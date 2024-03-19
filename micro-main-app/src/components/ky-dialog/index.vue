<template>
  <el-dialog class='ky-dialog' :class="{'page-style1':isFormPage}" :title='title' :visible.sync='dialogVisible'
             :close-on-click-modal='false' v-bind='$attrs' v-on='$listeners'>
    <template slot='title'>
      <slot name='title'></slot>
    </template>
    <slot></slot>
    <template slot='footer' v-if='visibleFooter'>
      <slot name='footer-left' />
      <slot name='footer'>
        <div class='btns--wrapper'>
          <el-button v-if='cancelText' :loading='loading' :type="!confirmText?'primary':''" @click='handleClose'>
            {{ cancelText }}
          </el-button>
          <el-button v-if='confirmText' type='primary' :loading='loading' @click='handleConfirm'>{{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: "ky-dialog",
  props: {
    loading: { type: Boolean },
    title: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    visibleFooter: {
      type: Boolean,
      default: true
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmText: {
      type: String,
      default: "确定"
    },
    isFormPage: {
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
      this.$emit("close")
      this.$emit("cancel")
      this.dialogVisible = false
    },
    handleConfirm() {
      this.$emit("confirm")
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit("update:visible", val)
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
</style>
<style lang='scss' scoped>
.ky-dialog {
  /deep/ {
    @import './ky-dialog.scss';
    
    .el-dialog__header {
      border-bottom: 1px solid #f1f1f5;
      
      .el-dialog__title {
        line-height: 1;
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
  
  /deep/ .el-dialog--origin {
    .el-dialog__body {
      margin: 0 !important;
      padding: 20px !important;
      border-top: none;
    }
  }
}

</style>
