<template>
  <div class="login">
    <!-- 头部标题以及窗口按钮 -->
    <Header v-if="isClientMode"></Header>
        <div class="content">
      <div class="tab">
        <el-tabs v-model="activeTab">
          <!-- 密码登录 -->
          <el-tab-pane label="密码登录" name="password">
            <el-form class="form" :model="passwordForm" :rules="rules" ref="passwordForm">
              <!-- 手机号 -->
              <el-form-item prop="phone" class="phone">
                <el-autocomplete v-model="passwordForm.phone" onkeyup="value=value.replace(/[^\d]/g,'')" :maxlength="11" style="width:100%" clearable :fetch-suggestions="queryAccountList" placeholder="输入手机号" @select="useAccount" @clear="handlePhoneClear">
                  <template slot-scope="{ item }">
                    <div class="name">{{ item.phone }}</div>
                  </template>
                </el-autocomplete>
              </el-form-item>
              <!-- 密码 -->
              <el-form-item prop="password">
                <el-input :type="showPassword ? 'text' : 'password'" maxlength="32" autocomplete="new-password" onkeyup="value=value.replace(/[\u4e00-\u9fa5]/g,'')" v-model="passwordForm.password" placeholder="输入密码" @keyup.enter.native="submitForm('passwordForm')"  >
                  <i :class="`iconfont icon-eye${showPassword ? '' : '-close'}`" slot="suffix" @click="showPassword=!showPassword"></i>
                </el-input>
              </el-form-item>
              <!-- 记住/忘记密码 -->
              <div class="options">
                <el-checkbox v-model="isChecked">记住密码</el-checkbox>
                <router-link to="/login/forget" class="forget">忘记密码？</router-link>
              </div>
              <!-- 提交 -->
              <el-button class="submit" type="primary" :loading="isLoading" @click="submitForm('passwordForm')">登录</el-button>
            </el-form>
          </el-tab-pane>

          <!-- 短信登录/注册 -->
          <el-tab-pane label="短信登录/注册" name="sms">
            <el-form class="form" :model="smsForm" :rules="smsRules" ref="smsForm">
              <!-- 手机号 -->
              <el-form-item prop="phone" class="phone">
                <el-input type="text" clearable maxlength="11" onkeyup="value=value.replace(/[^\d]/g,'')" v-model="smsForm.phone" placeholder="输入手机号" @input="onSmsPhoneChange"></el-input>
              </el-form-item>
              <!-- 图片动态码 -->
              <el-form-item prop="imgCode" class="imgCode" v-show="showImgCode">
                <el-input v-model="smsForm.imgCode" maxlength="4" placeholder="输入动态码" clearable></el-input>
                <div class="image" @click="refreshImgCode">
                  <span v-show="!imgCodeURL">点击获取</span>
                  <img v-show="imgCodeURL" :src="imgCodeURL" />
                </div>
                <el-button type="text" @click="refreshImgCode">换一张</el-button>
              </el-form-item>
              <!-- 验证码 -->
              <el-form-item prop="smsCode">
                <el-input type="text" maxlength="6" v-model="smsForm.smsCode" placeholder="输入验证码" @input="numberLimit">
                  <div slot="suffix">
                    <div class="line"></div>
                    <el-button type="text" class="smsText" @click="sendSmsCode">{{smsText}}</el-button>
                  </div>
                </el-input>
              </el-form-item>
              <!-- 提交 -->
              <el-button class="submit" type="primary" :loading="isLoading" @click="submitForm('smsForm')">登录</el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
        <img src="@/assets/image/login/qrcode.svg" @click="scanQrcode" />
      </div>
      <!-- 用户协议 -->
      <Agreement></Agreement>
    </div>
  </div>
</template>

<script>
var md5 = require('md5')

import Header from './components/header'
import Agreement from './components/agreement'
import REGULAR from '@/utils/regular'
import { CAPTCHA_TYPE } from '@/utils/constants'
import { initStore } from '@/utils/commonUtil'
import UserService from '@/services/module/user'
import { UpdateVersion } from '@/services/api/common'
import { getLoginAccount, saveLoginAccount, removeLoginAccount, setLoginData, setUserData,setCustomerData, getUserPreference, setUserPreference } from '@/utils/storage'

const SMS_CODE_TEXT = '立即获取'
const DEFAULT_COUNTDOWN = 60
const REMEMBER_KEY = 'isRememberPassword'


export default {
  components: {
    Header,
    Agreement,
  },
  created () {
    this.init()
  },
  data () {
    var validatePhoneRegister = (rule, value, callback) => {
      if (!this.isValidPhone || this.isLoading) return
      // 判断该手机是否未注册
      UserService.checkRegisterByPhone({ phone: this.passwordForm.phone }).then(() => {
        this.isNew = false
        callback()
      }).catch(() => {
        this.isNew = true
        callback(new Error('该手机号还未注册'))
      })
    }
    return {
      activeTab: 'password',
      isLoading: false,

      // 密码登录
      passwordForm: {
        phone: '',
        password: '',
      },
      isNew: true,
      isChecked: false,
      showPassword: false,

      // 短信登录
      smsForm: {
        phone: '',
        imgCode: '',
        smsCode: ''
      },
      smsText: SMS_CODE_TEXT,
      showImgCode: false,
      imgCodeURL: '',
      countdown: DEFAULT_COUNTDOWN,
      isCountingDown: false,

      // 验证规则
      rules: {
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: REGULAR.mobileNumber, message: '请输入正确的手机号', trigger: 'change' },
          { validator: validatePhoneRegister, trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { pattern: REGULAR.password, message: '请输入5-32位密码', trigger: 'blur' }
        ]
      },

      smsRules: {
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: REGULAR.mobileNumber, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        smsCode:[
          { required: true, message: '请输入验证码', trigger: 'blur' },
        ]
      }
    }
  },
  computed: {
    isValidPhone () {
      return REGULAR.mobileNumber.test(this.passwordForm.phone)
    },
    isValidPasswordForm () {
      return this.isValidPhone && REGULAR.password.test(this.passwordForm.password)
    },
    isValidSmsPhone () {
      return REGULAR.mobileNumber.test(this.smsForm.phone)
    },
    isValidImgCode () {
      return REGULAR.identCode.test(this.smsForm.imgCode)
    },
    isValidSmsCode () {
      return REGULAR.msgCode.test(this.smsForm.smsCode)
    }
  },
  methods: {
    async init () {
      this.isChecked =await getUserPreference(REMEMBER_KEY)
      const historyAccounts = await getLoginAccount() || []
      // 记住密码被勾选，则填充账号、密码
      if (this.isChecked && historyAccounts.length > 0) {
        this.passwordForm = { ...historyAccounts[0] }
      }
      if (this.$route.query.sms) {
        this.activeTab = 'sms'
      }
    },
    handlePhoneClear(){
      document.activeElement.blur()
    },
    async queryAccountList (queryString, cb) {
      const historyAccounts = await getLoginAccount() || []
      const results = historyAccounts.filter(f => f.phone.includes(queryString))
      cb(results)
    },
    useAccount (item) {
      this.passwordForm = { ...item }
    },
    // 扫码登录
    scanQrcode () {
      this.$router.push('/login/qrcode')
    },
    // 短信登录 - 验证码限制仅数字
    numberLimit () {
      this.smsForm.smsCode = this.smsForm.smsCode.replace(/[^\d]/g, '')
    },
    // 短信登录 - 监听手机号输入
    onSmsPhoneChange () {
      this.showImgCode = false
      if (this.isValidSmsPhone) {
        // 判断该手机是否新注册，新注册需要先获取图形验证码
        UserService.checkRegisterByPhone({ phone: this.smsForm.phone }).catch(() => {
          this.showImgCode = true
          this.refreshImgCode()
        })
      }
    },
    // 短信登录 - 获取图形验证码
    refreshImgCode () {
      if (!this.isValidSmsPhone) return
      UserService.getImgCode({ phone: this.smsForm.phone }).then(res => {
        this.imgCodeURL = `data:image/png;base64,${res.data.img}`
      })
    },
    // 短信登录 - 发送短信验证码
    sendSmsCode () {
      this.$refs.smsForm.validateField(['phone'], msg => {
        if (!msg) {
          const params = {
            phone: this.smsForm.phone,
            // 新注册用户才需要输入图形验证码
            captchaType: this.showImgCode ? CAPTCHA_TYPE.REGISTER : CAPTCHA_TYPE.LOGIN,
            imgCaptcha: this.smsForm.imgCode
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
        }
      })
    },
    // 短信登录 - 倒计时
    startCountdown () {
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
          this.smsText = '重新获取'
        }
      }, 1000)
    },
    // 提交表单
    submitForm (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.login(formName)
        }
      })
    },
    // 登录
    async login (formName) {
      if (this.isLoading) return

      let params = { ...this[formName] }
      if (formName === 'passwordForm') {
        // 密码MD5处理
        params.password = md5(this.passwordForm.password).toLocaleUpperCase()
      }
      this.isLoading = true
      // 发送请求
      UserService.login(params).then(async res => {
        sessionStorage.clear()

        // 存储登录信息
        setLoginData(res.data)
        // 初始化用户数据
        let userRes = await UserService.getUserInfo()
        setUserData(userRes.data)
        const res2 = await UserService.queryCustomerInfo(res.data.customerCode)
        if(res2.code === 0){
          setCustomerData(res2.data)
        }

        // 初始化store
        initStore()

        // 记住密码
        if (formName === 'passwordForm') {
          setUserPreference(REMEMBER_KEY, this.isChecked)
          this.isChecked ? saveLoginAccount(this[formName].phone, this[formName].password) : removeLoginAccount(this[formName].phone)
        }

        this.smsText = SMS_CODE_TEXT

        // 新用户进入引导页
        if (res.data.userStatus !== 0) {
          this.$router.push('/guide')
        } else {
          this.$router.push('/admin')
        }

        //更新版本号
        if (this.isClientMode) {
          this.updateVersion()
        }
      }).finally(() => {
        this.isLoading = false
      })
    },
    async updateVersion () {
      const version = await this.$native.getVersion()
      UpdateVersion(version)
    }
  }
}
</script>

<style lang="scss" scoped>
  .login {
      
    .content {
      height: 400px;
     
    }
    .tab {
      width: 400px;
      position: relative;

      > img {
        position: absolute;
        top: 0;
        right: 0;
        width: 48px;
        height: 48px;
        cursor: pointer;
      }

      /deep/ .el-tabs__header {
        margin: 10px 0;
      }

      /deep/ .el-tabs__nav-wrap::after {
        height: 1px;
        background-color: #f1f1f5;
      }

      /deep/ .el-tabs__item {
        line-height: 30px;
        font-size: 16px;
        padding: 0 40px 0 0;
        color: #333333;
      }

      /deep/ .el-tabs__item.is-active {
        font-weight: bold;
      }

      /deep/ .el-tabs__active-bar {
        height: 4px;
        border-radius: 4px;
      }

      .form {
        .phone {
          margin-top: 38px;
        }

        .options {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          line-height: 20px;

          /deep/ .el-checkbox__label {
            font-size: 12px;
            color: #666666;
          }

          .forget {
            color: #666666;
          }
        }

        .iconfont {
          font-size: 26px;
          margin-right: 20px;
          cursor: pointer;
        }

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

        .submit {
          margin: 48px 0 5px 0;
        }
      }
    }
  }

  .login-account-dropdown {
    width: 355px;
  }
</style>

