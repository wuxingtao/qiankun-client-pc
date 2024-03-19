<template>
  <div class='driver-wrapper'>
    <div class='message'>
      <div class='area'>
        <el-tooltip v-if='routeData.delivery' placement='bottom' effect='light' :visible-arrow='false'
                    :content='routeData.delivery.city'>
          <span>{{ routeData.delivery.city }}</span>
        </el-tooltip>
        <img class='left' src='@assets/image/waybill/driver-info-arrow-left.png' />
        <span> {{ model.serviceModeText }}</span>
        <img class='right' src='@assets/image/waybill/driver-info-arrow-right.png' />
        <el-tooltip v-if='routeData.pickup' placement='bottom' effect='light' :visible-arrow='false'
                    :content='routeData.pickup.city'>
          <span>{{ routeData.pickup.city }}</span>
        </el-tooltip>
      </div>
      <div class='border'></div>
      <div v-if='showPreArriveTime && (routeData.preArriveTime)'
           class='pre-arrive-time'>
        <el-tooltip placement='bottom' effect='light' :visible-arrow='false'
                    :content='handelTime(routeData.preArriveTime)'>
          <p>预计派送时间: {{ handelTime(routeData.preArriveTime) }}</p>
        </el-tooltip>
      </div>
      <div v-else class='status'>{{ routeData.statusText }}</div>
    </div>
    <template v-if='showDriverInfo'>
      <div class='driver-info'>
        <div class='info'>
          <div class='top'>
            <span>{{ driverInfo.name }}</span>
            <span v-if='driverInfo.employeeNumber' class='employeeNumber'>（工号：{{ driverInfo.employeeNumber }}）</span>
            <span v-if='driverInfo.carNumber' class='number-plate'>{{ driverInfo.carNumber }}</span>
          </div>
          <div v-if='idNumber' class='bottom'>
            <span>身份证：{{ idNumber }}</span>
          </div>
        </div>
        <div v-if='(routeData.canShowDriverMobile === 1) && mobileNumber' class='mobile'>
            <span @click='showContact'>
              {{ mobileNumber }}
              <i class='iconfont icon-mobile'></i>
            </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ROUTER_STATUS_EMUN } from '../enum/routerStatus'
import dayjs from 'dayjs'
import { phoneFlagEnum } from '@/views/waybill/enum/driverInfoEnum'


export default {
  name: 'DriverInfo',
  props: {
    waybillNumber: {
      type: String,
      default: ''
    },
    model: {
      type: Object,
      default: () => {
        return {}
      }
    },
    routeData: {
      type: Object,
      default: () => {
        return {}
      }
    },
    cargoStorageInfo: {
      type: Object,
      default: () => {
        return {}
      }
    },
    driverInfo: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return{
      
    }
  },
  computed: {
    mobileNumber() {
      /*
      * 优先展示真实号码，再展示虚拟号码
      * */
      if (!this.driverInfo || !this.driverInfo.mobile) return ''
      const { mobile, phoneFlag } = this.driverInfo
      if (phoneFlag === phoneFlagEnum.REAL) {
        return mobile || ''
      } else {
        return mobile.slice(0, 3) + '****' + mobile.slice(-4)
      }

    },
    idNumber() {
      if (!this.driverInfo || !this.driverInfo.idNumber) {
        return ''
      } else {
        const id = this.driverInfo.idNumber
        return `${id.slice(0, 4)} ${id.slice(4, 8)} ${id.slice(8, 12)} ${id.slice(12, 16)} ${id.slice(16)}`
      }
    },
    showDriverInfo() {
      if (!this.driverInfo) return false
      switch (this.routeData.status) {
        case ROUTER_STATUS_EMUN.ONCOMING:
        case ROUTER_STATUS_EMUN.ARRIVED:
        case ROUTER_STATUS_EMUN.PICKUP:
        case ROUTER_STATUS_EMUN.IN_TRANSIT:
        case ROUTER_STATUS_EMUN.DISPATCHING:
        case ROUTER_STATUS_EMUN.ERROR:
        case ROUTER_STATUS_EMUN.DISPATCH_SIGN:
          return true
        default:
          return false
      }
    },
    showPreArriveTime() {
      switch (this.routeData.status) {
        case ROUTER_STATUS_EMUN.PICKUP:
        case ROUTER_STATUS_EMUN.IN_TRANSIT:
        case ROUTER_STATUS_EMUN.DISPATCHING:
          return true
        default:
          return false
      }
    }
  },
  methods: {
    showContact() {
      this.$emit('showContact', true)
    },
    handelTime(val) {
      return dayjs(val).format('YYYY-MM-DD HH:mm')
    }
  },
  watch: {
    waybillNumber: {
      async handler(val) {
        if (!val || !this.getDriverInfo) return
        await this.getDriverInfo()
      },
      immediate: true
    }
  }

}
</script>

<style lang='scss' scoped>
.driver-wrapper {
  width: calc(100% - 24px);
  min-width: 454px;
  min-height: 50px;
  background: #ffffff;
  box-sizing: border-box;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 0.08);


  .photo {
    width: 34px;
    height: 34px;
    margin-right: 12px;
    background-image: url("~@assets/image/waybill/waybill-driver-info.png");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  .driver-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 9px;
    border-top: 1px solid #F1F1F5;
    
    .info {

      .top {
        display: flex;
        box-sizing: border-box;
        align-items: center;

        span {

          &:first-child {
            font-weight: bold;
            text-align: left;
            color: #424242;
          }
        }

        .employeeNumber {
          font-weight: 400;
          text-align: left;
          color: #999999;
        }

        .number-plate {
          height: 14px;
          line-height: 14px;
          padding: 0 4px;
          border: 1px solid #234eff;
          border-radius: 2px;
          background-color: #5778ff;
          text-align: center;
          color: #ffffff;
        }
      }

      .bottom {
        height: 12px;
        font-weight: 400;
        text-align: left;
        color: #333333;
        margin-top: 9px;

        span {
          margin-right: 4px;

          i {
            padding-right: 5px;
          }

          &:first-child {
            color: #999;
          }
        }
      }
    }

    .mobile {
      cursor: pointer;

      i {
        width: 12px;
        height: 12px;
        color: #8365f6;
      }
    }

  }

  .message {
    width: 100%;
    display: flex;
    align-items: center;
    padding-bottom: 9px;
    .area {
      display: flex;
      align-items: center;

      span {
        color: #333333;
        font-weight: 600;
        
        &:first-child, &:last-child {
          max-width: 64px;
          text-overflow: ellipsis;
          white-space: nowrap;
          overflow: hidden;
          font-size: 14px;
        }

        &:nth-child(3) {
          border: 1px solid #fda100;
          border-radius: 9px;
          padding: 3px 10px;
          color: #fda100;
          font-size: 10px;
          white-space: nowrap;
        }
      }

      img {
        display: inline-block;
        width: 29px;
      }

      .left {
        margin-left: 5px;
      }

      .right {
        margin-right: 5px;
      }

    }

    .border {
      width: 1px;
      height: 14px;
      background: #e6e6e6;
      margin: 0 16px;
    }

    .pre-arrive-time {
      display: flex;
      margin-left: auto;
      flex-shrink: 1;
      overflow: hidden;

      p {
        width: 100%;
        color: #424242;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .status {
      color: #424242;
      margin-left: auto;
    }
  }

}
</style>
