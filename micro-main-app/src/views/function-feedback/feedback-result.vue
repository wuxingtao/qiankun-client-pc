<template>
  <ky-dialog class="feedback-result--container" title="" :visible.sync="dialogVisible" is-form-page confirm-text="" cancel-text="我知道了" :show-close="false" width="700px">
    <img src="@/assets/image/feedback/result-success.png" />
    <div class="qrcode--wrapper">
      <span> 
        <img src="@/assets/image/qrcode-miniprogram.png" /> 
        <div>打开微信扫一扫<br/>{{tip}}</div>
        </span>
      <span>
         <img src="@/assets/image/qrcode-app.png" />
         <div>扫码下载跨运速运APP<br/>{{tip}}</div>
      </span>
    </div>
  </ky-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tip:{
      type:String
    }
  },
  data () {
    return {
      dialogVisible: false,
    }
  },
  methods: {
  },
  watch: {
    visible (val) {
      this.dialogVisible = val
    },
    dialogVisible (val) {
      this.$emit('update:visible', val)
    }
  },
}
</script>

<style lang="scss" scoped>
  .feedback-result--container {
    /deep/ {
      .el-dialog__header {
        display: none;
      }
      .el-dialog__body {
        margin-top: 30px !important;
        padding-bottom: 41px !important;
        text-align: center;
        .qrcode--wrapper{
          margin-top: 20px;
          display: flex;
          justify-content: center;
          font-size: 12px;
          color: #232222;
          line-height: 17px;
          span>img{
            width: 128px;
            height: 128px;
          }
          span + span {
            margin-left: 107px;
          }
        }
      }
    }
  }
</style>