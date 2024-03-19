<template>
  <el-dialog width="580px" :visible.sync="dialogVisible" class="question">
    <div class="top">
      <i class="iconfont icon-window-close" @click="onClose"></i>
    </div>
    <div class="middle">
      <div class="title">本次升级更新内容</div>
      <div class="description">
        <p>1.运单查询,下单寄件模块页面调整,样式更加简洁</p>
        <p>2.运单查询新增"我付款"的运单分类统计</p>
        <p>3.打印设置新增A4纸存根面单</p>
        <p>4.优化反馈的问题及提升客户端性能</p>
      </div>
    </div>
     <div slot="footer" class="dialog-footer">
      <el-button class="btn-i-know" size="medium" type="primary" @click="onClose">我知道了</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { setUserPreference } from '@/utils/storage'

const UPGRADE_KEY = 'isShowUpgradeTip'

export default {
  name: 'UpgradeTips',
  data () {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    showDialog () {
      this.dialogVisible = true
    },
    onClose () {
      setUserPreference(UPGRADE_KEY, true)
      this.dialogVisible = false
    },

  },
}
</script>

<style lang="scss" scoped>
  .question {
    /deep/.el-dialog__header {
      display: none;
    }
    /deep/ .el-dialog__body {
      padding: 2px 0;
    }

    .top {
      position: absolute;
      background: url("../../assets/image/upgrade-tips.png") no-repeat;
      height: 203px;
      width: 580px;
      // background-color:black;
      margin-top: -40px;
      > i {
        color: #ffffff;
        margin-left: 556px;
        margin-top: 40px;
        font-size: 12px;
        cursor: pointer;
        position: absolute;
      }
    }
    .title {
      height: 18px;
      opacity: 1;
      font-size: 18px;
      font-weight: 600;
      text-align: left;
      color: #333333;
      line-height: 18px;
    }
    .middle {
      margin-top: 170px;
      z-index: 2;
      padding: 0 0 0 30px;
    }
    .description {
      height: 96px;
      font-size: 14px;
      text-align: left;
      color: #333333;
      line-height: 24px;
      padding: 20px 0;
    }
  }
</style>
