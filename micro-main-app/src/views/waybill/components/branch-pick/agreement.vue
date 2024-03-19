<template>
  <ky-dialog title='自提风险告知书
' class='terms-service dialog-2021' custom-class='admin-dialog' :visible.sync='visibleFlag'
             width='600px' append-to-body>
    <div class='page__content'>
      <p>与您通过本平台缔约的主体是跨越速运集团有限公司或其子公司、分公司、关联公司（以下简称：跨越速运），跨越速运为您提供货物自提服务。</p>
      <p>
        跨越速运承运单号为{{ waybillNumber }}的货物，因您选择、修改该批货物的派送方式为自提，无需跨越速运派送。请您在确认自提前认真阅读《自提风险告知书》，
        <b>如您点击“我已阅读并理解，同意自提”，视为您已阅读、完全理解并同意本告知书的内容。</b>
      </p>
      <p>
        1.若您在下单时选择自提，提货地址为离收件地址最近的跨越速运派送点部；若您在下单后修改为自提的，提货地址为离当前货物所在地址距离最近的跨越速运服务点部/分拨/中转场。具体提货地址以短信通知为准，如您对提货地址有疑问的，请联系您的专属市场或拨打95324。</p>
      <p>2.为了便于您自提，跨越速运在该货物到达提货地址后，向您指定的自提手机号发送提货信息，提货信息包括提货地址、提货联系人、提货验证码，短信转发或截图转发验证码均有效。</p>
      <p>3.
        <b>提货验证码作为提货的唯一凭证，请您妥善保存、谨慎转发。对自提货物，跨越速运仅识别提货验证码，任何持有验证码的人均有权提货，跨越速运不对提货人的身份进行校验，持有验证码即视为已被授权提货。（即认码不认人）</b>
      </p>
      <p>
        4.
        <b>您须告知提货人，在签收前应认真查验货物情况，验收时发现货物毁损、短少的，须跟现场人员确认并在运单上注明。货物经自提人签收后，跨越速运不再承担任何货损、丢失的赔偿责任。</b>
      </p>
      <p>
        5.如该货物需要签回单的，持有提货验证码的提货人在回单上的签名有效。
      </p>
      <p>
        6.<b>您选择自提后，跨越速运对以下情形不承担时效延误的责任：</b>
      </p>
      <p>
        1)<b>您或您指定的自提人未提货或未及时提货的；</b>
      </p>
      <p>2)<b>您自行修改或被其他有权修改的人员重新修改为跨越速运派送的。</b>
      </p>
      <p>7.若该货物运费支付方式为到付或有代收货款服务的，则您需先行支付运费或货款，或告知提货人在提货前支付运费或货款，并在提货时出示付款凭证，否则跨越速运有权拒绝交接货物。
      </p>
    </div>
    <div slot='footer' class='dialog-footer w_full text_right'>
      <el-button class='btn-i-know' size='medium' type='primary' @click='close'>我已阅读</el-button>
    </div>
  </ky-dialog>

</template>

<script>
import { defineComponent, reactive, toRefs, onMounted, watch } from "@vue/composition-api"


export default defineComponent({
  name: "agreement",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    waybillNumber: String
  },
  setup(props, { emit }) {
    const state = reactive({
      visibleFlag: false,
    })
    
    watch(() => props.visible, (val) => {
      state.visibleFlag = val
    })
    
    watch(() => state.visibleFlag, (val) => {
      emit("update:visible", val)
    })
    
    
    function close() {
      state.visibleFlag = false
    }
    
    return { ...toRefs(state), close }
  }
})
</script>

<style lang='scss' scoped>
.page__content {
  line-height: 2;
  color: #333;
  
  p {
    text-indent: 26px;
  }
  
  b {
    font-weight: bold;
  }
}
</style>
