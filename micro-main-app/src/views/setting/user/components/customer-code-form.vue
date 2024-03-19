<template>
  <el-form
    class="customer-code-form__container"
    :model="formData"
    :rules="rules"
    ref="customerCodeFormRef"
  >
    <el-form-item label="客户编码" prop="customerCode">
      <el-input
        type="text"
        size="medium"
        autocomplete="new-password"
        v-model="formData.customerCode"
        v-kyerestrict.positive
        placeholder="请输入客户编码"
        :maxlength="20"
      ></el-input>
    </el-form-item>
    <el-form-item class="password" label="编码密码" prop="password">
      <el-input
        v-model="formData.password"
        :type="showPassword?'text':'password'"
        autocomplete="new-password"
        placeholder="请输入编码密码"
        size="medium"
        :maxlength="15"
      >
        <template slot="append">
          <i
            :class="['iconfont', showPassword ? 'iconeye-open' : 'iconeye-close']"
            @click="showPassword = !showPassword"
          />
        </template>
      </el-input>
    </el-form-item>
  </el-form>
</template>

<script>
import { reactive, ref, toRefs } from '@vue/composition-api'
import useCustomerCode from '../hooks/useCustomerCode'

export default {
  setup(props, { root }) {
    const customerCodeFormRef = ref(null)
    const state = reactive({
      showPassword: false,
      formData: {
        customerCode: '',
        password: ''
      }
    })
    const rules = {
      customerCode: [
        { required: true, message: '请输入客户编码', trigger: 'change' }
        // { pattern: REGULAR.positiveOrZero, message: '请输入正确的客户编码', trigger: 'change' }
      ],
      password: [
        { required: true, message: '请输入客户编码密码', trigger: 'change' },
        { pattern: /^[^\u4e00-\u9fa5]{1,32}$/, message: '请输入正确的客户密码', trigger: 'change' }
      ]
    }
    const { bindCustomerCode } = useCustomerCode(root) 

    const handleBindCustomerCode = async () => {
      await customerCodeFormRef.value.validate()
      return bindCustomerCode({
        customerCode: state.formData.customerCode,
        password: state.formData.password
      })
    }
    return {
      customerCodeFormRef,
      ...toRefs(state),
      rules,
      handleBindCustomerCode
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-code-form__container {
  /deep/ input{
    background:transparent;
  }
  .password {
    margin-top: 28px;
    /deep/ .el-input-group__append {
      position: absolute;
      right: 16px;
      bottom: 6px;
      i {
        color: $--color-primary;
        font-size: 16px;
        cursor: pointer;
      }
    }
  }
}
</style>