<template>
  <div class='waybill-state'>
    <div class='ydNo'>
      <div class='status'>{{ convertModel.waybillTmsStatusText }}</div>
      <span class='main-ydno'>
        <span>运单号：</span>{{ convertModel.waybillNumber }}
      </span>
      <el-button type='text' v-clipboard='convertModel.waybillNumber'>
        <svg-icon icon-class='copy' class='icon-copy' />
      </el-button>
    </div>
  </div>
</template>
<script>
import { statusEnum } from "../../../enum/queryEnum"

export default {
  name: "waybill-state",
  props: {
    convertModel: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      appointmentTimeDialogVisible: false,
      visibleOfModify: false,
      dataInfo: {},
      stateUrl: require("@assets/image/waybill/waybill-info-state.png"),
      isSHowUrge: false,
      showExigencyDate: false,
      statusEnum,
      drawer: false,
      isSelfSign: false,
      applicationRange: "10",
      preferenceVisible: false,
      timeDialogInfo: {
        finalAging: "", // 需派时效
        from: ""
      }
    }
  },
  methods: {}
}
</script>

<style lang='scss' scoped>
.waybill-state {
  border: 2px solid #f1f1f5;
  
  .ydNo {
    background: #faf8ff url('~@/assets/image/global/module-bg.png') no-repeat;
    background-position-x: right;
    background-color: linear-gradient(270deg, #faf8ff, #f2effe);
    height: 36px;
    line-height: 36px;
    display: flex;
    align-items: center;
    
    .status {
      width: 151px;
      height: 36px;
      line-height: inherit;
      background-image: url('~@/assets/image/waybill/international-status.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: cover;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      color: #ffffff;
      margin-right: 18px;
    }
    
    .main-ydno {
      font-weight: bold;
      line-height: 36px;
      height: 36px;
      flex-shrink: 0;
      color: $--color-text-primary;
      font-size: 14px;
      vertical-align: middle;
      
      & > span {
        font-weight: bold;
        color: #333333;
        font-size: 14px;
        line-height: 36px;
        vertical-align: middle;
      }
      
      // padding-left: 8px;
    }
    
    /deep/ .el-button--text {
      margin: 0 20px 0 8px;
      vertical-align: middle;
      line-height: 36px;
    }
    
    .cut-off {
      display: inline-block;
      width: 1px;
      height: 14px;
      background: #dcdae2;
      margin: 0 16px;
    }
    
    .skew-fill {
      display: inline-block;
      width: 10px;
      height: 100%;
      flex: 0 0 auto;
      background-color: #fff1da;
      transform: skewX(15deg);
      margin-right: -5px;
    }
    
    .warning {
      height: 100%;
      line-height: 36px;
      padding-left: 22px;
      background-color: #fff1da;
      font-size: 12px;
      text-align: left;
      color: #ff8038;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      flex: 1;
      
      i {
        color: #ff7d48;
        font-size: 14px;
      }
    }
  }
}
</style>
