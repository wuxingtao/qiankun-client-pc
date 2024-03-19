<template>
  <div class='goods-info'>
    <div class='header'>
      <span>报关信息</span>
    </div>
    <div class='detail'>
      <virtual-table
        :resizable='false'
        :data='clearance'
        :show-pagination='false'
        :tableColumns='clearanceConfig'
        :height='144'
      ></virtual-table>
    </div>
  </div>
</template>

<script>
import VirtualTable from '@/components/ky-table/virtual-table'
import { clearance } from '../../../config/detail'

export default {
  name: 'goods-info',
  components: {
    VirtualTable
  },
  props: {
    clearance: {
      type: Array,
      default: () => {
        return [
          // {
          //   goodsName: '操',
          //   goodsEname: 'fuck',
          //   goodsCode: '501923891233274861278346781234687',
          //   unitPrice: 4000,
          //   currency: 'rmb',
          //   subBoxNo: 'NO13781',
          //   countryOrigin: 'cHINA'
          // },
          // {
          //   goodsName: '操',
          //   goodsEname: 'fuck',
          //   goodsCode: '50192389123',
          //   unitPrice: 4000,
          //   currency: 'rmb',
          //   subBoxNo: 'NO13781',
          //   countryOrigin: 'cHINA'
          // },
          // {
          //   goodsName: '操',
          //   goodsEname: 'fuck',
          //   goodsCode: '50192389123',
          //   unitPrice: 4000,
          //   currency: 'rmb',
          //   subBoxNo: 'NO13781',
          //   countryOrigin: 'cHINA'
          // },
          // {
          //   goodsName: '操',
          //   goodsEname: 'fuck',
          //   goodsCode: '50192389123',
          //   unitPrice: 4000,
          //   currency: 'rmb',
          //   subBoxNo: 'NO13781',
          //   countryOrigin: 'cHINA'
          // },
          // {
          //   goodsName: '操',
          //   goodsEname: 'fuck',
          //   goodsCode: '50192389123',
          //   unitPrice: 4000,
          //   currency: 'rmb',
          //   subBoxNo: 'NO13781',
          //   countryOrigin: 'cHINA'
          // }
        ]
      }
    }
  },
  data() {
    return {
      clearanceConfig: clearance
    }
  }
}
</script>

<style lang='scss' scoped>
.goods-info {
  font-size: 14px;
  color: $--color-text-primary;
  
  .header {
    width: 100%;
    height: 28px;
    margin-top: 20px;
    background: linear-gradient(270deg, #fafafa, #f6f6f6);
    border-radius: 2px;
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    color: #333333;
    position: relative;
    
    > span {
      font-weight: bold;
      line-height: 28px;
      padding-left: 11px;
      
      &:before {
        display: inline-block;
        content: '';
        width: 3px;
        height: 16px;
        background: #666666;
        border-radius: 2px;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }
    }
  }
  
  .detail {
    margin-top: 12px;
  }
  
  /deep/ {
    .vxe-table--render-default .vxe-header--column {
      background-color: #F7F8FE;
    }
    
    .vxe-table--header-wrapper .vxe-header--row .vxe-header--column .vxe-cell .vxe-cell--title {
      color: #333333;
      font-size: 14px;
    }
    
    .vxe-table--body .vxe-body--row .vxe-body--column {
      //text-align: center;
    }
  }
}
</style>