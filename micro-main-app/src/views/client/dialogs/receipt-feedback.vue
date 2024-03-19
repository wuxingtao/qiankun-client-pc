<template>
  <el-dialog
    title="回单图片反馈"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="360px" class="receipt-feedback"
  >
    <div class="dialog-body">
      <el-form
        ref="form"
        :model="formData"
        :rules="formRules"
        label-position="top"
        label-width="88px"
      >
        <el-form-item label="反馈原因" prop="type">
          <el-select
            v-model="formData.type"
            multiple
            class="feedback-select"
            collapse-tags
            placeholder="请选择"
            @change="handleTypeChange"
          >
            <el-option
              v-for="item in types"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述" prop="content">
          <el-input
            type="textarea"
            :rows="4"
            v-model="formData.content"
            resize="none"
            clearable
            placeholder="请描述您遇到的问题，以便于我们提供更好的帮助"
            maxlength="200"
            show-word-limit
          ></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveData" :loading="loading">保 存</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { feedbackOfReceipt } from '@/services/api/waybillOld'

export default {
  name: 'ReceiptFeedback',
  data() {
    return {
      loading: false,
      ydNo: '',
      dialogVisible: false,
      types: [
        { name: '不清晰', value: '10' },
        { name: '无签字盖章', value: '20' },
        { name: '缺页少页', value: '30' },
        { name: '回单非寄方客户', value: '40' },
        { name: '其他问题', value: '50' }
      ],
      formData: {
        type: [],
        content: ''
      },
      formRules: {
        type: [{ required: true, message: '请选择反馈原因', trigger: 'blur' }],
        content: [{ required: false, message: '请输入问题描述', trigger: 'blur' }]
      }
    }
  },
  watch: {
    'formData.type'() {
      this.formRules.content[0].required = this.formData.type.indexOf('50') > -1
    }
  },
  methods: {
    showDialog(ydNo) {
      this.ydNo = ydNo
      this.dialogVisible = true
      this.$nextTick(() => this.$refs.form.resetFields())
    },
    handleTypeChange() {
      this.$nextTick(() => {
        if (this.formData.type !== '其它') {
          this.$refs.form.validateField(['content'])
        }
      })
    },
    saveData() {
      try {
        this.loading = true
        this.$refs.form.validate(async valid => {
          if (valid) {
            let res = await feedbackOfReceipt(
              this.ydNo,
              this.formData.content,
              this.formData.type.join('-')
            )
            if (res.code == 0) {
              this.$message.success('反馈成功')
              this.dialogVisible = false
            }
            // else{
            //     this.$message.error(res.errorInfo||res.msg)
            // }
          }
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.receipt-feedback {
  /deep/ {
    .el-select {
      width: 100%;
    }
  }
  // .dialog-body {
  //   border: solid 1px;
  // }
  .el-dialog__body {
    padding: 0 !important;
    margin: 0;
  }
  .el-form--label-top .el-form-item__label {
    padding: 0 !important;
  }
  .el-button {
    border-radius: 4px !important;
  }
  .el-form-item {
    margin-bottom: 10px;
  }
  .el-dialog__footer {
    border-top: solid 1px;
    padding: 10px 0;
  }
  .feedback-select {
    /deep/ .el-input__inner {
      border:none;
      border-radius: 0;
      border-bottom: solid 1px #e9e9e9;
    }
  }
}
</style>
