<template>
  <section class="fee-Info">
    <div class="detail">
      <div class="item"><span class="label"
              style="color: #999;">运&nbsp;&nbsp;单&nbsp;&nbsp;号：</span>{{detailInfo.waybillCode}}</div>
      <div class="item"><span class="label"
              style="color: #999;">承&nbsp;&nbsp;运&nbsp;&nbsp;人：</span>{{detailInfo.transportDriverName||'--'}}</div>
      <div class="item"><span class="label"
              style="color: #999;">承运车牌：</span>{{detailInfo.transportPlateNo||'--'}}</div>
      <div class="item"> <span class="label"
              style="color: #999;">承运车型：</span>{{cpTransportCarTypeName}} </div>
    </div>
  </section>
</template>

<script>
  export default {
    props: {
      detailInfo: {
        type: Object,
        require: true,
      },
    },
    computed: {
      cpTransportCarTypeName () {
        let { transportCarLength, transportCarTypeName } = this.detailInfo
        if (transportCarLength && transportCarTypeName) {
          return `${transportCarLength}米${transportCarTypeName}`
        } else {
          return '--'
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .fee-Info {
    .label {
      color: #999999 !important;
      display: inline-block;
      min-width: 80px;
    }
    .detail {
      display: flex;
      flex-wrap: wrap;
      margin-top: 16px;
      align-content: space-between;
      border-top: 1px solid #f1f1f5;
      font-size: 13px;
      .item {
        flex: 0 0 33.3%;
        padding: 12px 0 0 0;
        flex-wrap: wrap;
        line-height: 12px;
        font-size: 13px;
        .label {
          color: #999;
        }
      }
      .item1 {
        flex: 0 0 33.3%;
      }
    }
  }
</style>
