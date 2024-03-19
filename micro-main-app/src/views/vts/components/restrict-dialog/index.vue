<template>
  <div class="vts-restrict-dialog"
       :class="restrictType.class">
    <el-dialog title="提示"
               :width="'400px'"
               :show-close="false"
               :visible.sync="dialog.show"
               @close="dialog.show = false"
               :before-close="handleClose">
      <div class="vts-dialog-title"
           slot="title">
        <div class="title-left">
          <svg-icon :icon-class="restrictType.icon"></svg-icon>
          取派{{+dialog.limitType === 10 ? '限制' : '提醒'}}
        </div>
        <i class="el-dialog__close el-icon el-icon-close"
           @click="dialog.show = false"></i>
      </div>
      <span v-if="dialog.noticeMessage"
            class="vts-content">
        <svg-icon icon-class="tanhao"></svg-icon>
        <div>{{dialog.noticeMessage}}</div>
      </span>

      <span slot="footer"
            class="vts-footer">
        <el-button type="primary"
                   @click="dialog.show = false">知道了</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import { abnormalType } from './config'
  export default {
    props: {
      dialog: {
        type: Object,
        default: () => {
          return {
            show: false,
            limitType: '10'
          }
        }
      },
    },
    data () {
      return {
        abnormalType,
      }
    },
    computed: {
      restrictType () {
        let type = this.dialog && this.dialog.limitReason || '10'
        console.log('type', type)
        return this.abnormalType[type]
      }
    },
    methods: {
      handleClose () { }
    }
  }
</script>

<style lang="scss" scoped>
  .vts-restrict-dialog {
    height: 24px;
    line-height: 24px;
    background: #fff4e6;
    /deep/.el-dialog__header {
      width: 400px;
      height: 50px;
      border-radius: 4px 4px 0px 0px;
      padding: 0;
      .vts-dialog-title {
        font-size: 18px;
        font-weight: 600;
        text-align: left;
        line-height: 50px;
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        align-items: center;
        .svg-icon {
          font-size: 50px;
          width: 50px;
          height: 50px;
          overflow: hidden;
          margin-right: 8px;
        }
        .title-left {
          display: flex;
          flex-flow: row nowrap;
          justify-content: flex-start;
          align-items: center;
        }
        i {
          margin-right: 20px;
          font-weight: bold;
          font-size: 12px;
          cursor: pointer;
          color: #999;
        }
      }
    }
    /deep/.el-dialog__footer {
      padding: 12px 16px;
    }
    .vts-content {
      display: flex;
      flex-flow: row nowrap;
      justify-content: flex-start;
      align-items: flex-start;
      .svg-icon {
        margin-right: 6px;
        flex-shrink: 0;
        margin-top: 4px;
      }
      div {
        display: flex;
        flex-flow: row wrap;
        justify-content: flex-start;
        align-items: flex-start;
      }
    }
    .vts-footer {
      .el-button {
        width: 68px;
        height: 28px;
        line-height: 28px;
        text-align: center;
        color: #fff;
        background: #7653d6;
        border-radius: 2px;
        padding: 0;
      }
    }
  }
  .restrict-yq {
    /deep/.el-dialog__header {
      background: linear-gradient(270deg, #ffffff, #fff0da);
      .vts-dialog-title {
        color: #ff8000;
      }
    }
  }
  .restrict-tf {
    /deep/.el-dialog__header {
      background: linear-gradient(270deg, #ffffff, #cbd9f7);
      .vts-dialog-title {
        color: #3d72de;
      }
    }
  }
  .restrict-xq {
    /deep/.el-dialog__header {
      background: linear-gradient(270deg, #ffffff, #b3e8fa);
      .vts-dialog-title {
        color: #048db8;
      }
    }
  }
  .restrict-jq {
    /deep/.el-dialog__header {
      background: linear-gradient(270deg, #ffffff, #fbd4d1);
      .vts-dialog-title {
        color: #f34747;
      }
    }
  }
</style>