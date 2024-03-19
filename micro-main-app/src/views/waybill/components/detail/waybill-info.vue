<template>
  <div :class="['waybill-info',model.waybillStatus === 10 ? 'pickup':'']">
  <template v-if='model.waybillStatus === 10'>
    <waybill-info-company :model='model' />
    <div class='pickup detail'>
      <div class='item'>
        <span class='label'><span class=' w3'>托寄物</span>：</span>{{ model.goodsType | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label w3'><span class='w3'>实际重量</span>：</span>{{ model.actualWeight | formatEmpty }}kg
      </div>
      <div class='item'>
        <span class='label w3'><span class='w3'>计费重量</span>：</span>{{ model.freightWeight | formatEmpty }}kg
      </div>
      <div class='item'>
        <span class='label w3'><span class=' w3'>总件数(件)</span>：</span>{{ model.count | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span class='w2'>尺寸</span>：</span>
        {{ sizeHandle(model.goodsSizeList) }}
        <span v-if='model.goodsSizeList&&model.goodsSizeList.length > 1' class='size-detail' @click='viewSizeList'>
            详情</span>
      </div>
      <div class='item'>
        <span class='label'><span class='w2'>体积</span>：</span>{{ model.volume | formatEmpty }}m³
      </div>
      <div class='item'>
        <span class='label'><span>寄件时间</span>：</span>{{ model.deliveryTime | formatEmpty }}
      </div>
      <div class='item' v-if='model.productCode'>
        <span class='label'><span class='w3'>入库号</span>：</span>{{ model.productCode }}
      </div>
      <div class='item'>
        <span class='label'><span>付款方式</span>：</span>{{ model.unionText | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span>付款公司</span>：</span>{{ model.paymentCustomer | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span>服务方式</span>：</span>{{ model.serviceModeText | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span>保价声明(元)</span>：</span>{{ model.insuranceValue | formatEmpty }}
      </div>
      <div class='item' v-if='model.needClearanceControl !== needClearanceControlEnum.NO_PERMISSION'>
        <span class='label'><span>报关入仓</span>：</span>{{ model.needClearanceControl | formatCustom }}
      </div>
      <div class='item'>
        <span class='label'><span class='w3'>签回单(份)</span>：</span>{{ model.receiptFlag | formatEmpty }}
      </div>
      
      <div class='item'>
        <span class='label'><span>包装服务</span>：</span>{{ model.packageServiceText | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span>代收货款</span>：</span>{{ model.collectAmount | formatEmpty }}
      </div>
      <div class='item' v-for='(col, index) in customFieldInfo' :key='index'>
        <el-tooltip placement='bottom' effect='light' :visible-arrow='false'
                    :content='col.customerFieldName'>
          <span class='label'>{{ col.customerFieldName }}：</span>
        </el-tooltip>
        <el-tooltip v-if='col.customerFieldValue.length === 1' popper-class='customer-remark' placement='bottom'
                    effect='light' :visible-arrow='false'
                    :content='col.customerFieldValue[0]'>
          <span class='tooltip-reference'>{{ col.customerFieldValue[0] }}</span>
        </el-tooltip>
        <span v-else class='size-detail' @click='viewMarkList(col.customerFieldName, col.customerFieldValue)'>查看</span>
      </div>
      <div class='item' v-if='model.coupon && model.coupon.shortDesc'>
        <span class='label'><span class='w3'>优惠券</span>：</span>
        <svg-icon icon-class='waybillDetail-coupon' class-name='waybillDetail-coupon' />
        <span class='coupon-bg'><span class='coupon-text'>{{ model.coupon && model.coupon.shortDesc }}</span></span>
      </div>
      <div class='waybillRemark item'>
        <span class='label'>备注：</span><span>{{ model.waybillRemark | formatEmpty }}</span>
      </div>
    </div>
  </template>
  <template v-else>
  <div class='delivery-company'>
    <i class='iconfont icon-sender icon-category' />
    <span class='company-name'>{{ hasDeliveryInfo && model.waybillDelivery.deliveryCustomerName }}</span>
    <template v-if='[statusEnum.PICKUP, statusEnum.UNSIGNED, statusEnum.SIGNED].includes(String(model.waybillStatus))'>
      <img v-if='routeList.limitCancelFlag === limitCancelFlagEnum.UNFREEZE'
           class='affect_mark'
           src='@/assets/image/waybill/affect_mark_unfreeze.png' />
      <img v-else-if='routeList.limitType === affectTypeEnum.LIMIT'
           class='affect_mark'
         :src="routeList.needClearanceControl ? '@/assets/image/waybill/affect_mark_custom.png' :getMark(routeList.limitReason, routeList.limitType)"
          />
    </template>
  </div>
  <div class='delivery-info'>
    <p class='padding-buttom-12'>
      {{ hasDeliveryInfo && model.waybillDelivery.person }}
      <span class='margin-button-20'>{{ hasDeliveryInfo && model.waybillDelivery.mobile }}</span>
      <span v-if='hasDeliveryInfo&&model.waybillDelivery.mobile && model.waybillDelivery.phone' class='cut-off'></span>
      {{ hasDeliveryInfo && model.waybillDelivery.phone }}
    </p>
    <p class='padding-buttom-12'>{{ hasDeliveryInfo && model.waybillDelivery.address }}</p>
    <div class='warehouse margin-buttom-12' v-if='model.outWareHouseName'>
      <div class='detail-delivery'>
        <div class='item1' v-if='model.contactName'>
          <span class='label'>取货联系人：</span>{{ model.contactName | formatEmpty }}
        </div>
        <div class='item1' v-if='model.contactPhone'>
          <span class='label'>取货手机：</span>{{ model.contactPhone | formatEmpty }}
        </div>
        <div class='item1' v-if='model.outWareHouseName'>
          <span class='label'>寄方仓库：</span>{{ model.outWareHouseName | formatEmpty }}
        </div>
      </div>
    </div>
    <div v-else class='border'></div>
  </div>
  <div class='delivery-company'>
    <i class='iconfont icon-receiver icon-category' />
    <span class='company-name'>{{ hasPickupInfo && model.waybillPickup.customerName }}</span>
    <!-- <svg-icon v-if="model.selfSignFlag === 1" icon-class="self-sign-flag" class-name="self-sign-flag" /> -->
  </div>
  <div class='delivery-info'>
    <p class='padding-buttom-12'>
      {{ hasPickupInfo && model.waybillPickup.person | formatEmpty }}
      <span class='margin-button-20'>{{ hasPickupInfo && model.waybillPickup.mobile }}</span>
      <span v-if='hasPickupInfo&&model.waybillPickup.mobile && model.waybillPickup.phone' class='cut-off'></span>
      {{ hasPickupInfo && model.waybillPickup.phone }}
    </p>
    <p class='padding-buttom-12'>{{ hasPickupInfo && model.waybillPickup.address | formatEmpty }}</p>
    <div class='warehouse margin-buttom-12' v-if='model.selfSignFlag === 1'>
      <div class='detail-delivery'>
        <div class='item1'>
          <span class='label'>本人签收：</span>
          <img src='@assets/image/waybill/self-sign.png' class='self-sign'>
        </div>
      </div>
    </div>
  </div>
  <div class='delivery-info'>
  <div class='detail'>
    <div class='item'>
      <span class='label'><span class=' w3'>托寄物</span>：</span>{{ model.goodsType | formatEmpty }}
    </div>
    <div class='item'>
      <span class='label w3'><span class='w3'>实际重量</span>：</span>{{ model.actualWeight | formatEmpty }}kg
    </div>
    <div class='item'>
      <span class='label w3'><span class='w3'>计费重量</span>：</span>{{ model.freightWeight | formatEmpty }}kg
    </div>
    <div class='item'>
      <span class='label w3'><span class='w3'>总件数(件)</span>：</span>{{ model.count | formatEmpty }}
    </div>
    <div class='item'>
      <span class='label'><span class='w2'>尺寸</span>：</span>
      {{ sizeHandle(model.goodsSizeList) }}
      <span v-if='model.goodsSizeList&&model.goodsSizeList.length > 1' class='size-detail' @click='viewSizeList'>
              详情</span>
    </div>
    <div class='item'>
      <span class='label w3'><span class='w3'>体积</span>：</span>{{ model.volume | formatEmpty }}m³
    </div>
    <div class='item'>
      <span class='label'><span>寄件时间</span>：</span>{{ model.deliveryTime | formatEmpty }}
    </div>
    <div class='item' v-if='model.receiver'>
      <span class='label'><span>签收人</span>：</span>{{ model.receiver | formatEmpty }}
    </div>
    <div class='item' v-if='model.receiveTime'>
      <span class='label'><span>签收时间</span>：</span>{{ model.receiveTime | formatEmpty }}
    </div>
    <div class='item' v-if='model.productCode'>
      <span class='label'><span class='w3'>入库号</span>：</span>{{ model.productCode }}
    </div>
  </div>
  <div class='detail none-margin-top'>
    <div class='item'>
      <span class='label'><span>付款方式</span>：</span>{{ model.unionText | formatEmpty }}
    </div>
    <div class='item'>
      <span class='label'><span>付款公司</span>：</span>{{ model.paymentCustomer | formatEmpty }}
    </div>
    <div class='item'>
      <span class='label'><span>服务方式</span>：</span>{{ model.serviceModeText | formatEmpty }}
    </div>
    <div class='item'>
      <span class='label'><span>保价声明(元)</span>：</span>{{ model.insuranceValue | formatEmpty }}
    </div>
    <div class='item' v-if='model.needClearanceControl !== needClearanceControlEnum.NO_PERMISSION'>
      <span class='label'><span>报关入仓</span>：</span>{{ model.needClearanceControl | formatCustom }}
    </div>
    <div class='item'>
      <span class='label'><span class='w3'>签回单(份)</span>：</span>{{ model.receiptFlag | formatEmpty }}
    </div>
    
    <div class='item'>
      <span class='label'><span>包装服务</span>：</span>{{ model.packageServiceText | formatEmpty }}
    </div>
    <div class='item'>
      <span class='label'><span>代收货款</span>：</span>{{ model.collectAmount | formatEmpty }}
    </div>
    <template v-if='model.waybillStatus !== 20'>
      <div class='item'>
        <span class='label'><span>计费方式</span>：</span>{{ model.chargeType | formatEmpty }}
      </div>
      <div class='item' v-if='model.waybillStatus !== 20'>
        <span class='label'><span>运单金额</span>：</span>{{ model.freightAmount | formatEmpty }}
      </div>
      <div class='item' v-if='model.waybillStatus !== 20'>
        <span class='label'><span>费用合计</span>：</span>{{ model.totalAmount | formatEmpty }}
      </div>
      <div class='item' v-if='model.waybillStatus !== 20'>
        <span class='label'><span>附加费用</span>：</span>{{ model.extraAmount | formatEmpty }}
      </div>
    </template>
    <div class='item' v-for='(col, index) in customFieldInfo' :key='index'>
      <el-tooltip placement='bottom' effect='light' :visible-arrow='false'
                  :content='col.customerFieldName'>
        <span class='label'>{{ col.customerFieldName }}：</span>
      </el-tooltip>
      <el-tooltip v-if='col.customerFieldValue.length === 1' popper-class='customer-remark' placement='bottom'
                  effect='light' :visible-arrow='false'
                  :content='col.customerFieldValue[0]'>
        <span class='tooltip-reference'>{{ col.customerFieldValue[0] }}</span>
      </el-tooltip>
      <span v-else class='size-detail' @click='viewMarkList(col.customerFieldName, col.customerFieldValue)'>查看</span>
    </div>
    <div class='item' v-if='model.coupon && model.coupon.shortDesc'>
      <span class='label'><span class='w3'>优惠券</span>：</span>
      <svg-icon icon-class='waybillDetail-coupon' class-name='waybillDetail-coupon' />
      <span class='coupon-bg'><span class='coupon-text'>{{ model.coupon && model.coupon.shortDesc }}</span></span>
    </div>
  </div>
  <div class='detail none-margin-top'>
    <div class='waybillRemark item'>
      <span class='label'>备注：</span>{{ model.waybillRemark | formatEmpty }}
    </div>
  </div>
  <div class='none-margin-top'>
    <div class='customerRemark item'>
      <span class='label'>给司机捎句话：</span>{{ model.customerRemark | formatEmpty }}
    </div>
  </div>
  </div>
  </template>
  
  <waybill-size-view ref='waybillSizeViewRef' />
  <waybill-mark-view ref='waybillMarkViewRef' />
  </div>
</template>

<script>
import WaybillInfoCompany from './waybill-info-company'
import WaybillSizeView from '../waybill-size-view'
import WaybillMarkView from '../waybill-mark-view'
import { affectTypeEnum, limitCancelFlagEnum, needClearanceControlEnum } from '@/views/waybill/enum/affectEnum'
import { statusEnum } from '@/views/waybill/enum/queryEnum'
import { getMark } from '@/views/waybill/utils/methods'

export default {
  name: 'waybill-info',
  props: {
    model: {
      type: Object,
      require: true
    },
    routeList: {
      type: Object,
      require: true
    }
  },
  components: {
    WaybillInfoCompany,
    WaybillSizeView,
    WaybillMarkView
  },
  data() {
    return {
      sendEncrypt: false,
      sizeDetailVisible: false, // 尺寸
      affectTypeEnum,
      statusEnum,
      limitCancelFlagEnum,
      needClearanceControlEnum
    }
  },
  methods: {
    getMark,
    sizeHandle(val) {
      if (val && val.length > 0) {
        return `${val[0].length}*${val[0].width}*${val[0].height}*${val[0].count}(cm)`
      } else {
        return '--'
      }
    },
    viewSizeList() {
      this.$refs.waybillSizeViewRef.showDialog(this.model.goodsSizeList)
    },
    viewMarkList(customerFieldName, customerFieldValue) {
      this.$refs.waybillMarkViewRef.showDialog(customerFieldName, customerFieldValue)
    }
  },
  filters: {
    formatEmpty(val) {
      if (!val || val === '无') {
        return '--'
      }
      return val
    },
    formatCustom(val) {
      switch (val) {
        case needClearanceControlEnum.NEED:
          return '需要'
        case needClearanceControlEnum.WITHOUT:
          return '不需要'
        case needClearanceControlEnum.NONE:
        default:
          return '--'
      }
    }
  },
  computed: {
    hasDeliveryInfo() {
      return this.model.waybillDelivery
    },
    hasPickupInfo() {
      return this.model.waybillPickup
    },
    customFieldInfo() {
      const { customFieldInfos } = this.model
      if (customFieldInfos && customFieldInfos.length) {
        const arr = []
        customFieldInfos.map(i => {
          let flag = arr.some(t => t.customerFieldName === i.customerFieldName)
          if (flag) {
            const index = arr.findIndex(t => t.customerFieldName === i.customerFieldName)
            arr[index].customerFieldValue.push(i.customerFieldValue)
          } else {
            arr.push({
              customerFieldName: i.customerFieldName,
              customerFieldValue: [i.customerFieldValue]
            })
          }
        })
        return arr
      } else {
        return []
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.waybill-info {
  font-family: PingFangSC, PingFangSC-Regular;
  font-size: 14px;
  color: $--color-text-primary;
  
  &.pickup {
    .detail {
      border-top: none;
      padding: unset;
      padding-left: 20px;
      
      & > div:nth-child(4n-1) {
        padding-left: 20px;
      }
      
      .item {
        flex: 0 0 25%;
        box-sizing: border-box;
        height: 22px;
      }
    }
  }
  
  .padding-buttom-12 {
    padding-bottom: 12px;
  }
  
  .padding-left-12 {
    padding-bottom: 12px;
  }
  
  .margin-button-20 {
    margin-left: 20px;
  }
  
  .company-name {
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    color: #333333;
    padding: 0 24px 0 16px;
  }
  
  .cut-off {
    display: inline-block;
    width: 1px;
    height: 10px;
    background: #333333;
    margin: 0 12px;
  }
  
  .decrypt {
    color: #8365f6;
  }
  
  .delivery-company {
    display: flex;
    align-items: center;
    padding-bottom: 12px;
    margin-top: 12px;
    
    .icon-sender {
      color: #8365F6;
    }
    
    .icon-receiver {
      color: #FF8C5D;
    }
  }
  
  .warehouse {
    background: #fafafa;
    border-radius: 2px;
    height: 32px;
    line-height: 32px;
    
    .warehouse-color {
      color: #999999;
    }
  }
  
  .border {
    width: 100%;
    height: 1px;
    background: #f1f1f5;
  }
  
  .goods-info {
    border-top: 1px solid #f1f1f5;
    margin-top: 16px;
    padding: 16px 0 0 0;
  }
  
  .label {
    color: #333333;
    min-width: 80px;
    font-size: $--font-size-base;
  }
  
  .detail {
    display: flex;
    flex-wrap: wrap;
    margin-top: 16px;
    align-content: space-between;
    border-top: 1px solid #f1f1f5;
    padding: 16px 0 8px;
    line-height: 22px;
    
    .item {
      display: flex;
      align-items: center;
      flex: 0 0 33.3%;
      flex-wrap: nowrap;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow-x: hidden;
      overflow-y: unset;
      text-overflow: ellipsis;
      line-height: 22px;
      
      .label {
        width: 84px;
        display: inline-block;
        white-space: nowrap;
        overflow-x: hidden;
        overflow-y: unset;
        text-overflow: ellipsis;
      }
      
      .tooltip-reference {
        width: calc(100% - 88px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    
    .item1 {
      flex: 0 0 33.3%;
    }
    
    .waybillRemark {
      flex: 0 0 auto;
      width: 100%;
      word-break: normal;
      white-space: pre-wrap;
      align-items: flex-start;
      
      .w2 {
        letter-spacing: 26px;
        margin-right: -26px;
      }
    }
  }
  
  .customerRemark {
    line-height: 18px;
    
    .label {
      width: 95px;
      flex-shrink: 0;
    }
  }
  
  .none-margin-top {
    margin-top: 0;
  }
  
  .detail-delivery {
    display: flex;
    flex-wrap: wrap;
    margin-top: 16px;
    align-content: space-between;
    
    .item1 {
      display: flex;
      align-items: center;
      flex: 0 0 33.3%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
  
  .icon-category {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
  
  .self-sign {
    width: 94px;
    height: 18px;
  }
  
  .waybillDetail-coupon {
    width: 20px;
    height: 16px;
    vertical-align: text-top;
  }
  
  .coupon-bg {
    background: #feeecc;
    border-radius: 2px;
  }
  
  .coupon-text {
    opacity: 1;
    padding: 0 12px;
    color: #fe743c;
  }
  
  .size-detail {
    color: #8365f6;
    cursor: pointer;
  }
  
  .delivery-company {
   position: relative;
  }
  
  .affect_mark {
    display: block;
    width: 90px;
    height: 90px;
    position: absolute;
    top: -10px;
    right: 20px;
  }
}
</style>
<style lang='scss'>
.customer-remark {
  white-space: normal;
  word-break: break-all;
}
</style>