<template>
  <el-dialog
    :class="['dialog-address-restrict__container', limitReason]"
    custom-class="dialog-address-restrict__dialog"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :show-close="false"
    append-to-body
    width="360px"
  >
    <div class="header">
      <div class="img"></div>
      <div class="title">{{ title }}</div>
    </div>
    <div class="content" v-html="msg"></div>
    <div class="footer">
      <el-button v-if="address" @click="handleContactMarket">联系商务</el-button>
      <el-button v-if="limitType === 10" type="primary" @click="handleClose">我知道了</el-button>
      <template v-else>
        <el-button size="medium" @click="handleClose">取消</el-button>
        <el-button size="medium" type="primary" @click="handleContinue">继续下单</el-button>
      </template>
    </div>
<!--  联系商务  -->
    <contact-phone-dialog :visible.sync="marketVisible" :phone="marketingPhone" :appendBody="true"/>
  </el-dialog>
</template>

<script>
import { computed, reactive, toRefs, watch } from '@vue/composition-api'
import ContactPhoneDialog from '@views/setting/user/components/contact-phone-dialog'
import marketHelp from '@/utils/marketHelp'
import deliveryUtil from '@/utils/deliveryUtil'

export default {
  components:{
    ContactPhoneDialog
  },
  setup() {
    const state = reactive({
      dialogVisible: false,
      resolveResult: Function,
      limitType: '',
      msg: '',
      limitReason: '',
      limitReasonText: '',
      address: ''
    })
    // 市场联系方式
    const contactInfo = reactive({
      marketVisible:false,
      marketingPhone:''
    })
    const title = computed(() => {
      if (state.limitType === 10) {
        const text = state.limitReasonText ? `(${state.limitReasonText})` : ''
        return '限制下单' + text
      }
      return '温馨提醒'
    })
    /**
     * 传了reasonCode，则可不传limitReason和limitReasonText
     */
    const showDialog = ({ limitType, msg,reasonCode, limitReason, limitReasonText, address }) => {
      state.dialogVisible = true
      if(reasonCode){
        limitReason = limitReason || deliveryUtil.convetLimitReason(reasonCode)
        limitReasonText = deliveryUtil.convetLimitReason(reasonCode,'text',limitType === 10)
      }
      Object.assign(state, { limitType, msg, limitReason, limitReasonText, address })
      return new Promise(resolve => {
        state.resolveResult = resolve
      })
    }
    const handleClose = () => {
      state.dialogVisible = false
    }
    const handleContinue = () => {
      state.resolveResult && state.resolveResult(true)
      state.dialogVisible = false
    }

    watch(
      () => state.dialogVisible,
      flag => {
        if (!flag) {
          state.resolveResult && state.resolveResult()
        }
      }
    )

    async function handleContactMarket() {
      const data = await marketHelp.getMarketingInfoByAddress(state.address)
      contactInfo.marketingPhone = data.marketingPhone
      contactInfo.marketVisible = true
    }

    return {
      ...toRefs(state),
      ...toRefs(contactInfo),
      title,
      showDialog,
      handleClose,
      handleContinue,
      handleContactMarket
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../styles/affect-reason.scss';

.dialog-address-restrict__container {
  /deep/ {
    .el-dialog.dialog-address-restrict__dialog {
      position: absolute;
      top: 50%;
      left: 50%;
      margin: 0 !important;
      transform: translate(-50%, -50%);
      border-radius: 8px;
      .el-dialog__header {
        display: none;
      }
      .el-dialog__body {
        padding: 0 !important;
        text-align: center;
        .header {
          display: flex;
          align-items: center;
          border-radius: 8px;
          height: 50px;
          height: auto;
          text-align: center;
          // background: linear-gradient(360deg, rgba(255, 234, 209, 0), #ffead1);
          .img {
            padding: 0 12px;
            width: 44px;
            height: 50px;
            // background-image: url('~@/assets/image/delivery/affect-reason/pandemic.png');
            background-repeat: no-repeat;
            background-position: center;
            background-size: contain;
          }
          .title {
            font-size: 16px;
            font-weight: bold;
            line-height: 26px;
            color: $--color-text-primary;
          }
        }
        .content {
          display: flex;
          display: -webkit-box;
          align-items: center;
          justify-content: center;
          margin: 12px 16px 0;
          color: #6e6d72;
          line-height: 20px;
          // background: #fafafa;
          height: 84px;
          text-align: left;
          overflow: auto;
          // border: 1px solid;
          @include scroll-bar;
        }
        .footer {
          padding: 12px 16px 12px 0;
          text-align: right;
          .el-button {
            width: 72px;
            box-sizing: border-box;
            padding: 8px 0;
            text-align: center;
            font-size: $--font-size-medium;
            & > span {
              font-weight: bold;
            }
            & + .el-button {
              margin-left: 16px;
            }
          }
        }
      }
    }
  }
  @each $item in $reasons {
    $reason: map-get(
      $map: $item,
      $key: reason
    );
    $dialog-header-bg: map-get(
      $map: $item,
      $key: dialog-header-bg
    );
    &.#{$reason} {
      /deep/ {
        .el-dialog .el-dialog__body {
          .header {
            background: #{$dialog-header-bg};
            .img {
              background-image: url('~@/assets/image/delivery/affect-reason/#{$reason}.png');
              // background-size: 100%;
            }
          }
          // background-image: url('~@/assets/image/delivery/affect-reason/#{$reason}.png');
        }
      }
    }
  }
}
</style>
