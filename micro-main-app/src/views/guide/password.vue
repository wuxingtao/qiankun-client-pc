<template>
  <div class='password'>
    <p class='title'>请设置登录密码，以保障您的账号安全</p>
    <el-form ref='form' :model='form' class='form' :rules='rules'>
      <el-form-item label='密码' prop='password'>
        <el-input v-model='form.password' type='password' placeholder='密码由8-32位数字及字⺟组成' autocomplete='off'
                  :require='true'></el-input>
      </el-form-item>
      <el-form-item label='确认密码' prop='confirmPassword'>
        <el-input type='password' v-model='form.confirmPassword' placeholder='请再输⼊一次新密码' autocomplete='off'></el-input>
      </el-form-item>
      <el-form-item class='btn'>
        <el-button @click='next' :loading='isLoading'>跳过</el-button>
        <el-button type='primary' @click='submit' :loading='isLoading' :disabled='!isValidForm'>下一步</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
var md5 = require('md5')
import REGULAR from '@/utils/regular'
import UserService from '@/services/module/user'

export default {
  data() {
    var validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (!REGULAR.setPassword.test(this.form.password)) {
        callback(new Error('请输入8-32位密码'))
      } else {
        callback()
      }
    }
    var validateConfirm = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.form.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      isLoading: false,
      form: {
        password: '',
        confirmPassword: ''
      },
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: validatePassword, trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirm, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.isLoading = true
          UserService.modifyPwdByFirstLogin(md5(this.form.password).toLocaleUpperCase()).then(() => {
            this.next()
          }).finally(() => {
            this.isLoading = false
          })
        }
      })
    },
    next() {
      this.$router.push('/guide/code')
    }
  },
  computed: {
    isValidForm() {
      return REGULAR.setPassword.test(this.form.password) && this.form.password === this.form.confirmPassword
    }
  }
}
</script>

<style lang='scss' scoped>
.password {
  .title {
    font-size: 24px;
    color: #333333;
    font-weight: bold;
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