<template>
  <div class='wabybill-info-company__container'>
    <div class='sender-info'>
      <div class='company'>
        <i class='iconfont icon-sender' />
        <span>{{ waybillDelivery.deliveryCustomerName || '--' }}</span>
      </div>
      <div class='row'>
        <span class='padding-right-10'>{{ waybillDelivery.person }}</span>
        <span>{{ waybillDelivery.mobile }}</span>
        <span v-if='waybillDelivery.phone' class='telphone'>{{ waybillDelivery.phone }}</span>
      </div>
      <div class='row'>
        <span>{{ waybillDelivery.address }}</span>
      </div>
    </div>
    <div class='receiver-info'>
      <div class='company'>
        <i class='iconfont icon-receiver' />
        <span>{{ waybillPickup.customerName || '--' }}</span>
      </div>
      <div class='row'>
        <span class='padding-right-10'>{{ waybillPickup.person }}</span>
        <span>{{ waybillPickup.mobile }}</span>
        <span v-if='waybillPickup.phone' class='telphone'>{{ waybillPickup.phone }}</span>
        <img v-if='info.selfSignFlag === 1' class='self-sign' src='@assets/image/waybill/self-sign.png'>
      </div>
      <div class='row'>
        <span>{{ waybillPickup.address }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'

export default {
  props: {
    info: [Object]
  },
  setup(props) {
    const waybillDelivery = computed(() => props.info?.delivery || {})
    const waybillPickup = computed(() => props.info?.pickup || {})
    
    return {
      waybillDelivery,
      waybillPickup
    }
  }
}
</script>

<style lang='scss' scoped>
.wabybill-info-company__container {
  width: 753px;
  height: 212px;
  border: 1px solid #f1f1f5;
  border-top: none;
  color: $--color-text-primary;
  font-size: 12px;
  padding-top: 16px;
  box-sizing: border-box;
  background-image: url('~@/assets/image/waybill/international-header.png');
  background-repeat: no-repeat;
  background-position: right bottom;
  background-size: 390px 240px;
  
  & > div {
    flex: 1;
    padding-left: 20px;
    
    &:first-of-type {
      margin-bottom: 20px;
    }
    
    .company {
      height: 26px;
      line-height: 26px;
      font-size: 14px;
      display: flex;
      align-items: center;
      
      & > span {
        font-weight: bold;
        font-size: 14px;
      }
      
      .iconfont {
        font-size: 26px;
        margin-right: 12px;
        
        &.icon-sender {
          color: #8365F6;
        }
        
        &.icon-receiver {
          color: #FF8550;
        }
      }
    }
    
    .row {
      margin: 10px 0;
      line-height: 17px;
      
      .padding-right-10 {
        padding-right: 10px;
      }
      
      .telphone {
        margin-left: 8px;
        position: relative;
        
        &::before {
          height: 12px;
          content: '';
          position: absolute;
          left: -4px;
          top: 3px;
          border-left: 1px solid #03050d;
        }
      }
      
      &.pickup {
        margin-top: 14px;
        margin-bottom: 0;
        
        .pickup-contact {
          width: 317px;
          display: inline-block;
        }
        
        .label {
          display: inline-block;
          color: #333333;
          width: 84px;
        }
      }
      
      .self-sign {
        width: 85px;
        height: 18px;
        margin-left: 8px;
        position: relative;
        bottom: -4px;
      }
    }
  }
}
</style>