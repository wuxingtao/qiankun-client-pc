<template>
  <div class='parse-address-info-conatiner clientdialog'>
    <el-dialog title='智能填写' :visible.sync='dialogVisible' :close-on-click-modal='false' width='499px'>
      <div class='dialog-body'>
        <el-form ref='form' :model='formData' :rules='formRules' label-position='top' label-width='88px'>
          <el-form-item prop='content'>
            <el-input type='textarea' :rows='10' v-model='formData.content' resize='none' clearable maxlength='1000'
                      show-word-limit placeholder='粘贴整段地址，自动识别姓名、电话和地址。例：王大锤，13666666666，广东省深圳市南山区某某街道某某大厦'></el-input>
          </el-form-item>
        </el-form>
      </div>
      <span slot='footer' class='dialog-footer'>
        <el-button @click='dialogVisible = false'>取 消</el-button>
        <el-button type='primary' @click='saveData' :loading='loading'>保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { parseAddress } from "@utils/clientUtil"

export default {
  name: "ParseAddressInfo",
  props: {
    callbackFunc: { type: Function }
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      formData: {
        content: ""
      },
      formRules: {
        content: [{ required: true, message: "请输入需要解析的信息", trigger: "blur" }]
      }
      
    }
  },
  methods: {
    showDialog() {
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form.resetFields())
    },
    saveData() {
      try {
        this.loading = true
        this.$refs.form.validate(async valid => {
          if (valid) {
            let result = await parseAddress(this.formData.content)
            this.callbackFunc(result)
            this.dialogVisible = false
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.parse-address-info-conatiner {
  .dialog-body {
    /deep/ {
      .el-form-item {
        margin-bottom: 0;
      }
      
      .el-textarea__inner {
        padding: 12px;
        font-size: 12px;
        background: #f7f7f7;
      }
      
      .el-input__count {
        background: transparent;
        line-height: 1;
        bottom: 12px;
        right: 12px;
      }
      
      textarea {
        @include scroll-bar;
      }
    }
  }
}
</style>
