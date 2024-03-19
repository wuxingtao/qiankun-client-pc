<template>
  <el-form ref='addtionalFormRef' :class="['page-style1', isShowInDialog ? 'is-dialog' : '']" :model='formData' :rules='formRules' label-position='top' label-width='88px'>
    <section class='info-wrapper service-info'>
      <single-info-header :is-show-in-dialog='isShowInDialog' icon='icon-category-addtional' title='增值服务'>
        <dialog-addtional-description slot='common' :visible.sync='visibleAddtionalDescription' class='category-caption__tip'>
          (如需了解详情，可查看
          <span class='link' @click='toggleVisibleAddtionalDescription'>《增值服务指南》</span>)
        </dialog-addtional-description>

      </single-info-header>
      <el-row :gutter='20' type='flex' style='flex-wrap: wrap'>
        <el-col :span='6' style='position: relative'>

          <el-form-item prop='declaredValue' :error='errorMsgs.declaredValue' class='declared-value__item'>
            <div slot='label' class='declared-value__label'>
              <div>
                保价声明
                <i class='iconfont  iconfaq ' @click='showValuationStatement' />
              </div>
              <div @click='showValuationStatement'>保价说明</div>
            </div>
            <el-input v-model='formData.declaredValue' size='medium' clearable v-kyerestrict.positive maxlength='7' placeholder='请填写金额' @change='handleDeclaredValueChange' @focus='handleDeclaredValueFocus' />
            <tip-normal v-if='!errorMsgs.declaredValue && Number(formData.premium) > 0 && formData.payWay === "10"' :value='formData.declaredValue' :msg='`保费:${Number(formData.premium).toFixed(2)}(元)`' />
            <template v-if='Number(formData.declaredValue) <= 0'>
              <tip-normal v-if='formData.insuranceFeeType === 20' :msg='defaultDefaluteInsurancTip' />
              <div v-else-if='suggestions.declaredValue.tip' class='sugesstion-tip' @click="setSuggestionItemValue('declaredValue')">
                {{ suggestions.declaredValue.tip }}
                <i class='el-icon-circle-close' @click.stop="suggestions.declaredValue.tip = ''"></i>
              </div>
            </template>
          </el-form-item>
        </el-col>

        <el-col :span='6'>
          <el-form-item label='代收货款' prop='dsMoney'>
            <el-input v-model='formData.dsMoney' size='medium' clearable v-kyerestrict.currency :maxlength='9' max='999999.99' :placeholder="shareData.disabledCollectionPrice ? '该收件地址不支持代收货款' : '请填写金额'" @change='handleCollectionAmountChange' :disabled='shareData.disabledCollectionPrice' @clear="formData.dsCommission = ''"></el-input>
            <template v-if='!shareData.disabledCollectionPrice'>
              <tip-normal v-if='Number(formData.dsCommission) > 0 && Number(formData.dsMoney) <= 999999.99 && formData.payWay === "10"' :value='formData.dsMoney' :msg='`手续费:${Number(formData.dsCommission).toFixed(2)}(元)`' />
              <div v-else-if='suggestions.dsMoney.tip' class='sugesstion-tip' @click="setSuggestionItemValue('dsMoney')">
                {{ suggestions.dsMoney.tip }}
                <i class='el-icon-circle-close' @click.stop="suggestions.dsMoney.tip = ''"></i>
              </div>
            </template>
          </el-form-item>
        </el-col>
        <el-col :span='6'>
          <el-form-item label='包装服务' prop='mjWay' :class="['item-mj-way',mjWayValue.trim()?'have-value':'']">
            <el-tooltip :disabled='!!mjWayValue' content='如您已包装货物，无需选择' placement='bottom' effect='light' popper-class='mjway__tooltip-popper'>
              <el-select v-model='formData.mjWay' size='medium' clearable placeholder='请选择' popper-class='mjway__el-select-dropdown' @change="inputValueChange('mjWay')">
                <el-option v-for='item in $store.state.common.wrapOptions' :key='item.label' :label='item.label' :value='item.value'>
                  <mj-way-template :item='item' />
                </el-option>
              </el-select>
            </el-tooltip>
            <div v-if='mjWayValue.trim()' class='mj-way__tip'>选择包装服务后，我司将重新称重并收取一定的包装费</div>
            <div class='sugesstion-tip' v-if='suggestions.mjWay.tip' @click="setSuggestionItemValue('mjWay')">
              {{ suggestions.mjWay.tip }}
              <i class='el-icon-circle-close' @click.stop="suggestions.mjWay.tip = ''"></i>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span='6'>
          <el-form-item label='签回单' prop='hdCount' :class="['item-hd',visibleHdCount?'show-hd-count':'hide-hd-count']">
            <el-input v-model='eReceipt' size='medium' v-if="formData.receiptFlag==='40'" disabled />
            <template v-else>
              <el-select v-model='formData.receiptFlag' size='medium' clearable placeholder='请选择' @change='handleReceiptFlagChange'>
                <el-option v-for='item in $store.state.common.receiptOptions' :key='item.value' :label='item.label' :value='item.value'>
                </el-option>
              </el-select>
              <el-input class='item-hd-count' v-model='formData.hdCount' size='medium' v-if='visibleHdCount' placeholder='1~999' clearable :maxlength='3' v-kyerestrict.positiveNotZero>
                <template slot='append'>(份)</template>
              </el-input>
              <div class='sugesstion-tip' v-show='suggestions.hdCount.tip' @click="setSuggestionItemValue('hdCount')">
                {{ suggestions.hdCount.tip }}
                <i class='el-icon-circle-close' @click.stop="suggestions.hdCount.tip = ''"></i>
              </div>
            </template>
          </el-form-item>
        </el-col>
        <!-- v-show="customsChargeDescription" -->
        <el-col :span='isShowInDialog?24:8' v-show="customsChargeDescription">
          <el-form-item label=''>
            <el-checkbox class='chk-customs-charge' true-label="10" false-label="20" v-model='formData.checkedCustomsCharge' @change="handleCheckChange">
              报关入仓服务
            </el-checkbox>
            <!-- <p class="customs-tips" ></p> -->
            <div class="customs-tips" v-html="customsChargeDescription"></div>
          </el-form-item>
        </el-col>
      </el-row>
    </section>
    <declared-value-agreement :visible.sync='visibleDeclaredValueAgreement' />
    <!-- 不承保托寄物 -->
    <uncoverage-goods-agreement :visible.sync='visibleOfUncoveredGoods' />
    <dialog-single-declared-value ref='dialogSingleDeclaredValueRef' :formData='formData' @on-confirm='handleDeclaredValueChange' />
  </el-form>
</template>

<script>
import { ref, reactive, watch, computed, toRefs, onDeactivated } from '@vue/composition-api'
import UncoverageGoodsAgreement from '@comps/agreements/uncoverage-goods-agreement'
import DeclaredValueAgreement from '@comps/agreements/declared-value-agreement'
import TipNormal from '@/components/tip-normal'
import DialogSingleDeclaredValue from './dialog-single-declared-value'
import SingleInfoHeader from './single-info-header'
import DialogAddtionalDescription from './dialog-addtional-description/index'
import useSingleFee from '../hooks/useSingleFee'
import useSingleSuggestion from '../hooks/useSingleSuggestion'
import useSingleCommon from '../hooks/useSingleCommon'
import MjWayTemplate from './common/mj-way-template'
import * as storageUtil from '@/utils/storage'

export default {
  props: {
    tempShareData: { type: Object },
    tempFormData: { type: Object },
    isShowInDialog: {
      type: Boolean,
      default: false
    },
    errorMsgs: { type: Object }
  },
  components: {
    UncoverageGoodsAgreement,
    TipNormal,
    DeclaredValueAgreement,
    DialogSingleDeclaredValue,
    SingleInfoHeader,
    MjWayTemplate,
    DialogAddtionalDescription
  },
  setup (props, { emit, root }) {
    const addtionalFormRef = ref(null)
    const dialogSingleDeclaredValueRef = ref(null)
    const shareData = reactive(props.tempShareData)
    const formData = reactive(props.tempFormData)
    const msg = '如您未保价，将默认收取2元保价费，最高赔偿2000元'
    const state = reactive({
      visibleAddtionalDescription: false,
      visibleDeclaredValueAgreement: false,
      visibleOfUncoveredGoods: false,
      eReceipt: '电子回单',
      defaultDefaluteInsurancTip: msg,
      customsChargeInfo: {}, //报关入仓相关信息

    })
    const checkHdCount = async (rule, value, callback) => {
      if (formData.receiptFlag && value && (Number(value) || 0) < 1) {
        return callback(new Error('回单份数仅支持正整数'))
      }
      callback()
    }

    const checkDsMoney = async (rule, value, callback) => {
      if (value && (Number(value) || 0) <= 0) {
        return callback(new Error('代收货款只支持数字类型'))
      }
      if (value && Number(value) > 999999.99) {
        return callback(new Error('代收货款不能大于999999.99'))
      }
      callback()
    }
    const formRules = reactive({
      hdCount: [
        { required: false, message: '请输入回单份数', trigger: 'blur' },
        { validator: checkHdCount, trigger: 'blur' }
      ],
      dsMoney: [
        { validator: checkDsMoney, trigger: 'change' }
      ]
    })
    useSingleCommon({ formData, shareData, emit })
    const suggestions = computed(() => shareData.suggestions)

    watch(
      () => formData.receiptFlag,
      receiptFlag => {
        formRules.hdCount[0].required = ['10', '30'].includes(receiptFlag)
      },
      { immediate: true }
    )
    watch(
      () => shareData.disabledCollectionPrice,
      () => {
        formData.dsMoney = ''
        formData.dsCommission = ''
      }
    )

    watch(
      () => root.$store.state.delivery.currentDeliveryPage,
      (newVal, oldVal) => {
        if (newVal !== oldVal) {
          state.visibleAddtionalDescription = false
        }
      }
    )

    onDeactivated(() => {
      state.visibleAddtionalDescription = false
    })

    const visibleHdCount = computed(() => formData.receiptFlag && formData.receiptFlag !== '20')
    const mjWayValue = computed(() => formData?.mjWay || '')

    const { getServiceCharge, setFeeByField, setDefaultDeclaredValue } = useSingleFee({
      formData, shareData
    })
    const { setSuggestionItemValue } = useSingleSuggestion({
      formData, shareData
    })
    const handleDeclaredValueFocus = () => {
      if (storageUtil.getOrSetDeclaredValueFlag()) {
        return
      }
      showDeclaredValueDialog()
    }
    const showDeclaredValueDialog = () => {
      const ref = dialogSingleDeclaredValueRef.value
      ref.showDialog(formData)
    }

    const handleDeclaredValueChange = async result => {
      if (result.isFromDialog) {
        formData.declaredValue = result.declaredValue
        formData.premium = result.premium
      } else {
        formData.premium = await getServiceCharge('insuredFee', formData.declaredValue)
      }
      if ([0, '0'].includes(formData.declaredValue) || Number(formData.declaredValue) > 0) {
        formData.insuranceFeeType = ''
        formData.insuranceValueSource = '20'
      } else {
        await setDefaultDeclaredValue(true)
      }
      inputValueChange('declaredValue')
    }
    const handleCollectionAmountChange = async () => {
      inputValueChange('dsMoney')
      setFeeByField('dsMoney')
    }

    const handleReceiptFlagChange = () => {
      inputValueChange('receiptFlag')
      addtionalFormRef.value.clearValidate('hdCount')
      if (!['10', '30'].includes(formData.receiptFlag)) {
        formData.hdCount = ''
      }
    }

    const inputValueChange = fieldName => {
      if (fieldName === 'mjWay' && shareData.suggestions?.mjWay?.tip) {
        shareData.suggestions.mjWay.tip = ''
      }
      emit('addtionalInputValueChange', fieldName)
    }

    const toggleVisibleAddtionalDescription = () => {
      root.$reportUtils.clkExpressSingleButton({ button_name: '增值服务指南' })
      if (!state.visibleAddtionalDescription) {
        state.visibleAddtionalDescription = true
      }
    }

    const showValuationStatement = () => {
      root.$reportUtils.clkExpressSingleButton({ button_name: '保价说明' })
      state.visibleOfUncoveredGoods = true
    }

    const customsChargeDescription = computed(() => {
      let data = state.customsChargeInfo
      if (!data) {
        return ''
      }
      const replaceAmount = (text, amount) => {
        if (!text || !amount) {
          return text
        }
        const html = `<span style="color:#FF706D; font-size: 12px">${amount}</span>`
        return text.replace(new RegExp(amount, 'ig'), html)
      }
      if (formData.checkedCustomsCharge === '10') {
        return replaceAmount(data.fenceTips, data.totalAmount)
      }
      if (formData.checkedCustomsCharge === '20') {
        return replaceAmount(data.excTips, data.excTotalAmount)
      }
      return ''
    })

    const handleCheckChange = () => {
      inputValueChange('checkedCustomsCharge')
    }

    return {
      shareData,
      formData,
      addtionalFormRef,
      dialogSingleDeclaredValueRef,
      visibleHdCount,
      formRules,
      suggestions,
      setSuggestionItemValue,
      ...toRefs(state),

      inputValueChange,
      showDeclaredValueDialog,
      handleDeclaredValueFocus,
      handleDeclaredValueChange,
      handleCollectionAmountChange,
      handleReceiptFlagChange,
      mjWayValue,
      toggleVisibleAddtionalDescription,
      showValuationStatement,
      customsChargeDescription,
      handleCheckChange
    }
  }
}
</script>

<style lang='scss'>
  .mjway__tooltip-popper {
    transform: translateY(-6px);
  }
</style>
<style lang='scss' scoped>
  @import '../styles/single-common';

  .is-dialog {
    /deep/ .item-hd {
      // &.hide-hd-count {
      //   .el-form-item__content {
      //     & > .el-select {
      //       width: 100%;
      //     }
      //   }
      // }

      &.show-hd-count {
        .el-form-item__content {
          & > .el-select {
            width: 50%;
          }

          .el-form-item__error {
            min-width: 168px;
          }
        }
      }

      .item-hd-count {
        &.el-input {
          width: 50% !important;
        }

        // width: 97px !important;
        position: relative;

        .el-input__suffix {
          transform: translateX(-17px) !important;
        }

        .el-input-group__append {
          position: absolute;
          right: 19px;
          top: 8px;
        }
      }
    }
  }

  /deep/.service-info .item-hd {
    &.hide-hd-count {
      .el-form-item__content {
        & > .el-select {
          width: 100%;
        }
      }
    }
    .item-hd-count {
      input {
        padding-left: 12px !important;
      }
    }
  }
  .service-info {
    .category-caption {
      display: flex;
      align-items: center;

      .category-caption__tip {
        margin-left: 12px;
      }
    }

    .category-caption__tip {
      font-size: $--font-size-small;
      line-height: 1;
      color: #8f8fa8;

      .link {
        color: #8365f6;
        cursor: pointer;
      }
    }

    .declared-value__item {
      /deep/ .el-form-item__label {
        width: 100%;
      }

      .declared-value__label {
        display: flex;

        & > div:last-of-type {
          margin-left: auto;
          color: #8365f6;
          cursor: pointer;
        }

        .iconfaq {
          margin-left: 3px;
          color: #9598a7;
          font-size: 12px;
          cursor: pointer;
        }
      }
    }

    .item-hd {
      /deep/ {
        .el-form-item__content {
          // display: flex !important;
          // flex-wrap: wrap;
          & > .el-select {
            width: 50%;
          }

          & > .el-input {
            width: 50%;
          }

          & > .sugesstion-tip {
            // flex: 100%;
            bottom: -31px;
          }

          & > .el-form-item__error {
            width: 100%;
            transform: translateX(50%);
          }
        }
      }

      .input-remark {
        /deep/ .el-input__inner {
          padding-right: 80px;
        }
      }
    }

    .item-mj-way {
      &.have-value {
        margin-bottom: 40px;
      }

      .mj-way__tip {
        position: absolute;
        bottom: -34px;
        font-size: $--font-size-small;
        line-height: 16px;
        color: #ffa40d;
        min-width: 150px;
      }
    }
  }

  .customs-tips {
    font-size: 12px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: left;
    color: #666666;
    line-height: 14px;
    padding-left: 22px;
    word-wrap: break-word;
    word-break: break-all;
  }
  .chk-customs-charge {
    position: relative;
    top: -2px;
  }
</style>
