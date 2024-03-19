<template>
  <div class='waybill-detail' v-loading.lock='loading'>
  <div v-show='!showNetError' style='height:100%'>
  <ky-page-container :title='back.title' :showGoBack='back.showGoBack' :beforeRouteName='back.beforeRouteName'
                     :beforeRouteParams='back.beforeRouteParams' />
  <div class='waybill-main'>
  <div class='waybill-map-router' v-if='[statusEnum.PICKUP, statusEnum.UNSIGNED].includes(String(model.waybillStatus))'>
    <div class='route-map'>
      <el-skeleton :loading='loading'>
        <template slot='template'>
          <el-skeleton-item variant='p' style='width: 30%' />
          <div style='display: flex; align-items: center; justify-items: space-between;'>
            <el-skeleton-item variant='text' style='margin-right: 16px;width:50%' />
          </div>
        </template>
        <template>
          <netc-route-map ref='routeMapRef' :route-data='routeData' @initMapSuccess='onMapSuccess'
                          @initMapError='onMapError' @within10='within10'>
            <el-button v-show='showMapReloadButton' class='map-reload-button' :loading='mapReloadLoading'
                       @click='onReloadMap'>
              加载失败，点击重试
            </el-button>
          </netc-route-map>
          <div class='route-slot'>
            <driver-info class='driver-info' :waybillNumber='waybillNumber' :model='model' :driverInfo='driverInfo'
                         :routeData='routeData' :cargoStorageInfo='cargoStorageInfo'
                         @showContact='showDriverContact'></driver-info>
            <div v-if="clearanceControlVisible
                  && model.waybillStatus=== Number(statusEnum.UNSIGNED)
                  && routeData.clearanceControlFlag == 10"
                 class="clearance-storage-tip" @click="showClearanceStorageTip">{{routeData.clearanceStorageTip}}<i class="el-icon-arrow-right"></i></div>
            <!-- <div v-if="clearanceControlVisible && routeData.clearanceControlFlag == 10" @click="showClearanceStorageTip" class="clearance-storage-tip">{{routeData.clearanceStorageTip}}</div> -->
            <affect-notice v-if='[statusEnum.PICKUP, statusEnum.UNSIGNED].includes(String(model.waybillStatus))' class='affect-notice' :data='routeData' :isInMap='true'></affect-notice>
          </div>
        </template>
      </el-skeleton>
    </div>

    <div class='waybill-state-img' v-if='stateUrl'>
      <el-skeleton :loading='loading'>
        <template slot='template'>
          <el-skeleton :rows='1' />
        </template>
        <template>
          <el-image :src='stateUrl' style='width: 423px; height: 26px'>图片</el-image>
        </template>
      </el-skeleton>
    </div>
    <!-- <waybill-router v-if='list && list.length > 0' class='route-list' :list='list'></waybill-router> -->
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
  <div class='waybill-content'>
    <el-skeleton :loading='loading'>
      <template slot='template'>
        <el-skeleton :rows='4' />
      </template>
      <template>
        <waybill-state ref='waybillStateRef'
                       :convertModel='model' :routeList='routeData' :affectInfo='affectInfo'
                       @cargoStorageInfo='ModifyCargoStorageInfo' @getWaybillRoute='getWaybillRoute(true)'
                       @getDetailInfo='getDetailInfo(true)' @printCallback='printCallback'></waybill-state>
      </template>
      <template slot='template'>
        <el-skeleton :rows='6' />
      </template>
      <template>
        <waybill-info :model='model' :routeList='routeData'></waybill-info>
      </template>
    </el-skeleton>

  </div>
  <!-- 已签收-40 -->
  <div class='signed-image' v-if='model.waybillStatus === 40 && !loading'>
    <el-tabs class='detail-tabs' v-model='activeName' type='card'>
      <el-tab-pane label='运单资料' name='info'>
        <el-skeleton :loading='loading'>
          <template slot='template'>
            <el-skeleton :rows='1' />
          </template>
          <template>
            <signed-image ref='signedImage' />
          </template>
        </el-skeleton>
      </el-tab-pane>
      <el-tab-pane class='pane' label='运单路由' name='route'>
        <waybill-router class='waybill-router' :list='list'></waybill-router>
      </el-tab-pane>
    </el-tabs>
  </div>
  </div>
  <online-service :waybillNumber='waybillNumber'></online-service>
  <driver-contact ref='driverContact' :waybillNumber='waybillNumber' :driverInfo='driverInfo'></driver-contact>
  </div>
  <net-error v-show='showNetError' @btnClick='pageReload' />
  </div>
</template>
<script>
import { WaybillState, WaybillInfo, WaybillRouter, SignedImage } from '../components/detail'
import waybillApi from '@/services/api/waybill.js'
import OnlineService from '@/components/online-service'
import NetcRouteMap from '@/views/waybill/components/netc-route-map'
import DriverInfo from '../components/driver-info.vue'
import AffectNotice from '../components/affect-notice'
import DriverContact from '../components/driver-contact.vue'
import NetError from '@/components/error-page/net-error'
import { statusEnum, customerSourceEnum } from '@/views/waybill/enum/queryEnum'
import { limitCancelFlagEnum } from '@/views/waybill/enum/affectEnum'

export default {
  name: 'waybill-detail',
  components: {
    WaybillState,
    WaybillInfo,
    WaybillRouter,
    OnlineService,
    NetcRouteMap,
    DriverInfo,
    DriverContact,
    SignedImage,
    NetError,
    AffectNotice
  },
  data() {
    return {
      back: {
        title: '返回',
        showGoBack: true,
        beforeRouteName: 'waybill-v3',
        beforeRouteParams: {}
      },
      backImg: require('@assets/image/back-waybill.png'),
      model: {},
      waybillNumber: '',
      list: [],
      stateUrl: '',
      routeData: {},
      loading: false,
      driverVisible: false,
      cargoStorageInfo: {},
      isWithin10: false,
      refreshData: false, // 返回首页是否需要刷新数据
      driverInfo: null, // 司机信息
      affectInfo: null, // 取派限制信息
      showMapReloadButton: false,
      mapReloadLoading: false,
      showNetError: false, // 网络异常错误
      activeName: 'info', // 已签收页面tab
      statusEnum,
      clearanceControlVisible: true,
      limitCancelFlagEnum
    }
  },
  mounted() {
    this.$store.dispatch('common/setServiceWayDictAction')
  },
  methods: {
    /** 地图功能-司机距离10公里以内触发 */
    within10() {
      this.isWithin10 = true
    },
    lazyExecution(time) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    },
    async getDetailInfo(refreshData = false) {
      try {
        // 如果是刷新的时候延迟1秒调用
        const time = refreshData ? 2000 : 0
        if (refreshData) {
          if (refreshData) this.loading = true
          //setTimeout 会导致方法未执行完就直接返回
          await this.lazyExecution(time)
        }
        let res = await waybillApi.getWaybillDetail(this.waybillNumber)
        if (res.code === 0) {
          this.model = res.data
        }
        if (this.model.waybillStatus === 40) {
          this.$nextTick(() => {
            this.$refs.signedImage && this.$refs.signedImage.getMaterialInit()
          })
        }
        this.initBeforeRouteParams(refreshData)

      } catch (e) {
        this.showNetError = true
      } finally {
        if (refreshData) this.loading = false
      }
    },
    async getWaybillRoute(refreshData = false) {
      let params = {
        waybillNumber: this.waybillNumber
      }
      const time = refreshData ? 2000 : 0
      if (refreshData) {
        await this.lazyExecution(time)
      }
      let res = await waybillApi.getWaybillRoute(params)
      if (res.code === 0 && res.data) {
        this.list = res.data.routeNodeVos
        this.routeData = res.data
      }
    },
    async showClearanceStorageTip() {
      let _params = {
        warehousingList: [
          {
            id: Date.now(),
            payMode: this.routeData.payMode,
            serviceType: this.routeData.serviceMode,
            beginAddress: this.routeData.delivery.address,
            endAddress: this.routeData.pickup.address,
            sendTime: this.routeData.deliveryTime,
            sendCustomerCode: this.routeData.delivery.customerCode,
            waybillNumber: this.routeData.waybillNumber
          }
        ],
        pendingReceiptState: this.model.waybillStatus=== Number(this.statusEnum.UNSIGNED)
      }
      let res = await waybillApi.getWarehousingPrice(_params)
      if (res.code === 0 && res.data?.length) {
        const _h = this.$createElement
        const { totalAmount, excTotalAmount } = res.data[0]
        let _msg = null
        if(excTotalAmount) {
          _msg = _h('div', { style: 'line-height: 20px;padding: 10px 0px;' },
            [ _h('span', { style: 'font-weight: bold;' }, '该运单因实际需要报关入仓服务，需缴纳报关手续费'),
              _h('span', { style: 'color: #ff8038;font-weight: bold;' }, `${Number(totalAmount).toFixed(2)}`),
              _h('span', { style: 'font-weight: bold;' }, '元/票，并额外加收异常操作费'),
              _h('span', { style: 'color: #ff8038;font-weight: bold;' }, `${Number(excTotalAmount).toFixed(2)}`),
              _h('span', { style: 'font-weight: bold;' }, '元/票，请确认')
            ]
          )
        } else {
          _msg = _h('div', { style: 'line-height: 20px;padding: 10px 0px;' },
            [ _h('span', { style: 'font-weight: bold;' }, '该运单因实际需要报关入仓服务，需缴纳报关手续费'),
              _h('span', { style: 'color: #ff8038;font-weight: bold;' }, `${Number(totalAmount).toFixed(2)}`),
              _h('span', { style: 'font-weight: bold;' }, '元/票，请确认'),
            ]
          )
        }
        this.$confirm(_msg, '温馨提示', {
          confirmButtonText: '确定',
          cancelButtonText: '暂不处理',
          type: 'warning'
        }).then(async () => {
          const res = await this.fetchUpdateWarehousingAgreeState(10)
          if(res.code === 0) {
            this.clearanceControlVisible = false
          }
        }).catch(async () => {
          await this.fetchUpdateWarehousingAgreeState(20)
        })
      }
    },
    async fetchUpdateWarehousingAgreeState(flag) {
      let _params = [{
        adjustPriceFlag: '10',
        clearanceStorageFlag: flag,
        waybillNumber: this.routeData.waybillNumber
      }]
      return waybillApi.updateWarehousingAgreeState(_params)
    },
    showDriverContact(val) {
      this.$refs.driverContact.toggleVisible(val)
    },
    ModifyCargoStorageInfo(obj) {
      this.cargoStorageInfo = obj
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
        await this.getDetailInfo()
        this.getDriverInfo()
        // this.getExternalEffect()
        // if (['待通知取货', '待签收', '待揽件'].includes(this.model.waybillStatusText)) {
        if (this.model.waybillStatusText === '待揽件') {
          this.stateUrl = require('@assets/image/waybill/to-be-hired.png')
        } else {
          this.stateUrl = require('@assets/image/waybill/to-be-signed.png')
        }
        this.activeName = 'info'
        await this.getWaybillRoute()
        // }
      } finally {
        this.loading = false
      }
    },
    // 处理在详情页刷新无法返回
    initBeforeRouteParams(refreshData) {
      let waybillCustomerSource = 0
      switch (Number(this.model.roleCode)) {
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
      const waybillStatus = this.model.waybillStatus.toString()
      this.back.beforeRouteParams = {
        refreshData,
        waybillCustomerSource,
        waybillStatus
      }
    },
    // 打印完成回调
    printCallback() {
      this.initBeforeRouteParams(true)
    },
    async getDriverInfo() {
      const { data } = await waybillApi.getDriverInfo(this.waybillNumber)
      this.driverInfo = data
    },
    async getExternalEffect() {
      const { data } = await waybillApi.getExternalEffect(this.waybillNumber)
      this.affectInfo = data
    }
  },
  watch: {
    $route: {
      handler(val) {
        this.waybillNumber = val.query.ydNo
        this.activeName = 'info'
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
      flex: 1.7;
      padding: 12px 20px;
    }

    .waybill-map-router {
      min-width: 462px;
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;

      .waybill-state-img {
        margin-top: 8px;
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
    margin-bottom: 4px;
  }
  .clearance-storage-tip {
    position: relative;
    box-sizing: border-box;
    width: calc(100% - 8px);
    min-height: 25px;
    background: #fff8ee;
    border-radius: 4px;
    border: 1px solid #fff;
    box-shadow: 0px 2px 4px 0px rgba(53,70,98,0.10);
    color: #f05a05;
    line-height: 26px;
    font-size: 12px;
    padding: 0 23px 0 32px;
    margin-bottom: 4px;
    margin-top: 5px;
    &:before {
      content: '';
      position: absolute;
      left: 6px;
      top: 0;
      width: 25px;
      height: 25px;
      background-image: url("~@assets/image/waybill/clearance-storage-tip.png");
      background-size: 25px 25px;
      background-repeat: no-repeat;
      background-position: center center;
    }
    > i {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
    }
  }

  /deep/ .el-loading-mask {
    background-color: rgba(255, 255, 255, 0.1);
  }
  .affect-notice-map{
    width: calc(100% - 24px) !important;
    min-width: 454px;
    /deep/ .inner_content{
      line-height: 16px;
    }
  }
}
</style>
<style lang='scss'>
.route-slot {
  width: 100%;
  position: absolute;
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}
</style>
