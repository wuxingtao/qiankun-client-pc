<template>
  <div class="address-container">
    <el-form ref='formRef'
             :model="formData"
             :rules="formRules"
             label-position="top"
             label-width="88px">
      <el-row>
        <el-col :span="uicascader"
                class="address-cascader--wrapper">
          <el-form-item :error="errorMsgOfdistrict">
            <address-cascader :labelList="formData.districtList"
                              @valueChange="districtChange"
                              @handleHotCity="handleHotCity"
                              :disabled="disabled"
                              :fetch-suggestions="getSuggestDistrictsByKeyword"
                              :hasMinHeight="hasMinHeight"
                              ref="cascaderRef"
                              :placeholder="tabCascaderPlaceholder" />
          </el-form-item>
        </el-col>
        <el-col :span="uiautocomplete"
                class="address-input--wrapper">
          <el-form-item prop="detailAddress">
            <el-autocomplete v-model.trim="formData.detailAddress"
                             :title="formData.detailAddress"
                             :disabled="disabled"
                             size="medium"
                             :popper-class="autoPopperClass"
                             clearable
                             :trigger-on-focus="false"
                             :debounce="500"
                             :fetch-suggestions="addressSuggest"
                             @select="handleDetailAddressChange"
                             :maxlength="80"
                             :placeholder="placeholder1"
                             @change="handleDetailAddressChange"
                             @clear="handleDetailClear"
                             ref="autocompleteRef">
              <template slot-scope="{ item }">
                <el-tooltip :content="item.item.address_origin"
                            :open-delay="500"
                            :disabled="item.item.address_origin.length < 34"
                            style="overflow:hidden;">
                  <div>
                    <div class="title f_w_600 ellipsis"
                         v-html="item.item.title"> </div>
                    <span class="address c_999 fs_12 ellipsis-2"
                          v-html="item.item.address"></span>
                  </div>
                </el-tooltip>
              </template>
            </el-autocomplete>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <address-analysis :address="fullAddress"
                      :addressType="addressType"
                      @change="handleAnalysisChange"
                      ref="analysisRef" />
  </div>
</template>

<script>
import { reactive, ref, computed, watch, nextTick } from '@vue/composition-api'
import { debounce } from 'lodash'
import Regular from '@utils/regular'
import AddressCascader from './address-cascader'
import useAddress from './hooks/useAddress'
import useAddressSuggest from './hooks/useAddressSuggest'
import addressStorage from '@comps/ky-address/utils/addressStorage'
import AddressAnalysis from './components/address-analysis'
import addressUtil from '@comps/ky-address/hooks/addressUtil'

export default {
  components: {
    AddressCascader,
    AddressAnalysis
  },
  props: {
    data: { //{districtList:[],districtIdList:[],detailAddress}
      type: Object,
      default () {
        return {
          districtList: [],
          detailAddress: ''
        }
      }
    },
    tabCascaderPlaceholder: {
      type: String
    },
    placeholder1: {
      type: String,
      default: () => '请输入详细地址'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    // 10 寄件地址 20 收件地址
    addressType: {
      type: String,
      default: () => ''
    },
    // 展示类型<line,block,default>
    type: {
      type: String,
      default: () => ''
    },
    // 是否开启最低高度
    hasMinHeight: {
      type: Boolean,
      default: false
    },
    // vtsUI
    uicascader: {
      type: Number || String,
      default: () => 12
    },
    uiautocomplete: {
      type: Number || String,
      default: () => 12
    }
  },
  data () {
    const checkEmoji = async (rule, value, callback) => {
      if (Regular.emoji.test(value)) {
        return callback('详细地址不支持特殊字符')
      }
      callback()
    }
    const checkDetailAddress = (rule, value, callback) => {
      if (this.type !== 'block' && this.errorMsgOfdistrict) {
        callback()
      }
      if (!value) {
        return callback('详细地址不能为空')
      }
      callback()
    }
    return {
      formRules: {
        detailAddress: [
          // { required: true, message: '详细地址不能为空', trigger: 'blur' },
          { validator: checkDetailAddress, trigger: 'change' },
          { min: 5, message: '详细地址不能少于5个字', trigger: 'blur' },
          { max: 120, message: '详细地址不能超过120个字', trigger: 'blur' },
          { validator: checkEmoji, trigger: 'blur' },
        ],
      },
    }
  },
  setup (props, { root, emit }) {
    const formRef = ref(null)
    const autocompleteRef = ref(null)
    const analysisRef = ref(null)
    const autoAddressInfo = reactive({
      zIndex: ''
    })
    const formData = reactive({
      districtList: [''],
      detailAddress: ''
    })

    const autoPopperClass = computed(() => {
      return `address-autocomplete`
    })

    // 过滤空白三级地址
    const districtListArr = computed(() => {
      return formData.districtList ?.filter(i => i && i.trim()) || []
    })

    watch(() => props.data, d => {
      nextTick(() => {
        initFormData(d)
      })
    }, { immediate: false, deep: true })

    const initFormData = function(data) {
      formData.districtList = data ?.districtList || []
      formData.detailAddress = data ?.detailAddress
      if (data && data.districtList ?.length > 0 || data ?.detailAddress) {
        validateForm()
      }
    }

    const errorMsgOfdistrict = ref('')
    const fullAddress = computed(() => {
      return formData.districtList.join('').trim() + (formData.detailAddress || '').trim()
    })

    watch(() => errorMsgOfdistrict.value, d => {
      if (d && props.type !== 'block') {
        formRef.value.clearValidate(['detailAddress'])
      }
    }, { immediate: true })
    const { getAddressSuggestions, getThirdAddress } = useAddressSuggest()
    const { parseAddress, getDistrictChildNodesById, getSuggestDistrictsByKeyword, addressAnalysis } = useAddress()
    const addressSuggest = async (queryString, cb) => {
      if (districtListArr.value.length === 0) {
        autocompleteRef.value.activated = false
      }
      const list = await getAddressSuggestions(formData.districtList, queryString)
      autocompleteRef.value.activated = list.length !== 0
      cb(list)
      checkNeedParseAddress(queryString, list)
      return list?.length > 0
    }
    // 是否调用智能解析
    const checkNeedParseAddress = (queryString, list) => {
      if (districtListArr.value ?.length === 0 && list ?.length === 0) {
        fillAddress(queryString)
      }
    }
    const setSplitAddressResult = async result => {
      try {
        if (!result) {
          return
        }
        const { districtList, detailAddress } = result
        // 解析存在省市区才更新省市区
        if (districtList && districtList.length > 0) {
          formData.detailAddress = detailAddress || ''
          await setDistrict(districtList)
          formData.districtList = districtList || []
        }
      } finally {
        valueChange()
      }
    }
    const setDistrict = async districtList => {
      let msg = ''
      if (formData.districtList ?.length > 1 && districtList ?.length > 1
          && formData.districtList.join('') !== districtList.join('')) {
        let msg1, msg2
        if (formData.districtList[0] !== districtList[0]) {
          msg1 = `${districtList[0]}的${districtList[1]}`
          msg2 = districtList[0]
        } else if (districtList.length > 1 && formData.districtList[1] !== districtList[1]) {
          msg1 = `${districtList[0]}的${districtList[1]}`
          msg2 = districtList[1]
        } else if (districtList.length > 2 && formData.districtList[2] !== districtList[2]) {
          msg1 = `${districtList[1]}的${districtList[2]}`
          msg2 = districtList[2]
        }
        if (msg1 && msg2) {
          // msg = `您选择的地址可能属于${msg1},是否需要切换到${msg2}`
          const h = root.$createElement
          msg = h('p', null, [
            h('span', null, '您选择的地址可能属于'),
            h('span', { style: 'color: #fe8151' }, msg1),
            h('span', null, `是否需要切换到${msg2}`),
          ])
        }
      }
      if (msg) {
        // return root.$confirm(msg, '温馨提示')
        if (typeof msg === 'object') {
          return root.$kye_message.$message({
            message: msg,
            type: 'warning'
          })
        } else {
          return root.$kye_message.confirm(msg)
        }
      }
    }

    const handleDetailAddressChange = debounce(async function(e) {
      if (e.item) {
        selectSuggestAddress(e)
      } else {
        detailAddressChange()
      }
    }, 300)

    // 失去焦点》调用智能分单接口
    const handleAddressAnalysis = async e => {
      if (formData.detailAddress.length < 5 || !formData.districtList || formData.districtList.length === 0) {
        return
      }
      const pageRemindFlag = addressStorage.checkOne(window.location.pathname) ? '1' : '0'
      let hasAddress = await addressAnalysis({ address: fullAddress.value, addressType: props.addressType, pageRemindFlag })
      if (!hasAddress) {
        await checkAddressSuggest()
      }
    }

    const checkAddressSuggest = async ()=>{
      return await addressSuggest(formData.detailAddress, lists => {
        if (lists ?.length > 0) {
            analysisRef.value ?.showDialog(lists)
            autocompleteRef.value.activated = false
        }
      })
    }

    // 智能分单地址重选
    function handleAnalysisChange (val) {
      handleDetailAddressChange(val)
    }

    //详细地址变更
    const detailAddressChange = async () => {
      try {
        if (!formData.detailAddress) {
          return
        }
        valueChange()

        let addressTemp = formData.detailAddress
        if (addressTemp && formData.districtList ?.length > 0) {
          const districtText = formData.districtList.join('')
          addressTemp = districtText + addressTemp.replace(districtText, '')
        }
        // fillAddress(addressTemp)
      } catch {
        //
      } finally {
        valueChange()
      }
    }

    const handleDetailClear = () => {
      autocompleteRef.value.handleFocus()
    }

    // <地址解析功能取消> 解析并填充地址
    const fillAddress = async address => {
      const result = await parseAddress(address)
      await setSplitAddressResult(result)
    }

    //省市区变更
    const districtChange = selectedOptions => {
      formData.districtList = selectedOptions.map(o => o.label)
      valueChange()
    }
    // 触发热门城市
    const handleHotCity = arr => {
      formData.districtList = arr
      formData.detailAddress = ''
    }
    //选择联想地址
    const selectSuggestAddress = async addressInfo => {
      const item = addressInfo.item
      let districtListParse = await getThirdDistrict(addressInfo.item ?.location)
      const address_province = districtListParse ? districtListParse[0] : item.province
      const address_city = districtListParse ? districtListParse[1] : item.city
      const address_district = districtListParse ? districtListParse[2] : item.district

      let districtList = [root.$trim(address_province, '市'), address_city, address_district]

      let result
      if (districtList.filter(f => f).length < 2) {
        result = await parseAddress(addressInfo.value)
      } else {
        let districtText = districtList.join('')
        if (address_province.endsWith('市')) {
          districtText = address_city + address_district
        } else if (districtListParse) {
          districtText = address_province + address_city
        }
        let detailAddress
        if (districtListParse) {
          detailAddress = addressUtil.specialAddressFormat(item.address_origin, item.title_origin)
        } else {
          detailAddress = addressInfo.value
        }

        detailAddress = detailAddress.replace(districtText, '')
        result = { districtList, detailAddress }
      }

      await setSplitAddressResult(result)
    }

    // 联想经纬度获取三级地址,正常数据返回4级无需处理，3级为存在重复
    async function getThirdDistrict ({ lng, lat }) {
      if (!lng || !lat) {
        return null
      }
      const params = {
        longitude: lng,
        latitude: lat
      }
      let districtList = await getThirdAddress(params)
      return districtList && districtList.length === 3 ? districtList : null
    }

    const validateForm = async () => {
      errorMsgOfdistrict.value = ''
      if (!formData.districtList || formData.districtList.filter(d => d).length < 1) {
        errorMsgOfdistrict.value = '省市区不能为空'
        return
      } else if (formData.districtList.filter(d => d).length < 2) {
        errorMsgOfdistrict.value = '省市区至少要包含省市二级'
        return
      }
      try {
        await formRef.value.validate()
      }
      catch {
        return
      }
      if (fullAddress.value.length < 11) {
        errorMsgOfdistrict.value = '地址长度不能小于11位'
        return
      }
      return true
    }

    const checkAddressValid = () => {
      if (!formData.districtList || formData.districtList.filter(d => d).length < 1) {
        return false
      }
      if (formData.districtList.filter(d => d).length < 2) {
        return false
      }
      if (!formData.detailAddress || formData.length < 5) {
        return false
      }
      if (fullAddress.value.length < 11) {
        return false
      }
      return true
    }
    // //判断地址是否为空
    // const checkIsEmpty = ()=>{
    //   const data = props.data
    //   if(!data ){
    //     return true
    //   }
    //   if((!data.districtList || data.districtList.length<1) && !data.detailAddress){
    //     return true
    //   }
    // }

    const reset = () => {
      formData.districtList = []
      formData.detailAddress = ''
      errorMsgOfdistrict.value = ''
      nextTick(() => {
        formRef.value.clearValidate()
      })
    }

    const valueChange = debounce(async function() {
      props.data.districtList = formData.districtList,
      props.data.detailAddress = formData.detailAddress
      const validResult = await validateForm()
      emit('change', { validResult, fullAddress: fullAddress.value })
      await handleAddressAnalysis()
    }, 500)

    return {
      fullAddress,
      formRef,
      autocompleteRef,
      analysisRef,
      formData,
      errorMsgOfdistrict,
      autoAddressInfo,
      autoPopperClass,
      addressSuggest,
      getDistrictChildNodesById,
      getSuggestDistrictsByKeyword,
      handleDetailAddressChange,
      handleDetailClear,
      handleAddressAnalysis,
      handleAnalysisChange,
      handleHotCity,
      districtChange,
      selectSuggestAddress,
      reset,
      validateForm,
      checkAddressValid,
      checkAddressSuggest
    }
  },
  methods: {
    // async addressChange () {
    //   await this.validateForm()
    //   this.$emit('change')
    // },
    // addressLoaded () {
    //   this.$refs.cascaderRef.displayText = this.formData.districtList[0] + this.formData.districtList[1] + this.formData.districtList[2]
    // }
  }
}
</script>

<style lang="scss">
  .address-autocomplete {
    height: unset;
    min-width: 220px;
    min-height: 54px;
    font-size: 12px;
    color: #999999;
    border-radius: 4px;
    ul li {
      line-height: 1;
      padding: 12px 16px;
    }
    .title {
      line-height: 1;
      font-size: 14px !important;
      color: #333333;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-bottom: 6px;
    }
    .address {
      line-height: 1.5;
    }
  }
</style>
<style lang="scss" scoped>
  .address-container {
    /deep/ {
      .el-form .el-col {
        padding: 0 !important;
      }
    }
  }
  /deep/ {
    .el-form-item {
      margin-bottom: 0 !important;
    }
    .el-form-item__content {
      padding-bottom: 0 !important;
      .el-autocomplete {
        width: 100% !important;
      }
    }
  }
</style>
