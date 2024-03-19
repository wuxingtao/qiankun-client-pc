<template>
  <ky-dialog
    title="回单图片反馈"
    append-to-body
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="360px"
    class="receipt-feedback"
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
            :rows="3"
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
  </ky-dialog>
</template>

<script>
import API from '@api/waybill'
import { getPhone } from '@/utils/storage'
export default {
  name: 'ReceiptFeedback',
  data() {
    return {
      ydNo: '',
      loading: false,
      dialogVisible: false,
      types: [
        { name: '不清晰需重拍', value: '10' },
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
            const params = {
              /** 来源(字典：tms_receipt_picture_source)*/
              source: '10',
              /** 提交人手机号 */
              customerPhone: getPhone(),
              /** 运单号 */
              waybillNumber: this.ydNo,
              /** 补拍说明 */
              detail: this.formData.content,
              /** 错误类型 */
              errorType: this.formData.type.join('-')
            }
            console.log(params, '参数')
            const res = await API.receiptPictureFeedback(params)
            if (res.code == 0) {
              this.$message.success('反馈成功')
              this.queryReceiptPictureInfo(this.ydNo)
              this.dialogVisible = false
            }
          }
        })
      } finally {
        this.loading = false
      }
    },
    /** 查询经手单号 */
    async queryReceiptPictureInfo(waybillNumber) {
      const { data } = await API.getReceiptListPicInfo(waybillNumber)
      const row = data && data.rows[0]
      this.$store.dispatch('material/SET_FEEDBACK_STATUS', row)
    },
  }
}
</script>
<style lang="scss" scoped>
@import './style.scss';
</style>
