<template>
  <section class="fee-Info">
    <div class="detail">
      <div class="item"><span class="label"
              style="color: #999;">含税运费：</span>{{detailInfo.transportFee|FTFee}}</div>
      <div class="item"><span class="label"
              style="color: #999;">折后运费：</span>{{detailInfo.lineDiscountFee|FTFee}}(线路折扣 {{detailInfo.lineDiscount||'--'}}%)</div>
      <div class="item"><span class="label"
              style="color: #999;">装&nbsp;&nbsp;货&nbsp;&nbsp;费：</span>{{detailInfo.loadingFee|FTFee}}</div>
      <div class="item"> <span class="label"
              style="color: #999;">卸&nbsp;&nbsp;货&nbsp;&nbsp;费：</span>{{detailInfo.unLoadingFee|FTFee}}</div>
      <div class="item"><span class="label"
              style="color: #999;">回&nbsp;&nbsp;单&nbsp;&nbsp;费：</span>{{detailInfo.receiptFee|FTFee}}</div>
      <div class="item"> <span class="label"
              style="color: #999;">货物价值：</span>{{detailInfo.insuredMoney|FTinsuredMoney}}</div>
      <div class="item"> <span class="label"
              style="color: #999;">保&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;费：</span>{{detailInfo.insuredFee|FTFee}}</div>
      <div class="item"> <span class="label"
              style="color: #999;">总&nbsp;&nbsp;运&nbsp;&nbsp;费：</span>{{detailInfo.countFee|FTFee}}</div>
      <div class="item"> <span class="label"
              style="color: #999;">其他费用：</span>{{detailInfo.otherFee|FTFee}}</div>
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
    filters: {
      FTFee (val) {
        if (val) {
          return `￥${(+val).toFixed(2)}`
        } else {
          return '--'
        }
      },
      FTinsuredMoney (val) {
        if (val) {
          return `￥${((+val) / 10000).toFixed(2)} 万`
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
      color: #999999;
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
        line-height: 18px;
        font-size: 13px;
        .label {
          color: #666 !important;
        }
      }
      .item1 {
        flex: 0 0 33.3%;
      }
    }
  }
</style>
