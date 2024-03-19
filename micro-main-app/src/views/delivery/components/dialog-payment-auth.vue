<template>
    <ky-dialog title="申请付款授权" :visible.sync="dialogVisible" width="380px" append-to-body>
      <div class="page-style1">
        <el-form ref="form" :rules="formRules" :model="formData">
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="授权账号" prop="authorizationAccount">
                <el-input v-model="formData.authorizationAccount" clearable :maxlength="15" type="number" placeholder="请填写付款方编码或免绑手机号" @input="onAuthorizationAccountInput"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="申请人" prop="proposer">
                <el-input v-model="formData.proposer" placeholder="请填写申请人姓名" :maxlength="20" @input="onProposerInput"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="手机号码" prop="sjMobile">
                <el-input v-model="formData.sjMobile" placeholder="请填写手机号码" size="medium" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="公司名称" prop="company">
                <el-input v-model="formData.company" placeholder="请填写公司名称" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="客户编码" prop="customr">
                <el-input v-model="formData.customer" placeholder="请填写客户编码" readonly></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="备注" prop="jjRemark">
                <el-input v-model="formData.jjRemark" size="medium" clearable :maxlength="50" show-word-limit placeholder="请输入备注"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button :loading="loading" type="primary" @click="handleClickSave" :disabled="!formData.authorizationAccount || !formData.proposer">保存</el-button>
      </span>
    </ky-dialog>
</template>

<script>
import Regular from '@utils/regular'
import { getPhone, getCustomerCode, getCustomerName } from '@/utils/storage'
export default {
  props: {
    visible: { type: Boolean, require: true },
    authorizationAccount: String,
  },
  data() {
    return {
      dialogVisible: false,
      formRules: {
        authorizationAccount: [
          { required: true, message: '请填写付款方编码或免绑手机号', trigger: 'change' },
        ],
        proposer: [
          { required: true, message: '请输入姓名', trigger: 'change' },
          { min: 2, message: '姓名不能少于2个字', trigger: 'change' },
        ],
        sjMobile: [
          { required: false, len: 11, message: '请输入11位手机号', trigger: 'blur' },
          { pattern: Regular.mobileNumber, message: '请输入正确的手机号', trigger: 'blur' },
        ],
      },
      formData: {
        authorizationAccount: '',
        proposer: '',
        sjMobile: getPhone(),
        customer: getCustomerCode(),
        company: getCustomerName(),
        jjRemark: '',
      },
      loading: false,
    }
  },
  methods: {
    onAuthorizationAccountInput() {
      if (this.formData.authorizationAccount.length > 15)
        this.formData.authorizationAccount = this.formData.authorizationAccount.slice(0, 15)
    },
    onProposerInput() {
      let reg = /^[\u4E00-\u9FA5A-Za-z0-9-.·（）]*$/
      if (!reg.test(this.formData.proposer))
        this.formData.proposer = this.formData.proposer.slice(0, -1)
    },
    handleClickSave() {
      try {
        this.loading = true
        this.$emit('on-confirm', this.formData)
      } finally {
        this.loading = false
      }
    },
    resertFormData() {
      this.formData = {
        authorizationAccount: '',
        proposer: '',
        sjMobile: getPhone(),
        customer: getCustomerCode(),
        company: getCustomerName(),
        jjRemark: '',
      }
    },
  },
  watch: {
    visible(val) {
      if (val) {
        this.formData.authorizationAccount = this.authorizationAccount
        this.dialogVisible = true
      } else {
        this.dialogVisible = false
      }
    },
    dialogVisible(val) {
      if (!val) {
        this.$emit('update:visible', false)
      }
    },
  },
}
</script>

<style>
</style>