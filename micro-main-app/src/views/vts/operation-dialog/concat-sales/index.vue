<template>
  <section class="concat-sales">
    <ky-dialog class='confirm-order page-style1'
               title='联系销售'
               :visible.sync='concatSaleVisible'
               width='390px'
               @confirm="concatSaleVisible=false">

      <div class="main"
           v-loading='loading'>
        <div class="info">
          <div><span class="item">销售姓名：</span> {{dataInfo.managerName}}</div>
          <div><span class="item">销售电话：</span> {{dataInfo.managerPhone}}</div>
        </div>
        <div class="bgImg">
          <img src="../../../../assets/image/vts/sales.png"
               alt=""
               class="saleimg">
        </div>
      </div>
    </ky-dialog>

  </section>
</template>

<script>
  import { salesInfo } from '@/services/api/vts/index'
  export default {
    // props: {
    //   detailInfo: {
    //     type: Object,
    //     required: true
    //   }
    // },
    data () {
      return {
        concatSaleVisible: false,
        loading: false,
        dataInfo: {
          managerName: '',
          managerPhone: ''
        },
        detailInfo: {}
      }
    },
    watch: {
      'detailInfo.demandOrderCode' (val) {
        if (val) {
          this.getSaleInfo()
        }
      }
    },
    methods: {
      showConcatSaleVisible (val) {
        this.concatSaleVisible = true
        this.detailInfo = val
      },
      // 获取信息
      async getSaleInfo () {
        try {
          this.loading = true
          let res = await salesInfo({ demandOrderCode: this.detailInfo.demandOrderCode })
          this.dataInfo = res.data
          this.loading = false
        } catch (error) {
          this.loading = false
          console.log(error);
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .concat-sales {
    // /deep/ {
    //   @include loading;
    // }
    .main {
      height: 68px;
      widows: 100%;
      display: flex;
      justify-content: space-between;
      background-color: #fdfcff;
      .info {
        padding-left: 20px;
        box-sizing: border-box;
        height: 90%;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        margin-top: 3%;
        font-size: 14px;
        color: #333;
        .item {
          color: #666;
        }
      }
      .bgImg {
        width: 86px;
        height: 100%;
        .saleimg {
          width: 100%;
        }
      }
      /deep/ .el-loading-spinner {
        background: url(/img/loading.540a8486.gif) no-repeat !important;
        background-size: 30px 30px !important;
        width: 240px;
        height: 120px;
        position: absolute;
        top: -10% !important;
        left: 16% !important;
      }
    }
  }
</style>
