<template>
  <ky-dialog
    title="自提风险告知书"
    custom-class="pickup-risk-agreement__container"
    :visible.sync="visibleFlag"
    append-to-body
    width="700px"
  >
    <el-scrollbar style="height: 500px">
      <div class="content">
        <div class="content-title">自提风险告知书</div>
        <div class="content-desc"></div>
        <dl>
          <dd>
            与您通过本平台缔约的主体是跨越速运集团有限公司或其子公司、分公司、关联公司（以下简称：跨越速运），跨越速运为您提供货物自提服务。
          </dd>
          <dd>
            跨越速运承运您的货物，因您选择、修改该批货物的派送方式为自提，无需跨越速运派送。请您在确认自提前认真阅读《自提风险告知书》，<b
              >如您点击“我已阅读并理解，同意自提”，视为您已阅读、完全理解并同意本告知书的内容。</b
            >
          </dd>
          <div style="padding-left:24px;">
            <dd>
              1. 若您在下单时选择自提，提货地址为离收件地址最近的跨越速运派送点部；若您在下单后修改为自提的，提货地址为离当前货物所在地址距离最近的跨越速运服务点部/分拨/中转场。具体提货地址以短信通知为准，如您对提货地址有疑问的，请联系您的专属市场或拨打95324。
            </dd>
            <dd>
              2. 为了便于您自提，跨越速运在该货物到达提货地址后，向您指定的自提手机号发送提货信息，提货信息包括提货地址、提货联系人、提货验证码，短信转发或截图转发验证码均有效。
            </dd>
            <dd class="bold">
              3. 提货验证码作为提货的唯一凭证，请您妥善保存、谨慎转发。对自提货物，跨越速运仅识别提货验证码，任何持有验证码的人均有权提货，跨越速运不对提货人的身份进行校验，持有验证码即视为已被授权提货。（即认码不认人）
            </dd>
            <dd class="bold">
              4. 您须告知提货人，在签收前应认真查验货物情况，验收时发现货物毁损、短少的，须跟现场人员确认并在运单上注明。货物经自提人签收后，跨越速运不再承担任何货损、丢失的赔偿责任。
            </dd>
            <dd>5. 如该货物需要签回单的，持有提货验证码的提货人在回单上的签名有效。</dd>
            <dd class="bold">6. 您选择自提后，跨越速运对以下情形不承担时效延误的责任：</dd>
            <dd class="bold">1) 您或您指定的自提人未提货或未及时提货的；</dd>
            <dd class="bold">2) 您自行修改或被其他有权修改的人员重新修改为跨越速运派送的。</dd>
            <dd>
              7. 若该货物运费支付方式为到付或有代收货款服务的，则您需先行支付运费或货款，或告知提货人在提货前支付运费或货款，并在提货时出示付款凭证，否则跨越速运有权拒绝交接货物。
            </dd>
          </div>
        </dl>
      </div>
    </el-scrollbar>
    <div slot="footer" class="dialog-footer">
      <el-button size="medium" type="primary" @click="visibleFlag = false">我知道了</el-button>
    </div>
  </ky-dialog>
</template>

<script>
export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visibleFlag: false
    }
  },
  watch: {
    visible(val) {
      this.visibleFlag = val
    },
    visibleFlag(val) {
      this.$emit('update:visible', val)
    }
  }
}
</script>

<style lang='scss'>
.pickup-risk-agreement__container {
  .el-dialog__body {
    border-top: 1px solid #f1f1f5;
    border-bottom: 1px solid #f1f1f5;
    padding: 0 !important;
    margin: 0 !important;
    border-top: unset;
    .content {
      padding: 0 20px;
      color: #333;
      font-size: 12px;
      .content-title {
        padding-top: 20px;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        color: $--color-text-primary;
        padding-bottom: 24px;
      }
      .content-desc {
        color: #fc2020;
        line-height: 22px;
        font-weight: bold;
        margin-bottom: 6px;
      }
      dl {
        .bold,
        b {
          &,
          & span {
            font-weight: bold;
          }
        }
        dt {
          font-weight: bold;
          padding: 24px 0 16px;
        }
        dd {
          line-height: 22px;
        }
      }
    }
  }
}
</style>


