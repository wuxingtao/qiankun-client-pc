<template>
  <div class="waybill">
    <div class="header">
      <div class="payInfo">
        <div>
          <p class="customer-name">{{waybillModel.senderCustomerName}}</p>
          <p class="mobile-phone">{{showMobilePhone(waybillModel.senderMobile)}}</p>
        </div>
        <div class="payType-detail">
          <div class="line"></div>
          <div class="payType">{{waybillModel.payType===10?'收方付':'第三方付'}}</div>
          <div>
            <svg-icon icon-class="payment-waybill-arraw" style="width:36px;height:36px;"></svg-icon>
          </div>
        </div>
        <div>
          <p class="customer-name">{{waybillModel.recipientCustomerName}}</p>
          <p class="mobile-phone">{{showMobilePhone(waybillModel.recipientMobile)}}</p>
        </div>
      </div>
    </div>

    <div class="foot-info">
      <div><span class="foot-title">下单日期：</span>{{waybillModel.orderDate}}</div>
      <div><span class="foot-title">总票数:</span>{{waybillModel.tatalOrderCount}}票</div>
    </div>
    <div class="table">
      <div class="table-header">
        <span class="waybillNumber">运单号</span>
        <span class="orderTime">下单时间</span>
      </div>
      <div class="table-info">
        <div class="table-content" v-for="(item,index) in waybillModel.waybillInfoList" :key="index">
          <div class="top">

            <div class="left">
              <div class="yd-no">{{item.waybillNumber}}<span class='copy-waybiNumber' v-clipboard="item.waybillNumber">
                  <svg-icon icon-class='copy' class='icon-copy' />
                </span></div>
              <div class="tooltip-content">寄方姓名:<el-tooltip effect="dark" :content="item.deliveryPerson" placement="top"><span class="item">{{item.deliveryPerson}}</span>
                </el-tooltip>
              </div>

            </div>
            <div class="right">
              <div class="order-time">{{item.orderTime}}</div>
              <div class="tooltip-content">收方姓名:<el-tooltip effect="dark" :content="item.pickupPerson" placement="top"><span class="item">{{item.pickupPerson}}</span>
                </el-tooltip>
              </div>
            </div>

          </div>
          <div class="tooltip-goodsType-content">托寄物:<el-tooltip effect="dark" :content="item.goodsType" placement="top"><span class="goodsType-item">{{item.goodsType}}</span>
            </el-tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import paymentUtil from '../utils/paymentUtil'

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
    }
  }
}
</script>

<style lang="scss" scoped>
  .waybill {
    width: 500px;
    height: 400px;
    // background: #ffffff;

    .header {
      width: 500px;
      height: 80px;
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      border: 1px solid #f1f1f5;
      border-radius: 4px;
      box-shadow: 0px 2px 6px 0px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .table {
      // margin: 0 20px 20px 20px;
      height: 100%;

      .table-header {
        width: 500px;
        height: 36px;
        background: #f7f8fe;
        color: #333333;
        box-shadow: 0px -1px 0px 0px #dedede inset;
        .waybillNumber {
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Medium;
          font-weight: bold;
          text-align: left;
          line-height: 36px;
          padding-left: 16px;
          width: 260px;
          display: inline-block;
        }
        .orderTime {
          border-left: 1px solid #d5d2de;
          padding-left: 8px;
          font-weight: bold;
          font-size: 12px;
          display: inline-block;
        }
      }
      .table-info {
        height: 450px;
        overflow: scroll;
        overflow-x: hidden;
        .table-content {
          border-bottom: 1px solid #dedede;
          line-height: 28px;
          padding: 4px 0;
          font-size: 12px;
          color: #333333;
          .top {
            display: flex;
          }
          .tooltip-content {
            display: flex;
            
          }
          .tooltip-goodsType-content {
            display: flex;
            padding-left: 16px;
            .goodsType-item {
              font-size: 12px;
              font-family: PingFangSC, PingFangSC-Semibold;
              font-weight: 600;
              text-align: left;
              color: #333333;
              padding-left: 8px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 420px;
            }
          }
          .item {
            font-size: 12px;
            font-family: PingFangSC, PingFangSC-Semibold;
            font-weight: 600;
            text-align: left;
            color: #333333;
            padding-left: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 140px;
          }
          .left {
            padding-left: 16px;
            display: inline-block;
            width: 260px;
            .yd-no {
              font-size: 13px;
              font-family: PingFangSC, PingFangSC-Semibold;
              font-weight: 600;
              text-align: left;
              color: #8f8fa8;
              padding-right: 8px;
            }
            .icon-copy {
              width: 16px;
              height: 16px;
              padding-left: 8px;
            }
          }
          .right {
            padding-left: 8px;
            .order-time {
              font-size: 12px;
              font-family: PingFangSC, PingFangSC-Regular;
              font-weight: 400;
              text-align: left;
              color: #8f8fa8;
            }
          }
        }
      }
    }
    .payInfo {
      display: flex;
      justify-content: space-around;
      text-align: center;
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
        padding: 4px 20px;
        background: #ffffff;
        border: 1px solid #dbdbdb;
        border-radius: 11px;
      }
      .customer-name {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Semibold;
        font-weight: 600;
        color: #03050d;
        line-height: 16px;
      }
      .mobile-phone {
        padding-top: 8px;
        font-size: 12px;
        font-family: PingFangSC, PingFangSC-Regular;
        font-weight: 400;
        color: #666666;
        line-height: 12px;
      }
    }

    .foot-info {
      padding: 30px 20px 10px 0;
      display: flex;
      justify-content: space-between;
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
  }
</style>