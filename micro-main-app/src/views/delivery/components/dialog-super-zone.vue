<template>
  <ky-dialog
    title="超区选项"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    width="700px"
    append-to-body
  >
    <div class="dialog-body">
      <div class="receiver-address"><span>收件地址：</span> {{ sjAddress }}</div>
      <div class="tip">
        该收件地址超出我司的派送范围外{{
          formatValue(superZoneInfo.length)
        }}km,请选择以下操作或咨询您的商务：
      </div>
      <div
        :class="['self-pickup-wrap', !isHomeDelivery ? 'active' : '']"
        @click="isHomeDelivery = false"
      >
        <div class="content">
          <div class="title">网点自提</div>
          <div>
            <div class="row">
              <span class="label">自提地址：</span>
              <span style="max-width: 428px; display: inline-block">{{
                superZoneInfo.selfLiftingAddress
              }}</span>
              <span
                class="copy-address"
                v-if="superZoneInfo.selfLiftingAddress"
                v-clipboard="superZoneInfo.selfLiftingAddress"
              >
                复制地址</span
              >
            </div>
          </div>
        </div>
        <el-radio v-model="isHomeDelivery" :label="false"><span></span></el-radio>
      </div>
      <div
        :class="['home-delivery-wrap', isHomeDelivery ? 'active' : '']"
        @click="isHomeDelivery = true"
      >
        <div class="content">
          <div class="title">送货上门<span>(需收取派送费)</span></div>
          <div>
            <div class="row">
              <span class="label">预估超区费：</span>
              <span v-if="formData.payWay !== '10'">
                按照付款公司报价计算，暂不支持查看
              </span>
              <template v-else>
                <span>{{ formatValue(superZoneInfo.superAreaFee) }} 元</span>
                <span class="label" style="padding-left: 50px">收费价格：</span>
              {{ superZoneInfo.superAreaUnitePrice }} 元/km
              </template>
            </div>
          </div>
        </div>
        <el-radio v-model="isHomeDelivery" size="medium" :label="true"><span></span></el-radio>
      </div>
      <div class="pickup-wrapper" v-show="!isHomeDelivery">
        <div class="label">自提人手机号</div>
        <el-input
          v-model="selfPickupMobile"
          size="medium"
          clearable
          :maxlength="11"
          placeholder="请您填写自提人手机号"
        ></el-input>
        <div class="tip">货物到达提货地址后，跨越速运会向您指定的自提手机号发送提货信息</div>
        <div>
          <el-checkbox v-model="isCheckAgreement">
            我已阅读并同意
          </el-checkbox>
          <span class="agreement" @click="visibleOfAgreement = true">《自提风险告知书》</span>
        </div>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="saveData" :loading="loading"> 保存</el-button>
    </span>
    <pickup-risk-agreement :visible.sync='visibleOfAgreement'/>
  </ky-dialog>
</template>

<script>
import numeral from 'numeral'
import Regular from '@utils/regular'
import PickupRiskAgreement from '@comps/agreements/pickup-risk-agreement'

export default {
  components:{
    PickupRiskAgreement
  },
  data() {
    return {
      loading: false,
      dialogVisible: false,
      isHomeDelivery: false, //是否送货上门
      sjAddress: '',
      superZoneInfo: {},
      resolveResult: Function,
      selfPickupMobile: '',
      isCheckAgreement: false,
      visibleOfAgreement:false,
      formData:{}
    }
  },
  methods: {
    formatValue(val) {
      return val ? numeral(val).format('0,0.00') : '0'
    },
    async showDialog(superZoneInfo, formData,isModify) {
      this.formData = formData
      const {sjAddress,sjMobile,deliveryMode,selfPickupMobile} = formData
      this.dialogVisible = true
      this.sjAddress = sjAddress
      this.selfPickupMobile = sjMobile
      this.superZoneInfo = superZoneInfo
      this.isCheckAgreement = false
      if(deliveryMode){
        this.isHomeDelivery = deliveryMode == 20
        this.selfPickupMobile = selfPickupMobile
        this.isCheckAgreement = !!isModify && !this.isHomeDelivery
      }
      return new Promise(resolve => {
        this.resolveResult = resolve
      })
    },
    checkForm(){
      if(this.isHomeDelivery){
        this.selfPickupMobile = ''
        return
      }
      if(!this.selfPickupMobile){
        return '请输入自提人手机号'
      }
      if(!Regular.mobilePhone.test(this.selfPickupMobile)){
        return '请输入正确手机号码'
      }
      if (!this.isCheckAgreement) {
        return '请先勾选我同意相关协议'
      }
    },
    async saveData() {
      try {
        const msg = this.checkForm()
        if (msg) {
          this.$message.warning(msg)
          return
        }
        this.loading = true
        const deliveryMode = this.isHomeDelivery ? '20' : '10'
        this.resolveResult && this.resolveResult({ deliveryMode, selfPickupMobile: this.selfPickupMobile})
        this.dialogVisible = false
      } catch (ex) {
        console.log('ex :>> ', ex)
      } finally {
        this.loading = false
      }
    }
  },
  watch: {
    dialogVisible(val) {
      if (!val) {
        this.resolveResult && this.resolveResult(false)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/.el-dialog__body {
  padding-bottom: 24px;
}
.dialog-body {
  color: #333333;
  font-size: 14px;
  .receiver-address {
    display: flex;
    align-items: center;
    padding-left: 20px;
    height: 54px;
    border-radius: 4px;
    color: #03050d;
    font-size: 14px;
    background: url('~@/assets/image/delivery/super-zone-bg2.png') no-repeat;
    background-color: #fdfcff;
    background-position-x: right;
    & > span {
      color: #666666;
    }
  }
  .tip {
    font-size: 14px;
    color: #03050d;
    margin: 20px 0 9px;
  }
  .self-pickup-wrap {
    margin-bottom: 12px;
  }
  [class*='-wrap'] {
    display: flex;
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    padding: 20px 18px 20px 20px;
    background: url('~@/assets/image/delivery/super-zone-bg1.png') no-repeat;
    background-position-x: right;
    &.active {
      border: 2px solid #8365f6;
      background-color: #f4f0ff;
      /deep/ {
        .el-radio__inner {
          border: none;
        }
      }
    }
  }

  .content {
    .title {
      font-size: 16px;
      font-weight: bold;
      color: #03050d;
      padding-bottom: 12px;
      & > span {
        padding-left: 8px;
        font-size: 14px;
        color: #999999;
      }
    }
    .row {
      color: #03050d;
      line-height: 20px;
      display: flex;
      .copy-address {
        vertical-align: top;
        padding-left: 17px;
        position: relative;
        color: #9a5fff;
        cursor: pointer;
        &::before {
          content: '';
          display: block;
          width: 1px;
          height: 12px;
          background: #d8d8d8;
          position: absolute;
          left: 7px;
          top: 2px;
        }
      }
    }
    .label {
      color: #666666;
      vertical-align: top;
    }
  }
  .el-radio {
    margin-left: auto;
    display: flex;
    align-items: center;
    /deep/ {
      .el-radio__inner {
        height: 24px;
        width: 24px;
        box-sizing: border-box;
        border: 2px solid #666666;
      }
      .el-radio__input.is-checked .el-radio__inner {
        &::after {
          content: '';
          width: 10px;
          height: 5px;
          border: 2px solid white;
          border-top: transparent;
          border-right: transparent;
          text-align: center;
          display: block;
          position: absolute;
          top: 7px;
          left: 6px;
          transform: rotate(-45deg);
          border-radius: 0px;
          background: none;
        }
      }
    }
  }
  .pickup-wrapper {
    display: block;
    padding: 16px;
    margin-top: 20px;
    background: #f8f8f8;
    border-radius: 4px;
    border: none;
    .label {
      color: $--color-text-primary;
      font-weight: bold;
      margin-bottom: 12px;
    }
    .el-input{
      width: 375px;
    }
    .tip {
      color: #8f8fa8;
      font-size: $--font-size-small;
      margin: 8px 0 12px;
    }
    .el-checkbox {
      font-size: $--font-size-small;
      color: $--color-text-regular;
    }
     .agreement {
        color: $--color-primary;
        cursor: pointer;
      }
  }
}
</style>
