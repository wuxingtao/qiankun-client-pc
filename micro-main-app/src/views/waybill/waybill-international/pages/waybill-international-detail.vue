<template>
  <div class='waybill-detail' v-loading.lock='loading'>
    <div v-show='!showNetError' style='height:100%'>
      <ky-page-container :title='back.title' :showGoBack='back.showGoBack' :beforeRouteName='back.beforeRouteName'
                         :beforeRouteParams='back.beforeRouteParams' />
      <div class='waybill-main'>
        <div class='waybill-content'>
          <el-skeleton :loading='loading'>
            <template slot='template'>
              <el-skeleton :rows='4' />
            </template>
            <template>
              <waybill-state class='waybill-state' ref='waybillStateRef'
                             :convertModel='routeData'></waybill-state>
            </template>
            <template slot='template'>
              <el-skeleton :rows='6' />
            </template>
            <template>
              <waybill-info :info='routeData'></waybill-info>
              <goods-info :clearance='routeData.declares || []'></goods-info>
            </template>
          </el-skeleton>
        </div>
        <div class='waybill-map-router'>
          <div class='waybill-state-img' v-if='stateUrl'>
            <el-skeleton :loading='loading'>
              <template slot='template'>
                <el-skeleton :rows='1' />
              </template>
              <template>
                <el-image :src='stateUrl' style='width: 423px; height: 36px'>图片</el-image>
              </template>
            </el-skeleton>
          </div>
          <div v-if='list && list.length > 0' class='route-list'>
            <el-skeleton :loading='loading'>
              <template slot='template'>
                <el-skeleton :rows='4' />
              </template>
              <template>
                <waybill-router :list='list'></waybill-router>
              </template>
            </el-skeleton>
          </div>
        </div>
      </div>
      <online-service :waybillNumber='waybillNumber'></online-service>
    </div>
    <net-error v-show='showNetError' @btnClick='pageReload' />
  </div>
</template>
<script>
import { WaybillInfo, WaybillRouter, WaybillState } from "../components/detail"
import waybillApi from "@/services/api/waybill.js"
import OnlineService from "@/components/online-service"
import NetError from "@/components/error-page/net-error"
import { customerSourceEnum } from "@/views/waybill/enum/queryEnum"
import GoodsInfo from "@/views/waybill/waybill-international/components/detail/goods-info"

export default {
  name: "WaybillInternationalDetail",
  components: {
    GoodsInfo,
    WaybillState,
    WaybillInfo,
    WaybillRouter,
    OnlineService,
    NetError
  },
  data() {
    return {
      back: {
        title: "返回",
        showGoBack: true,
        beforeRouteName: "waybill-v3",
        beforeRouteParams: {}
      },
      backImg: require("@assets/image/back-waybill.png"),
      waybillNumber: "",
      list: [],
      stateUrl: "",
      routeData: {},
      loading: false,
      visible: false,
      isWithin10: false,
      refreshData: false, // 返回首页是否需要刷新数据
      showMapReloadButton: false,
      mapReloadLoading: false,
      showNetError: false, // 网络异常错误
      activeName: "info" // 已签收页面tab
    }
  },
  mounted() {
    this.$store.dispatch("common/setServiceWayDictAction")
  },
  methods: {
    /** 地图功能-司机距离10公里以内触发 */
    within10() {
      this.isWithin10 = true
    },
    async getWaybillInternationalRoute() {
      let params = {
        waybillNumber: this.waybillNumber
      }
      let res = await waybillApi.getWaybillInternationalRoute(params)
      if (res.code === 0 && res.data) {
        this.list = res.data.routeNodeVos
        this.routeData = res.data
      }
      this.initBeforeRouteParams()
    },
    onMapSuccess() {
      this.showMapReloadButton = false
      this.mapReloadLoading = false
    },
    onMapError() {
      this.showMapReloadButton = true
      this.mapReloadLoading = false
    },
    onReloadMap() {
      this.mapReloadLoading = true
      this.$refs.routeMapRef.reload()
    },
    async pageReload() {
      this.showNetError = false
      try {
        this.loading = true
        await this.getWaybillInternationalRoute()
        switch (this.routeData.waybillTmsStatusText) {
          case "待揽件":
            this.stateUrl = require("@assets/image/waybill/pickup.png")
            break
          case "待签收":
            this.stateUrl = require("@assets/image/waybill/unsign.png")
            break
          case "已签收":
            this.stateUrl = require("@assets/image/waybill/signed.png")
            break
        }
        this.activeName = "info"
      } finally {
        this.loading = false
      }
    },
    // 处理在详情页刷新无法返回
    initBeforeRouteParams(refreshData) {
      let waybillCustomerSource = 0
      switch (Number(this.routeData.roleCode)) {
        case 2:
          waybillCustomerSource = customerSourceEnum.SENDED
          break
        case 3:
          waybillCustomerSource = customerSourceEnum.RECEIVED
          break
        case 4:
          waybillCustomerSource = customerSourceEnum.PAIED
          break
      }
      const waybillStatus = this.routeData.waybillTmsStatus.toString()
      this.back.beforeRouteParams = {
        refreshData,
        waybillCustomerSource,
        waybillStatus
      }
    },
  },
  watch: {
    $route: {
      handler(val) {
        this.waybillNumber = val.query.ydNo
        this.activeName = "info"
      },
      immediate: true
    },
    waybillNumber: {
      async handler(val) {
        if (!val) return
        this.pageReload()
      },
      immediate: true
    }
  }
}
</script>
<style lang='scss' scoped>
.waybill-detail {
  position: relative;
  
  /deep/ {
    @include loading;
  }
  
  height: 100%;
  // min-width: 1188px;
  
  .waybill-main {
    display: flex;
    height: 93%;
    
    .waybill-content {
      width: 753px;
      padding: 12px 20px;
    }
    
    .waybill-map-router {
      padding-top: 12px;
      min-width: 462px;
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      
      .waybill-state-img {
        height: 36px;
        text-align: center;
      }
      
      .route-map {
        position: relative;
        width: 100%;
        flex: 1;
        min-height: 283px;
        background-color: #f8f8f8;
      }
      
      .route-list {
        flex: 1;
        overflow: scroll;
        @include scroll-bar;
        padding-right: 20px;
      }
    }
    
    .signed-image {
      flex: 1;
      min-width: 465px;
      margin-top: 12px;
      padding: 0 20px;
      border-left: 1px solid #f1f1f5;
      // padding: 0 20px;
      position: relative;
      
      /deep/ {
        .detail-tabs > .el-tabs__header {
          height: 38px;
          margin-bottom: 13px;
          background-color: #f3effe;
          background-image: url('~@/assets/image/global/module-bg.png');
          background-repeat: no-repeat;
          background-position: right center;
          
          .el-tabs__item {
            border: none;
          }
          
          .el-tabs__nav {
            border: none;
          }
          
          .el-tabs__item {
            width: 110px;
            height: 38px;
            line-height: 38px;
            padding: 0;
            font-size: 14px;
            color: #333333;
            text-align: center;
            border: none;
            position: relative;
            border-radius: 4px 4px 0px 0px;
            overflow: hidden;
            
            &.is-active {
              color: #8365f6;
              background: #ffffff;
              border: 1px solid #e0e0e8;
              border-bottom: none;
              border-radius: 4px 4px 0px 0px;
              
              &::before {
                content: '';
                width: 100%;
                height: 2px;
                background-color: #8365f6;
                position: absolute;
                top: 0;
                left: 0;
              }
            }
          }
        }
        
        .ky-page-container {
          padding: 0;
        }
      }
    }
  }
  
  .map-reload-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .driver-info {
    position: absolute;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
  }
  
  /deep/ .el-loading-mask {
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
