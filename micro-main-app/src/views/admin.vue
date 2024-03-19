<template>
  <div class='admin'>
    <!-- 头部 -->
    <Header></Header>

    <div class='admin-container'>
      <!-- 导航菜单 -->
      <Menu :is-collapse.sync='isCollapse'></Menu>

      <!-- 主内容 -->
      <div class='container'>

        <!-- Tab选项卡 -->
        <Tab ref='tabRef' @openTabsChange='openTabsChangeHandler'></Tab>
        <!-- 功能页面 -->
        <div class='content' :class="isClientMode?'client-mode':'web-mode'">
          <keep-alive :exclude='exclude'>
            <router-view></router-view>
          </keep-alive>
          <!--        子应用渲染区，用于挂载子应用节点-->
          <div id="frame"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import startQiankun from '../micro'


import Header from './layout/header.vue'
import Menu from './layout/menu.vue'
import Tab from './layout/tab.vue'
import * as storageUtil from '@/utils/storage'
import userUtil from '@/utils/user'
import { getOpenTabExclude } from '@utils/tabUtils'
import { parseJson } from '@utils/commonUtil'
import { SET_ADVERTISEMENT } from '@/store/mutation-types'
import dayjs from 'dayjs'
import {  saveProxyInfo,getAdvertisementDetails } from '@/services/api/common'
import { ADVERTISEMENT_TYPE_ENUM } from '@/enum/admin'


export default {
  components: {
    Header,
    Menu,
    Tab
  },
  data() {
    return {
      isCollapse: false,
      visibleTime: false,
      timeRunData: [],
      exclude: ''
    }
  },
  // 初始化全局数据
  created() {
    // 埋点上报更新用户信息
    window.report.updateUserInfo()

    // new DevicePixelRatio().init()
    // 用户数据
    this.$store.dispatch('updateUserInfo')
    // 实名认证
    this.$store.dispatch('updateRealNameInfo')
    this.$store.dispatch('setCustomerListAction')
    this.$store.dispatch('client/setPermissionAction')
    this.$store.dispatch('auth/setAuthCodeListAction')

    // 未绑码情况下不初始化业务数据
    if (storageUtil.getCustomerCode()) {
      this.$store.dispatch('common/setServiceWayDictAction')
      this.$store.dispatch('client/setCustomerMappingFieldAction')
      this.$store.dispatch('client/setCustomerizedPermissionAction')
      this.$store.dispatch('setModule/update_print_set')
      this.$store.dispatch('client/setEncryptTextAction')
      this.$store.dispatch('client/setServiceWayAction')
      this.$store.dispatch('client/setGoodsBatchTimesAction')
      this.$store.dispatch('client/setPrintTemplateListAction')
      this.$store.dispatch('waybill/updateChildParentAuthorityAction')
      this.$store.dispatch('waybill/updateGoodsBatchTimesAction')
      // this.$store.dispatch('waybill/updateUserTypeAction') //个人中心本人签收用户角色权限 本人签收-发生产注释
    }
    // // 统计分析权限
    this.$store.dispatch('tatol/GET_TOTALS_AUTH')

    // 权限管理权限
    this.$store.dispatch('permission/get_common_user')
    this.$store.dispatch('permission/get_payment_user')

    this.$store.dispatch('permission/update_button_list')

    // 客户端模式下，最大化窗口
    this.$nextTick(() => {
      this.$native.win.maximize()
      this.$native.win.setLoginFormFlag(false)
      // this.$native.win.sizable()
    })
  },
  mounted() {
    this.qiankunInit()

    userUtil.checkGrayVersion()
    this.handleProxyInfo()
  },
  methods: {
    qiankunInit(){
      if(!window.qiankunStarted){
        startQiankun()
      }
    },
    // 处理waybill tab页面删除时被缓存问题
    openTabsChangeHandler(openTabs) {
      this.exclude = getOpenTabExclude(openTabs)
    },

    //处理网络代理信息
    async handleProxyInfo() {
      try {
        if (this.isClientMode && this.$native.existsNativeFunc('getProxyInfo')) {
          let proxyInfo = parseJson(await this.$native.getProxyInfo())
          if (proxyInfo) {
            await saveProxyInfo(proxyInfo)
          }
        }
      } catch (e) {
        console.log('e :>> ', e)
      }
    }
  },
  watch: {
    isCollapse(val) {
      this.$store.commit('updateMenuCollapseStatus', val)
    }
  }
}
</script>

<style lang='scss' scoped>
$minWidth: 1110px;
.admin {
  min-width: $minWidth;
  background-color: #f5f7fb;

  @media (max-width: 1024px) {
    /deep/ .admin-footer {
      bottom: 15px !important;
    }
  }

  .admin-container {
    @include scroll-bar;
    overflow: auto;
    min-width: $minWidth;

    display: flex;
    position: absolute;
    top: 46px;
    left: 0px;
    right: 0px;
    bottom: 0px;

    .menu:not(.menu-collapse) {
      width: 168px;
    }

    .container {
      height: 100%;
      flex: 1;
      margin-right: 8px;
      padding-right: 0;
      background-color: #f5f7fb;
      border-radius: 4px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex: 1;

      .content {
        @include scroll-bar;
        overflow: auto;
        height: calc(100% - 30px);
        background: rgba(255, 255, 255, 0.99);
        // margin-right: 4px;
      }
    }
  }
}
</style>
