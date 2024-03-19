<template>
  <div v-loading.lock="loading">
    <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
      <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>权限交接
    </div>
    <div class="add-cooperation page-style1">
        <el-form :rules="formRules" :model="formData">
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="姓名" prop="userName">
                <el-input v-model="formData.userName" placeholder="接收人姓名" :maxlength="20" clearable @input="onNameInput"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="手机号码" prop="userPhone">
                <el-input v-model="formData.userPhone" placeholder="接收人手机号码" :maxlength="11" clearable @input="onPhoneInput" type="number"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="24">
              <el-form-item label="验证码" prop="verificationCode">
                <el-input v-model="formData.verificationCode" size="medium" :maxlength="6" placeholder="短信验证码" type="number" @input="onVerificationCodeInput" >
                  <div slot="suffix">
                    <el-button type="text" class="smsText" @click="getCode">{{ smsText }}</el-button>
                  </div>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
        <div class="tip" v-if="isViewTip">验证码将发送至您的手机{{ sendToPhone() }}，请输入验证码，确认是您本人操作。</div>
        <span class="footer">
          <el-button round @click="handleCancel">取消</el-button>
          <el-button type="primary" round @click="handleClickSave" :disabled="!formData.verificationCode || !formData.userName || !formData.userPhone">提交</el-button>
        </span>
      </div>
  </div>
</template>

<script>
import Regular from '@utils/regular'
import { sendTeamMessage, replaceMainAuthPhone } from '@/services/api/pyAuth'
import { getPhone } from '@/utils/storage'
export default {
  name: 'jurisdictionConnect',
  data() {
    return {
      formRules: {
        userName: [
          { required: true, message: '请输入姓名', trigger: 'change' },
          { min: 2, message: '姓名不能少于2个字', trigger: 'change' }
        ],
        userPhone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: Regular.mobileNumber, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        verificationCode: [
          { required: true, message: '请输入验证码', trigger: 'change' }
        ]
      },
      formData: {
        userName: '',
        userPhone: '',
        verificationCode: ''
      },
      loading: false,
      smsText: '获取验证码',
      countdown: 60,
      isViewTip: false
    }
  },
  methods: {
    sendToPhone() {
      let phone = getPhone()
      return String(phone).replace(/^(\d{3})(\d{4})(\d{4})$/, '$1' + '****' + '$3')
    },
    handleCancel() {
      this.$router.push({name: 'user'})
    },
    handleClickSave() {
      this.$confirm('当前进行主授权人转让权限操作，请确认是否转让他人？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(async () => {
        const result = await replaceMainAuthPhone({
          newMainAuthPhone: this.formData.userPhone,
          newMainName: this.formData.userName,
          messageCode: this.formData.verificationCode
        })
        if (result && result.code === 0) {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.formData = { 
            userName: '',
            userPhone: '',
            verificationCode: ''
          }
          this.handleCancel()
        }
        if (result && result.code === 33015 || result && result.code === 33016) {
          this.formData.verificationCode = ''
        }
        if (result && result.code === -1) {
          this.formData.verificationCode = ''
          this.formData.userPhone = ''
        }
      })
    },
    onNameInput() {
      let reg = /^[\u4E00-\u9FA5A-Za-z0-9-.·（）]*$/
      if (!reg.test(this.formData.userName)) this.formData.userName = this.formData.userName.slice(0, -1)
    },
    onPhoneInput() {
      if (this.formData.userPhone.length > 11) this.formData.userPhone = this.formData.userPhone.slice(0, 11)
    },
    onVerificationCodeInput() {
      if (this.formData.verificationCode.length > 6) this.formData.verificationCode = this.formData.verificationCode.slice(0, 6)
    },
    async getCode() {
      try {
        this.loading = true
        await sendTeamMessage()
        this.isViewTip = true
        this.smsText = `${this.countdown}s`
        let timeCountDown = setInterval(() => {
          if (this.countdown > 0) {
            this.countdown--
            this.smsText = `${this.countdown}s`
          } else {
            clearInterval(timeCountDown)
            this.smsText = '获取验证码'
            this.countdown = 60
            this.isViewTip = false
          }
        }, 1000)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .add-cooperation {
    margin-left: 20px;
    width: 530px;

    .tip {
      margin-bottom: 26px;
      font-size: 14px;
      color: #666666;
    }
  }

  .smsText {
    border: none;
    color: #8365f6;
  }
</style>

<style lang="scss">
  .el-message-box .el-message-box__btns {
    .el-button {
      width: 72px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      padding: 0;
      border-radius: 4px;
      border: 1px solid #dfdfdf;
      box-sizing: border-box;
    }

    .el-button--primary {
      background: #8365f6;
      border: 1px solid #8365f6;
    }
  }
</style>