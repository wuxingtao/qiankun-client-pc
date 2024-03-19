<template>
  <div class="waybill">
    <div class="header">
      <div class="ydNo">{{waybillModel.waybillNumber}}<span class='copy-waybillNumber' v-clipboard="waybillModel.waybillNumber">
          <svg-icon icon-class='copy' class='icon-copy' />
        </span></div>
    </div>
    <div class="payInfo">
      <div class="payInfo-left">
        <p class="customer-name">{{waybillModel.deliveryCustomerName}}</p>
        <p class="mobile-phone">{{showMobilePhone(waybillModel.deliveryPhone)}}</p>
        <el-tooltip class="item" effect="dark" :content="waybillModel.deliveryPerson" placement="top">
          <p class="customer-person">
            {{waybillModel.deliveryPerson}}</p>
        </el-tooltip>
      </div>
      <div class="payType-detail">
        <div class="line"></div>
        <div class="payType">{{waybillModel.payType==10?'收方付':'第三方付'}}</div>
        <div>
          <svg-icon icon-class="payment-waybill-arraw" style="width:36px;height:36px;"></svg-icon>
        </div>
      </div>
      <div class="payInfo-right">
        <p class="customer-name">{{waybillModel.pickupCustomerName}}</p>
        <p class="mobile-phone">{{showMobilePhone(waybillModel.pickupPhone)}}</p>

        <el-tooltip class="item" effect="dark" :content="waybillModel.pickupPerson" placement="top">
          <p class="customer-person">{{waybillModel.pickupPerson}} </p>
        </el-tooltip>

      </div>
    </div>
    <div class="foot-info">
      <div class="goods-type"><span class="foot-title">托寄物:</span>
        <el-tooltip class="item" effect="dark" :content="waybillModel.goodsType" placement="top">
          <p class="goods-type-content">{{waybillModel.goodsType}}</p>
        </el-tooltip>
      </div>
      <div class="orderTime"><span class="foot-title">下单时间：</span>{{showOrderTime(waybillModel.orderTime)}}</div>
    </div>
  </div>
</template>

<script>
import paymentUtil from '../utils/paymentUtil'
import dayjs from 'dayjs'

export default {
  name: 'waybill-info',
  props: {
    waybillModel: {
      type: Object
    }
  },
  data () {
    return {
      tableData: [],
      loading: false
    }
  },
  methods: {
    showMobilePhone (val) {
      return paymentUtil.showMobilePhone(val)
    },
    showOrderTime (val) {
      let time = ''
      if (val) {
        time = dayjs(val).format('YYYY-MM-DD HH:mm')
      }
      return time
    }
  }
}
</script>

<style lang="scss" scoped>
  .waybill {
    width: 500px;
    height: 166px;
    // background: #ffffff;
    border: 1px solid #f1f1f5;
    background: url('~@assets/image/paymentAuth/payment-oneWaybill-bg.png') no-repeat;
    border-radius: 4px;
    box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
    .header {
      width: 500px;
      height: 36px;
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      .ydNo {
        font-size: 14px;
        font-family: PingFangSC;
        font-weight: 600;
        text-align: left;
        color: #8f8fa8;
        line-height: 20px;
        padding: 3px 20px;
        .copy-waybillNumber {
          margin-left: 8px;
        }
      }
    }
    .table {
      margin: 0 20px 20px 20px;
    }
    .payInfo {
      display: flex;
      justify-content: space-around;
      .payInfo-left {
        width: 160px;
      }
      .payInfo-right {
        width: 160px;
      }
      .payType-detail {
        display: flex;
        align-items: center;
        .svg-icon[data-v-c8a70580] {
          vertical-align: 0.16em;
        }
      }
      .line {
        width: 32px;
        height: 1px;
        background: #d8d8d8;
        border-radius: 1px;
      }
      .payType {
        padding: 4px 10px;
        background: #ffffff;
        border: 1px solid #dbdbdb;
        border-radius: 11px;
        text-align: center;
      }
      .customer-name {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Semibold;
        font-weight: 600;
        text-align: center;
        color: #03050d;
        line-height: 16px;
        margin-top: 14px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .mobile-phone {
        padding-top: 8px;
        font-size: 12px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: center;
        color: #666666;
        line-height: 12px;
      }
      .customer-person {
        padding-top: 8px;
        font-size: 13px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        text-align: center;
        color: #03050d;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 14px;
      }
    }

    .foot-info {
      padding: 30px 20px 10px 20px;
      display: flex;
      justify-content: space-between;

      .goods-type {
        padding-right: 8px;
        display: flex;
        // width: 300px;
        .goods-type-content {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          max-width: 220px;
        }
        .foot-title {
          padding-right: 10px;
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: left;
          color: #999999;
          line-height: 12px;
        }
      }
      .orderTime {
        max-width: 160px;
        font-size: 12px;
        //padding-left: 10px;
        // text-align: right;
      }
    }
  }
</style>