<template>
  <div class='waybill-detail-signed'>
    <waybill-detail-material ref='waybillDetailMaterial' />
  </div>
</template>
<script>
import WaybillDetailMaterial from './waybill-detail-material'

export default {
  name: 'signed-image',
  components: {
    WaybillDetailMaterial
  },
  methods: {
    getMaterialInit() {
      console.log('signed-image')
      this.$refs.waybillDetailMaterial && this.$refs.waybillDetailMaterial.init()
    }
  }
}
</script>
<style lang='scss' scope>
.waybill-detail-signed {
  width: 100%;
  
  .ky-tabs {
    //background: url('~@/assets/image/global/module-bg.png') no-repeat;
    //background-position-x: right;
    
    .el-tabs__header {
      background-image: none !important;
    }
    
    .el-tabs__item {
      height: 39px;
      line-height: 39px;
    }
  }
  
  /** 运单详情中调整回单模块样式 */
  .material-wrap {
    min-width: 465px;
  }
  
  .ky-page-header {
    display: none;
  }
  
  .toolbar {
    justify-content: flex-start;
    
    &.receipt {
      .toolbar-transform {
        &-item:nth-child(-n+4) {
          display: none;
        }
      }
    }
  }
  
  .toolbar-filter {
    display: none;
  }
  
  .toolbar-right {
    margin-top: -7px !important;
    justify-content: flex-start;
  }
  
  .toolbar-left {
    position: absolute;
    right: 20px;
    top: 52px;
  }
  
  .express-image {
    // 回单
    &-receipt, &-weight {
      width: 388px;
      min-height: 467px;
    }
    
    // 运单联
    &-report {
      width: 424px;
      min-height: 467px;
    }
    
    // 签收联
    &-delivery {
      width: 424px;
      min-height: 467px;
    }
  }
  
  .toolbar-pagination {
    position: absolute;
    left: 50%;
    bottom: 0;
    display: none;
    transform: translateX(-50%);
  }
  
  .express-route-map {
    margin-top: 25px;
  }
  
  .express-route {
    flex-flow: wrap;
    position: relative;
    width: 100%;
    top: 20px;
    display: block;
    overflow: hidden;
    
    &-map {
      width: 100%;
      height: 283px;
    }
    
    &-three {
      margin-top: 20px;
      margin-bottom: 20px;
    }
  }
}
</style>