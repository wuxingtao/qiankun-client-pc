<template>
  <el-form ref='singleInfoBaseFormRef' class='page-style1 wrapper' :model='formData' :rules='formRules' label-position='top' label-width='88px'>
    <section class='info-wrapper goods-info'>
      <single-info-header :is-show-in-dialog='isShowInDialog' icon='icon-category-goods' title='货物信息' />
      <el-row :gutter='20' type='flex' style='flex-wrap: wrap'>
        <el-col :span='6'>
          <el-form-item label='付款方式' prop='payWay' :error='errorMsgs.payWay'>
            <el-select v-model='formData.payWay' :disabled="shareData.waybillModifyStatus === '30'" size='medium' placeholder='请选择' popper-class='pay-way-popper suggest-popper' @change="inputValueChange('payWay')">
              <el-option v-for='item in $store.state.common.payWayOptions' :key='item.value' :label='item.label' :value='item.value'>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span='6' v-if="formData.payWay === '20'">
          <el-form-item prop='paymentCustomerName' class="form-item__pay-company">
            <div :class="['pay-company__label']" slot='label'>
              <span>当前付款公司</span>
              <i :class="['iconfont','iconedit',!canEditPayCompany || isInEditPayCompany?'disabled':'']" @click="setPayCompanyEditStatus" />
            </div>
            <el-input v-model='formData.paymentCustomerName' size='medium' clearable :maxlength='20' :disabled="!hasErrorPayCompany && !isInEditPayCompany" placeholder='请输入当前付款公司' @change="handlePayCompanyChange" @clear="handlePayCompanyClear"/>
            <ky-tip v-show="formData.paymentCustomerName && !hasErrorPayCompany" type="tip" msg="请确认付款公司是否正确，如错误请修改或删除即可" />
          </el-form-item>
        </el-col>

        <el-col :span='6' v-if='visibleOfPaymentAccount' class='pay-account'>
          <el-form-item label='付款账号' prop='payAccount' :error='errorMsgs.payAccount'>
            <el-autocomplete size='medium' clearable v-model='formData.payAccount' autocomplete='new-password' :fetch-suggestions='queryPayAccountList' v-kyerestrict.positive placeholder='付款账号或主授权号' :maxlength='20' @select="inputValueChange('payAccount')" popperClass='pay-account-popper' @change="inputValueChange('payAccount')" ref='payAccountRef'>
              <template slot-scope='{ item }'>
                <div class='pay-name fs_14'>{{ item.label }}</div>
                <div class='pay-code fs_12 c_999'>{{ item.value }}</div>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>
        <el-col :span='6'>
          <el-form-item class="single-serviceWay" label='服务方式' prop='serviceWay' :error='errorMsgs.serviceWay'>
            <el-select popper-class='single-serviceWay--popper suggest-popper' v-model='formData.serviceWay' :disabled="shareData.waybillModifyStatus === '30' || disabledFields.serviceWay" size='medium' placeholder='请选择' @change="inputValueChange('serviceWay')">
              <template slot='empty'>
                <div class='el-select-dropdown__empty'>
                  <div v-if='shareData.loadingFlags.loadServiceWay'>
                    <i class='el-icon-loading' /> 加载中...
                  </div>
                  <template v-else-if='!isAddressOrPaywayEmpty'>
                    <div class="el-select-dropdown__empty-tip" v-if="serviceWayTip">
                      {{serviceWayTip}}
                    </div>
                    <div class='el-select-dropdown__empty-error' v-else>
                      <div>
                        <i class='el-icon-warning-outline' />
                        加载失败，请点击重新获取
                      </div>
                      <el-button size='mini' @click='loadServiceWayOption()'>重新获取</el-button>
                    </div>
                  </template>
                  <div v-else>
                    请先完善寄收信息及付款方式
                  </div>
                </div>
              </template>
              <service-way-template :options="serviceWayOptions"/>
            </el-select>
            <div class='sugesstion-tip' v-if='shareData.suggestions.serviceWay.tip' @click="setSuggestionItemValue('serviceWay')">
              {{ shareData.suggestions.serviceWay.tip }}
              <i class='el-icon-circle-close' @click.stop="shareData.suggestions.declaredValue.serviceWay = ''"></i>
            </div>
            <tip-normal show-html v-else-if='currentServiceWayInfo && currentServiceWayInfo.descriptionTip' :value='formData.serviceWay' :msg='currentServiceWayInfo.descriptionTip' />
          </el-form-item>
        </el-col>
        <el-col :span='6' style='position: relative'>
          <i class='iconfont icon-warning icon-contrband' @click='visibleOfContraband = true' />
          <el-form-item label='托寄物' prop='goods' :error='errorMsgs.goods'>
            <el-autocomplete v-if='!$store.state.supplier.existSupplierInfo' size='medium' clearable v-model='formData.goods' :fetch-suggestions='queryGoodsList' placeholder='请输入托寄物' :maxlength='40' @select="handleGoodsChange" @change="handleGoodsChange">
            </el-autocomplete>
            <template v-else>
              <el-button class='btn-size-add' size='medium' @click='visibleOfDialogGoods = true'>
                <i class="iconfont icon-goods" style="font-size:12px;padding-right: 4px" />
                {{ (formData.goods ? '编辑' : '添加') + '托寄物' }}
              </el-button>
            </template>
            <tip-normal :value='formData.goods' :msg='warningMsgs.goods' />
          </el-form-item>
        </el-col>
        <el-col :span='6'>
          <el-form-item prop='count' style='white-space: nowrap'>
            <template #label>总件数
              <!-- <span style="font-size: 12px;color: #999999;">(给司机小哥的)</span> -->
            </template>
            <el-input v-model='formData.count' :disabled="shareData.waybillModifyStatus === '30' || disabledFields.count" size='medium' clearable v-kyerestrict.positiveNotZero :maxlength='4' placeholder='1~9999' @change="inputValueChange('count')">
              <template slot='append'>(件)</template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span='6'>
          <el-form-item label='预估总重量' prop='weight'>
            <el-input v-model='formData.weight' v-kyerestrict.currency class='weight' :disabled="!disabledFields.isParentWaybill && (shareData.waybillModifyStatus === '30' || disabledFields.weight)" size='medium' clearable :maxlength="(formData.weight+'').includes('.') ? 8 : 5" placeholder='请准确填写重量，以便派车取货' @change="inputValueChange('weight')">
              <template slot='append'>(kg)</template>
            </el-input>
            <tip-normal v-if='weigthTip' :value='weigthTip' :msg='weigthTip' />
            <ky-tip v-show="warningMsgs.weight" :msg="warningMsgs.weight" />
          </el-form-item>
        </el-col>
        <el-col :span='6'>
          <el-form-item label='规格尺寸'>
            <el-button class='btn-size-add' @click='showdialogGoodsSize' size='medium'>
              <i class="iconfont icon-edit" style='padding-right: 4px;' />
              {{ formData.sizeList && formData.sizeList.length > 0 ? '编辑' : '添加' }}
            </el-button>
          <tip-normal :msg="volumetricWeightText" :can-close="false"/>
          </el-form-item>
        </el-col>
        <el-col :span='6' v-if='visibleVipshopCode'>
          <el-form-item label='唯品会入库号' prop='vipshopCode'>
            <el-input v-model='formData.vipshopCode' size='medium' clearable :maxlength='21' placeholder='请输入唯品会入库号'></el-input>
          </el-form-item>
        </el-col>
        <!-- 自定义字段 -->
        <el-col :span='6' v-for='(col, index) in customFields.filter(f=>f.code !== "90" || formData[f.prop] || !formData.customField90Disabled)' :key='index' style="margin-top: -2px;">
          <el-form-item :prop='formData.customFieldDisabled ? "" : col.prop' :error='errorMsgs[col.prop]' class='custome-column-item'>
            <el-tooltip  :disabled="col.label.length < 9" slot="label" class="custome-slot-label" effect="light" :content="col.label" placement="top-start">
              <div>
                <span class="custome-slot-content">{{ col.label }}</span>
                <span v-if="!formData.customFieldDisabled && col.required" class="custome-slot-icon">*</span>
              </div>
            </el-tooltip>
            <el-input v-model='formData[col.prop]' size='medium' clearable :disabled="isDisabledCustomField(col)" :maxlength='(col.code === "90" &&  formData.customField90Maxlength) || col.maxlength' :placeholder="'请输入' + col.label" @change='inputValueChange(col.prop)'>
            </el-input>
          </el-form-item>
        </el-col>
      </el-row>
    </section>

    <single-info-addtional ref='singleInfoAddtionalRef' :tempFormData.sync='formData' :tempShareData.sync='shareData' :isShowInDialog='isShowInDialog' :errorMsgs="errorMsgs" @addtionalInputValueChange='inputValueChange($event)' />

    <!-- 违禁品 -->
    <ky-contraband :visible.sync='visibleOfContraband'></ky-contraband>
    <!-- 托寄物 -->
    <dialog-goods :visible.sync='visibleOfDialogGoods' :goods.sync='formData.goods' @on-comfirm="inputValueChange('goods')" />
    <!-- 托寄物尺寸 -->
    <dialog-goods-size ref='dialogGoodsSizeRef' @size-list-change="inputValueChange('sizeList')" />
  </el-form>
</template>

<script>
import { onMounted, reactive, ref, computed, nextTick, watch, toRefs } from '@vue/composition-api'
import { Contraband } from '@comps'
import DialogStandardSize from './dialog-standard-size/index'
import DialogGoods from '@/views/supplier-management/sku/components/dialog-goods.vue'
import TipNormal from '@/components/tip-normal'
import SingleInfoAddtional from './single-info-addtional.vue'
import SingleInfoHeader from './single-info-header'
import ServiceWayTemplate from './common/service-way-template'

import { debounce } from 'lodash'
import deliveryUtil from '@/utils/deliveryUtil'
import Regular from '@utils/regular'
import customColumnUtil from '@utils/customColumn'
import * as storageUtil from '@utils/storage'
import * as permissionApi from '@api/permission'
import deliveryApi from '@api/delivery'
import useSingleFee from '../hooks/useSingleFee'
import useSingleSuggestion from '../hooks/useSingleSuggestion'
import useSingleGoods from '../hooks/useSingleGoods'
import useSingleCommon from '../hooks/useSingleCommon'
import defaultConfigUtil from '../utils/defaultConfigUtil'
import useWeightSizeValidate from '@views/delivery/hooks/useWeightSizeValidate'

export default {
  props: {
    tempShareData: { type: Object },
    tempFormData: { type: Object },
    customFieldInfos:{ type:Array,undefined}, //查询修改时使用的自定义字段
    disabledFields: {
      type: Object, default: () => {
      }
    },
    isShowInDialog: { type: Boolean },
    isModify: { type: Boolean }
  },
  components: {
    'ky-contraband': Contraband,
    DialogGoods,
    'dialog-goods-size': DialogStandardSize,
    TipNormal,
    SingleInfoAddtional,
    SingleInfoHeader,
    ServiceWayTemplate
  },
  setup (props, { emit, root }) {
    const shareData = reactive(props.tempShareData)
    const formData = reactive(props.tempFormData)
    const dialogGoodsSizeRef = ref(null)
    const singleInfoBaseFormRef = ref(null)
    const singleInfoAddtionalRef = ref(null)
    const visibleOfContraband = ref(false) //是否显示违禁品说明
    const visibleOfDialogGoods = ref(false)
    const serviceWayOptions = ref(root.$store.state.common.defaultServiceWayDict || [])
    const payAccountRef = ref(null)
    const weigthTip = ref('') //重量提示
    const thirdPartyPayAccount = ref([])

    const state = reactive({
      serviceWayTip: '',
      canEditPayCompany: false,
      isInEditPayCompany: false, //付款公司是否在编辑中
      hasErrorPayCompany: false,
    })
    const errorMsgs = reactive({
      goods: '',
      payWay: '',
      payAccount: '',
      serviceWay: '',
      declaredValue: '',
    })
    const warningMsgs = reactive({
      goods: '',
      weight: '' // 预估重量超重提示
    })

    const { getOverWeightMessage } = useWeightSizeValidate()

    watch(() => props.tempFormData, data => {
      Object.assign(formData, data)
    })
    watch(() => props.shareData, data => {
      Object.assign(shareData, data)
    })

    const visibleVipshopCode = computed(() => {
      if (props.isShowInDialog && !formData.ydNo) {
        return false
      }
      return root.$store.getters.isVipshopUser && (props.isModify || !props.isShowInDialog)
    })

    const isDisabledCustomField = fieldInfo => {
      let flag = formData.customFieldDisabled
      flag = flag || (fieldInfo.code === '90' && formData.customField90Disabled)
      return flag
    }

    const checkPayCompany = async (rule, value, callback) => {
      if (!value) {
        formData.paymentCustomerCode = ''
        loadServiceWayOption()
        recaculateInsuredAndCollectionFee()
        return callback()
      }
      // value = commonUtil.toCdb(value)
      formData.paymentCustomerName = value
      let msg = ''
      if (value.length < 4) {
        msg = '长度不能少于4个字符'
      }
      //  else if (/[\[<>><\]]/.test(value)) {
      //   msg = '不能输入\\([<>><]这些特殊符号'
      // }
      else if (/^\d{1,}$/.test(value)) {
        msg = '不能为纯数字'
      } else if (/^[A-Za-z]{1,}$/.test(value)) {
        msg = '不能为纯英文'
      } else if (new Set(value.split()).size === value.length) {
        msg = '不能为完全一样的字符'
      }
      if (!msg && formData.paymentCustomerName) {
        const res = await deliveryApi.getCompanyInfoByName(formData.paymentCustomerName)
        if (res.code === 0) {
          const customerCode = res.data[0].customerCode
          if (!customerCode) {
            msg = '请输入正确的公司简称'
          } else {
            formData.noPayCustomerFlag = '0'
            formData.sjCompany = formData.paymentCustomerName
            formData.paymentCustomerCode = customerCode
            loadServiceWayOption()
            recaculateInsuredAndCollectionFee()
            inputValueChange('paymentCustomerName')
          }
        }
      }
      state.hasErrorPayCompany = !!msg
      if (msg) {
        return callback(new Error(msg))
      }
      callback()
    }

    const handlePayCompanyClear = () => {
      singleInfoBaseFormRef.value.validateField('paymentCustomerName')
    }

    const handlePayCompanyChange = async value => {
      if(!value){
        formData.paymentCustomerCode = ''
      }
      if (value.trim() === '' && formData.noPayCustomerFlag === '0') {
        formData.noPayCustomerFlag = '10'
      }
      if(value.trim() === '' &&  formData.noPayCustomerFlag === '10'){
        inputValueChange('paymentCustomerName')
      }
    }

    const checkVipshopCode = async (rule, value, callback) => {
      if (
        !(root.$store.getters.authorityIds || []).includes('048') &&
          !formData.vipshopCode &&
          (formData.sjCompany || '').includes('唯品') &&
          !['隔日达', '陆运件'].includes(formData.serviceWay)
      ) {
        return callback(new Error('唯品会入库号不能为空'))
      }
      callback()
    }

    // 实时超重检测 TODO 补充接口对接
    const handleWeightChange = () => {
      const params = {
        planeListInfo: shareData.planeListInfo,
        weight: formData.weight,
        serviceWay: formData.serviceWay,
        count: formData.count
      }
      warningMsgs.weight = getOverWeightMessage(params)
      if (warningMsgs.weight) {
        weigthTip.value = ''
      }
    }

    const checkWeight = async (rule, value, callback) => {
      const { weight } = formData
      if (weight > 99999.99) {
        return callback(new Error('预估总重量不能大于99999.99'))
      }
      // if (weight > 0) {
      //   // if (weight / count > 1500) {
      //   //   return callback(new Error("单件货物重量不得超过1500kg"))
      //   // }
      //   if (
      //     weight / (Number(count) || 1) >= 80 &&
      //     (!sizeList || sizeList.every(s => Number(s.height) <= 0))
      //   ) {
      //     return callback(new Error('单件货物重量大于80kg,须填写货物尺寸'))
      //   }
      // }
      callback()
    }
    const checkCount = async (rule, value, callback) => {
      singleInfoBaseFormRef.value.validateField(['weight'])
      callback()
    }

    //兼容修改时，取详情接口返的自定义字段与ka配置并集字段
    const unionCustomColumns = computed(() => {
      const originalCustomColumns = root.$store.getters.customOriginalFields
      return customColumnUtil.getModifyUnionCustomColums(originalCustomColumns,props.customFieldInfos)
    })

    /** 自定义字段 */
    const customFields = computed(() => {
      const fields = customColumnUtil.getFormFields(unionCustomColumns.value)
      // const fields = root.$store.getters.customFields || {}
      fields.forEach(item => {
        root.$set(formData, item.prop, formData[item.prop] || '')
      })
      return fields
    })

    /** 自定义字段表单验证规则 */
    const customFieldFormRules = computed(() => {
      const rules = customColumnUtil.getFormRules(unionCustomColumns.value)
      return rules
    })

    const formRules = reactive({
      goods: [
        { required: true, message: '请输入托寄物', trigger: 'change' },
        { min: 2, message: '托寄物不能少于2个字', trigger: 'change' },
        { max: 30, message: '托寄物不能多于30个字', trigger: 'change' },
        {
          pattern: Regular.text4,
          message: '托寄物名称不可为纯数字或纯符号',
          trigger: 'change'
        }
      ],
      payWay: [{ required: true, message: '请选择付款方式', trigger: 'change' }],
      payAccount: [{ required: false, message: '请输入付款账号', trigger: 'change' }],
      vipshopCode: [
        {
          required: false,
          pattern: Regular.vipshopCode,
          message: '请输入正确的唯品会入库号',
          trigger: 'blur'
        },
        { validator: checkVipshopCode, trigger: 'blur' }
      ],
      serviceWay: [{ required: true, message: '请选择服务方式', trigger: 'change' }],
      weight: [{ validator: checkWeight, trigger: 'blur' }],
      count: [{ validator: checkCount, trigger: 'blur' }],
      paymentCustomerName: [
        { validator: checkPayCompany, trigger: 'blur' }
      ],
      ...customFieldFormRules.value,
    })

    const volumetricWeightText = computed(()=>{
      return deliveryUtil.getVolumetricWeightText(formData.cube,formData.volumetricWeightRatio)
    })

    watch(() => root.$store.getters.customFieldRules, oldVal => {
      Object.assign(formRules, oldVal)
    })

    const resetData = () => {
      initSuggestionData()
      Object.keys(errorMsgs).forEach(k => {
        errorMsgs[k] = ''
      })
      Object.keys(warningMsgs).forEach(k => {
        warningMsgs[k] = ''
      })
      weigthTip.value = ''
      nextTick(() => {
        singleInfoBaseFormRef.value.clearValidate()
        const addtionalFormRef = singleInfoAddtionalRef.value.$refs.addtionalFormRef
        addtionalFormRef.clearValidate()
      })
    }

    const validAddtionalForm = async () => {
      const addtionalFormRef = singleInfoAddtionalRef.value.$refs.addtionalFormRef
      return await addtionalFormRef.validate()
    }
    const validateForm = async () => {
      try {
        if (Object.keys(errorMsgs).find(k => errorMsgs[k])) {
          console.log('errorMsgs :>> ', errorMsgs)
          return false
        }
        let valid = await singleInfoBaseFormRef.value.validate()
        valid = valid && (await validAddtionalForm())
        return valid
      } catch (ex) {
        console.log('ex :>> ', ex)
        return false
      }
    }
    const isAddressOrPaywayEmpty = computed(() => {
      // const qhAddressEmpty =  deliveryUtil.isAddressDataEmpty(formData.qhAddressData)
      // const sjAddressEmpty = deliveryUtil.isAddressDataEmpty(formData.sjAddressData)
      const payWay = formData.payWay
      // if (qhAddressEmpty || sjAddressEmpty || !payWay) {
      //   return true
      // }
      if ((formData.qhAddress || '').length < 10  || (formData.sjAddress || '').length < 10 || !payWay) {
        return true
      }
      return false
    })
    const currentServiceWayInfo = computed(() => {
      const item = serviceWayOptions.value?.find(s => s.value == formData.serviceWay)
      return item
    })

    watch(currentServiceWayInfo, item => {
      formData.estimateArriveTime = item?.appointmentStartTime
    })

    const visibleOfPaymentAccount = computed(() => {
      return ['30'].includes(formData.payWay)
    })

    watch(
      () => formData.payWay,
      () => {
        formData.payAccount = ''
        // 修改付款方式时候清空账号和密码的校验
        errorMsgs.payAccount = ''
        const isRequired = ['30'].includes(formData.payWay)
        formRules.payAccount[0].required = isRequired
        const account = storageUtil.getPayCustomerCode()
        if (isRequired && account) {
          formData.payAccount = account
        }
      }
    )
    useSingleCommon({ formData, shareData, emit })
    const { setFeeByField, setDefaultDeclaredValue, setInsuredAndCollectionFee } = useSingleFee({
      formData, shareData
    })
    const { initSuggestionData, setSuggestionInfo, setSuggestionItemValue } = useSingleSuggestion({
      formData, shareData, serviceWayOptions
    })
    const { verifyGoods, changeOfGoods, queryGoodsList } = useSingleGoods({
      vm: root,
      formData,
      shareData,
      singleInfoBaseFormRef,
      errorMsgs,
      warningMsgs,
      initSuggestionData,
      setSuggestionInfo
    })

    const checkOverWeight = async () => {
      weigthTip.value = '请准确填写重量，以便司机取货'
      const res = await deliveryApi.checkOverWeightFlag()
      if (res.code === 0) {
        weigthTip.value = res.data.weightTips
        // '您好，您上次下单填写的重量与实际重量严重不符，请准确填写，以免影响您的时效'
      }
    }

    const showdialogGoodsSize = () => {
      const cb = (sizeList, cube) => {
        formData.sizeList = sizeList
        formData.cube = cube
      }
      const readOnly = shareData.waybillModifyStatus === '30'
      const params = {
        sizeList: formData.sizeList,
        callback: cb,
        readonly: readOnly,
        cube: formData.cube,
        planeListInfo: shareData.planeListInfo,
        serviceWay: formData.serviceWay,
        volumetricWeightRatio: formData.volumetricWeightRatio
      }
      dialogGoodsSizeRef.value.showDialog(params)
    }

    const queryThirdPartyPayAccount = async () => {
      const res = await permissionApi.uam_getThirdPartyPayaccounts(formData)
      if (res.code === 0) {
        thirdPartyPayAccount.value = res.data?.map(m => ({ label: m.customerName, value: m.payAccount })) || []
      }
    }
    const queryPayAccountList = async (queryString, cb) => {
      if (!thirdPartyPayAccount.value) {
        await queryThirdPartyPayAccount()
      }
      let arr = thirdPartyPayAccount.value.filter(f =>
        f.label.includes(queryString) || f.value.includes(queryString)
      )
      cb(arr)
    }

    const loadServiceWayOption = async () => {
      const sjAddress = deliveryUtil.getFullAddress(formData, 'sjAddress')
      const qhAddress = deliveryUtil.getFullAddress(formData, 'qhAddress')
      const payWay = formData.payWay
      if (!sjAddress || !qhAddress || !payWay) {
        return
      }
      formData.sjAddress = sjAddress
      formData.qhAddress = qhAddress
      try {
        serviceWayOptions.value = []
        shareData.loadingFlags.loadServiceWay = true
        state.serviceWayTip = ''
        const res = await deliveryApi.queryServiceWayListByBatch([formData])
        let options = root.$store.state.common.defaultServiceWayDict
        let data = []
        if (res.code === 0 && res.data[0]) {
          const msg = res.data[0].msg
          if (msg) {
            state.serviceWayTip = msg
            options = []
          } else {
            data = res.data[0].serviceTypeList || []
            options = data.map(d => Object.assign(d, {
              value: d.serviceTypeCode,
              label: d.serviceTypeName
            }))
          }
        }

        const itemCanUse = options.find(f => !f.disabled )
        const item = options.find(f => !f.disabled && [f.value, f.label].includes(formData.serviceWay))
        serviceWayOptions.value = options
        nextTick(async () => {
          if (item) {
            formData.serviceWay = item.value
          } else if (options.length === 1) {
            if(formData.serviceWay !== options[0].value && !options[0].disabled){
              formData.serviceWay = options[0].value
              inputValueChange('serviceWay')
            }
          } else {
            const defaultConfig = await defaultConfigUtil.getDefaultConfig()
            const defaultItem = options.find(f => !f.disabled && f.label === defaultConfig?.serviceModel)
            if (defaultItem) {
              formData.serviceWay = defaultItem.value
            } else {
              formData.serviceWay = ''
            }
          }
          if(!itemCanUse || options.length === 0){
            formData.serviceWay = ''
          }
        })
      } finally {
        shareData.loadingFlags.loadServiceWay = false
      }
    }

    const handleGoodsChange = debounce(function () {
      inputValueChange('goods')
    }, 300)

    const recaculateInsuredAndCollectionFee = ()=>{
      if (formData.insuranceValueSource !== '20' || formData.insuranceFeeType === 10) {
        formData.declaredValue = ''
        formData.premium = ''
        setDefaultDeclaredValue()
        setFeeByField('dsMoney')
      } else {
        setInsuredAndCollectionFee()
      }
    }

    const inputValueChange = async fieldName => {
      switch (fieldName) {
        case 'payAccount':
        case 'payWay':
          singleInfoAddtionalRef.value.$refs.addtionalFormRef.clearValidate(['payAccount'])
          if(formData.payWay !== '20'){
            formData.paymentCustomerName = ''
            formData.paymentCustomerCode = ''
            if(fieldName === 'payWay'){
              formData.noPayCustomerFlag = ''
            }
            formData.insuranceValueSource = ''
            recaculateInsuredAndCollectionFee()
          }
          break
        case 'serviceWay':
          if (errorMsgs.serviceWay?.includes('选择') && formData.serviceWay) {
            errorMsgs.serviceWay = ''
          }
          verifyGoods('serviceWay')
          break
        case 'goods':
          changeOfGoods()
          break
        case 'sizeList':
          nextTick(() => singleInfoBaseFormRef.value.validateField(['weight']))
          break
        case 'declaredValue':
          errorMsgs.declaredValue = ''
          break
        case 'count':
        case 'weight':
          handleWeightChange()
          break
      }
      emit('baseInfoInputValueChange', fieldName)
    }
    const setPayCompanyEditStatus = () => {
      if (state.canEditPayCompany && !state.isInEditPayCompany) {
        state.isInEditPayCompany = true
      }
    }
    onMounted(async () => {
      checkOverWeight()
    })

    return {
      ...toRefs(state),
      volumetricWeightText,
      shareData,
      formData,
      visibleOfPaymentAccount,
      errorMsgs,
      warningMsgs,
      formRules,
      dialogGoodsSizeRef,
      singleInfoBaseFormRef,
      singleInfoAddtionalRef,
      payAccountRef,
      visibleVipshopCode,
      visibleOfContraband,
      visibleOfDialogGoods,
      weigthTip,
      handleWeightChange,
      isAddressOrPaywayEmpty,
      serviceWayOptions,
      customFields,

      setSuggestionInfo,
      setSuggestionItemValue,
      initSuggestionData,

      queryGoodsList,
      queryThirdPartyPayAccount,
      queryPayAccountList,
      loadServiceWayOption,

      currentServiceWayInfo,
      resetData,
      validateForm,
      validAddtionalForm,
      inputValueChange,
      showdialogGoodsSize,
      handleGoodsChange,
      setPayCompanyEditStatus,
      handlePayCompanyChange,
      handlePayCompanyClear,
      recaculateInsuredAndCollectionFee,
      isDisabledCustomField
    }
  }
}
</script>

<style lang='scss'>
  .single-serviceWay--popper {
    .el-select-dropdown__empty {
      padding: 10px;

      &-error {
        padding-top: 8px;
        text-align: center;
        max-width: 270px;
        .el-button {
          margin-top: 18px;
          border: 1px solid #c1c1c1;
          border-radius: 4px;
        }
      }
      &-tip {
        height: 132px;
        box-sizing: border-box;
        padding-top: 92px;
        color: #666666;
        line-height: 18px;
        background-image: url('~@assets/image/waybill/no-form-data.png');
        background-size: 68px 68px;
        background-repeat: no-repeat;
        background-position: center 20px;
      }
    }
  }

  .pay-account-popper {
    min-width: 200px;

    .pay-name {
      font-weight: bold;
    }

    .el-autocomplete-suggestion__wrap {
      max-height: 220px;
    }

    .el-autocomplete-suggestion__list li {
      padding: 12px 16px;
      line-height: 1.6;
    }
  }

  .pay-way-popper {
    li {
      height: 32px !important;
      line-height: 32px !important;
    }
  }
</style>
<style lang='scss' scoped>
  @import '../styles/single-common.scss';
  .form-item__pay-company {
    .pay-company__label {
      .iconfont {
        font-size: 12px;
        color: #8365f6;
        padding-left: 4px;
        cursor: pointer;
        &.disabled {
          color: #8f8fa8;
          cursor: not-allowed;
        }
      }
    }
  }

  .goods-info {
    &.info-wrapper {
      margin-bottom: 8px;
    }

    .pay-account {
      position: relative;

      .pay-account-text {
        position: absolute;
        top: 0px;
        right: 20px;
        display: flex;
        font-size: 14px;
        color: #8365f6;
        cursor: pointer;

        i {
          font-size: 12px;
        }

        .line {
          width: 1px;
          height: 12px;
          background: #e9e9e9;
          margin: 0 8px;
        }
      }
    }

    .icon-contrband {
      position: absolute;
      top: 1px;
      left: 65px;
      font-size: 12px;
      color: #9598a7;
      cursor: pointer;
    }

    .btn-size-add {
      background: #fdfdfe;
      border: 1px solid #e9e9e9;
      height: 26px;
      margin-top: 7px;
      padding: 0 20px;
      width: 100%;
      font-size: 12px;
      color: #8365f6;
    }

    .custome-column-item {
      /deep/ .el-form-item__label {
        width: 100%;
        white-space: nowrap;
        // text-overflow: ellipsis;
        overflow: hidden;
        &::after {
          display: none;
        }
      }
      /deep/ .el-popover--plain {
        font-size: 12px !important;
        padding: 0 !important;
        color: #333 !important;
      }
      .custome-slot-icon {
        color: #f56c6c;
        margin-left: 2px;
        top: -2px;
        position: relative;
      }
      .custome-slot-content {
        overflow: hidden;
        white-space: nowrap;
        font-size: 12px;
        cursor: pointer;
        display: inline-block;
        text-overflow: ellipsis;
        max-width: calc(100% - 20px);
      }
    }

    .weight {
      ::v-deep .el-input__inner {
        padding-right: 5px !important;
      }
    }
  }
</style>
