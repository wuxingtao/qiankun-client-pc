<template>
  <div class='single-receiver--container page-style1'>
  <el-form ref='receiverFormRef' :model='formData' :rules='formRules' label-position='top' label-width='88px'>
  <section class='info-wrapper receiver-info'>
  <single-info-header :is-show-in-dialog='isShowInDialog' icon='icon-receiver' title='收方信息'>
    <template #title>
      <div class='title ellipsis'>
        收方信息
        <span class="title-tip">填写手机号更方便派货</span>
      </div>
    </template>
    <span slot="default-dialog" class="title-tip">填写手机号更方便派货</span>
    <template #default>
      <div class='address-book'>
        <el-button type='text' size='mini' @click='showParseAddressInfoRef'>
          <i class='iconfont icon-parse-address icon-btn' />智能填写
        </el-button>
        <el-button type='text' size='mini' @click='showAddressBook'>
          <i class='iconfont icon-address-book icon-btn' />从地址簿选择
        </el-button>
      </div>
    </template>
  </single-info-header>
  <el-row :gutter='20'>
    <el-col :span='4' class='sjCompany-style'>
      <el-form-item label='收件公司' prop='sjCompany' :error='errorMsgs.sjCompany'>
        <el-autocomplete popper-class='company-autocomplete' size='medium' :maxlength='32' clearable
                         ref='sjCompanyInputRef' v-model='formData.sjCompany' :title='formData.sjCompany'
                         :fetch-suggestions='queryReceiverContactList' placeholder='请输入收件公司'
                         @select='setReceiverInfo' @clear='$refs.sjCompanyInputRef.focus()'
                         @blur="inputValueChange('sjCompany')">
          <template slot-scope='{ item }'>
            <single-contact-template :item='item' />
          </template>
        </el-autocomplete>
      </el-form-item>
      <div class='sjCompany-style__warn' v-if='receiverAttentionArr.length > 0'>
        <span class='text'>收货注意</span>
        <el-popover placement='right-start' title='收货注意' width='230' v-model='visibleSjCompany'
                    popper-class='sjCompany-popper' trigger='hover'>
          <i slot='reference' class='iconfont iconcoupon-issue'></i>
          <div class='receiverAttentionArr' v-for='(item, index) in receiverAttentionArr' :key='index'>
            <span>{{ index + 1 }}. {{ item }}</span>
          </div>
        </el-popover>
      </div>
    </el-col>
    <el-col :span='4'>
      <el-form-item label='收件人' prop='sjContactPerson' :error='errorMsgs.sjContactPerson'>
        <el-autocomplete popper-class='company-autocomplete' size='medium' :maxlength='20' clearable
                         v-model.trim='formData.sjContactPerson' :fetch-suggestions='queryReceiverContactList'
                         placeholder='请输入收件人' @select='setReceiverInfo'
                         @change="inputValueChange('sjContactPerson')">
          <template slot-scope='{ item }'>
            <single-contact-template :item='item' />
          </template>
        </el-autocomplete>
      </el-form-item>
    </el-col>
    <el-col :span='4'>
      <el-form-item label='手机号码' prop='sjMobile'>
        <el-input v-model='formData.sjMobile' :title='formData.sjMobile' size='medium' clearable :maxlength='11'
                  :placeholder="formData.isSignSelf?'请输入手机号码':'手机 / 座机二选一'"
                  @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'sjMobile')"
                  @change="inputValueChange('sjMobile')"></el-input>
      </el-form-item>
    </el-col>
    <el-col :span='4'>
      <el-form-item label='固定电话' prop='sjTelephone'>
        <el-input v-model='formData.sjTelephone' :title='formData.sjTelephone' size='medium' clearable minlength='7'
                  :maxlength='21' :placeholder="formData.isSignSelf?'请输入固定电话':'手机 / 座机二选一'"
                  @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'sjTelephone')"
                  @change="inputValueChange('sjTelephone')"></el-input>
      </el-form-item>
    </el-col>
  </el-row>
  
  <el-row :gutter='20'>
    <el-col :span='18'>
      <el-form-item prop='sjAddress' :error='errorMsgs.sjAddressRestrict || errorMsgs.sjAddress' :class="{'is-restrict':_addressRestrictErrorInfo.msg}">
        <template #label> 详细地址 <i class='asterisk-address'>*</i></template>
        <ky-address ref='sjAddressRef' :data='formData.sjAddressData' addressType='20'
                    :disabled="shareData.waybillModifyStatus === '30'" @change="inputValueChange('sjAddress')" />
        <template v-if='!errorMsgs.sjAddress && !errorMsgs.sjAddressRestrict'>
        <single-address-tip :_addressRestrictWarningInfo.sync="_addressRestrictWarningInfo" :_addressRestrictErrorInfo="_addressRestrictErrorInfo"/> 
        <tip-normal show-html 
                    :value='formData.sjAddress' :msg='warningMsgs.sjAddress || warningMsgs.sjAddressRestrict' />
                    
        </template>
      </el-form-item>
    </el-col>
  </el-row>
  <el-row :gutter='20' v-if='!isShowInDialog || $store.getters.isSignBySelf'
          :style="!isShowInDialog ? 'float:right;padding-top:20px' : 'padding-bottom:16px'">
    <el-col :span='12' class='signbyself-wrap' v-if='$store.getters.isSignBySelf'>
      <el-checkbox v-model='formData.isSignSelf' @change='changeOfSignSelf'>
        需本人签收
        <div class='tip'>(勾选后收件人手机为必填)</div>
      </el-checkbox>
    </el-col>
    <el-col :span='4' v-if='!isShowInDialog'>
      <el-checkbox class='chk-save-address' v-model='formData.isSaveReceiverInfo'>保存到地址簿</el-checkbox>
    </el-col>
  </el-row>
  </section>
  </el-form>
  <dialog-address :visible.sync='visibleOfaddressBook' addressType='20' @on-confirm='setReceiverInfo($event)' />
  <parse-address-info ref='parseAddressInfoRef' :callbackFunc='$event=>setReceiverInfo($event,true)' />
  <dialog-clipboard-native ref='dialogClipboardNativeRef' :callbackFunc='$event=>setReceiverInfo($event,true)' />
  </div>
</template>

<script>
import { debounce } from "lodash"
import { reactive, ref, nextTick, watch, onActivated, onMounted, toRefs } from "@vue/composition-api"
import deliveryApi from "@api/delivery"
import deliveryUtil from "@/utils/deliveryUtil"
import * as clientUtil from "@/utils/clientUtil"

import ParseAddressInfo from "./parse-address-info"
import TipNormal from "@/components/tip-normal"
import DialogAddress from "@/views/address-book/components/dialog-address"
import SingleInfoHeader from "./single-info-header"

import useSingleReceiver from "../hooks/useSingleReceiver"
import useSingleValidate from "../hooks/useSingleValidate"
import useSingleContact from "../hooks/useSingleContact"
import useSingleCommon from "../hooks/useSingleCommon"
import useSingleAddress from "../hooks/useSingleAddress"
import DialogClipboardNative from "./dialog-clipboard-native"
import SingleContactTemplate from "./common/single-contact-template"
import SingleAddressTip from './single-address-tip'

export default {
  props: {
    tempShareData: { type: Object },
    tempFormData: { type: Object },
    isShowInDialog: {
      type: Boolean,
      default: false
    }
  },
  components: {
    ParseAddressInfo,
    DialogAddress,
    TipNormal,
    SingleInfoHeader,
    DialogClipboardNative,
    SingleContactTemplate,
    SingleAddressTip
  },
  setup(props, { emit, root }) {
    const shareData = reactive(props.tempShareData)
    const formData = reactive(props.tempFormData)
    const receiverFormRef = ref(null)
    const sjAddressRef = ref(null)
    // const receiverWarehouseOptions = ref([])
    const visibleOfaddressBook = ref(false)
    const dialogClipboardNativeRef = ref(null)
    const sjCompanyInputRef = ref(null)
    const state = reactive({
      _addressRestrictWarningInfo:{},
      _addressRestrictErrorInfo:{}
    })
    const errorMsgs = reactive({
      sjAddressRestrict: "",
      sjAddress: "",
      sjCompany: "",
      sjContactPerson: ""
    })
    const receiverAttentionArr = ref([])
    const warningMsgs = reactive({
      sjAddressRestrict: "",
      sjAddress: ""
    })
    useSingleCommon({ formData, shareData, emit })
    const { formRules } = useSingleReceiver({ formData, receiverFormRef })
    const { queryReceiverContactList, handlePhoneOnPaste } = useSingleContact({ vm: root, isReceriver: true })
    const { validateFields } = useSingleValidate({
      formData, shareData
    })
    const { validateAddressRestrict, setValidateAddressRestrictResult } = useSingleAddress()
    onMounted(() => {
      readClipboardContent()
    })
    onActivated(() => {
      readClipboardContent()
    })
    const readClipboardContent = debounce(function() {
      const tabName = root.$store.state.delivery.deliveryActiveTab
      if (tabName !== "single") {
        return
      }
      dialogClipboardNativeRef.value.readClipboardContent()
    }, 300)
    
    watch(
      () => formData.sjAddressData,
      data => {
        if (!data) {
          return
        }
        const districtText = data.districtList?.join("").trim() || ""
        formData.sjAddress = districtText + data.detailAddress
      },
      { deep: true }
    )
    
    const resetData = () => {
      sjAddressRef.value.reset()
      receiverAttentionArr.value = []
      Object.keys(errorMsgs).forEach(k => {
        errorMsgs[k] = ""
      })
      Object.keys(warningMsgs).forEach(k => {
        warningMsgs[k] = ""
      })
      state._addressRestrictWarningInfo = {}
      state._addressRestrictErrorInfo = {}
      nextTick(() => receiverFormRef.value.clearValidate())
    }
    
    const validateForm = async () => {
      try {
        let addressValid = (await sjAddressRef.value.validateForm())
        let valid = await receiverFormRef.value.validate()
        return valid && addressValid
      } catch (ex) {
        return false
      }
    }
    
    const changeOfReceiverCompany = async () => {
      const res = await deliveryApi.getReceiverAttention(formData.sjCompany)
      receiverAttentionArr.value = []
      if (res.code === 0 && res.data.length > 0) {
        const resArry =
          res.data &&
          res.data.map(i => (i.lookFlag === "10" ? i.receiveAttention : "")).filter(i => i)
        receiverAttentionArr.value = resArry
      }
    }
    
    const setReceiverInfo = async (item, isFromParseAddress) => {
      clientUtil.formatEmptyOfObject(item)
      if (isFromParseAddress) {
        formData.sjContactPerson = item.contact || formData.sjContactPerson
        formData.sjMobile = item.contactPhone || formData.sjMobile
        formData.sjTelephone = item.telephone || formData.sjTelephone
      } else {
        formData.sjCompany = item.company
        formData.sjContactPerson = item.contact
        formData.sjMobile = item.contactPhone
        formData.sjTelephone = item.telephone
      }
      
      if (shareData.waybillModifyStatus !== "30") {
        let districtList = [root.$trim(item.province, "市"), item.city, item.area].filter(f => f)
        if (item.districtList?.length > 1) {
          districtList = item.districtList
        }
        formData.sjAddressData.districtList = districtList
        formData.sjAddressData.detailAddress = item.detailAddress
        formData.sjAddress = deliveryUtil.getFullAddress(formData, "sjAddress")
      }
      receiverFormRef.value.validateField(["sjMobile", "sjTelephone"])
      const fields = ["sjContactPerson"] //'sjCompany',
      receiverFormRef.value.validateField(fields)
      validateFields({ fields, errorMsgs })
      changeOfReceiverCompany()
      inputValueChange("sjAddress", ["sjMobile"])
    }

    const setReceiverAddressRestrictResult = restrictResult => {
      setValidateAddressRestrictResult(state,restrictResult)
    }
    
    //debounce 处理输入收件人后，再从下拉选项选择重复触发的问题
    const inputValueChange = debounce(async function(fieldName, fields) {
      switch (fieldName) {
        case "sjCompany":
          changeOfReceiverCompany(fieldName)
          break
        case "sjAddress":
          if(!await sjAddressRef.value.checkAddressValid()){
            setValidateAddressRestrictResult(state,{})
            return
          }
          validateAddressRestrict(state,{sjAddress:formData.sjAddress})
          break
      }
      if (["sjContactPerson"].includes(fieldName)) {//'sjCompany',
        receiverFormRef.value.validateField(fieldName, msg => {
          !msg && validateFields({ fields: fieldName, errorMsgs })
        })
      }
      emit("receiverInfoInputValueChange", fieldName, fields)
    }, 300)
    
    const changeOfSignSelf = flag => {
      if (flag && !formData.sjMobile) {
        root.$message.info("勾选本人签收后，收件人手机号需必填")
      }
    }
    watch(
      () => formData.isSignSelf,
      flag => {
        formRules.sjMobile[0].required = flag
        receiverFormRef?.value?.clearValidate(["sjMobile"])
      },
      { immediate: true }
    )
    
    
    const parseAddressInfoRef = ref()
    const showParseAddressInfoRef = () => {
      root.$reportUtils.clkExpressSingleButton({ button_name: "收方智能填写" })
      parseAddressInfoRef.value.showDialog()
    }
    
    const showAddressBook = () => {
      root.$reportUtils.clkExpressSingleButton({ button_name: "收方从地址薄选择" })
      visibleOfaddressBook.value = true
    }
    
    
    return {
      ...toRefs(state),
      shareData,
      formData,
      formRules,
      visibleOfaddressBook,
      resetData,
      warningMsgs,
      inputValueChange,
      receiverFormRef,
      sjAddressRef,
      dialogClipboardNativeRef,
      sjCompanyInputRef,
      errorMsgs,
      
      queryReceiverContactList,
      handlePhoneOnPaste,
      validateForm,
      
      changeOfReceiverCompany,
      setReceiverInfo,
      visibleSjCompany: false, // 收方注意气泡
      receiverAttentionArr,
      changeOfSignSelf,
      
      parseAddressInfoRef,
      showParseAddressInfoRef,
      showAddressBook,
      setReceiverAddressRestrictResult
    }
  }
}
</script>

<style lang='scss'>
.el-autocomplete-suggestion.company-autocomplete {
  width: 296px !important;
  
  .el-scrollbar {
    max-height: 190px;
    
    .el-autocomplete-suggestion__wrap {
      max-height: 190px;
    }
  }
}
</style>
<style lang='scss' scoped>
@import '../styles/single-common.scss';

.single-receiver--container {
  padding: 0;
  background-color: #fff;
  
  /deep/ {
    .icon-receiver {
      color: #ff8c5d;
    }
  }
  
  .receiver-info {
    .el-col-4 {
      width: 25%;
    }
    
    .signbyself-wrap {
      position: relative;
      top: -2px;
      margin-right: 20px;
      
      .tip {
        display: inline-block;
        color: #aaaaaa;
      }
    }
    
    .chk-save-address {
      position: relative;
      top: -2px;
      margin-bottom: 15px;
    }
  }
  
  .chk-save-address {
    position: relative;
    top: -2px;
    margin-bottom: 15px;
  }
  
  .sjCompany-style {
    position: relative;
    
    &__warn {
      position: absolute;
      top: 0;
      right: 20px;
      font-size: $--font-size-small;
      font-weight: 400;
      color: #ff8038;
      
      i {
        font-size: $--font-size-small;
        color: #9fa1b0;
        cursor: pointer;
      }
    }
  }
}
</style>

<style lang='scss'>
.sjCompany-popper {
  height: 200px;
  overflow-y: scroll;
  
  .el-popover__title {
    padding-left: 0;
    font-size: $--font-size-small;
    font-weight: 600;
    color: #03050d;
  }
  
  .receiverAttentionArr {
    display: flex;
    font-size: $--font-size-small;
    font-weight: 400;
    color: #03050d;
    line-height: 18px;
    text-align: justify;
    word-break: break-all;
    
    span {
      &:nth-child(1) {
        display: flex;
      }
    }
  }
}
</style>
