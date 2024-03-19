<template>
  <div>
    <el-header class="admin-header">
      <div class="admin-container-wrapper">
        <a href="//www.ky-express.com/" class="admin-header-logo"><img style="width: 261.5px;height:34px;" src="@/assets/image/bill/logo-purple.svg" alt=""></a>

      <div class="admin-header-container">
        <div class="admin-header-item">
          <div class="header-tools-notice" @click="showNotice">公告</div>
          <i class="iconfont icon-default"></i>
          <span>{{userData.phone.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")}}</span>
          <a href="javascript:;" @click="handleLogout" class="header-tools-unlogin">退出</a>
        </div>
      </div>
            </div>
    </el-header>
    <div class="admin-container">
      <el-aside class="admin-aside aside" width="200px">
        <el-scrollbar style="height: 100%;">
          <!-- <div class="aside-order">
            <el-button type="primary"
                       @click="changePage('/eawb/order')">下单寄件</el-button>
          </div> -->
          <el-menu :default-active="activeNav" text-color="#666" active-text-color="#643789">
            <!-- 我的账单-->
            <el-menu-item index="6" v-eventTracting="{bizCode:'P001'}" @click="changePage('/bill/index')">
              <i class="iconfont icon-waybill1"></i>
              <span slot="title">我的账单</span>
            </el-menu-item>
            <!-- 发票-->
            <el-menu-item index="7" v-eventTracting="{bizCode:'P002'}" @click="changePage('/invoice/index')">
              <i class="iconfont icon-waybill1"></i>
              <span slot="title">发票</span>
            </el-menu-item>
            <!-- 个人设置 -->
            <el-submenu index="5">
              <template slot="title">
                <img src="../eAWB/image/setting.svg" alt="个人设置">
                <span> 个人设置</span>
              </template>
              <el-menu-item-group>
                <el-menu-item index="3-1" @click="changePage('/bill/perInfo')">个人信息</el-menu-item>
                <el-menu-item index="3-1" @click="changePage('/bill/print')">打印配置</el-menu-item>
                <!-- <el-menu-item index="3-2" @click="changePage('/eawb/config')">运单配置</el-menu-item> -->
                <el-menu-item index="3-3" @click="changePage('/bill/cusCode')">客户编码</el-menu-item>
                <el-menu-item index="3-4" @click="changePage('/bill/pasSet')">密码设置</el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-scrollbar>
      </el-aside>
      <div class="admin-main">
        <div class="admin-title">
          <div class="admin-title-text">{{pageTitle}}</div>

        </div>
        <div class="admin-page" :style="{ minHeight: height + 'px' }">
          <router-view />
        </div>
        <div class="admin-footer">（KYE）跨越速运集团有限公司版权所有 Copyright 2007-2019 ky-express.com.All Rights Reserved<a href="http://beian.miit.gov.cn/" style="text-decoration:underline;color: rgba(255, 255, 255, 0.8);">粤ICP备08000894号</a></div>
      </div>
    </div>
    <BillNotice ref="notice" />
  </div>
</template>
<script>
import { getLoginData } from "@/utils/storage"
import { userLogOut } from "@/utils/commonUtil"
import BillNotice from "./components/BillNotice"
export default {
  components: {
    BillNotice
  },
  data() {
    return {
      height: "",
      pageTitle: "",
      activeNav: "1",
      userData: {},
    }
  },
  watch: {
    $route: {
      handler: function(val) {
        this.changeNav(val)
        this.setPageTitle(val)
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    changeNav(val) {
      switch (val) {
        case "/bill/index":
          this.activeNav = "6"
          break
        case "/invoice/index":
          this.activeNav = "7"
          break
        case "/bill/eventTracking":
          this.activeNav = "8"
          break
        case "/bill/print":
          this.activeNav = "3-1"
          break
        case "/bill/cusCode":
          this.activeNav = "3-2"
          break
        default: //可选
          //语句
      }
    },
    changePage(path) {
      this.$router.push(path)
    },
    handleLogout() {
      userLogOut("/billlogin/password")
    },
    setPageTitle(val) {
      let name = val.meta.name
      this.pageTitle = name
    },
    showNotice() {
      console.log(this.$refs.notice)
      this.$refs.notice.showDialog()
    },
  },
  created() {
    this.height = window.innerHeight - 152
    this.setPageTitle(this.$route)
    this.userData = getLoginData() || {}
  }
}
</script>
<style>
  .el-header {
    background-color: #b3c0d1;
    color: #333;
    line-height: 60px;
  }
  .el-aside {
    color: #333;
  }
</style>
<style lang="scss">
  @import "@assets/scss/admin.scss";
  .header-tools-notice {
    cursor: pointer;
    padding-right: 36px;
  }
  .admin-title {
    .admin-title-text {
      display: inline-block;
      font-weight: 600;
      vertical-align: top;
    }
  }
    .el-header {
    color: #333;
    line-height: 60px;
  }
  .el-aside {
    color: #333;
  }
  .admin-container{
    height:calc(100% - 80px);
    padding-top: 80px !important;
  }
</style>

