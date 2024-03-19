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
      <div class='row pickup'>
        <span class='pickup-contact' v-if=' model.contactName&&(model.contactPhone||model.contactFixPhone)'>
          <span class='label'>取货联系人：</span>
          <span class='padding-right-10'>{{ model.contactName }}</span>
          <span class='padding-right-10'>{{ model.contactPhone }}</span>
           <span>{{ model.contactFixPhone }}</span>
        </span>
        <template v-if='model.outWareHouseName'>
          <span class='label'>寄方仓库：</span>
          <span>{{ model.outWareHouseName }}</span>
        </template>
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
        <img v-if='model.selfSignFlag === 1' class='self-sign' src='@assets/image/waybill/self-sign.png'>
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
    model: [Object]
  },
  setup(props) {
    const waybillDelivery = computed(() => props.model?.waybillDelivery || {})
    const waybillPickup = computed(() => props.model?.waybillPickup || {})
    
    return {
      waybillDelivery,
      waybillPickup
    }
  }
}
</script>

<style lang='scss' scoped>
.wabybill-info-company__container {
  display: flex;
  color: $--color-text-primary;
  font-size: 12px;
  margin-top: 19px;
  
  & > div {
    flex: 1;
    padding: 16px 20px;
    
    &:first-of-type {
      margin-right: 19px;
    }
    
    &.sender-info {
      background-image: url('~@/assets/image/waybill/waybill-sender.png');
    }
    
    &.receiver-info {
      background-image: url('~@/assets/image/waybill/waybill-receiver.png');
    }
    
    background-repeat: no-repeat;
    background-position: bottom right;
    background-color: #f4f6fa;
    background-size: 86px;
    
    .company {
      font-size: 14px;
      margin-bottom: 14px;
      
      & > span {
        font-weight: bold;
        font-size: 14px;
      }
      
      .iconfont {
        font-size: 16px;
        margin-right: 12px;
        
        &.icon-sender {
          color: #8365F6;
        }
        
        &.icon-receiver {
          color: #FF8C5D;
        }
      }
    }
    
    .row {
      margin: 8px 0;
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
          //width: 317px;
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