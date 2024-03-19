<template>
  <ky-dialog
      width="500px"
      class="dialog-2021 dialogForm"
      custom-class="freight-dialog"
      title="申请查看"
      :visible.sync="dialogVisible"
      append-to-body
      :close-on-click-modal="false"
      :before-close="closeDialog"
  >
    <el-form class="kye-form--normal" :model="formData" :rules="formRules" ref="formRef" v-loading="loading">
      <el-form-item prop="reason">
        <el-input
            type="textarea"
            placeholder="请输入申请原因，便于商务为您快速开通。"
            resize="none"
            :maxlength="150"
            :autosize="{ minRows: 5, maxRows: 8}"
            show-word-limit
            clearable
            v-model="formData.reason"
        ></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取 消</el-button>
      <el-button type="primary" v-btnThrottle @click="formSubmit">确定</el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { defineComponent, reactive, toRefs, ref } from '@vue/composition-api'
import deliveryApi from '@/services/api/delivery'
import REGULAR from '@utils/regular'

export default defineComponent({
  name: 'freight-dialog',
  props: {},
  setup (props, { emit, root }) {
    const state = reactive({
      dialogVisible: false,
      loading: false,
      formData: {
        reason: '',
      },
      formRules: {
        reason: [
          { required: false, message: '申请原因不能为空', trigger: 'blur' },
          { pattern: REGULAR.chineseText, message: '请填写正确的原因', trigger: 'blur' }
        ],
      },
    })
    const formRef = ref(null)

    function showDialog () {
      state.dialogVisible = true
    }

    function closeDialog () {
      state.dialogVisible = false
      formRef.value.resetFields()
    }

    function formSubmit () {
      formRef.value.validate(valid => {
        if (valid) {
          handleApplyAuth()
        }
      })
    }

    async function handleApplyAuth () {
      state.loading = true
      try {
        let res = await deliveryApi.freightApplyAdd(state.formData.reason)
        if (res.code === 0) {
          root.$message.success('提交成功，已为您通知商务处理')
          emit('handleCheckFreight')
          closeDialog()
        }
      } finally {
        state.loading = false
      }
    }

    return { ...toRefs(state), formRef, showDialog, closeDialog, formSubmit }
  },
})
</script>

<style lang="scss" scoped>
/deep/ {
  .freight-dialog {
    min-width: 500px;
  }

  .el-form-item {
    &:last-child {
      margin-bottom: 0;
    }
  }

  .el-textarea__inner {
    padding: 12px;
    background: #f7f7f7;
    border: none;
    color: $--color-text-primary;
  }

  .el-input__count {
    background: transparent;
    line-height: 1;
    bottom: 10px;
    right: 16px;
  }
}

</style>
