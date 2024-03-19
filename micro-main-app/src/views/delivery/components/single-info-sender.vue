<template>
  <div class='single-sender--container page-style1'>
  <el-form ref='senderFormRef' :model='formData' :rules='formRules' label-position='top' label-width='88px'>
  <section class='info-wrapper sender-info'>
  <single-info-header :is-show-in-dialog='isShowInDialog' icon='icon-sender' title='寄方信息'>
    <div slot="title" class="title ellipsis">
      寄方信息
      <span class="title-tip">填写手机号更方便取货</span>
    </div>
    <template #default>
      <div class='address-book'>
        <el-button type='text' size='mini' @click='showParseAddressInfoRef'>
          <i class='iconfont icon-parse-address icon-btn' />
          智能填写
        </el-button>
        <el-button type='text' size='mini' @click='showAddressBook'>
          <i class='iconfont icon-address-book icon-btn' />从地址簿选择
        </el-button>
      </div>
    </template>
    <template #default-dialog>
      <slot name='dialog-sender-title'>
        <span class="title-tip">填写手机号更方便取货</span>
      </slot>
      
    </template>
    
    
  </single-info-header>
  <el-row :gutter='20'>
  <el-col :span='4'>
    <el-form-item label='寄件公司' prop='jjCompany' :error='errorMsgs.jjCompany'>
      <el-autocomplete popper-class='company-autocomplete' size='medium' :maxlength='32' clearable
                       :disabled='!canModifySenderCompany || !!shareData.waybillModifyStatus'
                       v-model='formData.jjCompany' :title='formData.jjCompany'
                       :fetch-suggestions='querySenderContactList' placeholder='请输入寄件公司' @select='setSenderInfo'
                       @change="inputValueChange('jjCompany')">
        <template slot-scope='{ item }'>
          <single-contact-template :item='item' />
        </template>
      </el-autocomplete>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='寄件人' prop='jjContactPerson' :error='errorMsgs.jjContactPerson'>
      <el-autocomplete popper-class='company-autocomplete' size='medium' :maxlength='20' clearable
                       v-model.trim='formData.jjContactPerson' :fetch-suggestions='querySenderContactList'
                       placeholder='请输入寄件人' @select='setSenderInfo' @change="inputValueChange('jjContactPerson')">
        <template slot-scope='{ item }'>
          <single-contact-template :item='item' />
        </template>
      </el-autocomplete>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='手机号码' prop='sms' class='sender-phone-wrap'>
      <el-input v-model='formData.sms' :title='formData.sms' size='medium' clearable :maxlength='11'
                placeholder='请输入手机号码'
                @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'sms')"></el-input>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='固定电话' prop='jjTelePhone'>
      <el-input v-model='formData.jjTelePhone' :title='formData.jjTelePhone' size='medium' clearable
                placeholder='请输入固定电话' :minlength='7' :maxlength='21'
                @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'jjTelePhone')"></el-input>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='退货仓' prop='sendHouseName' v-if='isWareHouseVisible'>
      <el-select v-model='formData.sendHouseName' size='medium' :disabled='shareData.returnWarehouseDisabled'
                 filterable clearable remote placeholder='请输入退货仓' value-key='warehouseNumber'
                 :remote-method='querySenderWareHouses' @change='selectSenderWareHouse'
                 @clear='selectSenderWareHouse(null)' @focus="querySenderWareHouses('')">
        <el-option v-for='(item, index) in returnWarehouseOptions' :key='index' :label='item.warehouseNumber'
                   :value='item'>
        </el-option>
      </el-select>
    </el-form-item>
  </el-col>
  <el-col :span='18' v-if='!isBatchFill'>
    <el-form-item prop='qhAddress' :error='errorMsgs.qhAddressRestrict || errorMsgs.qhAddress' :class="{'is-restrict':_addressRestrictErrorInfo.msg}">
      <template #label> 详细地址 <i class='asterisk-address'>*</i></template>
      <ky-address ref='qhAddressRef' addressType='10' :data='formData.qhAddressData'
                  :disabled='!!shareData.waybillModifyStatus' @change="inputValueChange('qhAddress')" />
      <tip-normal show-html v-if='!errorMsgs.qhAddress&&!errorMsgs.qhAddressRestrict' :value='formData.qhAddress'
                  :msg='warningMsgs.qhAddress || warningMsgs.qhAddressRestrict' />
      <single-address-tip :_addressRestrictWarningInfo.sync="_addressRestrictWarningInfo" :_addressRestrictErrorInfo="_addressRestrictErrorInfo"/>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='取货联系人' prop='qhContactPerson' :error='errorMsgs.qhContactPerson'>
      <el-input v-model='formData.qhContactPerson' size='medium' clearable :maxlength='20' placeholder='请输入取货联系人姓名'
                @change="inputValueChange('qhContactPerson')"></el-input>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='取货人手机' prop='qhContactWay'>
      <el-input v-model='formData.qhContactWay' :title='formData.qhContactWay' size='medium' clearable :maxlength='11'
                placeholder='请输入取货人手机'
                @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'qhContactWay')"></el-input>
    </el-form-item>
  </el-col>
  <el-col :span='4'>
    <el-form-item label='取货人电话' prop='qhTelePhone'>
      <el-input v-model='formData.qhTelePhone' :title='formData.qhTelePhone' size='medium' clearable
                placeholder='请输入取货人电话' :minlength='7' :maxlength='21'
                @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'qhTelePhone')"></el-input>
    </el-form-item>
  </el-col>
  
  <el-col :span='18' v-if='isBatchFill'>
    <el-form-item prop='qhAddress' :error='errorMsgs.qhAddressRestrict || errorMsgs.qhAddress' :class="{'is-restrict':_addressRestrictErrorInfo.msg}">
      <template #label> 详细地址 <i class='asterisk-address'>*</i></template>
      <ky-address ref='qhAddressRef' addressType='10' :data='formData.qhAddressData'
                  :disabled='!!shareData.waybillModifyStatus' @change="inputValueChange('qhAddress')" />
      <template v-if='!errorMsgs.qhAddress&&!errorMsgs.qhAddressRestrict'>
         <tip-normal show-html :value='formData.qhAddress'
                  :msg='warningMsgs.qhAddress || warningMsgs.qhAddressRestrict' />
      </template>
      <single-address-tip :_addressRestrictWarningInfo.sync="_addressRestrictWarningInfo" :_addressRestrictErrorInfo="_addressRestrictErrorInfo"/>
    </el-form-item>
  </el-col>
  
  <template v-if='!isBatchFill'>
    <el-col :span='8' v-if='deliveryTimeShow'>
      <el-form-item label='货好时间'>
        <delivery-time class='delivery-time-wrapper' ref='deliveryTimeRef' :tip='deliveryInfo.errorMsg'
                       @change='deliveryTimeChange' />
      </el-form-item>
    </el-col>
    <el-col :span='4' v-if='!isShowInDialog' style='float:right;padding:20px 10px 0 0 !important;text-align: right;'>
      <el-checkbox class='chk-save-address' v-model='formData.isSaveSenderInfo'>保存到地址簿</el-checkbox>
    </el-col>
  </template>
  </el-row>
  </section>
  </el-form>
  <dialog-address :visible.sync='visibleOfaddressBook' addressType='10' @on-confirm='setSenderInfo($event)' />
  <parse-address-info ref='parseAddressInfoRef' :callbackFunc='$event=>setSenderInfo($event,true)' />
  <dialog-sender-address-list ref='dialogSenderAddressListRef' />
  </div>
</template>

<script>
import { onMounted, ref, nextTick, reactive, watch, toRefs } from "@vue/composition-api"
import { mapGetters } from "vuex"

import { formatEmptyOfObject } from "@/utils/clientUtil"
import ParseAddressInfo from "./parse-address-info"
import DialogAddress from "@/views/address-book/components/dialog-address"
import TipNormal from "@/components/tip-normal"
import SingleInfoHeader from "./single-info-header"
import SingleContactTemplate from "./common/single-contact-template"
import DeliveryTime from "@/views/waybill/components/delivery-time/index2"
import { getPhone, getCustomerCode } from "@/utils/storage"

import deliveryUtil from "@/utils/deliveryUtil"
import useSingleSender from "../hooks/useSingleSender"
import useSingleContact from "../hooks/useSingleContact"
import useSingleWareHouse from "../hooks/useSingleWareHouse"
import useSingleValidate from "../hooks/useSingleValidate"
import useSingleCommon from "../hooks/useSingleCommon"
import useClipboard from "../hooks/useClipboard"
import useSingleAddress from "../hooks/useSingleAddress"
import DialogSenderAddressList from "./dialog-sender-address-list"
import { getNgihtFeeNew } from "@api/waybillOld"
import { debounce } from "lodash"
import SingleAddressTip from './single-address-tip'

export default {
  props: {
    isShowInDialog: { type: Boolean },
    isBatchFill: { type: Boolean },
    deliveryTimeShow: { type: Boolean },
    tempShareData: { type: Object },
    tempFormData: { type: Object }
  },
  components: {
    DialogAddress,
    TipNormal,
    ParseAddressInfo,
    SingleInfoHeader,
    DeliveryTime,
    SingleContactTemplate,
    DialogSenderAddressList,
    SingleAddressTip
  },
  data() {
    return {
      customerCode: getCustomerCode(),
      phone: getPhone(),
      visibleOfaddressBook: false
    }
  },
  setup(props, { emit, root }) {
    const shareData = reactive(props.tempShareData)
    const formData = reactive(props.tempFormData)
    const senderFormRef = ref(null)
    const qhAddressRef = ref(null)
    const deliveryTimeRef = ref(null)
    const dialogSenderAddressListRef = ref(null)
    const returnWarehouseOptions = ref([])
    const state = reactive({
      _addressRestrictWarningInfo:{},
      _addressRestrictErrorInfo:{}
    })
    const errorMsgs = reactive({
      qhAddressRestrict: "",
      qhAddress: "",
      jjCompany: "",
      jjContactPerson: "",
      qhContactPerson: ""
    })
    const warningMsgs = reactive({
      qhAddressRestrict: "",
      qhAddress: ""
    })
    // 货好时间数据
    const deliveryInfo = reactive({
      date: "",
      errorMsg: ""
    })
    const isWarehouseTriggerAddressChange = ref(false)
    const { formRules } = useSingleSender()
    useSingleCommon({ formData, shareData, emit })
    const { querySenderContactList, handlePhoneOnPaste } = useSingleContact({ vm: root, isSender: true })
    const { isWareHouseVisible, queryWareHouses, setSenderWareHouse } = useSingleWareHouse({
      vm: root,
      formData,
      shareData
    })
    const { validateFields } = useSingleValidate({
      formData,
      shareData
    })
    const { getValidtClipboardContent } = useClipboard({ root })
    const { validateAddressRestrict, setValidateAddressRestrictResult } = useSingleAddress()
    watch(
      () => formData.qhAddressData,
      data => {
        if (!data) {
          return
        }
        formData.qhAddress = data.districtList?.join("").trim() + data.detailAddress
      },
      { deep: true }
    )
    
    watch(() => props.deliveryTimeShow, flag => {
      nextTick(() => {
        if (flag) {
          deliveryTimeRef.value?.goodsBatchTimesInit({ dateTime: formData.goodsTime }, () => {
            deliveryTimeCheck()
          })
        }
      })
    })
    
    onMounted(async () => {
      root.$store.dispatch("common/setPayWayOptionsAction")
    })
    
    const validateForm = async () => {
      try {
        const addressValid = (await qhAddressRef.value.validateForm())
        let valid = await senderFormRef.value.validate()
        if (props.deliveryTimeShow) {
          valid = valid && (await deliveryTimeRef.value.validateForm())
        }
        return addressValid && valid
      } catch (ex) {
        console.log("ex :>> ", ex)
        return false
      }
    }
    
    const querySenderWareHouses = async queryString => {
      const result = await queryWareHouses(queryString)
      returnWarehouseOptions.value = result
    }
    
    const selectSenderWareHouse = async item => {
      setSenderWareHouse(item)
      if (!item) {
        return
      }
      isWarehouseTriggerAddressChange.value = true
      inputValueChange("qhAddress")
    }
    
    const resetData = () => {
      qhAddressRef.value.reset()
      Object.keys(errorMsgs).forEach(k => {
        errorMsgs[k] = ""
      })
      Object.keys(warningMsgs).forEach(k => {
        warningMsgs[k] = ""
      })
      state._addressRestrictWarningInfo = {}
      state._addressRestrictErrorInfo = {}
      returnWarehouseOptions.value = []
      nextTick(() => senderFormRef.value.clearValidate())
      deliveryInfo.errorMsg = ""
      deliveryTimeRef.value?.reset()
    }
    
    const setSenderInfo = async (item, isFromParseAddress) => {
      formatEmptyOfObject(item)
      if (root.$store.getters.canModifySenderCompany) {
        formData.jjCompany = item.company || formData.jjCompany
      }
      if (isFromParseAddress) {
        formData.jjContactPerson = item.contact || formData.jjContactPerson
        formData.qhContactPerson = item.contact || formData.qhContactPerson
        formData.sms = item.contactPhone || formData.sms
        formData.jjTelePhone = item.telephone || formData.jjTelePhone
      } else {
        formData.jjContactPerson = formData.qhContactPerson = item.contact
        formData.sms = item.contactPhone
        formData.jjTelePhone = item.telephone
      }
      formData.qhContactWay = formData.sms
      formData.qhTelePhone = formData.jjTelePhone
      
      if (!shareData.waybillModifyStatus) {
        let districtList = [root.$trim(item.province, "市"), item.city, item.area].filter(f => f)
        if (item.districtList?.length > 1) {
          districtList = item.districtList
        }
        formData.qhAddressData.districtList = districtList
        formData.qhAddressData.detailAddress = item.detailAddress
        formData.qhAddress = deliveryUtil.getFullAddress(formData, "qhAddress")
      }
      
      senderFormRef.value.validateField(["sms", "jjTelePhone"])
      const fields = ["jjCompany", "jjContactPerson", "qhContactPerson"]
      senderFormRef.value.validateField(fields)
      validateFields({ fields, errorMsgs })
      nextTick(() => inputValueChange("qhAddress"))
    }
    
    const validateSingleSenderAddressRestrict = async () => {
      if(!await qhAddressRef.value.checkAddressValid()){
        setValidateAddressRestrictResult(state,{})
        return
      }
      validateAddressRestrict(state,{qhAddress:formData.qhAddress})
    }

    const setSenderAddressRestrictResult = restrictResult => {
      setValidateAddressRestrictResult(state,restrictResult)
    }

    //debounce 处理输入寄件人后，再从下拉选项选择重复触发的问题
    const inputValueChange = debounce(async function(fieldName) {
      switch (fieldName) {
        case "qhAddress":
          if (!isWarehouseTriggerAddressChange.value) {
            selectSenderWareHouse(null)
          }
          isWarehouseTriggerAddressChange.value = false
          validateSingleSenderAddressRestrict()
          break
      }
      if (["jjCompany", "jjContactPerson", "qhContactPerson"].includes(fieldName)) {
        senderFormRef.value.validateField(fieldName, msg => {
          !msg && validateFields({ fields: fieldName, errorMsgs })
        })
      }
      emit("senderInfoInputValueChange", fieldName)
    }, 300)
    
    

    const getNightFee = debounce(async () => {
      if (!deliveryInfo.date) {
        return
      }
      const params = [{
        customerCode: getCustomerCode(),
        waybillNo: formData.ydNo, // 运单号或者唯一标识
        sendAddress: formData.qhAddress,
        calculationFeeTime: deliveryInfo.date // 计费时间
      }]
      try {
        let res = await getNgihtFeeNew(params)
        if (res.code === 0 && res.data) {
          const { nightPickupFlag, chargeStartTime, endChargeTime, nightPickupFee } = res.data[0].feeResponse
          if (nightPickupFlag === "10" && nightPickupFee) {
            const timeText = chargeStartTime && endChargeTime ? `${chargeStartTime}-${endChargeTime}` : `${chargeStartTime}后`
            deliveryInfo.errorMsg = `当前寄件地址(${timeText})取货会加收夜间取货费用，详情请联系商务经理`
          } else {
            deliveryInfo.errorMsg = ""
          }
        }
      } catch (e) {
        deliveryInfo.errorMsg = ""
      }
    }, 600)
    // 货好时间完整回调
    const deliveryTimeChange = async val => {
      deliveryInfo.date = val
      formData.goodsTime = val
      await deliveryTimeCheck()
    }
    // 货好时间是否调用夜间取货
    const deliveryTimeCheck = async () => {
      let valid = await deliveryTimeRef.value.validateForm()
      if (valid) {
        getNightFee()
      } else {
        deliveryInfo.errorMsg = ""
      }
    }
    // 换绑客户编码后校验寄件地址列表
    const checkSenderAddressList = async isFromBatchFill => {
      const { existInCache, content } = await getValidtClipboardContent()
      if (!existInCache && content) {
        return
      }
      const result = await dialogSenderAddressListRef.value.showDialog(isFromBatchFill)
      if (result) {
        setSenderInfo(result)
      }
    }
    // // 批量导入窗口初始化
    // const showBatchComp = () => {
    //   formData.goodsTime = dayjs().add(5, 'minute').format('YYYY-MM-DD HH:mm')
    //   nextTick(() => {
    //     deliveryTimeRef.value?.goodsBatchTimesInit({ dateTime: formData.goodsTime }, () => {
    //       deliveryTimeCheck()
    //     })
    //   })
    // }
    const parseAddressInfoRef = ref()
    const showParseAddressInfoRef = () => {
      if(props.isBatchFill) {
        root.$reportUtils.clkExpressBatchSubbuttonSub({ button_name: "寄方智能填写" })
      } else {
        root.$reportUtils.clkExpressSingleButton({ button_name: "寄方智能填写" })
      }
      
      parseAddressInfoRef.value.showDialog()
    }
    
    
    return {
      ...toRefs(state),
      shareData,
      formData,
      isWareHouseVisible,
      formRules,
      senderFormRef,
      qhAddressRef,
      deliveryTimeRef,
      dialogSenderAddressListRef,
      isWarehouseTriggerAddressChange,
      warningMsgs,
      errorMsgs,
      deliveryInfo,
      querySenderContactList,
      handlePhoneOnPaste,
      validateForm,
      returnWarehouseOptions,
      querySenderWareHouses,
      selectSenderWareHouse,
      resetData,
      setSenderInfo,
      
      inputValueChange,
      deliveryTimeChange,
      deliveryTimeCheck,
      checkSenderAddressList,
      
      parseAddressInfoRef,
      showParseAddressInfoRef,
      validateSingleSenderAddressRestrict,
      setSenderAddressRestrictResult
    }
  },
  
  computed: {
    ...mapGetters(["canModifySenderCompany"])
  },
  methods: {
    showAddressBook() {
      if(this.isBatchFill) {
        this.$reportUtils.clkExpressBatchSubbuttonSub({ button_name: "寄方从地址薄选择" })
      } else {
        this.$reportUtils.clkExpressSingleButton({ button_name: "寄方从地址薄选择" })
      }
      this.visibleOfaddressBook = true
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

.single-sender--container {
  .el-col {
    padding: 0 15px !important;
  }
  
  /deep/ {
    .icon-sender {
      color: #8365F6;
    }
  }
}

.delivery-time-wrapper {
  /deep/ {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}
</style>
