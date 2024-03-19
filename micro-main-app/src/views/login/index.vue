<template>
  <div class="index" :class="isClientMode?'client-mode':'web-mode'">
    <!-- 固定宽高容器 -->
    <div class="container">
      <!-- 广告栏 -->
      <div class="banner">
        <el-carousel height="100%" :indicator-position="bannerList.length > 1 ? '' : 'none'">
          <el-carousel-item v-for="(item,index) in getBannerList()" :key="index">
            <div class="image-wrapper">
              <img class="banner-image" :src="item.url" :onerror="defaultImage" @click="onBannerClick(item.link)" />
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>
      <!-- 主内容 -->
      <div class="main">
        <div class="link-wrapper" v-if="!isClientMode">
          <i class="iconfont icon-logo"/>
          <i class="iconfont icon-phone"></i>
          <span class="phone">95324</span>
          <el-link type="primary" href="https://www.ky-express.com/">进入官网</el-link>
        </div>
        <!-- 子路由切换 -->
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import Adapter from '@/utils/native/adapter'
import native from '@/utils/native'

export default {
  data () {
    return {
      bannerList: [
        // { isInClient: true, url: "https://ic-h5.kye-erp.com/intro/official-website/banner_01.png" },
        // { isInClient: true, url: "https://ic-h5.kye-erp.com/intro/official-website/banner_02.png" },
        // { isInClient: true, url: "https://ic-h5.kye-erp.com/intro/official-website/banner_03.png" },
        { isInClient: true, url: require('@/assets/image/login/pc.jpg') },
        { isInClient: false, url: require('@/assets/image/login/web.jpg') },
        // { isInClient: false, url: "https://ic-h5.kye-erp.com/intro/official-website/images/banner_web_01@2x.png" },
        // { isInClient: false, url: "https://ic-h5.kye-erp.com/intro/official-website/images/banner_web_02@2x.png" },
        // { isInClient: false, url: "https://ic-h5.kye-erp.com/intro/official-website/images/banner_web_03@2x.png" },
      ],
      defaultImage: 'this.src="' + require('@/assets/image/login/default_banner.png') + '"'
    }
  },
  created () {
    // UserService.getAdImage().then((res) => {
    //   let data = res.data
    //   if (data && data.length > 0) {
    //     this.bannerList = data
    //   }
    // })
  },
  mounted () {
    this.$native.win.resume()
    this.$native.win.setLoginFormFlag(true)
  },
  methods: {
    getBannerList () {
      const list = this.bannerList.filter(b => b.isInClient === !!this.isClientMode)
      return list
    },
    // 点击广告
    onBannerClick (url) {
      if (url) {
        Adapter.openLink(url)
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if(native.isClientMode){
        native.win.setLoginFormFlag(true)
      }
    })
  },
}
</script>

<style lang="scss" scoped>
  .index {
    min-width: 816px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &.web-mode {
      .container {
        width: 100%;
        height: 100%;
        
        .banner {
          width: 60%;
          height: 100%;
          .image-wrapper {
            width: 100%;
            height: 100%;
            position: relative;
            // &::after {
            //   position: absolute;
            //   top: 49px;
            //   left: 70px;
            //   z-index: 2;
            //   content: "";
            //   background: url("~@/assets/image/admin/kye_logo.png") no-repeat;
            //   background-size: contain;
            //   width: 180px;
            //   height: 45px;
            // }
          }
        }
        .main {
          width: 40%;
          position: relative;     
          flex-direction: column;
          .link-wrapper {
            color: #8365f6;
            display: flex;
            align-items: center;
            position: absolute;
            top: 42px;
            .icon-logo{
              font-size: 30px;
              margin-right: 90px;
            }
            .icon-phone {
              font-size: 31px;
            }
            .phone {
              font-size: 22px;
              line-height: 1;
              margin: 0 28px 0 12px;
            }
          }
          .login{
            flex: 1;
            display: flex;
             align-items: center;
          }
        }
        @media (max-width: 1044px) {
          .banner {
            width: 50%;
          }
          .main {
            width: 50%;
          }
        }
      }
    }
    .container {
      background: #ffffff;
      width: 960px;
      height: 600px;
      box-shadow: 0px 2px 12px 0px #f3f4f6;
      //  -webkit-app-region: drag;
      overflow: hidden;
      display: flex;

      .banner {
        width: 400px;
        height: 600px;
        .el-carousel {
          height: 100%;
        }
        &-image {
          width: 100%;
          height: 100%;
          cursor: pointer;
          object-fit: cover;
        }
      }

      .main {
        width: 560px;
        display: flex;
        align-items: center;
        justify-content: center;
        // &>div{
        //   border: 1px solid;
        // }
        /deep/ .content {
          display: flex;
          flex-direction: column;
        }

        /deep/ .form {
          width: 100%;
          .el-form-item {
            margin-bottom: 28px;
          }

          .el-form-item__error {
            padding-top: 8px;
            left: 18px;
          }

          .el-dropdown {
            width: 100%;
          }

          .el-dropdown-item {
            width: 100%;
          }

          .el-input {
            width: 100%;
            height: 40px;

            .el-input__inner {
              border-radius: 21px;
            }
          }

          .el-button {
            width: 100%;
            border-radius: 18px;
            padding: 10px 20px;
          }
        }
      }
    }
  }
</style>



