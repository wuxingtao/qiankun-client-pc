<!-- 弃用 -->
<template>
  <ky-dialog
    width="500px"
    class="dialog-form page-style1 dialog-2021"
    :title="title"
    :visible.sync="dialogVisible"
    :before-close="closeDialog"
    custom-class="dialog-payment-add"
    append-to-body
    :close-on-click-modal="false"
  >
    <el-form
      class="kye-form--normal mt_12"
      ref="formRef"
      :model="formData"
      :rules="formRule"
      label-position="left"
      label-width="100px"
      inline
    >
      <el-row :gutter="30">
        <el-col :span="12">
          <el-form-item label="手机号码" prop="userMobile">
            <el-input
              placeholder="请填写绑定相同客户编码的手机号"
              v-model="formData.userMobile"
              maxlength="11"
              clearable
              @change="handlePhoneChange"
              :disabled="isEdit"
              v-kyerestrict.positive
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="姓名" prop="userName">
            <el-input
              placeholder="请填写姓名"
              v-model.trim="formData.userName"
              maxlength="20"
              clearable
              :disabled="userNameDisabled || isEdit"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="30">
        <el-col :span="24">
          <el-form-item label="备注" prop="remarks" class="form-item-remark">
            <el-input
              type="text"
              placeholder="选填"
              maxlength="40"
              show-word-limit
              v-model="formData.remarks"
            >
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button
        type="primary"
        v-btnThrottle
        @click="handleSubmit('formName')"
        :disabled="submitDisabled"
        >确定
      </el-button>
    </div>
  </ky-dialog>
</template>

<script>
import { defineComponent, reactive, toRefs, ref, computed, nextTick } from '@vue/composition-api'
import REGULAR from '@utils/regular'
import paymentApi from '@api/payment'
import { cloneDeep } from 'lodash'

const formRule = {
  userMobile: [
    { required: true, message: '请填写11位手机号' },
    { pattern: REGULAR.mobileNumber, message: '请填写正确的手机号', trigger: 'blur' }
  ],
  userName: [
    { required: true, message: '请填写接收人' },
    { pattern: REGULAR.chineseOnly, message: '请填写正确的接收人', trigger: 'blur' }
  ],
  remarks: [
    { required: false },
    { pattern: REGULAR.chineseText, message: '请填写正确的备注', trigger: 'blur' }
  ]
}

export default defineComponent({
  name: 'dialog-payment-add',
  props: {},
  setup(props, { root, emit }) {
    const initialData = {
      title: '新增副授权号',
      dialogVisible: false,
      isEdit: false, // 是否编辑状态
      formData: {
        userName: '',
        userMobile: '',
        remarks: ''
      },
      userNameDisabled: false, // 用户名禁止编辑
      formRule: formRule
    }
    const state = reactive(cloneDeep(initialData))

    const formRef = ref(null)

    const submitDisabled = computed(() => {
      return !(state.formData.userMobile && state.formData.userName)
    })

    function handleCancel() {
      closeDialog()
    }

    function handleSubmit() {
      formRef.value.validate(async valid => {
        if (valid) {
          let params = { ...state.formData }
          const submitFn = state.isEdit
            ? paymentApi.uam_payment_changeViceAuth
            : paymentApi.uam_payment_addViceAuth
          let res = await submitFn(params)
          if (res.code === 0) {
            root.$message.success(`${state.isEdit ? '编辑' : '新增'}副授权号成功`)
            emit('tableRefresh')
            closeDialog()
          }
        }
      })
    }

    function closeDialog() {
      Object.assign(state, initialData)
      formRef.value?.resetFields()
      state.dialogVisible = false
    }

    async function handlePhoneChange(val) {
      if (val && val.length === 11 && REGULAR.mobileNumber.test(val)) {
        state.userNameDisabled = false
        state.formData.userName = ''
        let res = await paymentApi.uam_payment_getAuthInfo({ phone: val, hideErrMsg: true })
        if (res.code === 0 && res.data?.userName) {
          state.formData.userName = res.data.userName
          state.userNameDisabled = true
        } else {
          state.formData.userName = ''
          state.userNameDisabled = false
        }
      } else {
        state.userNameDisabled = false
      }
    }

    function openDialog(row) {
      formRef.value?.resetFields()
      state.dialogVisible = true
      nextTick(() => {
        // 编辑处理
        if (row && row.id) {
          state.isEdit = true
          const { userName, userMobile, remarks } = row
          Object.assign(state.formData, { userName, userMobile, remarks })
          state.title = '编辑副授权号'

          if (userName) {
            state.userNameDisabled = true
          }
        }
      })
    }

    return {
      ...toRefs(state),
      formRef,
      submitDisabled,
      closeDialog,
      handleCancel,
      handleSubmit,
      handlePhoneChange,
      openDialog
    }
  }
})
</script>

<style lang="scss" scoped>
.kye-form--normal {
  /deep/ {
    .el-form-item {
      width: 100%;
    }

    .form-item-remark {
      .el-form-item__label {
        line-height: initial !important;
      }
    }

    .el-form-item__content {
      width: 100%;
    }
  }
}
</style>
