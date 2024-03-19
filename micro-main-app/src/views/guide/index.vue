<template>
  <div class='guide'>
    <div class='header'>
      <!-- 窗体按钮 -->
      <div class='window' v-if='isClientMode'>
        <i class='iconfont icon-window-minimize' @click="onWinBtnClick('minimize')"></i>
        <!-- <img v-show="winState != 1" src="@/assets/image/admin/win_maximize.png" @click="onWinBtnClick('maximize')">
        <i v-show="winState == 1" class="iconfont icon-window-resume" @click="onWinBtnClick('resume')"></i> -->
        <i class='iconfont icon-window-close' @click="onWinBtnClick('close')"></i>
      </div>
      <!-- LOGO -->
      <div class='logo'>
        <i class='iconfont icon-logo'></i>
      </div>
      <div class='bg'>
        <img src='../../assets/image/admin/header_plane_bg.png'></img>
      </div>
    </div>
    <div class='container'>
      <div class='steps'>
        <div class='step' v-for='(item, index) in steps' :key='item.index'>
          <span class='index' :class='{active: item.index === step}'>{{ item.index }}</span>
          <span class='title'>{{ item.title }}</span>
          <span class='line' v-if='index < steps.length - 1'></span>
        </div>
      </div>
      <div class='content'>
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.setStep(this.$route.path)

    this.$nextTick(() => {
      this.$native.win.maximize()
    })
  },
  data() {
    return {
      winState: 1,
      step: 1,
      steps: [
        { index: 1, title: '设置登录密码', tips: '设置登录密码,便于您下次通过密码登录客户端。' },
        { index: 2, title: '绑定客户编码', tips: '绑定客户编码后，享受跨越速运寄件服务。' },
        { index: 3, title: '完善实名信息', tips: '请完善实名认证，帮助您快速下单。' }
      ]
    }
  },
  methods: {
    async onWinBtnClick(btnName) {
      await this.$native.win[btnName]()
      this.winState = await this.$native.win.getState()
    },
    setStep(path) {
      switch (path) {
        case '/guide/code':
          this.step = 2
          break
        case '/guide/verify':
          this.step = 3
          break
        default:
          this.step = 1
          break
      }
    }
  },
  watch: {
    // 监听路由变化，切换步骤
    $route(to) {
      this.setStep(to.path)
    }
  }
}
</script>

<style lang='scss' scoped>
$contentWidth: 925px;

.guide {
  height: 100%;
  background-color: #a384ff;
  position: relative;
  min-height: 850px;

  .header {
    width: 100%;
    height: 100px;
    overflow: hidden;


    .window {
      position: absolute;
      top: 15px;
      right: 25px;
      display: flex;
      align-items: center;

      i {
        color: #FFFFFF;
        margin-left: 20px;
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
      width: 130px;
      height: 32px;
      position: absolute;
      left: 24px;
      top: 27px;

      i {
        color: white;
        font-size: 32px;
      }
    }

    .bg {
      width: 100%;
      height: 100%;
      background-image: url("../../assets/image/admin/header_bg_new.png");
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100% 100%;

      img {
        display: inline-block;
        width: 467px;
        height: 100%;
        margin-left: 126px;
      }
    }
  }

  .container {
    position: absolute;
    top: 100px;
    left: 30px;
    right: 30px;
    bottom: 30px;
    min-width: 1024px;
    min-height: 640px;
    background: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 2px 4px 0px rgba(29, 26, 33, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;

    .steps {
      display: flex;
      justify-content: space-between;
      width: $contentWidth;

      .step {
        margin: 25px 0;
        display: flex;
        align-items: center;

        .index {
          margin-right: 8px;
          width: 28px;
          height: 28px;
          line-height: 28px;
          font-size: 12px;
          background: #FFFFFF;
          border: 1px solid #d6dde5;
          border-radius: 50%;
          color: #666666;
          display: inline-block;
          text-align: center;
        }

        .active {
          color: #FFFFFF;
          background-color: #8365F6;
        }

        .title {
          color: #333333;
          font-size: 18px;
          font-weight: bold;
        }

        .line {
          display: inline-block;
          width: 210px;
          height: 1px;
          background-color: #d6dde5;
          margin: 0 15px;
        }
      }
    }

    .content {
      width: 530px;
      margin-top: 86px;
    }
  }
}
</style>