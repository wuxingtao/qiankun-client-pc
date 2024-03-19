<template>
  <section class="vts-detail"
           v-loading.lock='loading'>
    <ky-page-container :title='back.title'
                       :showGoBack='back.showGoBack'
                       :beforeRoutePath='back.beforeRoutePath' />
    <div class="detail-main">
      <!-- 订单状态 -->
      <div class="waybill-state">
        <div class='ydNo'>
          <span class='main-ydno'>订单编号：{{detailInfo.demandOrderCode}}</span>
          <el-button type='text'
                     v-clipboard='detailInfo.demandOrderCode'>
            <svg-icon icon-class='copy'
                      class='icon-copy' />
          </el-button>
        </div>
        <div class='status'>
          <el-image :src='stateUrl'
                    style='width:180px;height:60px'>图片</el-image>
          <div class='status-text'>
            <span>{{detailInfo.orderStatus|FTorderStatus}}</span>
          </div>
          <div class="operation-buttons-wrap">
            <div class='operation-buttons'>
              <el-button size='small'
                         @click="showDialog(item,detailInfo)"
                         v-for="(item,index) in btnList.btn"
                         :key="index"
                         :class="{'firstBtn':index==0}">{{item}}</el-button>
            </div>
            <RestrictDetail :detail="restrictOptions"
                            v-if="restrictOptions&&restrictOptions.show"></RestrictDetail>
          </div>
        </div>
      </div>
      <!-- 订单信息 -->
      <div class="waybill-baseInfo">
        <baseInfo :detailInfo="detailInfo" />
      </div>
      <!-- 费用信息 -->
      <div class="waybill-feeInfo"
           v-show="+detailInfo.orderStatus>=200&&+detailInfo.transportFee&&!String(detailInfo.countFee).includes('***')">
        <feeInfo :detailInfo="detailInfo" />
      </div>
      <!-- 费用信息加密情况 -->
      <div class="waybill-feeInfo-mask"
           v-show="+detailInfo.orderStatus>=200&&+detailInfo.transportFee&&String(detailInfo.countFee).includes('***')">
        <div class="item">
          <span class="label"
                style="color: #666;padding-left: 5px;box-sizing: border-box">运费明细：</span>
          <span class="maskText">******</span>
          <div v-if="feeInfoMaskType&&httpFlag"
               class="feeInfoMaskType">{{feeInfoMaskType}}</div>
          <div class="btn"
               @click="applyLook"
               v-if="!feeInfoMaskType&&httpFlag">申请查看</div>
        </div>
      </div>
      <!-- 车型信息 -->
      <div class="waybill-feeInfo"
           v-show="+detailInfo.orderStatus>=400&&detailInfo.waybillCode">
        <carInfo :detailInfo="detailInfo" />
      </div>
      <!-- 在线客服 -->
      <online-service :waybillNumber='detailInfo.demandOrderCode'></online-service>
    </div>

    <!-- 确认下单弹框 -->
    <confirmOrder ref="confirmOrder"
                  :detailInfo="detailInfo"
                  @close="dialogClose"></confirmOrder>
    <!-- 联系销售弹框 -->
    <concatSales ref="concatSales"
                 :detailInfo="detailInfo"></concatSales>
    <!-- 取消订单 -->
    <cancelOrder ref="cancelOrder"
                 :detailInfo="detailInfo"
                 @close="dialogClose"></cancelOrder>

    <!-- 公用弹框22-2-17 -->
    <ky-dialog :visibleFooter="dialogOption.visibleFooter"
               :visible="dialogOption.show"
               :title="dialogOption.title"
               @close="dialogOption.show = false"
               @confirm="dialogConfirm"
               width='450px'>
      <component ref="cpts"
                 :is="dialogOption.cpt"
                 :isShowTips="isShowTips"></component>
    </ky-dialog>
  </section>
</template>

<script>

  import { baseInfo, feeInfo, carInfo } from "./components"
  import { orderDetail, fetchApplyLook, fetchCheckApply, getRestrict } from '@/services/api/vts'
  import { confirmOrder, concatSales, cancelOrder, applyLook } from '@/views/vts/operation-dialog'
  import OnlineService from '@/components/online-service'
  import RestrictDetail from './../components/restrict-dialog/restrict-detail'
  export default {
    components: { baseInfo, feeInfo, carInfo, confirmOrder, concatSales, cancelOrder, OnlineService, applyLook, RestrictDetail },
    data () {
      return {
        back: {
          title: '返回',
          showGoBack: true,
          beforeRoutePath: '/admin/vtsWaybill'
        },
        stateUrl: require('@assets/image/waybill/waybill-info-state.png'),
        detailInfo: {},
        loading: false,
        dialogOption: {
          show: false,
          cpt: null,
          title: '',
        },
        showRestrict: false,
        isShowTips: false,
        feeInfoMaskType: null,
        httpFlag: false,
        restrictOptions: {
          show: false
        }
      }
    },
    activated () {
      this.getOrderDetail()
    },
    filters: {
      FTorderStatus (val) {
        let _status = {
          100: '待报价',
          200: '待下单',
          300: '已下单',
          400: '已中标',
          500: '运输中',
          600: '已完成',
          700: '已取消'
        }
        console.log(_status[+val]);

        return _status[+val] || '--'
      }
    },
    computed: {
      btnList () {
        let _status = [
          { status: 100, btn: ['联系销售', '取消订单'] },
          { status: 200, btn: ['确认下单', '联系销售', '取消订单'] },
          { status: 300, btn: ['再来一单', '联系销售'] },
          { status: 400, btn: ['再来一单', '联系销售'] },
          { status: 500, btn: ['再来一单', '联系销售'] },
          { status: 600, btn: ['再来一单', '联系销售'] },
          { status: 700, btn: ['再来一单', '联系销售'] },
        ]
        if (this.detailInfo.orderStatus) {
          switch (+this.detailInfo.orderStatus) {
            case 100:
              return _status[0]
              break;
            case 200:
              return _status[1]
              break;
            case 300:
              return _status[2]
              break;
            case 400:
              return _status[3]
              break;
            case 500:
              return _status[4]
              break;
            case 600:
              return _status[5]
              break;
            case 700:
              return _status[6]
              break;
            default:
              break;
          }
        }
        return { status: null, btn: [] }

      },

    },
    methods: {
      // 获取订单详情
      async getOrderDetail () {
        this.loading = true
        try {
          // 重置防疫信息
          this.restrictOptions = {
            show: false
          }
          let res = await orderDetail({ demandOrderCode: this.$route.params.id })
          console.log(res, '详情接口返回')
          this.detailInfo = res.data
          if (String(this.detailInfo.countFee).includes('***')) {
            this.applyCheck()
          }
          console.log('获取订单详情', res)
          // TODO
          // TODO 接下来需要在这个地方去请求取派限制，拿到取派限制之后，传给子组件
          let { demandOrderCode, orderStatus } = res.data
          console.log('orderStatus', +orderStatus)
          // 完成和取消不需要查询取派限制
          if (![600, 700].includes(+orderStatus)) {
            let res2 = await getRestrict({ demandOrderCode, channelCode: '8', operationType: '20' })
            // 有命中取派限制
            if (res2 && res2.data && res2.data.length) {
              let restrict = res2.data[0]
              // 且提醒类型不是不提醒（详情不需要区分提醒和限制，只需要区分是否不提醒）
              if (restrict.limitType !== '30') {
                this.restrictOptions = {
                  show: true,
                  ...restrict
                }
              }
            }
          }
          this.loading = false
        } catch (error) {
          this.restrictOptions = {
            show: false
          }
          this.loading = false
        } finally {
          this.loading = false
        }
      },
      // 弹框操作
      showDialog (val, detailInfo) {
        if (val === '联系销售') {
          this.$refs.concatSales.showConcatSaleVisible(detailInfo)
        } else if (val === '取消订单') {
          this.$refs.cancelOrder.showCancelOrderVisible(detailInfo)
        } else if (val === '确认下单') {
          this.$refs.confirmOrder.showConfirmOrderVisible(detailInfo)
        } else {
          sessionStorage.setItem('AgainOrderDetailInfo', JSON.stringify(this.detailInfo))
          this.$router.push({ path: '/admin/vtsOrder', query: { demandOrderCode: this.detailInfo.demandOrderCode } })
        }
      },
      // 弹框关闭
      dialogClose (val) {
        if (val === 'cancelOrder') {
          this.$refs.cancelOrder.colseCancelOrderVisible()
        } else if (val === 'configOrder') {
          this.$refs.confirmOrder.closeConfirmOrderVisible()
        }
        this.getOrderDetail()
        this.dialogOption.show = false
      },
      applyLook () {
        this.isShowTips = false
        this.dialogOption = {
          show: true,
          cpt: applyLook,
          title: '申请查看'
        }
      },
      async dialogConfirm () {
        console.log(this.$refs.cpts.ruleForm, 'this.$refs.cpts.ruleForm')
        const { desc } = this.$refs.cpts.ruleForm
        this.isShowTips = false
        if (!desc) {
          this.isShowTips = true
          return
        }
        let parmas = {
          applyReason: desc,
          authCodes: [
            "freightLookAuthFlag"
          ]
        }
        try {
          let res = await fetchApplyLook(parmas)
          console.log(res, '申请解密')
          this.dialogOption.show = false
          this.applyCheck()
        } catch (error) {
          console.log(error)
        }
      },
      // 判断权限申请状态
      async applyCheck () {
        const { data } = await fetchCheckApply({ authCodes: ["freightLookAuthFlag"] })
        console.log(data, '详情权限判断')
        this.httpFlag = true
        if (data.status == 1) {
          this.feeInfoMaskType = `您于 ${data.applyTime || '--'} 申请查看，如需加急处理请联系商务`
          return
        }
        if (data.status == 2) {
          this.feeInfoMaskType = `查看权限申请失败，您可联系商务咨询`
          return
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .vts-detail {
    /deep/ {
      @include loading;
    }
    .detail-main {
      padding: 12px 20px;
      box-sizing: border-box;
      .waybill-state {
        border: 1px solid #f5f5f5;
        .ydNo {
          background: #faf8ff url('~@/assets/image/global/module-bg.png') no-repeat;
          background-position-x: right;
          background-color: linear-gradient(270deg, #faf8ff, #f2effe);
          height: 36px;
          padding-left: 16px;
          display: flex;
          align-items: center;

          .main-ydno {
            font-weight: bold;
            font-size: 13px;
            line-height: 30px;
            height: 30px;
            padding-left: 8px;
          }

          /deep/ .el-button--text {
            margin: 0 20px 0 8px;
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
            background-color: #fff1da;
            transform: skewX(15deg);
            margin-right: -5px;
          }

          .warning {
            flex: 1;
            height: 100%;
            line-height: 36px;
            padding-left: 22px;
            background-color: #fff1da;
            font-size: 12px;
            text-align: left;
            color: #ff8038;

            i {
              color: #ff7d48;
              font-size: 14px;
            }
          }
        }

        .status {
          height: 62px;
          display: flex;
          align-items: center;

          .status-text {
            margin-left: -100px;
            padding: 0 30px;
            z-index: 2;
            display: flex;
            flex-direction: column;

            span:first-child {
              font-size: 18px;
              font-weight: bold;
              color: #333333;
            }

            span:nth-child(2) {
              padding-top: 6px;
              font-size: 14px;
              text-align: left;
              color: #ff706d;
            }
          }
          .operation-buttons-wrap {
            display: flex;
            flex: 1;
            flex-flow: row nowrap;
            justify-content: space-between;
            align-items: center;
            .operation-buttons {
              z-index: 2;
              display: flex;

              /deep/ .el-button {
                margin-right: 6px;
                margin-left: 6px;
              }
            }
          }
        }
      }
      .el-loading-spinner {
        background: url(~@/assets/image/loading.gif) no-repeat !important;
        background-size: 48px 48px;
        width: 240px;
        height: 120px;
        position: absolute;
        top: 40%;
        left: 45%;
      }
      .firstBtn {
        color: #8365f6;
        background: #f2effe;
        border: 1px solid #8365f6;
      }
      .waybill-feeInfo-mask {
        margin-top: 16px;
        border-top: 1px solid #f1f1f5;
        padding: 12px 0 0 0;
        box-sizing: border-box;
        .item {
          display: flex;
          align-items: center;
          .label {
            width: 70px;
            margin-right: 8px;
          }
          .maskText {
            padding-top: 6px;
            box-sizing: border-box;
          }
          .btn {
            color: #8365f6;
            margin-left: 3px;
            cursor: pointer;
          }
          .feeInfoMaskType {
            color: #999;
            margin-left: 3px;
          }
        }
      }
    }
  }
</style>
