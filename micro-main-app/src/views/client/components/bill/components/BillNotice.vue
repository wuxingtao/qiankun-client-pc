<template>
  <div class="clientdialog">
    <el-dialog title="公告"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               top="10vh"
               width="315px">
      <div class="content">
        本系统自2019年09月28日起在线对账功能正式上线，<span style="color: #EE1D06">仅供展示查询日期前六个月的账单及往期未付款月份的账单</span>，但系统上线日期之前的账单无法展示，如有需要请线下联系对应的财务人员获取。
      </div>
      <span slot="footer"
            class="dialog-footer">
        <el-button type="primary"
                   @click="dialogVisible = false">知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    showDialog () {
      this.dialogVisible = true
    },
  }
}
</script>

<style lang='scss' scoped>
  .clientdialog {
    .content {
      font-size: 12px;
      color: #333;
      line-height: 17px;
      text-indent: 2em;
    }
    .el-button--primary {
      padding: 0;
      height: 32px;
    }
    /deep/ .el-dialog > .el-dialog__body {
      margin: 20px 4px 26px 20px;
    }
  }
</style>
