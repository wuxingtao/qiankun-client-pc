<template>
  <div class="qrcode">
    <!-- 头部标题以及窗口按钮 -->
    <Header></Header>

    <!-- 扫码 -->
    <div class="content">
      <div class="nav">
        <span>手机扫码 安全登录</span>
        <img src="@/assets/image/login/pc.svg" @click="back"/>
      </div>
      <div class="image">
        <div ref="qrcode" id="qrcode"></div>
        <div class="cover" v-show="isStatusShow" @click="onCoverClick">
          <img v-if="isSuccess" src="@/assets/image/login/qrcode_success.png"/>
          <img v-else src="@/assets/image/login/qrcode_error.png"/>
          <p class="status">{{status}}</p>
          <p class="desc">{{desc}}</p>
        </div>
      </div>
      <div class="tips">
        <span>打开 跨越速运App 扫一扫</span>
        <el-button type="text" icon="el-icon-refresh-right" @click="refreshQrcode">刷新</el-button>
      </div>
      <!-- 用户协议 -->
      <Agreement></Agreement>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import Header from './components/header'
import Agreement from './components/agreement'
import UserService from '@/services/module/user'
import { setLoginData, setUserData,setCustomerData} from '@/utils/storage'
import { initStore } from '@/utils/commonUtil'
import {UpdateVersion} from '@/services/api/common'

export default {
  components: {
    Header,
    Agreement
  },
  data() {
    return {
      timer: null,
      isChecking: false,
      lgToken: '',
      isStatusShow: false,
      isSuccess: false,
      status: '',
      desc: ''
    }
  },
  mounted() {
    this.refreshQrcode()
    this.timer = setInterval(this.checkLogin, 2000)
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    // 生成二维码图片
    createQrcode(text) {
      new QRCode(this.$refs.qrcode, {
        width: 200,
        height: 200,
        text: text,
        colorDark: '#333',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.L
      })
    },
    showStatus(isSuccess, status, desc) {
      this.isSuccess = isSuccess
      this.status = status
      this.desc = desc
      this.isStatusShow = true
    },
    back() {
      // this.$router.push('/login')
      location.href = window.location.origin + '/login'
    },
    // 点击错误提示
    onCoverClick() {
      if (!this.isSuccess) {
        this.refreshQrcode()
      }
    },
    // 刷新二维码
    refreshQrcode() {
      UserService.getQrUrl().then(res => {
        document.getElementById('qrcode').innerHTML = ''
        let qrCode = res.data.qrCode
        if (qrCode) {
          this.createQrcode(qrCode)
          this.lgToken = qrCode.replace(/^.*lgToken=/, '').replace(/&ts=.*$/g, '')
          // 刷新后不显示之前的错误信息
          this.isStatusShow = false
        }
      })
    },
    // 定时检测登录状态
    checkLogin() {
      // 防重复请求
      if (this.isChecking || !this.lgToken) return
      this.isChecking = true
      UserService.qrCodeLogin(this.lgToken).then(async res => {
        clearInterval(this.timer)
        this.showStatus(true, '登录成功', '')
     
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

        // 新用户进入引导页
        if (res.data.userStatus !== 0) {
          this.$router.push('/guide')
        } else {
          this.$router.push('/admin')
        }

        //更新版本号
        if(this.isClientMode){
          this.updateVersion()
        }
      }).catch(error => {
        let code = error.code
        switch (code) {
          case 16117:
            this.showStatus(true, error.msg, '等待确认')
            break
          case 16118:
            this.showStatus(false, '二维码已失效', '请刷新')
            break
          default:
            break
        }
      }).finally(() => {
        this.isChecking = false
      })
    },
    async updateVersion(){
      const version = await this.$native.getVersion()
      UpdateVersion(version)
    }
  }
}
</script>

<style lang="scss" scoped>
.qrcode {
  .content {
    align-items: center;
    width: 400px;

    .nav {
      position: relative;
      width: 100%;
      border-bottom: 1px solid #f1f1f5;
      text-align: center;
      margin-bottom: 15px;

      > span {
        font-size: 16px;
        color: #333333;
        font-weight: bold;
        line-height: 50px;
      }

      > img {
        position: absolute;
        top: 0;
        right: 0;
        width: 48px;
        height: 48px;
        cursor: pointer;
      }
    }

    .image {
      position: relative;
      padding: 20px;
      border: 1px solid #e1e1e1;
      border-radius: 3px;

      #qrcode {
        width: 200px;
        height: 200px;
      }

      .cover {
        position: absolute;
        left: 0;
        top: 0;
        width: 240px;
        height: 240px;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        flex-direction: column;
        cursor: pointer;

        > img {
          width: 64px;
          height: 64px;
          margin-top: 75px;
        }

        .status {
          color: #FFFFFF;
          font-size: 18px;
          font-weight: bold;
          margin: 10px 0;
        }

        .desc {
          color: #FFFFFF;
          font-size: 14px;
        }
      }
    }
    
    .tips {
      width: 240px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #999999;
      margin-bottom: 20px;
      
      .el-button {
        font-size: 12px;
      }
    }
  }
}
</style>