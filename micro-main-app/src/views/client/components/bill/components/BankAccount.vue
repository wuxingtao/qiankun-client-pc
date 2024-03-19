<template>
  <div class="clientdialog">
    <el-dialog title="查看付款账号"
               :visible.sync="dialogVisible"
               :close-on-click-modal="false"
               width="360px">
      <div class="content">
        <div>
          <span class="label">对公账号</span>
          <span>{{bankAccountInfo.publicBankAccount}}</span>
        </div>
        <div>
          <span class="label">开户名</span>
          <span>{{bankAccountInfo.publicBankAccountName}}</span>
        </div>
        <div>
          <span class="label">开户银行</span>
          <span>{{bankAccountInfo.publicBankName}}</span>
        </div>
      </div>
      <span slot="footer"
            class="dialog-footer">

        <el-button type="primary"
                   @click="dialogVisible=false">知道了</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    bankAccountInfo: { type: Object, required: true },
  },
  data () {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    showDialog () {
      this.dialogVisible = true
    },
  },
}
</script>

<style lang="scss" scoped>
  .content {
    padding-top: 4px;
    & > div {
      height: 33px;
      &:last-child {
        height: 34px;
        line-height: 18px;
      }
    }
    font-size: 12px;
    color: #333333;
    .label {
      color: #999999;
      width: 72px;
      display: inline-block;
    }
  }
</style>
