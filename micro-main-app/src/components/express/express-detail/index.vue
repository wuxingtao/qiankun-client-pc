<template>
  <div class="express-detail" v-loading="loading">
    <!--  城市信息  -->
    <div class="detail-info mb_20" v-if="(layoutSelect.city && routeInfo.jjCity)||(layoutSelect.ydCode && routeInfo.ydCode)">
      <div class="city-info mb_12" v-if="layoutSelect.city && routeInfo.jjCity">
        <div>
          <span class="mr_54 city city-1">{{ routeInfo.jjCity }}</span><span class="city mr_4">{{ routeInfo.sjCity }}</span>
          <span class="timeless">{{ routeInfo.serviceWay }}</span>
        </div>
      </div>
      <div class="waybill" v-if="layoutSelect.ydCode && routeInfo.ydCode">
        <span class="waybill-no pr_10">运单号：{{ routeInfo.ydCode }}</span>
        <el-button class="ml_10 copy-btn" v-clipboard='routeInfo.ydCode'>复制</el-button>
      </div>
    </div>
    <slot name="contact">
      <!--  距离  -->
      <div class="contactBox" v-if="layoutSelect.distance && mapShow">
        <div class="content ptb_16 plr_18 flex flex_ai_c">
          <div class="avatar mr_16">
            <img src="../../../assets/image/client/express/icon-courier.png">
          </div>
          <div class="flex_1">
            <p class="p1 fs_15 mb_4 flex flex_jc_b">
              <span class="f_w_500">{{ deliveryInfo.name }}</span>
              <span class="f_w_500">距离您还有</span>
            </p>
            <p class="p2 flex flex_jc_b">
              <span style="color:#999999">联系方式：{{ deliveryInfo.phone }}</span>
              <span class="fs_16 f_w_500 theme-color">{{ `${deliveryInfo.distance}${isMap(deliveryInfo.distance) ? 'km' : ''}` }}</span>
            </p>
          </div>
        </div>
      </div>
    </slot>
    <div class="map-route" v-if="(mapShow && pointA.lat && pointB.lat)||(layoutSelect.detail && routeInfo.route && routeInfo.route.length > 0)">
      <!--  地图组件  -->
      <express-map :pointA="pointA" :pointB="pointB" v-if="mapShow && pointA.lat && pointB.lat" :options="mapOptions"></express-map>
      <!--  路由树  -->

      <div class="express-route-lists" v-if="layoutSelect.detail && routeInfo.route && routeInfo.route.length > 0">
        <ul>
          <li v-for="(item,index) in routeInfo.route" :key="index" :class="['flex flex_ai_c',{'route-active':index===0}]">
            <div class="time-info">{{ dateConnectorChange(item.dateTime) }}</div>
            <div class="line-info">
              <div class="dot">
                <span v-if="index === 0 && routeInfo.ydStatus === 4">收</span>
              </div>
              <span class="dot-line"></span>
            </div>
            <div class="route-text flex_1">{{ formatStep(item.stepDesc) }}</div>
          </li>
        </ul>

      </div>
    </div>
  </div>
</template>

<script>
import ExpressMap from '../express-map'
import { routeQuery, getDistanceApi, getDriverInfoByOrderNo, anlysisWayBillAddressInfo } from '@api/shipment'
import { mapState } from 'vuex'
import formatDate from '@/utils/formatDate'
import dayjs from 'dayjs'

export default {
  name: 'express-detail',
  components: {
    ExpressMap
  },
  props: {
    // 显示布局内容
    layout: {
      type: String,
      default: () => 'city,ydCode,distance,detail'
    },
    title: {
      type: String,
      default: () => '查看物流'
    },
    // 运单号
    ydCode: {
      type: String,
      default: () => ''
    },
    // 下单编码
    orderNumber: '',
    //报单时间
    deliveryTime: ''
  },
  data () {
    return {
      dialogVisible: true,
      // 是否显示地图
      mapShow: false,
      // pointA: {lng: 116.404 , lat: 39.915} ,
      // pointB: {lng: 116.496255 , lat: 39.914492} ,
      pointA: { lng: '', lat: '' },
      pointB: { lng: '', lat: '' },
      mapOptions: {
        // 是否显示线条
        lineShow: false
      },
      // 司机信息
      deliveryInfo: {
        name: '',
        phone: '',
        // 距离用户距离km
        distance: '',
        // 待签收的运输状态
        deliveryStatus: true,
        carNo: ''
      },
      // 后台返回路由详情
      routeInfo: {
        jjCity: '',
        sjCity: '',
        serviceWay: '',
        ydCode: '',
        route: []
      },
      loading: false,
      status: ''
    }
  },
  computed: {
    // layout 布局显示
    layoutSelect () {
      let result = {}
      const layoutArr = this.$attrs.layout || this.layout || ''
      layoutArr.split(',').forEach(item => {
        result[item.trim()] = true
      })
      return result
    },
    info: {
      get () {
        return {
          mapShow: this.mapShow,
          pointA: this.pointA,
          pointB: this.pointB,
          deliveryInfo: this.deliveryInfo,
          routeInfo: this.routeInfo
        }
      },
      set () { }
    },
    noValue () {
      const { mapShow, routeInfo, loading } = this
      return {
        mapShow,
        routeInfo,
        loading
      }
    },
    ...mapState(['userInfo']),
  },
  activated () {
    Object.assign(this.$data, this.$options.data.call(this))
    this.mapShow = false
  },
  watch: {
    info: {
      handler (val) {
        this.$emit('delivery-info-change', val)
      },
      deep: true
    },
    // 是否存在物流数据
    noValue: {
      handler (val) {
        this.$emit('no-value-callback', !val.loading && !val.mapShow && val.routeInfo.route.length === 0)
      },
      deep: true,
      immediate: true
    }
  },
  methods: {

    /**
           *
           * @param ydCode 运单code
           * @param goodsStatus  取货派货
           * @param sendAddress
           * @param receivesAddress
           * @param status 物流状态
           */
    detailInit ({ ydCode, goodsStatus = 0, sendAddress, receivesAddress, status }) {
      this.getRouteInfo(ydCode)
      status !== '已签收' && this.getDistance(ydCode, goodsStatus)
      const isAnlysisBillAddress=(status === '已签收'||status==='待签收')
      isAnlysisBillAddress&& this.anlysisBillAddress(sendAddress, receivesAddress)
      this.mapOptions.lineShow = status === '已签收'
      this.status = status
    },
    /**
           * 获取运单详情
           * @param ydCode 运单号
           * @param type
           * @returns {Promise<boolean>}
           */
    async getRouteInfo (ydCode, type = 'client') {
      let params = {
        mobile: this.userInfo.phone,
        companyNo: this.userInfo.customCode,
        data: [{ 'ydCode': ydCode }],
        // waybillSource: '120',
      }
      const paramsDriver = {
        orderNumber: this.orderNumber
      }
      if (type !== 'client') {
        params.waybillSource = '120'
      }
      let res = await routeQuery(params)
      // TODO 待列表接口增加下单编码字段
      if (this.orderNumber && this.status !== '待签收') {
        let resDelivery = await getDriverInfoByOrderNo(paramsDriver)
        if (resDelivery.code === 0 && resDelivery.data) {
          const { driverName, driverPhone, carNo } = resDelivery.data
          this.deliveryInfo.name = driverName
          this.deliveryInfo.phone = driverPhone
          this.deliveryInfo.carNo = carNo
        }
      }
      console.log(this.deliveryInfo,'info')
      if (res.code === 0 && res.data.successList.length > 0) {
        const dataArr = res.data.successList[0]
        this.routeInfo = dataArr
        if (this.status === '待签收') {
          this.deliveryInfo.name = dataArr.deliveryName
          this.deliveryInfo.phone = dataArr.deliveryPhone
          this.deliveryInfo.deliveryStatus = dataArr.deliveryStatus
          if (!dataArr.deliveryPhone&&this.orderNumber && this.deliveryTime && dayjs(this.deliveryTime).add(1, 'day') > dayjs()) {
            let resDelivery = await getDriverInfoByOrderNo(paramsDriver)
            if (resDelivery.code === 0 && resDelivery.data) {
              const { driverName, driverPhone, carNo } = resDelivery.data
              this.deliveryInfo.name = driverName
              this.deliveryInfo.phone = driverPhone
              this.deliveryInfo.carNo = carNo
              this.deliveryInfo.deliveryStatus=true
            }
          }
        }
        
        return true
      } else {
        // this.$message.error(res.msg)
      }

      return false
    },
    /**
           * 获取两点距离
           * @param ydCode 运单号
           * @param goodsStatus 0 取货 1派货
           * @returns {Promise<void>}
           */
    async getDistance (ydCode, goodsStatus = 0) {
      try {
        let params = {
          ydCode,
          goodsStatus
        }
        this.loading = true
        let res = await getDistanceApi(params)
        this.loading = false
        if (res.code === 0 && res.data) {
          this.pointA = res.data.origin || { lat: '', lng: '' }
          this.pointB = res.data.destination || { lat: '', lng: '' }
          this.deliveryInfo.distance = res.data.transportStatus
          if (this.pointA.lat && this.pointB.lat) {
            this.mapShow = true
          }
        } else {
          this.mapShow = false
          this.info = { mspShow: false }
        }
      } catch (e) {
        this.mapShow = false
        this.loading = false
        this.info = { mspShow: false }
      }
    },
    /**
           * 获取寄收地址经纬度
           * @param receivesAddress 收件地址
           * @param sendAddress 寄件地址
           */
    async anlysisBillAddress (sendAddress, receivesAddress) {
      try {
        let params = {
          receivesAddress,
          sendAddress
        }
        this.loading = true
        let res = await anlysisWayBillAddressInfo(params)
        this.loading = false
        if (res.code === 0 && res.data) {
          this.pointA = { lat: res.data.sendLat, lng: res.data.sendLng } || { lat: '', lng: '' }
          this.pointB = { lat: res.data.receiveLat, lng: res.data.receiveLng } || { lat: '', lng: '' }
          if (this.pointA.lat && this.pointB.lat) {
            this.mapShow = true
          }
        } else {
          this.mapShow = false
        }
      } catch (e) {
        this.mapShow = false
        this.loading = false
      }
    },
    // 时间格式处理
    dateConnectorChange (val) {
      return formatDate.dateConnectorChange(val, '/')
    },
    // 匹配替换时间字符串
    formatStep (val) {
      return formatDate.dateSymbolFormat(val)
    },
    isMap (num) {
      if (/\d/.test(num)) return true
      return false
    },
  }
}
</script>

<style lang="scss" scoped>
  $themeColor: #8365f6;
  .detail-info {
    .city {
      color: #333333;
      font-size: 18px;
      font-weight: 500;
    }

    .city-1 {
      position: relative;

      &::after {
        content: "";
        position: absolute;
        width: 30px;
        background: url("../../../assets/image/client/express/icon-cityarrow.png")
          no-repeat;
        background-size: 88%;
        height: 14px;
        right: -46px;
        top: 8px;
      }
    }

    .timeless {
      display: inline-block;
      font-size: 12px;
      padding: 6px;
      color: $themeColor;
      background: #efebff;
      border-radius: 10px;
      transform: scale(0.8);
      margin-top: -3px;
      vertical-align: top;
    }

    .waybill-no {
      font-size: 13px;
      font-weight: 400;
      text-align: left;
      color: rgba(51, 51, 51, 0.93);
      position: relative;

      &::after {
        content: "";
        position: absolute;
        right: 0;
        width: 1px;
        height: 14px;
        background: #dcdae2;
      }
    }
  }

  .contactBox {
    position: absolute;
    width: 377px;
    height: 76px;
    opacity: 0.95;
    margin: 10px 0 0 10px;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.08);
    z-index: 1;

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 100%;
      background: #f4f1ff;

      img {
        max-width: 100%;
      }
    }

    .p1 {
      color: #666666;
    }
  }

  .express-detail {
    position: relative;
  }

  /* 路由信息 */
  .express-route-lists {
    @include scroll-bar;
    background: #ffffff;
    border: 1px solid #e6e6e6;
    border-radius: 5px;
    padding: 16px;
    margin-top: 12px;
    position: relative;
    max-height: 130px;
    overflow-y: auto;

    li {
      margin-bottom: 24px;
      color: #999999;
      font-size: 14px;
      position: relative;
      z-index: 1;

      &:last-child {
        margin-bottom: 0;
      }

      .dot {
        width: 12px;
        height: 12px;
        background: #e8e6ee;
        border-radius: 50%;
        display: inline-block;
        text-align: center;

        span {
          font-size: 12px;
          color: #ffffff;
          line-height: 20px;
        }
      }

      &.route-active {
        color: #333333;

        .dot {
          width: 20px;
          height: 20px;
          background: #7c57df;
        }
      }
    }

    .time-info {
      width: 135px;
      text-align: right;
    }

    .line-info {
      margin: 0 16px;
      width: 20px;
      font-size: 0;
      text-align: center;
    }

    ul {
      position: relative;

      &::after {
        content: "";
        position: absolute;
        left: 161px;
        top: 0;
        bottom: 4px;
        width: 1px;
        background-color: #f1f1f5;
      }
    }
  }

  .copy-btn {
    border: none;
    padding: 0 !important;
    color: $themeColor !important;
  }
</style>
