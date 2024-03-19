<template>
  <div class='waybill-info'>
    <waybill-info-company :info='info' :customColumns='customColumns' />
    <div class='header'>
      <span>运单信息</span>
    </div>
    <div class='detail'>
      <div class='item'>
        <span class='label'><span>服务方式</span>：</span>{{ info.internationalDetail.serviceMode | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span class='w3'>运单件数</span>：</span>{{ info.internationalDetail.count | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span class='w3'>报关模式</span>：</span>{{ info.internationalDetail.declareMode | formatEmpty
        }}
      </div>
      <div class='item'>
        <span class='label'><span
          class='w3'>预估重量</span>：</span>{{ info.internationalDetail.predictWeight | formatEmpty }}kg
      </div>
      <div class='item'>
        <span class='label'><span>付款方式</span>：</span>{{ info.internationalDetail.unionText | formatEmpty }}
      </div>
      <div class='item'>
        <span class='label'><span>付款公司</span>：</span>{{ info.internationalDetail.paymentCustomer | formatEmpty }}
      </div>
      <div class='waybillRemark item'>
        <span class='label'>运单备注：</span>
        <el-tooltip placement='bottom' effect='light' :visible-arrow='false'
                    :content='info.internationalDetail.waybillRemark'>
          <span>{{ info.internationalDetail.waybillRemark | formatEmpty }}</span>
        </el-tooltip>
      </div>
    </div>
    <waybill-size-view ref='waybillSizeViewRef' />
  </div>
</template>

<script>
import WaybillInfoCompany from "./waybill-info-company"
import WaybillSizeView from "../../../components/waybill-size-view"

export default {
  name: "waybill-info",
  props: {
    info: {
      type: Object,
      require: true
    }
  },
  components: {
    WaybillInfoCompany,
    WaybillSizeView
  },
  data() {
    return {
      sendEncrypt: false,
      sizeDetailVisible: false // 尺寸
    }
  },
  methods: {
    sizeHandle(val) {
      if (val && val.length > 0) {
        return `${val[0].length}*${val[0].width}*${val[0].height}*${val[0].count}(cm)`
      } else {
        return "--"
      }
    },
    viewSizeList() {
      this.$refs.waybillSizeViewRef.showDialog(this.info.goodsSizeList)
    }
  },
  filters: {
    formatEmpty(val) {
      if (!val || val === "无") {
        return "--"
      }
      return val
    }
  },
  computed: {
    customColumns() {
      const cols = this.$store.getters.customColumns || {}
      const keys = Object.keys(cols).filter(k => k.startsWith("CustomColumn") && cols[k])
      const newkeys = keys.map(k => ({
        label: cols[k],
        prop: k.replace(/CustomColumn/i, "customColumnValue")
      }))
      return newkeys
    },
    hasDeliveryInfo() {
      return this.info.waybillDelivery
    },
    hasPickupInfo() {
      return this.info.waybillPickup
    }
  }
}
</script>

<style lang='scss' scoped>
.waybill-info {
  font-size: 14px;
  color: $--color-text-primary;
  
  
  //  .detail {
  //    border-top: none;
  //    padding: unset;
  //    padding-left: 20px;
  //
  //    & > div:nth-child(4n-1) {
  //      padding-left: 20px;
  //    }
  //
  //    .item {
  //      flex: 0 0 25%;
  //      box-sizing: border-box;
  //      height: 22px;
  //    }
  //
  //}
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
    display: flex;
    flex-wrap: wrap;
    align-content: space-between;
    line-height: 22px;
    
    .item {
      display: flex;
      align-items: center;
      flex: 0 0 33.3%;
      flex-wrap: nowrap;
      white-space: nowrap;
      overflow-x: hidden;
      overflow-y: unset;
      text-overflow: ellipsis;
      
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
    
    .waybillRemark {
      flex: 0 0 auto;
      width: 100%;
      //text-overflow: ellipsis;
      white-space: nowrap;
      //overflow: hidden;
    }
  }
}
</style>
<style lang='scss'>
.customer-remark {
  white-space: normal;
  word-break: break-all;
}
</style>