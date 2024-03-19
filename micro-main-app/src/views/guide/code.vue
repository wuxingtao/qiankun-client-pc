<template>
  <div class='code'>
    <p class='title'>绑定客户编码后，享受跨越速运寄件服务。</p>
    <p class='desc'>若您没有客户编码，请联系您的商务，或拨打95324咨询。</p>
    <el-form ref='form' :model='form' class='form' :rules='rules'>
      <el-form-item label='客户编码' prop='code'>
        <el-input v-model='form.code' @input='handleCodeInput' placeholder='请输⼊客户编码' autocomplete='off'></el-input>
      </el-form-item>
      <el-form-item label='密码' prop='password'>
        <el-input type='password' v-model='form.password'
                  placeholder='请输⼊密码' autocomplete='off' :maxlength='32'></el-input>
      </el-form-item>
      <el-form-item class='btn'>
        <el-button @click="$router.push('/guide/verify')" :loading='isLoading'>跳过</el-button>
        <el-button type='primary' @click='submit' :loading='isLoading' :disabled='!isValidForm'>下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import REGULAR from '@/utils/regular'
import UserService from '@/services/module/user'
import { setCustomerData } from '@utils/storage'

export default {
  data() {
    return {
      isLoading: false,
      form: {
        code: '',
        password: ''
      },
      rules: {
        code: [
          { required: true, message: '请输入客户编码', trigger: 'blur' }
          // { pattern: REGULAR.positiveOrZero, message: '请输入正确的客户编码', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入客户密码', trigger: 'blur' },
          { pattern: /^[^\u4e00-\u9fa5]{1,32}$/, message: '请输入正确的客户密码' }
        ]
      }
    }
  },
  methods: {
    handleCodeInput() {
      this.form.code = this.form.code.replace(/[^\d]/g, '')
    },
    submit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.isLoading = true
          UserService.bindCustomerCode(this.form.code, this.form.password).then(async () => {
            const res = await UserService.queryCustomerInfo(this.form.code)
            if (res.code === 0) {
              setCustomerData(res.data)
            }
            this.next()
          }).catch(() => {
            this.isLoading = false
          })
        }
      })
    },
    next() {
      this.$store.dispatch('updateUserInfo', () => {
        setTimeout(() => {
          this.isLoading = false
          this.$router.push('/guide/verify')
        }, 1000)
      })
    }
  },
  computed: {
    isValidForm() {
      return REGULAR.positiveOrZero.test(this.form.code) && /^[^\u4e00-\u9fa5]{1,32}$/.test(this.form.password)
    }
  }
}
</script>

<style lang='scss' scoped>
.code {
  .title {
    font-size: 24px;
    color: #333333;
    font-weight: bold;
  }
  
  .desc {
    margin-top: 12px;
    font-size: 14px;
    color: #666666;
  }
  
  .form {
    margin-top: 50px;
    
    .btn {
      text-align: center;
      margin-top: 80px;
    }
    
    /deep/ .el-input__inner {
      border: none;
      border-bottom: 1px solid #e9e9e9;
      padding: 0;
    }
    
    
    .el-button {
      width: 200px;
      height: 36px;
      border-radius: 20px;
      font-size: 12px;
    }
  }
}
</style>
