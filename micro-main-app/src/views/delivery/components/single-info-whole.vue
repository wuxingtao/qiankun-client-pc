<template>
  <div class='single-info-whole--container' :class="[{'add':!isModify&&visibleOfSender},{'is-dialog':isShowInDialog}]">
    <div class='notices'>
      <notice-item v-show='shareData.visibleOfOpenBoxTip' @on-close='shareData.visibleOfOpenBoxTip=false'>
        <span>{{ openBoxTip }}</span>
      </notice-item>
    </div>

    <div class='sender-receiver--wrapper' :class="{'add':!isModify&&visibleOfSender}">
      <single-info-sender ref='singleInfoSenderRef' v-if='visibleOfSender' :tempShareData.sync='shareData' :tempFormData.sync='formData' :isShowInDialog='isShowInDialog' :deliveryTimeShow='deliveryTimeShow' @senderInfoInputValueChange='(fieldName)=>inputValueChange(fieldName)'>
        <template #dialog-sender-title>
          <slot name='dialog-sender-title'></slot>
        </template>
      </single-info-sender>

      <single-info-receiver ref='singleInfoReceiverRef' :tempFormData.sync='formData' :tempShareData.sync='shareData' :isShowInDialog='isShowInDialog' @receiverInfoInputValueChange='(fieldName)=>inputValueChange(fieldName)' />
    </div>
    <single-info-base-addtional ref='singleInfoBaseAddtionalRef' :tempFormData.sync='formData' :tempShareData.sync='shareData' :isShowInDialog='isShowInDialog' :isModify='isModify' :customFieldInfos='customFieldInfos' @baseInfoInputValueChange='(fieldName)=>inputValueChange(fieldName)' :disabledFields='disabledFields' />

    <single-info-coupon ref='singleInfoCouponRef' :formData='formData' :shareData='shareData' :isShowInDialog='isShowInDialog' v-if='visibleOfCoupon' />

    <single-info-remarks ref='singleInfoRemarksRef' v-bind='$attrs' :tempFormData.sync='formData' :tempShareData.sync='shareData' :isShowInDialog='isShowInDialog' :showGuide='!isModify' />
    <dialog-super-zone ref='dialogSuperZoneRef' />
    <adjust-price-notice ref="adjustPriceNoticeRef" />
    <dialog-address-restrict ref='dialogAddressRestrictRef' />
    <declare-ware ref="declareWareRef" />
  </div>
</template>

<script>
import { computed, ref, nextTick, reactive, watch, toRefs } from '@vue/composition-api'
import SingleInfoSender from './single-info-sender'
import SingleInfoReceiver from './single-info-receiver'
import SingleInfoBaseAddtional from './single-info-base-addtional'
import SingleInfoCoupon from './single-info-coupon'
import SingleInfoRemarks from './single-info-remarks'
import DialogSuperZone from './dialog-super-zone'
import AdjustPriceNotice from '../adjust-price/adjust-price-notice'

import NoticeItem from '@/components/NoticeItem'
import customColumnUtil from '@utils/customColumn'
import * as clientUtil from '@/utils/clientUtil'
import * as formDataUtil from '../utils/formData'
import * as storageUtil from '@/utils/storage'
// import * as permissionApi from '@api/permission'
import deliveryApi from '@api/delivery'
import deliveryUtil from '@/utils/deliveryUtil'
import defaultConfigUtil from '../utils/defaultConfigUtil'
import useSingleCommon from '../hooks/useSingleCommon'
import useSingleWhole from '../hooks/useSingleWhole'
import useSingleWholeMsg from '../hooks/useSingleWholeMsg'
import useSingleFee from '../hooks/useSingleFee'
import useSingleSender from '../hooks/useSingleSender'
import DialogAddressRestrict from './dialog-address-restrict'
import DeclareWare from '@views/waybill/components/declare-ware/index.vue'
import wareHouseUtil from '@/utils/wareHouseUtil'
import wareHouseApi from '@api/wareHouseApi'

export default {
  components: {
    SingleInfoSender,
    SingleInfoReceiver,
    SingleInfoBaseAddtional,
    SingleInfoCoupon,
    SingleInfoRemarks,
    DialogSuperZone,
    NoticeItem,
    AdjustPriceNotice,
    DialogAddressRestrict,
    DeclareWare
    // SingleFillRecord
  },
  props: {
    tempShareData: { type: Object },
    tempFormData: { type: Object },
    //批量填写新增收方时使用
    visibleOfSender: {
      type: Boolean,
      default: true
    },
    visibleOfCoupon: {
      type: Boolean,
      default: true
    },
    isModify: {
      type: Boolean,
      default: false
    },
    ydNo: {
      type: String
    },
    needWareCheck:{
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      openBoxTip: '警告：请确保您运单上填写的托寄物与内件物品一致，否则被查到为航空违禁品造成退货、扣款、罚款等责任将全部由您承担'
    }
  },
  setup (props, { emit, root }) {
    const shareData = reactive(props.tempShareData)
    const formData = reactive(props.tempFormData)
    const singleInfoSenderRef = ref(null)
    const singleInfoReceiverRef = ref(null)
    const singleInfoBaseAddtionalRef = ref(null)
    const singleInfoRemarksRef = ref(null)
    const singleInfoCouponRef = ref(null)
    const dialogSuperZoneRef = ref(null)
    const adjustPriceNoticeRef = ref(null)
    const dialogAddressRestrictRef = ref(null)
    const disabledFields = ref({})
    const deliveryTimeShow = ref(false) // 是否显示修改运单-货好时间
    const declareWareRef = ref(null)
    const isShowInDialog = computed(() => !props.visibleOfSender || props.isModify)
    const estimateFreightFields = ['sjAddress', 'qhAddress', 'payWay', 'payAccount', 'serviceWay', 'weight', 'count', 'sizeList', 'declaredValue', 'dsMoney', 'receiptFlag', 'mjWay','checkedCustomsCharge']
    const state = reactive({
      customFieldInfos: null
    })

    useSingleCommon({ formData, shareData, emit })
    const {
      getModel,
      setWaybillNo,
      resetAddressErrorAndWaningMsg,
      setAddressRestrictMsgs,
      setAddressValidateResultTip,
      setGoodsInfoValidateResultTip,
      setdCollectionPriceDisableStatus
    } = useSingleWhole({
      vm: root, formData, shareData,
      singleInfoSenderRef, singleInfoReceiverRef, singleInfoBaseAddtionalRef
    })
    const {
      displayErrorAndWarningInfoByTableRow,
      setTableRowErrorAndWarningInfo,
      setErrorAndWarningMsgsByValidteData
    } = useSingleWholeMsg({
      singleInfoSenderRef,
      singleInfoReceiverRef,
      singleInfoBaseAddtionalRef,
      singleInfoRemarksRef
    })

    const { setInsuredAndCollectionFee, setDefaultDeclaredValue, setFeeByField } = useSingleFee({
      formData, shareData
    })
    const { validateSenderAddressRestrict } = useSingleSender()
    watch(() => props.tempFormData, data => {
      Object.assign(formData, data)
    })
    watch(() => props.shareData, data => {
      Object.assign(shareData, data)
    })

    //修改或再来一单时校验全部字段
    const validateAllFields = async (model, ignorePayCustomNameChange) => {
      const params = deliveryUtil.convertFormDataListToApiParams(model)
      validateAddressRestrict(model)
      const res = await deliveryApi.validateWaybillFieldBySingle(1, params)
      if (!res?.data?.verifyDataResponses || !res.data.verifyDataResponses[0]) {
        return
      }
      const result = res.data.verifyDataResponses[0]
      model.delayTime = result?.businessData?.delayTime
      nextTick(() => setPayCompany(result, true, true, ignorePayCustomNameChange))
      setdCollectionPriceDisableStatus(result)
      await setErrorAndWarningMsgsByValidteData(result)
    }

    const validateAddressRestrict = async model => {
      const result = await deliveryApi.getAddressRestrictMessagesByModify(model)
      if(!result){
        return
      }
      if(result?.qhAddressResult){
        singleInfoSenderRef.value.setSenderAddressRestrictResult(result.qhAddressResult)
        // setValidateAddressRestrictResult(state,result.qhAddressResult)
      }
      if(result?.sjAddressResult){
        singleInfoReceiverRef.value.setReceiverAddressRestrictResult(result.sjAddressResult)
        // setValidateAddressRestrictResult(state,result.sjAddressResult)
      }
    }

    const getWaybillByWaybillNumber = async () => {
      const isCopy = root.$route.params?.isCopy
      let ydNo = ''
      if (props.isModify) {
        ydNo = props.ydNo
      } else if (isCopy) {
        ydNo = root.$route.params.ydNo
      }
      if (!ydNo || (!props.isModify && !isCopy)) {
        return
      }
      const res = await deliveryApi.queryWaybillByWaybillNumber(ydNo, props.isModify)
      if (res.code !== 0) {
        return
      }
      // console.log(res, '接口返回运单数据')
      deliveryTimeShow.value = false
      const resData = res.data
      const model = deliveryUtil.convertWaybillDetaillToFormData(resData, isCopy)
      model.waybillParentInden = resData.waybillParentInden
      if (props.isModify) {
        state.customFieldInfos = model.customFieldInfos
        setTimeout(() => {
          const customFields = singleInfoBaseAddtionalRef.value.customFields
          customColumnUtil.assignWaybillDataToFormData(formData, resData, customFields)
        }, 1000)
        const originalCustomColumns = root.$store.getters.customOriginalFields
        const flag = !!originalCustomColumns?.find(f => f.kyField === '90' && f.unboxingType === '10')
        //禁用自定义字段90
        model.customField90Maxlength = resData.operationMode === '2' ? -1 : 128
        model.customField90Disabled = resData.operationMode === '1' || flag
        //禁用所有自定义字段
        model.customFieldDisabled = resData.waybillType === '150'
        if (resData.waybillStatus === 20 && resData.orderNumber) {
          nextTick(() => {
            deliveryTimeShow.value = true
          })
        }
        shareData.waybillModifyStatus = ''
        const disabledCount = resData.operationMode === '1' && [10, 20].includes(resData.waybillParentInden)
        disabledFields.value = {
          serviceWay: resData.serviceModeUpdateFlag === 20,
          count: disabledCount || resData.waybillParentInden === 10,
          // weight:resData.waybillParentInden === 10
          isParentWaybill: resData.waybillParentInden === 10
        }
        const list = ['内部件', '内部次日', '内部急件', '特惠快运', '特惠普运', '特惠航空', '特惠同城', '特惠省内']
        const waybillSource = resData.waybillSource
        if (waybillSource === '330') { //一票一议
          shareData.waybillModifyStatus = '30'
        } else if (resData.dispatchFlag === '30') { //已调度
          if (list.includes(resData.serviceModeText)) {
            shareData.waybillModifyStatus = '20'
          } else {
            shareData.waybillModifyStatus = '10'
          }
        }
      }
      return model
    }

    const wholeGetActiveCoupon = () => {
      return singleInfoCouponRef.value?.infoCouponGetActiveCoupon()
    }

    const showModel = async (model, ignoreModelData) => {
      try {
        clearFormData({ ignoreShareData: true })
        shareData.loadingFlags.loadData = true
        if (!ignoreModelData && !model) {
          model = await getWaybillByWaybillNumber()
        }
        if (model) {
          Object.assign(formData, model)
          shareData.coupon = model.coupon

          if (formData.sendHouseName || formData.receiptHouseName) {
            shareData.returnWarehouseDisabled = !!formData.receiptHouseName
          }
          setVolumetricWeightRatio('payWay')
        } else {
          await defaultConfigUtil.loadDataBatch(formData, root, true)
          await deliveryUtil.sleep(100)
          await validateSenderAddressRestrict(singleInfoSenderRef, formData)
          singleInfoSenderRef.value.validateSingleSenderAddressRestrict()
        }
        afterBaseInfoChange(model?.payAccount)
        getWarehousingPrice('',true)
        nextTick(() => {
          adjustPriceNoticeRef.value.loadCustomerAdjustPriceNotice()
        })
      } catch (ex) {
        console.log('showModel :>> ', ex)
      } finally {
        shareData.loadingFlags.loadData = false
      }
    }

    //初始赋值后调用
    const afterBaseInfoChange = async payAccount => {
      await loadServiceWayOption()
      nextTick(async () => {
        payAccount && (formData.payAccount = payAccount)
        calculateEstimateFreight()
        if (props.isModify) {
          setInsuredAndCollectionFee()
        } else {
          setDefaultDeclaredValue()
          setFeeByField('dsMoney')
        }
        if (props.isModify || root.$route.params?.isCopy) {
          await validateAllFields(formData, true)
        }
        // if(payAccount){
        //   singleInfoBaseAddtionalRef.value.canEditPayCompany = false
        // }
        await setPlaneOverloadInfo()
        singleInfoBaseAddtionalRef.value.handleWeightChange()
      })
    }

    // 托寄物和付款账号保存至历史记录中
    const saveGoodsAndPayAccountToHistory = () => {
      const historyGoodsList = root.$store.getters.historyGoodsList
      const goods = formData.goods
      if (!historyGoodsList.includes(goods)) {
        historyGoodsList.unshift(goods)
        historyGoodsList.length = 5
      }
    }
    const getFormDataModel = async () => {
      const result = await checkFormData()
      if (!result) {
        return
      }
      /** 绑定优惠券到下单表单上 */
      await singleInfoCouponRef.value?.bindCouponInOrder()
      let model = await getModel()
      const originalCustomColumns = root.$store.getters.customOriginalFields
      const unionCustomCoumns = customColumnUtil.getModifyUnionCustomColums(originalCustomColumns, state.customFieldInfos)
      const customFields = customColumnUtil.getFormFields(unionCustomCoumns)
      // const customFields = root.$store.getters.customFields
      const customerFieldInfos = customFields.reduce((arr, item) => {
        const val = model[item.prop]
        if (val) {
          const obj = {
            customerFieldName: item.label,
            customerFieldValue: val,
            kyField: item.code,
          }
          arr.push(obj)
        }
        return arr
      }, [])
      /** 绑定自定义字段内容到下单表单上 */
      model.customerFieldInfos = customerFieldInfos || ''
      model.deliveryMode = result.deliveryMode || ''
      model.selfPickupMobile = result.selfPickupMobile || ''
      return model
    }
    //保存成功返回运单数据
    const saveData = async withPrint => {
      try {
        shareData.loadingFlags.saveData = true
        const model = await getFormDataModel()
        if (!model) {
          return
        }
        if(props.needWareCheck){
          await handleWareHouse(model)
        }
        const params = deliveryUtil.convertFormDataListToApiParams(model,null,withPrint)
        if (props.isModify) {
          const msg = '修改后，我们将按新的运单内容继续为您提供服务，请确认是否修改？'
          await root.$confirm(msg, { type: 'warning' })
          params.operationType = 2
          params.version = model.modifyVersion
          params.orderInfos[0].preWaybillDelivery.uploadDeliveryCustomer = model.jjCompany
        }
        const res = await deliveryApi.saveWaybill(params)
        if (res.code === 0) {
          saveGoodsAndPayAccountToHistory()
          if (props.isModify) {
            root.$message.success('运单修改成功')
          }
          return model
        }
        let msg = res.msg || '保存失败'
        if (res.data?.errorResult.length > 0) {
          msg = res.data?.errorResult[0].msg
        }
        root.$message.error(msg)
      } catch (ex) {
        console.log('saveData :>> ', ex)
      } finally {
        shareData.loadingFlags.saveData = false
      }
    }

    const resetFormData = async (isResetWaybillNumber, ignoreModelData, clearAll) => {
      const ydNo = formData.ydNo
      clearFormData({})
      nextTick(async () => {
        if (clearAll) {
          const customerInfo = storageUtil.getUserData()?.customerInfo
          const canModifySenderCompany = customerInfo?.modifyShipperFlag == '10'
          if (!canModifySenderCompany) {
            formData.jjCompany = clientUtil.getLoginCompanyName()
          }
          adjustPriceNoticeRef.value.loadCustomerAdjustPriceNotice()
        } else {
          await showModel(null, ignoreModelData)
        }
        if (isResetWaybillNumber) {
          setWaybillNo()
        } else {
          formData.ydNo = ydNo
        }
      })

    }

    const clearFormData = ({ inFormData, inShareData, ignoreShareData }) => {
      const tempShareData = formDataUtil.getShareData()
      const tempFormData = formDataUtil.getFormData()
      if (!inFormData || !inShareData) {
        inFormData = formData
        inShareData = shareData
      }
      Object.keys(inFormData).forEach(k => {
        inFormData[k] = tempFormData[k]
      })
      !ignoreShareData && Object.keys(shareData).forEach(k => {
        inShareData[k] = tempShareData[k]
      })
      inFormData.qhAddressData.districtList = []
      inFormData.qhAddressData.detailAddress = ''
      inFormData.sjAddressData.districtList = []
      inFormData.sjAddressData.detailAddress = ''

      /** 保存成功以后清空优惠券数据 */
      inFormData.coupon = {}
        singleInfoCouponRef.value?.resetData()
        resetData()
    }
    const hideDialog = () => {
        singleInfoRemarksRef.value?.hideDialog()
    }

    const resetData = () => {
        singleInfoSenderRef.value?.resetData()
        singleInfoReceiverRef.value.resetData()
        singleInfoBaseAddtionalRef.value.resetData()
    }

    //检查表单数据:如果超区则返回取货方式，否则返回表单校验结果
    const checkFormData = async ignoreSuperZone => {
      // const data = {"superZone":1,"feature":3,"superAreaDeliverFlag":1,"selfLiftingAddress":"江西省赣州市瑞金市谢坊镇谢坊村瑞金市象湖镇解放西路凯丽商业街中段 ","superAreaUnitePrice":2.0,"length":196.547,"superAreaFee":393.094,"selfLiftingDepot":"赣州谢坊","selfLiftingDepotLatLng":"25.871451,116.029370","receiptAddressLatLng":"25.693454,114.307037","senderLng":"121.70692","senderLat":"31.38209"}
      // await dialogSuperZoneRef.value.showDialog(data, 'formData.sjAddress')
      try {
        const errorMsgs = Object.assign({},
            singleInfoSenderRef.value?.errorMsgs,
            singleInfoReceiverRef.value.errorMsgs,
            singleInfoRemarksRef.value.errorMsgs)
        if (Object.values(errorMsgs).some(e => e)) {
          console.log('errorMsgs :>> ', errorMsgs)
          root.$message.warning('请修改提示处错误内容')
          return
        }
        if (singleInfoSenderRef.value?._addressRestrictErrorInfo?.msg) {
          root.$message.warning('当前寄件地址限制下单')
          return
        }
        if (singleInfoReceiverRef.value._addressRestrictErrorInfo?.msg) {
          root.$message.warning('当前收件地址限制下单')
          return
        }
        let valid = await singleInfoSenderRef.value?.validateForm()
        if (!singleInfoSenderRef.value) {
          valid = true
        }
        let valid2 = await singleInfoReceiverRef.value.validateForm()
        let valid3 = await singleInfoBaseAddtionalRef.value.validateForm()
        if (!valid || !valid2 || !valid3) {
          console.log('valid :>> ', !valid, !valid2, !valid3)
          root.$message.warning('请修改提示处错误内容')
          return
        }
        if (ignoreSuperZone) {
          return true
        }
        if (!await checkAddressRestrict()) {
          return
        }
        if (!await checkPayAuth()) {
          return
        }
        return await checkSuperZone()
      } catch (ex) {
        console.log('checkFormData :>> ', ex)
      }
    }

    const checkAddressRestrict = async () => {
      const resData = await deliveryApi.getAddressRestrictMessage(formData) || {}
      if (!resData.msg) {
        return true
      }
      return await dialogAddressRestrictRef.value.showDialog(resData)
      // if(limitType === 10){
      //   root.$kye_message.confirm(msg, {
      //     title:'限制下单提醒',
      //     confirmButtonText: '我知道了',
      //     showCancelButton: false
      //   })
      //   return
      // }
      // try{
      //   await root.$kye_message.confirm(msg, {
      //     title:'温馨提示',
      //     dangerouslyUseHTMLString:true,
      //     confirmButtonText: '继续下单',
      //     cancelButtonText: '取消',
      //     closeOnClickModal: false,
      //     showClose: false
      //   })
      //   return true
      // }catch{
      //   return false
      // }
    }

    //校验付款授权
    const checkPayAuth = async () => {
      if (!['20', '30'].includes(formData.payWay)) {
        return true
      }
      const res = await deliveryApi.validateWaybillField(formData, ['payWay'])
      if (res.data?.businessData?.authorizeStatus !== '20') {
        return true
      }
      try {
        let msg = '您未被授权使用收方付，如点击继续将向收方发起付款授权申请，'
        if (formData.payWay === '30') {
          msg = '您未被授权使用该公司付款，如点击继续将向对方发起付款授权申请，'
        }
        msg += '点击返回将为您改为寄方付'
        // const payWayText = formData.payWay === '30'?'第三方付':'收方付'
        // const msg = `您未被授权使用${payWayText}，如继续操作，将向对方发起授权申请，若对方拒绝会影响派送！点击取消将为您自动切换付款方式为寄方付。`
        await root.$kye_message.confirm(msg, {
          title: '温馨提示',
          confirmButtonText: '继续',
          cancelButtonText: '返回',
          closeOnClickModal: false,
          showClose: false
        })
        return true
      } catch {
        formData.payWay = '10'
      }
    }

    //检查超区
    const checkSuperZone = async () => {
      let payAccount = deliveryUtil.getPayAccount(formData, true)
      if (!payAccount) {
        return true
      }
      let res = await deliveryApi.querySuperzoneInfo(
        formData.qhAddress,
        formData.sjAddress,
        payAccount
      )
      if (res.code === 0 && res.data.superZone === 1) {
        if (res.data.superAreaDeliverFlag === 0) {
          let msg = '温馨提示:当前地址不支持派送,请切换收件地址,或咨询您的商务'
          singleInfoReceiverRef.value.errorMsgs.sjAddress = msg
          return false
        } else if (res.data.selfLiftingAddress) {
          return await dialogSuperZoneRef.value.showDialog(res.data, formData, props.isModify)
        }
      }
      return true
    }

    const inputValueChange = async (fieldName, fields) => {
      nextTick(async () => {
        try {
          shareData.loadingFlags.validating = true
          fields = (fields || []).push(fieldName)
          const thirdFields = ['payWay', 'sjMobile', 'sjCompany', 'sjTelephone']
          if (formData.payWay === '30' && thirdFields.find(f => thirdFields.includes(f))) {
            singleInfoBaseAddtionalRef.value.queryThirdPartyPayAccount()
          }
          setVolumetricWeightRatio(fieldName)
          await validateField(fieldName)
        } finally {
          shareData.loadingFlags.validating = false
        }
      })
      emit('mainInfoInputValueChange', fieldName)
    }

    const setVolumetricWeightRatio = async fieldName => {
      if (!['payWay', 'serviceWay'].includes(fieldName)) {
        return
      }
      formData.volumetricWeightRatio = 0
      if (formData.payWay !== '10' || !formData.serviceWay) {
        return
      }
      const params = [{
        no: 1,
        serviceMode: formData.serviceWay,
        paymentType: formData.payWay
      }]
      const res = await deliveryApi.getVolumetriceWeight(params)
      if (res?.code === 0 && res.data?.length > 0) {
        formData.volumetricWeightRatio = res.data[0]?.weightCoefficient || 0
      }
    }

    const validateField = async fieldName => {
      const serviceWayFields = ['sjAddress', 'qhAddress', 'payWay', 'payAccount', 'sjCompany']
      const dispatchFields = ['sjAddress', 'qhAddress', 'serviceWay']
      const adjustPriceFields = [...dispatchFields, 'weight']
      const reciverFields2 = ['payWay', 'sjCompany', 'sjMobile', 'sjTelephone', 'sjAddress',]
      const reciverFields = [...reciverFields2, 'paymentCustomerName']
      const anlysisFields = [...serviceWayFields, 'serviceWay',]

      if (estimateFreightFields.includes(fieldName)) {
        shareData.estimateFreight = {}
      }
      let isSetPayCompany = false
      let validateWaybillFieldRes = null
      const isReciverFields = reciverFields.includes(fieldName)
      if (reciverFields2.includes(fieldName)) {
        formData.noPayCustomerFlag = '0'
      }
      if (isReciverFields && await checkReceiverAddress()) {
        validateWaybillFieldRes = await deliveryApi.validateWaybillField(formData, anlysisFields)
        const isReceriverField = reciverFields.includes(fieldName)
        if (fieldName !== 'paymentCustomerName') {
          isSetPayCompany = formData.payWay === '20' && (isReceriverField || (!formData.paymentCustomerName && formData.noPayCustomerFlag !== '10'))
          await setPayCompany(validateWaybillFieldRes.data, isSetPayCompany, isReceriverField)
        }
        setAddressValidateResultTip(validateWaybillFieldRes.data, [])
        setGoodsInfoValidateResultTip(anlysisFields, validateWaybillFieldRes.data)
      }
      if (!await checkAddress(fieldName)) {
        return
      }

      if (!isReciverFields && anlysisFields.includes(fieldName)) {
        if (!validateWaybillFieldRes) {
          validateWaybillFieldRes = await deliveryApi.validateWaybillField(formData, anlysisFields)
        }
        if (formData.payWay === '30') {
          formData.paymentCustomerCode = validateWaybillFieldRes?.data?.businessData?.paymentCustomerCode
        }
      }
      if (!isSetPayCompany && serviceWayFields.includes(fieldName)) {
        await loadServiceWayOption()
      }

      setPlaneOverloadInfo(fieldName)
      getWarehousingPrice(fieldName)
      await calculateEstimateFreight(fieldName)
      const warnResult = []
      if (adjustPriceFields.includes(fieldName)) {
        const { adjustPriceMsg, delayTime, customerAdjustPriceTips } = await deliveryApi.adjustPriceRemind(formData) || {}
        formData.delayTime = delayTime
        if (customerAdjustPriceTips) {
          adjustPriceNoticeRef.value.showMessage(customerAdjustPriceTips)
        }
        if (adjustPriceMsg) {
          warnResult.push({ field: 'sjAddress', adjustPriceMsg })
        }
      }
      // if (dispatchFields.includes(fieldName)) {
      //   const res = await deliveryApi.dispatchAddressRestrict(formData)
      //   resetAddressErrorAndWaningMsg(true)
      //   nextTick(() => setAddressRestrictMsgs(res.data))
      //   if (res.data.errorResult?.length > 0) {
      //     return
      //   }
      //   if (res.data.warnResult?.length > 0) {
      //     warnResult.push(...res.data.warnResult)
      //   }
      // }
      if (anlysisFields.includes(fieldName)) {
        // const res = await deliveryApi.validateWaybillField(formData, anlysisFields)
        setAddressValidateResultTip(validateWaybillFieldRes.data, warnResult)
        if (validateWaybillFieldRes.data) {
          setGoodsInfoValidateResultTip(anlysisFields, validateWaybillFieldRes.data)
        }
      }
    }

    const setPayCompany = async (resData, isSetPayCompany = true, isSetPayCompanyEditable = true, ignorePayCustomNameChange) => {
      const addtionalRef = singleInfoBaseAddtionalRef.value
      const { paymentCustomerName, queryPayAuthSource, paymentCustomerCode } = resData?.businessData || {}
      if (isSetPayCompanyEditable) {
        addtionalRef.canEditPayCompany = !['10', '20'].includes(queryPayAuthSource)
        addtionalRef.isInEditPayCompany = false
      }
      if (!isSetPayCompany) {
        return
      }
      if (paymentCustomerName) {
        formData.sjCompany = paymentCustomerName
      }
      formData.noPayCustomerFlag = paymentCustomerName ? '0' : ''
      formData.paymentCustomerName = paymentCustomerName
      formData.paymentCustomerCode = paymentCustomerCode
      loadServiceWayOption()
      if (!ignorePayCustomNameChange) {
        singleInfoBaseAddtionalRef.value.recaculateInsuredAndCollectionFee()
      }
    }

    const setPlaneOverloadInfo = async fieldName => {
      const flag = (fieldName === 'weight') && Object.keys(shareData.planeListInfo || {}).length < 1
      if (!flag && !['sjAddress', 'qhAddress', 'serviceWay'].includes(fieldName)) {
        return
      }
      shareData.planeListInfo = {}
      const qhDistrictList = formData.qhAddressData?.districtList
      const sjDistrictList = formData.sjAddressData?.districtList
      if (qhDistrictList?.length > 1 && sjDistrictList?.length > 1 && formData.serviceWay) {
        const res = await deliveryApi.getPlaneOverloadInfo(qhDistrictList[1], sjDistrictList[1], formData.serviceWay)
        if (res.code === 0 && res.data?.length > 0) {
          shareData.planeListInfo = res.data[0]
        }
      }
      singleInfoBaseAddtionalRef.value.handleWeightChange()
    }

    //计算预估费用：（关联字段：收、寄件地址、服务方式、增值服务）
    const calculateEstimateFreight = async fieldName => {
      try {
        if (fieldName && !estimateFreightFields.includes(fieldName)) {
          return
        }
        shareData.loadingFlags.estimateFreight = true
        shareData.estimateFreight = {}
        if (!root.$store.getters.hasFrightFeeAuth) {
          return
        }
        const result = await deliveryApi.getEstimateFreight(formData)
        if (result && result.length > 0) {
          shareData.estimateFreight = result[0].feeResponse
        }
      } finally {
        shareData.loadingFlags.estimateFreight = false
        /** 优惠券组件监听表单元素更新操作 */
        await singleInfoCouponRef.value?.fetchCouponList(formData, fieldName, shareData.estimateFreight, props.isModify)
      }
    }

    const getServiceWayOptions = () => {
      return singleInfoBaseAddtionalRef.value.serviceWayOptions
    }
    const loadServiceWayOption = async serviceWayOptions => {
      if (serviceWayOptions) {
        singleInfoBaseAddtionalRef.value.serviceWayOptions = serviceWayOptions
        return
      }
      await singleInfoBaseAddtionalRef.value.loadServiceWayOption()
    }

    const checkReceiverAddress = async () => {
      const receiverRef = singleInfoReceiverRef.value
      const sjAddressRef = receiverRef.sjAddressRef
      if (!await sjAddressRef.checkAddressValid()) {
        receiverRef.errorMsgs.sjAddress = ''
        receiverRef.errorMsgs.sjAddressRestrict = ''
        receiverRef.warningMsgs.sjAddress = ''
        receiverRef.warningMsgs.sjAddressRestrict = ''
        return false
      }
      return true
    }

    const checkSenderAddress = async () => {
      const senderRef = singleInfoSenderRef.value
      const qhAddressRef = senderRef?.qhAddressRef
      if (qhAddressRef && (!await qhAddressRef.checkAddressValid())) {
        senderRef.errorMsgs.qhAddress = ''
        senderRef.errorMsgs.qhAddressRestrict = ''
        senderRef.warningMsgs.qhAddress = ''
        senderRef.warningMsgs.qhAddressRestrict = ''
        return false
      }
      return true
    }

    const checkAddress = async fieldName => {
      await deliveryUtil.sleep(100)
      let senderFlag = await checkSenderAddress()
      let receiverFlag = await checkReceiverAddress()
      if (senderFlag && !receiverFlag && fieldName === 'qhAddress') {
        validateSenderAddressRestrict(singleInfoSenderRef, formData)
        return
      }
      if (!senderFlag || !receiverFlag) {
        return
      }
      return true
    }

    // const loading = computed(() =>{
    //   console.log('shareData.loadingFlags :>> ', shareData.loadingFlags)
    //   return shareData.loadingFlags
    //   // const senderRef = singleInfoSenderRef.value
    //   // const receiverRef = singleInfoReceiverRef.value
    //   // console.log('senderRef :>> ', senderRef)
    //   let flag = Object.values(shareData.loadingFlags).some(f => f)
    //   // flag = flag || senderRef && Object.values(senderRef.errorMsgs).some(f => f === null)
    //   // flag = flag || receiverRef && Object.values(receiverRef.errorMsgs).some(f => f === null)
    //   return flag
    // })

    // watch(()=>loading,flag=>{
    //   console.log('flag :>> ', flag)
    //   emit('loading-change', flag)
    // })
    const getWarehousingPrice = async (fieldName,isInit=false) => {
      if(!isInit){
        const warehousingPriceFields = ['sjAddress', 'qhAddress', 'payWay', 'serviceWay','weight']
        if(fieldName && !warehousingPriceFields.includes(fieldName)){
          return
        }
      }
      const res = await deliveryApi.getWarehousingPrice(formData)
      if(!isInit){
        formData.checkedCustomsCharge = ''
      }
      if (res.code === 0&&res.data) {
        const singleAddtionalRef = singleInfoBaseAddtionalRef.value.$refs.singleInfoAddtionalRef
        if(res.data.length>0){
          if(!(isInit&&formData.checkedCustomsCharge==='20'&&props.isModify)){
            formData.checkedCustomsCharge = '10'
          }
          singleAddtionalRef.customsChargeInfo = res.data ? res.data[0] : {}
        }
        else{
          formData.checkedCustomsCharge = ''
          singleAddtionalRef.customsChargeInfo ={}
        }
      }
    }

    // 调起报关入仓
    const handleWareHouse = function(model){
      return new Promise(async (resolve,reject) => {
        if(formData.checkedCustomsCharge === '20' || !formData.checkedCustomsCharge){
          resolve(false)
          return
        }
        const params = wareHouseUtil.singleWaybillFormat(formData)
        const res = await wareHouseApi.getWarehousingPrice(params)
        if (res.code === 0 && res.data && res.data.length > 0) {
          let resolveResult = await declareWareRef.value?.showDialog({data: res.data})
          if (resolveResult.checkedCustomsCharge) {
            formData.checkedCustomsCharge = resolveResult.checkedCustomsCharge
            model.checkedCustomsCharge = resolveResult.checkedCustomsCharge
          }
          if(resolveResult.type === 'close'){
            // loading.value = false
            reject(false)
          }
        }
        resolve(true)
      })
    }

    return {
      shareData,
      formData,
      ...toRefs(state),
      singleInfoCouponRef,
      singleInfoSenderRef,
      singleInfoReceiverRef,
      dialogSuperZoneRef,
      singleInfoBaseAddtionalRef,
      singleInfoRemarksRef,
      adjustPriceNoticeRef,
      dialogAddressRestrictRef,
      declareWareRef,
      checkFormData,
      clearFormData,
      getWaybillByWaybillNumber,
      disabledFields,
      isShowInDialog,
      deliveryTimeShow,
      setWaybillNo,
      // afterBaseInfoChange,
      inputValueChange,
      getFormDataModel,
      loadServiceWayOption,
      saveGoodsAndPayAccountToHistory,
      displayErrorAndWarningInfoByTableRow,
      setTableRowErrorAndWarningInfo,
      saveData,
      wholeGetActiveCoupon,
      resetFormData,
      resetData,
      showModel,
      // showBatchDialog,
      hideDialog,
      getServiceWayOptions,
      setVolumetricWeightRatio

    }
  },
  computed: {
    loading () {
      let flag = Object.values(this.shareData.loadingFlags).some(f => f)
      // console.log('flag :>> ', flag)
      flag = flag || this.$refs.singleInfoSenderRef && Object.values(this.$refs.singleInfoSenderRef.errorMsgs).some(f => f === null)
      flag = flag || this.$refs.singleInfoReceiverRef && Object.values(this.$refs.singleInfoReceiverRef.errorMsgs).some(f => f === null)
      return flag
    }
  },
  watch: {
    loading (val) {
      this.$emit('loading-change', val)
    }
  }
}
</script>

<style lang='scss' scoped>
  .single-info-whole--container {
    position: relative;
    &.is-dialog {
      .adjust-price-notice__container {
        top: 40px;
      }
    }
    .notices {
      min-width: 740px;
      position: absolute;
      left: 196px;
      right: 204px;
      min-width: 740px;
      z-index: 2;
    }

    &.add {
      /deep/ {
        .goods-info,
        .coupon-info,
        .el-form > .service-info {
          .el-col-6 {
            width: 16.66%;
          }
        }

        .info-wrapper {
          background-image: url('~@/assets/image/delivery/header-bg-long.png');
          background-position: top left;
          background-repeat: no-repeat;
          background-size: 990px 38px;

          &.info-remarks {
            overflow: hidden;
          }
        }

        .sender-info {
          background-image: url('~@/assets/image/delivery/header-bg-short.png');
          background-size: 623px 38px;
        }
      }
    }

    .sender-receiver--wrapper.add {
      margin-bottom: 8px;
      display: flex;

      /deep/ {
        .el-col-4 {
          width: 25%;
        }
      }

      & > div {
        &:first-of-type {
          margin-right: 8px;
        }

        flex: 1;
      }
    }

    /deep/ .address-cascader--wrapper,
    /deep/ .address-input--wrapper {
      padding-left: 0 !important;
      padding-right: 0 !important;
    }

    /deep/ .address-cascader--wrapper {
      padding-right: 0 !important;
    }

    /deep/ {
      .el-col {
        padding: 0 15px !important;
      }

      input,
      .el-input--medium,
      .el-input__inner,
      .el-input__suffix,
      .el-select__caret:not(.el-icon-circle-close) {
        .el-input__icon {
          width: 13px;
        }
      }
    }

    /deep/ {
      .el-form-item__label {
        padding-bottom: 1px !important;
        //color: #888888 !important;
      }

      .el-checkbox__input {
        width: 12px;
        height: 15px;
      }

      .el-checkbox__label {
        color: #03050d;
      }
    }
  }
</style>
