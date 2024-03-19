<template>
  <div class='header'>
    
    <!-- LOGO -->
    <img class='logo' src='@/assets/image/admin/kye_logo.png' @click='handleClickLogo' />
    <img class='plane' src='@/assets/image/admin/header_plane.png' />
    
    <!-- 功能 -->
    <div class='items'>
      <!-- 窗体按钮 -->
      <div class='window' v-if='isClientMode'>
        <i class='iconfont icon-window-minimize' @click="onWinBtnClick('minimize')"></i>
        <img v-show='winState != 1' src='@/assets/image/admin/win_maximize.png' @click="onWinBtnClick('maximize')">
        <i v-show='winState == 1' class='iconfont icon-window-resume' @click="onWinBtnClick('resume')"></i>
        <i class='iconfont icon-window-close' @click="onWinBtnClick('close')"></i>
      </div>
      
      <!-- 辅助功能 -->
      <div class='menu'>
        <!--        <el-button class="btn-preview-version" plain size="mini">体验新版</el-button>-->
        <slot></slot>
        <!-- 关注公众号 -->
        <el-popover :width='180' title='关注公众号' trigger='hover' placement='bottom'>
          <p class='el-popover__content'>
            扫一扫关注公众号，物流信息实时推送，方便查件。
          </p>
          <div class='el-popover__image'>
            <img src='@/assets/image/admin/wechatOfficalAccount.png' />
          </div>
          <el-button slot='reference' style='border:1px soild red'><i class='iconfont icon-qrcode'></i></el-button>
        </el-popover>
        
        <!-- 意见反馈 -->
        <el-popover trigger='hover' v-if='!visibleFeedbackTip'>
          <p class='el-popover__link' @click="$router.push({path:'/admin/function-feedback'})">功能反馈</p>
          <el-button slot='reference' @click="$router.push({path:'/admin/function-feedback'})"><i
            class='iconfont icon-feedback'></i></el-button>
        </el-popover>
        <el-popover v-show='visibleFeedbackTip' v-model='visibleFeedbackTip' trigger='manual' :width='404'
                    placement='bottom-start' popper-class='header-feedback-tip-popper'>
          <i class='iconfont icon-btn-icon' @click='closeFeedbackTip' />
          <div class='content'>
            <span>功能不好用，您提，我们改！</span>
            <el-button type='primary' round size='mini' @click='goFeedback'>去反馈</el-button>
          </div>
          <el-button slot='reference' @click="$router.push({path:'/admin/function-feedback'})"><i
            class='iconfont icon-feedback'></i></el-button>
        </el-popover>
        
        <!-- 帮助文档 -->
        <el-popover trigger='hover'>
          <p class='el-popover__link' @click='openHelpDoc'>帮助文档</p>
          <el-button slot='reference' @click='openHelpDoc'><i class='iconfont icon-help'></i></el-button>
        </el-popover>
      </div>
      
      <!-- 公告 -->
      <Notice></Notice>
    </div>
  </div>
</template>

<script>
import Notice from "@views/layout/notice.vue"
import Adapter from "@utils/native/adapter"
import QRCode from "qrcodejs2"
import Funcs from "@/utils/funcs"
import { getToken, setUserPreference } from "@/utils/storage"

const HELP_DOC_URL = "http://res.ky-express.com/Customer/客户端操作手册/"
const STORAGE_KEY = "isHideFeedbackTip"

export default {
  name: "Header",
  components: {
    Notice
  },
  // mounted(){
  //   const flag =  getUserPreference(STORAGE_KEY)
  //   if(!flag){
  //     this.visibleFeedbackTip = true
  //   }
  // },
  data() {
    return {
      winState: 1,
      visibleFeedbackTip: false
    }
  },
  methods: {
    goFeedback() {
      this.$router.push({ path: "/admin/function-feedback" })
      this.closeFeedbackTip()
    },
    closeFeedbackTip() {
      this.visibleFeedbackTip = false
      setUserPreference(STORAGE_KEY, true)
    },
    handleClickLogo() {
      if (!this.$native.isClientMode()) {
        if (["uc-uat.ky-express.com", "uc-dev.ky-express.com"].includes(window.location.hostname)) {
          window.location = "http://www-dev.ky-express.com/"
        } else {
          window.location = "https://www.ky-express.com"
        }
      }
    },
    // 窗口按钮事件
    async onWinBtnClick(btnName) {
      if (btnName === "close") {
        await this.$confirm("是否确认退出系统", "提示", {
          type: "warning"
        })
      }
      await this.$native.win[btnName]()
      this.winState = await this.$native.win.getState()
    },
    // 建议反馈二维码
    createQrcode() {
      const env = process.env.NODE_ENV === "test"
      const url = env
        ? "http://m-uat.ky-express.com/feedback.html"
        : "https://m.ky-express.com/feedback.html"
      const source = "website"
      const version = "1.0"
      const ua = Funcs.getBrowserInfo()
      const token = getToken()
      const link = `${url}#/?token=${token}&source=${source}&version=${version}&ua=${ua}`
      new QRCode(this.$refs.qrcode, {
        width: 95,
        height: 95,
        text: link,
        colorDark: "#333",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
      })
    },
    // 打开帮助文档
    openHelpDoc() {
      Adapter.openLink(HELP_DOC_URL)
    }
  }
}
</script>

<style lang='scss' scoped>
.web-mode {
  .logo {
    cursor: pointer;
  }
}

.header {
  height: 74px;
  padding: 0 20px;
  position: relative;
  background-color: #9378fa;
  background-image: url('../../assets/image/admin/header_bg.png');
  background-position: left bottom;
  -webkit-app-region: drag;
  // background-repeat: no-repeat;
  
  .window {
    position: relative;
    display: flex;
    align-items: center;
    margin-left: 34px;
    padding-left: 18px;
    
    &::before {
      content: '';
      position: absolute;
      top: -2px;
      left: 0;
      width: 1px;
      height: 16px;
      opacity: 0.3;
      background-color: #fff;
    }
    
    > i {
      color: #ffffff;
      margin-left: 16px;
      font-size: 12px;
      cursor: pointer;
    }
    
    > img {
      width: 12px;
      margin-left: 20px;
      cursor: pointer;
    }
  }
  
  .logo {
    z-index: 2;
    width: 186px;
    height: 46px;
    position: absolute;
    top: 0px;
    left: 0px;
  }
  
  .plane {
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .items {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    height: 45px;
    // margin-top: 7px;
    
    .menu {
      display: flex;
      align-items: center;
      
      .el-button {
        width: 16px;
        background: none;
        border: none;
        margin-left: 34px;
        padding: 12px 0;
      }
      
      .btn-preview-version {
        width: 65px;
        height: 18px;
        padding: 0;
        border: 1px solid #ffffff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
      }
      
      i {
        color: #ffffff;
        cursor: pointer;
      }
      
      .helpDoc {
        font-size: 16px;
      }
    }
    
    .search {
      cursor: pointer;
      display: flex;
      align-items: center;
      background-color: #ffffff;
      width: 380px;
      height: 45px;
      border-radius: 22px;
      margin-left: 30px;
      padding: 0 15px;
      font-size: 14px;
      color: #999999;
      
      .title {
        width: 270px;
        line-height: 30px;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .line {
        margin: 0 15px;
      }
      
      .btn {
        &:hover {
          color: #8365f6;
        }
        
        .icon-search {
          font-size: 12px;
          margin-right: 5px;
        }
      }
    }
  }
}
</style>

<style lang='scss'>
.el-popover__content {
  font-size: 12px;
  padding: 0 16px;
}

.el-popover__title {
  padding-left: 16px;
}

.el-popover {
  border-radius: 8px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
  0px 3px 6px -4px rgba(0, 0, 0, 0.12);
}

.header-feedback-tip-popper {
  position: relative;
  background: url('~@/assets/image/feedback/popover.png') no-repeat !important;
  border: unset !important;
  box-sizing: border-box;
  height: 73px;
  display: flex;
  align-items: center;
  
  & > i {
    position: absolute;
    top: 4px;
    right: 7px;
    font-size: 12px;
    cursor: pointer;
  }
  
  & > .content {
    display: flex;
    align-items: center;
    padding-left: 60px;
    
    & > span {
      font-size: 18px;
      font-weight: bold;
      color: #03050d;
      margin-right: 7px;
    }
    
    & > button {
      padding: 5px 13px !important;
    }
  }
  
  // &.el-popper > .popper__arrow {
  //   top: -19px !important;
  //   &::after {
  //      border-width: 9px !important;
  //   }
  // }
}
</style>
