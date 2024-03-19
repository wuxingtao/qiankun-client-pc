<template>
  <div class="forget">
    <!-- 头部 -->
    <Header></Header>

    <!-- 内容 -->
    <div class="content">
      <div class="caption">找回密码</div>
      <!-- 表单 -->
      <el-form class="form" :model="form" ref="form" v-show="!submitSuccess">
        <!-- 手机号 -->
        <el-form-item prop="phone" class="phone">
          <el-input v-model="form.phone" onkeyup="value=value.replace(/[^\d]/g,'')" clearable maxlength="11" placeholder="输入手机号" @input="onPhoneChange"></el-input>
        </el-form-item>
        <!-- 图片动态码 -->
        <el-form-item prop="imgCode" class="imgCode" v-show="isValidPhone">
          <el-input v-model="form.imgCode" maxlength="4" placeholder="输入动态码" clearable></el-input>
          <div class="image" @click="refreshImgCode">
            <span v-show="!imgCodeURL">点击获取</span>
            <img v-show="imgCodeURL" :src="imgCodeURL"/>
          </div>
          <el-button type="text" @click="refreshImgCode">换一张</el-button>
        </el-form-item>
        <!-- 短信验证码 -->
        <el-form-item prop="smsCode" class="smsCode">
          <el-input type="text" maxlength="6" v-model="form.smsCode" placeholder="输入验证码" @input="numberLimit">
            <div slot="suffix">
              <div class="line"></div>
              <el-button type="text" class="smsText" :disabled="!isValidPhone || !isValidImgCode || isCountingDown" @click="sendSmsCode">{{smsText}}</el-button>
            </div>
          </el-input>
        </el-form-item>
        <el-button class="submit" type="primary" :loading="isLoading" @click="submit" :disabled="!(isValidPhone && isValidImgCode && isValidSmsCode)">确定找回</el-button>
      </el-form>
      
      <!-- 找回密码成功 -->
      <div class="success" v-show="submitSuccess">
        <p class="title"><i class="icon el-icon-success"></i>找回密码申请已提交成功</p>
        <p class="desc">我们会以短信方式将重置密码发送到您手机{{phoneSuffix}}上，请注意查收。</p>
      </div>

      <!-- 返回登录 -->
      <el-button class="backBtn" @click="backLogin">返回登录</el-button>
    </div>
  </div>
</template>

<script>
import Header from './components/header'
import UserService from '@/services/module/user'
import { removeLoginAccount } from '@/utils/storage'
import REGULAR from '@/utils/regular'
import {CAPTCHA_TYPE} from '@/utils/constants'

const SMS_CODE_TEXT = '获取验证码'
const DEFAULT_COUNTDOWN = 60

export default {
  components: {
    Header,
  },
  data() {
    return {
      isLoading: false,
      submitSuccess: false,
      smsText: SMS_CODE_TEXT,
      imgCodeURL: '',
      countdown: DEFAULT_COUNTDOWN,
      isCountingDown: false,
      form: {
        phone: '',
        imgCode: '',
        smsCode: ''
      }
    }
  },
  methods: {
    // 返回登录界面
    backLogin() {
      // this.$router.push('/login')
      location.href = window.location.origin + '/login'
    },
    // 验证码限制仅数字
    numberLimit() {
      this.form.smsCode = this.form.smsCode.replace(/[^\d]/g, '')
    },
    // 刷新图形码
    refreshImgCode() {
      if (!this.isValidPhone) return
      UserService.getImgCode({phone: this.form.phone}).then(res => {
        this.imgCodeURL = `data:image/png;base64,${res.data.img}`
      })
    },
    // 监听手机号输入
    onPhoneChange() {
      if (this.isValidPhone) {
        this.refreshImgCode()
      }
    },
    // 发送短信验证码
    sendSmsCode() {
      const params = {
        phone: this.form.phone,
        captchaType: CAPTCHA_TYPE.FORGET_PASSWORD,
        imgCaptcha: this.form.imgCode
      }
      this.isCountingDown = true
      // 发送请求
      UserService.sendSmsCode(params).then(() => {
        // 短信发送成功，开启倒计时
        this.$message.success('短信验证码已发送，请注意查收')
        this.startCountdown()
      }).catch(() => {
        this.refreshImgCode()
        this.isCountingDown = false
      })
    },
    // 短信倒计时
    startCountdown() {
      this.smsText = `${this.countdown}s`
      this.countdown--
      var interval = setInterval(() => {
        if (this.countdown >= 0) {
          this.smsText = `${this.countdown}s`
          this.countdown--
        } else {
          clearInterval(interval)
          this.countdown = DEFAULT_COUNTDOWN
          this.isCountingDown = false
          this.smsText = SMS_CODE_TEXT
        }
      }, 1000)
    },
    // 提交
    submit() {
      this.isLoading = true
      UserService.resetPassword(this.form).then(() => {
        this.submitSuccess = true
        // 清空之前记住的密码
        removeLoginAccount(this.form.phone)
      }).finally(() => {
        this.isLoading = false
      })
    }
  },
  computed: {
    // 手机尾号
    phoneSuffix() {
      let phone = this.form.phone
      return phone.length >= 4 ? phone.substr(phone.length - 4) : ''
    },
    // 是否有效手机号
    isValidPhone() {
      return REGULAR.mobileNumber.test(this.form.phone)
    },
    // 是否有效图形码
    isValidImgCode() {
      return REGULAR.identCode.test(this.form.imgCode)
    },
    // 是否有效验证码
    isValidSmsCode() {
      return REGULAR.msgCode.test(this.form.smsCode)
    }
  }
}
</script>

<style lang="scss" scoped>
.forget {
  .content {
    width: 400px;
    .caption{
      padding-bottom: 32px;
      font-size: 18px;
      font-weight: bold;
      color: #333333;
    }
    .form {
      .el-form-item {
        margin-bottom: 18px !important;
      } 
      .imgCode {
        /deep/ .el-form-item__content {
          display: flex;
          justify-content: space-between;

          .el-input {
            width: 200px;
          }

          .image {
            width: 120px;
            height: 40px;
            margin: 0 15px;
            background: #f8f7fe;
            border-radius: 20px;
            color: #999999;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;

            img {
              width: 80px;
              height: 30px;
            }
          }

          .el-button {
            width: auto;
            padding: 0;
          }
        } 
      }

      .smsCode {
        .line {
          position: absolute;
          top: 12px;
          width: 1px;
          height: 16px;
          opacity: 1;
          background: #e9e9e9;
        }

        .smsText {
          width: 120px !important;
        }
      }

      .submit {
        margin: 30px 0 15px;
      }
    }
    .success {
      height: 248px;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .title {
        display: flex;
        align-items: center;
        color: #333333;
        font-size: 16px;
        font-weight: bold;
        line-height: 50px;

        .icon {
          color: #52C41A;
          font-size: 24px;
          margin-right: 20px;
        }
      }

      .desc {
        padding-left: 45px;
        color: #666666;
        font-size: 14px;
        line-height: 22px;
      }
    }

    .backBtn {
      width: 100%;
      padding: 10px 20px;
      border-radius: 19px;
    }
  }
}
</style>
