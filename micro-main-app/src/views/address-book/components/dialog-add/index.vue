<template>
  <ky-dialog :width="!isVtsAdd?'890px':'500px'"
             class='dialogForm page-style1 dialog-2021 dialog-extend-css'
             custom-class='admin-dialog'
             :title='formTitle'
             :visible.sync='dialogForm1'
             :before-close='closeDialog'
             :modal='dialogModal'
             append-to-body
             :close-on-click-modal='false'>
  <ky-ui-tip type='warning'
             class='mb_20'
             v-if='show_parse_tip'>请检查地址、姓名、电话信息等是否准确，如有遗漏请及时修改
  </ky-ui-tip>
  <el-form class='kye-form--normal'
           ref='formName'
           :rules='rules'
           :model='formData'
           label-position='left'
           label-width='100px'
           inline
           v-loading='pageLoading'
           v-if='!isVtsAdd'>
  <ky-ui-label title='地址信息'
               :desc="addressType ==='20' ? '填写手机号更方便派货' : '填写手机号更方便取货'" />
  <el-row :gutter='30'>
    <el-col :span='6'>
      <el-form-item label='公司名称'
                    prop='company'>
        <el-input placeholder='请填写公司名称'
                  :maxlength='32'
                  v-model='formData.company'
                  clearable
                  :disabled='disableCompanyName || isVipshop'></el-input>
      </el-form-item>
    </el-col>
    <el-col :span='6'>
      <el-form-item :label="addressType === '20' ? '收件联系人' : '联系人'"
                    prop='contact'>
        <encrypt-field-input v-if="showEncryptInput('contact')"
                             :encryptField='encryptField.contact' />
        <el-input v-else
                  placeholder='请填写联系人姓名'
                  v-model.trim='formData.contact'
                  clearable></el-input>
      </el-form-item>
    </el-col>
    <el-col :span='6'>
      <el-form-item label='手机号码'
                    prop='contactPhone'>
        <encrypt-field-input v-if="showEncryptInput('contactPhone')"
                             :encryptField='encryptField.contactPhone' />
        <el-input v-else
                  placeholder='请填写11位手机号'
                  v-kyerestrict.positive
                  @input='changeNum'
                  v-model.trim='formData.contactPhone'
                  @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'contactPhone')"
                  clearable></el-input>
      </el-form-item>
    </el-col>
    <el-col :span='6'>
      <el-form-item label='固定电话'
                    prop='telephone'>
        <encrypt-field-input v-if="showEncryptInput('telephone')"
                             :encryptField='encryptField.telephone' />
        <el-input v-else
                  placeholder='请填写固定电话'
                  v-model='formData.telephone'
                  maxlength='20'
                  clearable
                  @paste.native.capture.prevent="e=>handlePhoneOnPaste(e,formData,'telephone')"></el-input>
      </el-form-item>
    </el-col>
  </el-row>
  <!--      <el-row>-->
  <!--        <el-form-item label="详细地址" label-width="100%" class="w_full form-address-item" prop="address">-->
  <!--          <encrypt-field-input v-if="showEncryptInput('address')" :encryptField="encryptField.address" />-->
  <!--          <el-input v-else placeholder="请填写详细地址" v-model="formData.address" clearable></el-input>-->
  <!--        </el-form-item>-->
  <!--      </el-row>-->
  <el-row :gutter='30' v-if="!isVipshop">
    <el-col :span='24'>
      <el-form-item label='省市区'
                    label-width='100%'
                    class='w_full form-address-item label-required'
                    prop='address'>
        <ky-address ref='addressRef'
                    :data='addressData'
                    :addressType='addressType'
                    type='block'
                    tabCascaderPlaceholder='请选择省市区'
                    placeholder1='请填写所在街道及详细地址' />
      </el-form-item>
    </el-col>
  </el-row>
  <el-row :gutter='30'>
    <el-col :span='24'>
      <el-form-item label='备注'
                    prop='remark'
                    label-width='100%'
                    class='w_full'>
        <el-input v-model.trim='formData.remark'
                  size='medium'
                  placeholder='请填写备注（选填）'
                  clearable
                  maxlength='100'
                  show-word-limit
                  class='input-remark input-limit-suffix'></el-input>
      </el-form-item>
    </el-col>
  </el-row>
  <el-row>
    <!--        <el-form-item prop="isCollect">-->
    <!--          <el-checkbox label="设为常用" v-model="formData.isCollect"></el-checkbox>-->
    <!--        v-if="addressType === '10'" </el-form-item>-->
    <el-form-item v-if="addressType === '10'">
      <div class='flex'>
            <span class='theme-color mr_4 fs_12'
                  style='color: #03050D;'>设为默认</span>
        <el-switch v-model='formData.isDefault'
                   active-color='#9378FA'
                   :width='24'
                   class='kye-switch--small'
                   inactive-color='#BFC5D1'>
        </el-switch>
      </div>
    </el-form-item>
  </el-row>
  <ky-ui-label title='智能填写'></ky-ui-label>
  <el-row>
    <el-col :span='24'>
      <el-form-item :error='errorInfo.parse'
                    class='w_full textarea_col'>
        <div class='address-parse__content'>
          <el-input v-model='addressStr'
                    type='textarea'
                    class='address-parse__input'
                    placeholder='粘贴文本，自动识别姓名、电话和地址。例如：张三 13666666666 广东省深圳市宝安区航站四路跨越速运大厦'
                    clearable
                    maxlength='100'
                    @blur="errorInfo.parse=''"
                    show-word-limit
                    :autosize='{minRows:4}'
                    resize='none'></el-input>
          <el-button class='address-parse__btn'
                     size='small'
                     type='primary'
                     round
                     plain
                     v-btnThrottle
                     @click='parseAddress'>识别
          </el-button>
        </div>
      </el-form-item>
    </el-col>
  </el-row>
  </el-form>
  <!-- vts新增 -->
  <el-form class='kye-form--normal'
           ref='formName'
           :rules='rules'
           :model='formData'
           label-position='left'
           label-width='100px'
           inline
           v-loading='pageLoading'
           v-else>
  <ky-ui-label title='地址信息' />
  <el-row :gutter='30'>
    <el-col :span='12'>
      <el-form-item :label="addressType === '20' ? '收件联系人' : '联系人'"
                    prop='contact'>
        <encrypt-field-input v-if="showEncryptInput('contact')"
                             :encryptField='encryptField.contact' />
        <el-input v-else
                  placeholder='请填写联系人姓名'
                  v-model.trim='formData.contact'
                  clearable></el-input>
      </el-form-item>
    </el-col>
    <el-col :span='12'>
      <el-form-item label='手机号码'
                    prop='contactPhone'>
        <encrypt-field-input v-if="showEncryptInput('contactPhone')"
                             :encryptField='encryptField.contactPhone' />
        <el-input v-else
                  placeholder='请填写11位手机号码'
                  v-kyerestrict.positive
                  @input='changeNum'
                  v-model.trim='formData.contactPhone'
                  clearable></el-input>
      </el-form-item>
    </el-col>
  </el-row>
  <!--      <el-row>-->
  <!--        <el-form-item label="详细地址" label-width="100%" class="w_full form-address-item" prop="address">-->
  <!--          <encrypt-field-input v-if="showEncryptInput('address')" :encryptField="encryptField.address" />-->
  <!--          <el-input v-else placeholder="请填写详细地址" v-model="formData.address" clearable></el-input>-->
  <!--        </el-form-item>-->
  <!--      </el-row>-->
  <el-row :gutter='30'>
    <el-col :span='24'>
      <el-form-item label='省市区'
                    label-width='100%'
                    class='w_full form-address-item label-required'
                    prop='address'>
        <ky-address ref='addressRef'
                    :data='addressData'
                    :addressType='addressType'
                    type='block'
                    tabCascaderPlaceholder='请选择省市区'
                    placeholder1='请填写所在街道及详细地址' />
      </el-form-item>
    </el-col>
  </el-row>
  <el-row>
    <!--        <el-form-item prop="isCollect">-->
    <!--          <el-checkbox label="设为常用" v-model="formData.isCollect"></el-checkbox>-->
    <!--        v-if="addressType === '10'" </el-form-item>-->
    <el-form-item v-if="addressType === '10'">
      <div class='flex'>
            <span class='theme-color mr_4 fs_12'
                  style='color: #03050D;'>设为默认</span>
        <el-switch v-model='formData.isDefault'
                   active-color='#9378FA'
                   :width='24'
                   class='kye-switch--small'
                   inactive-color='#BFC5D1'>
        </el-switch>
      </div>
    </el-form-item>
  </el-row>
  <ky-ui-label title='智能填写'></ky-ui-label>
  <el-row>
    <el-col :span='24'>
      <el-form-item :error='errorInfo.parse'
                    class='w_full textarea_col'>
        <div class='address-parse__content'>
          <el-input v-model='addressStr'
                    type='textarea'
                    class='address-parse__input'
                    placeholder='粘贴文本，自动识别姓名、电话和地址。例如：张三 13666666666 广东省深圳市宝安区航站四路跨越速运大厦'
                    clearable
                    maxlength='100'
                    @blur="errorInfo.parse=''"
                    show-word-limit
                    :autosize='{minRows:4}'
                    resize='none'></el-input>
          <el-button class='address-parse__btn'
                     size='small'
                     type='primary'
                     round
                     plain
                     v-btnThrottle
                     @click='parseAddress'>识别
          </el-button>
        </div>
      </el-form-item>
    </el-col>
  </el-row>
  </el-form>
  
  <div slot='footer'
       class='dialog-footer'>
    <el-button @click='handleCancel'>取 消</el-button>
    <el-button type='primary'
               v-btnThrottle
               @click="saveForm('formName')">确定
    </el-button>
  </div>
  </ky-dialog>
</template>

<script>
import _ from 'lodash'
import { mapGetters } from 'vuex'
import { KyUiLabel, KyUiTip } from '@comps/ky-ui'
import { getCustomerCode, getPhone } from '@/utils/storage'
import {
  addAddressList,
  aiAddrAnalysis,
  aiAddrAnalysisCallback,
  modifyAddress,
  modifyVipshopAddress
} from '@/services/api/address'
import * as clientUtil from '@utils/clientUtil'
import REGULAR from '@utils/regular'
import dataMask from '@/utils/dataMask'
import encryptCommonMixin from './encrypt-common.js'
import { validateNumber } from '@utils/validate'
import Regular from '@utils/regular'

export default {
  mixins: [encryptCommonMixin],
  name: 'dialog-add',
  components: {
    KyUiLabel,
    KyUiTip
  },
  props: {
    // 是否显示遮罩
    dialogModal: {
      type: Boolean,
      default: () => true
    },
    addressType: {
      type: String,//10-寄件，20-收件,为空-唯品
      require: true
    },
    isVipshop:{
      type:Boolean
    }
  },
  data() {
    const phoneValid = (rule, value, callback) => {
      if (!this.formData) {
        return
      }
      
      const mobileValid = REGULAR.mobileNumber.test(this.formData.contactPhone)
      const telValid = REGULAR.telephoneNew.test(this.formData.telephone)
      const addressType = this.addressType
      if ((mobileValid && telValid) || (mobileValid && !this.formData.telephone) || (telValid && !this.formData.contactPhone)) {
        callback()
        this.$refs.formName.clearValidate(['telephone'])
        if (addressType !== '10') {
          this.$refs.formName.clearValidate(['contactPhone'])
        }
      } else {
        if (!this.formData.contactPhone && this.isVtsAdd) {
          callback(new Error('手机号码不能为空'))
          this.$refs.formName.clearValidate(['telephone'])
          return
        }
        if (!this.formData.contactPhone && !this.formData.telephone) {
          callback(new Error('手机号码和固定电话不能同时为空'))
          this.$refs.formName.clearValidate(['telephone'])
          return
        }
        if (rule.field === 'telephone' && addressType !== '10') {
          this.$refs.formName.validateField(['contactPhone'])
        }
      }
    }
    
    const contactValid = (rule, value, callback) => {
      if (!this.formData) {
        return ''
      }
      const reg = Regular.text2
      if (!(reg.test(value))) {
        if (value.length < 2) {
          callback(new Error('联系人姓名不能少于两个字'))
        } else if (value.length > 30) {
          callback(new Error('联系人姓名不能超过30个字'))
        } else {
          callback(new Error('请填写正确的联系人姓名'))
        }
      } else {
        callback()
      }
    }
    const companyValid = (rule, value, callback) => {
      if (!this.formData) {
        return ''
      }
      if (!value) {
        callback()
        return
      }
      const reg = REGULAR.text1
      if (!(reg.test(value)) || value.length < 2 || value.length > 32) {
        if (value.length < 2) {
          callback(new Error('公司名称不能少于两个字'))
        }
        if (value.length > 32) {
          callback(new Error('公司名称不超过32个字'))
        } else {
          callback(new Error('请填写正确的公司名称'))
        }
      } else {
        if (validateNumber(value)) {
          callback(new Error('公司名称不能为纯数字，请填写正确的公司名称'))
        }
        callback()
      }
    }
    return {
      formData: {
        id: '',
        contact: '',
        company: '',
        contactPhone: '',
        telephone: '',
        remark: '',
        address: '',
        province: '',
        city: '',
        area: '',
        // 设为常用
        isCollect: false,
        // 设为默认
        isDefault: false
      },
      parseResultMd5: '', //地址解析对应md5
      // <弃用> 省市区信息
      districtInfo: {
        districtList: [], // [广东省，深圳市，宝安区]
        valid: false,
        validError: ''
      },
      addressData: {
        districtList: [],
        detailAddress: ''
      },
      addressStr: '',
      dialogForm1: false,
      formTitle: '',
      // 省市区信息
      districtStr: '',
      pageLoading: false,
      errorInfo: {
        parse: ''
      },
      // 表单验证规则
      rules: {
        contact: [
          { required: true, message: '联系人不能为空', trigger: 'blur' },
          { validator: contactValid, trigger: 'blur' }
        ],
        company: [
          // { required: true, message: '公司名称不能为空', trigger: 'blur' },
          { min: 2, max: 32, validator: companyValid, trigger: 'blur' },
          {
            pattern: Regular.text1,
            message: '请输入正确的公司名称',
            trigger: 'blur'
          }
        ],
        // 手机号
        contactPhone: [
          { pattern: REGULAR.mobileNumber, message: '请填写正确的手机号' },
          { required: this.addressType === '10', message: '请填写11位手机号' },
          { validator: phoneValid, trigger: 'blur' }
        ],
        // 固定电话
        telephone: [
          { pattern: Regular.landlinePhone3, message: '请填写正确的固定电话' },
          { validator: phoneValid, trigger: 'blur' }
        ],
        remark: [
          { max: 100, message: '运单备注最大支持100个汉字长度', trigger: 'blur' }
        ]
        // address: [
        //   { required: true, message: '详细地址不能为空', trigger: 'blur' },
        // ]
      },
      encryptField: {
        address: {
          visible: false,
          value: ''
        },
        contact: {
          visible: false,
          value: '',
          replace: val => dataMask.maskName(val)
        },
        contactPhone: {
          visible: false,
          value: '',
          replace: val => dataMask.maskMobile(val)
        },
        telephone: {
          visible: false,
          value: '',
          replace: val => dataMask.maskTelephone(val)
        }
      },
      // 是否显示智能解析提示
      show_parse_tip: false,
      pageStatus: '', // <'add','edit'>
      // 是否是vts
      isVtsAdd: false
    }
  },
  computed: {
    disableCompanyName() {
      return this.addressType === '10' && getCustomerCode() && !this.canModifySenderCompany
    },
    addressBookEncryptFields() {
      const { contact, contactPhone, telephone, address } = this.formData
      return { contact, contactPhone, telephone, address }
    },
    // titleDescription(){
    //   switch(this.addressType){
    //     case '10':
    //       return '填写手机号更方取取货'
    //     case '20':
    //       return '填写手机号更方取派货'
    //     default:
    //       return ''
    //   }
    // },
    ...mapGetters(['isEncryptField', 'canModifySenderCompany'])
  },
  watch: {
    'formData.address': function() {
      if (this.dialogForm1) {
        this.$refs['formName'].validateField(['address'])
      }
    },
    'addressStr': function(val) {
      if (val) {
        this.errorInfo.parse = ''
      }
    },
    // // 公司过滤特殊字符
    // 'formData.company': function(val) {
    //   if (val) {
    //     this.formData.company = val.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\w]/g, '').trim()
    //   }
    // },
    dialogForm1(val) {
      if (!val && this.$options && this.$data) {
        Object.assign(this.$data.formData, this.$options.data().formData)
        this.show_parse_tip = false
      } else {
        this.$refs.addressRef?.reset()
      }
    },
    addressBookEncryptFields: {
      handler(data) {
        const fields = [{ prop: 'contact', text: '联系人' }, { prop: 'contactPhone', text: '手机号码' }, {
          prop: 'telephone',
          text: '固定电话'
        }
        , { prop: 'address', text: '详细地址' }]
        fields.forEach(item => {
          if (!data[item.prop]) {
            this.encryptField[item.prop].visible = false
          }
          this.encryptField[item.prop].value = data[item.prop]
          this.encryptField[item.prop].content = data[item.prop] ? `${item.text}：${data[item.prop]}` : ''
        })
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handlePhoneOnPaste(e, formData, field) {
      const text = e.clipboardData?.getData('Text')
      if (!text) {
        return
      }
      const isMobile = !['telephone'].includes(field)
      const reg = isMobile ? /[^\d]/g : /[^\d\-]/g
      const maxLength = isMobile ? 11 : text.includes('-') ? 13 : 12
      formData[field] = text.replace(reg, '').substr(0, maxLength)
    },
    // 调用弹窗显示/关闭
    setVisible(val) {
      this.dialogForm1 = val
    },
    closeDialog() {
      this.setVisible(false)
      this.resetForm()
    },
    // 取消
    handleCancel() {
      this.$confirm('是否取消修改', { type: 'warning' }).then(() => {
        this.closeDialog()
      })
    },
    resetForm(type) {
      if (Object.keys(this.$refs).length === 0) {
        return
      }
      this.parseResultMd5 = ''
      this.$refs['formName'].resetFields()
      this.addressStr = ''
      Object.assign(this.$data.formData, this.$options.data().formData)
      
      if ((type !== 'add' || this.pageStatus === 'edit') && this.$refs.addressRef) {
        this.$refs.addressRef.reset()
      }
      if ((type === 'add' || this.pageStatus === 'add') && this.addressType === '10') {
        this.formData.company = clientUtil.getLoginCompanyName()
      }
      this.errorInfo.parse = ''
    },
    // 添加数据
    addForm(type) {
      console.log(this.$attrs, 'this.$attrsAD')
      if (type === 'vts') {
        this.isVtsAdd = true
      }
      this.formData.id = ''
      this.formTitle = '新增地址'
      this.pageStatus = 'add'
      this.dialogForm1 = true
      this.$nextTick(() => {
        this.resetForm('add')
        
      })
    },
    // 获取用户详情
    getDetail({ row }) {
      return new Promise(resolve => {
        this.$nextTick(async () => {
          this.districtStr = (row.province + row.city + row.area)
          this.addressData.districtList = row.area ? [row.province, row.city, row.area] : [row.province, row.city]
          this.addressData.detailAddress = row.address
          for (let i in row) {
            this.formData[i] = row[i]
          }
          if (this.disableCompanyName) {
            this.formData.company = clientUtil.getLoginCompanyName()
          }
          this.$nextTick(() => {
            this.resetEncryptVisible()
          })
          resolve('true')
        })
      })
      
    },
    isPhone(val) {
      return /(1[3465789]\d{9})$/.test(val)
    },
    // 获取更新地址簿参数
    getUpdateParam(row) {
      // 获取address 实时数据
      const address = this.$refs.addressRef.formData.detailAddress
      let province, city, area
      if (row && !this.$refs.addressRef) {
        province = row.province
        city = row.city
        area = row.area
      } else {
        const districtList = this.addressData?.districtList || []
        province = districtList[0]
        city = districtList[1]
        area = districtList[2]
      }
      return {
        addressType: this.addressType,
        id: this.formData.id,
        phone: getPhone(),
        customerCode: getCustomerCode(),
        contact: this.formData.contact,
        company: this.formData.company,
        contactPhone: this.formData.contactPhone,
        telephone: this.formData.telephone,
        province: province,
        city: city,
        area: area,
        address: address,
        remark: this.formData.remark,
        isCollect: this.formData.isCollect,
        defaultFlag: this.formData.isDefault,
        source: 'PC客户端'
      }
    },
    async modifyVipshopAddress() {
      const params = {
        userId: getPhone(),
        customerCode: this.formData.customerCode,
        contacts: this.formData.contact,
        fixedTelephone: this.formData.telephone,
        mobile: this.formData.contactPhone,
        remark: this.formData.remark
      }
      
      this.$refs.formName.validate(async valid => {
        // const addressValid = await this.$refs.addressRef.validateForm()
        if (valid) {
          this.pageLoading = true
          modifyVipshopAddress(params)
            .then(res => {
              this.pageLoading = false
              if (res.code !== 0) {
                return
              }
              this.$message.success('保存成功')
              // 新增需刷新第一页
              this.refreshList(!this.formData.id)
              this.resetForm()
              this.setVisible(false)
            }).catch(e => {
              this.pageLoading = false
              console.log(e)
            })
        }
      })
    },
    // 保存数据
    async saveForm(formName) {
      if (!this.addressType) {
        this.modifyVipshopAddress()
        return
      }
      let fn = addAddressList
      let params = {}
      if (this.formData.id) {
        params = this.getUpdateParam()
        fn = modifyAddress
      } else {
        const address = this.$refs.addressRef.formData.detailAddress
        const districtList = this.addressData.districtList
        params = {
          addressType: this.addressType,
          addressList: [{
            phone: getPhone(),
            customerCode: getCustomerCode(),
            contact: this.formData.contact,
            company: this.formData.company,
            contactPhone: this.formData.contactPhone,
            telephone: this.formData.telephone,
            province: districtList[0] || '',
            city: districtList[1] || '',
            area: districtList[2] || '',
            address: address,
            remark: this.formData.remark,
            isCollect: this.formData.isCollect,
            defaultFlag: this.formData.isDefault,
            source: 'PC客户端'
          }]
        }
      }
      this.$refs[formName].validate(async valid => {
        const addressValid = await this.$refs.addressRef.validateForm()
        if (valid && addressValid && fn) {
          this.pageLoading = true
          fn(params)
            .then(res => {
              this.pageLoading = false
              if (res.code !== 0) {
                return
              }
              this.$message.success('保存成功')
              // 新增需刷新第一页
              this.refreshList(!this.formData.id)
              this.resetForm()
              this.setVisible(false)
            }).catch(e => {
              this.pageLoading = false
              console.log(e)
            })
        }
      })
      this.parseAddressResultCallback()
    },
    // 修改数据
    async modAddress({ index, row }, type) {
      if (type === 'vts') {
        this.isVtsAdd = true
      }
      this.formTitle = '修改联系人'
      this.pageStatus = 'edit'
      this.dialogForm1 = true
      await this.getDetail({ index, row })
    },
    // 地址解析
    parseAddress: _.throttle(async function() {
      if (!this.addressStr) {
        this.errorInfo.parse = '请填写需要解析的信息'
        return
      } else {
        if (this.addressStr.length < 13) {
          this.$message.error('请输入至少13个字')
          return
        }
        this.errorInfo.parse = ''
      }
      
      let result = clientUtil.smartRecognize(this.addressStr) || {}
      let res = await aiAddrAnalysis(this.addressStr)
      this.resetForm()
      if (res.code !== 0) {
        this.formData = Object.assign(this.formData, {
          contact: result.name,
          // company: result.company,
          contactPhone: result.mobiles[0],
          address: result.address
        })
        return
      }
      
      let data = res.data
      if (data) {
        const { name, city, district } = data
        const province = data.province
        // const addressArr = data.detailAddress.split(' ') || []
        const districtStr = province + city + district
        this.formData = Object.assign(this.formData, {
          contact: name,
          address: data.address,
          contactPhone: data.contactPhone,
          // company: '',
          telephone: data.telephone,
          province: province,
          city: city,
          area: district,
          districtStr: districtStr
        })
        this.addressData.districtList = district ? [province, city, district] : [province, city]
        this.addressData.detailAddress = data.detailAddress
        this.parseResultMd5 = data.aimd5
        // 增加识别效验
        // this.$refs['formName'].validate()
        this.show_parse_tip = true
      }
    }, 500),
    parseAddressResultCallback() {
      if (!this.parseResultMd5) {
        return
      }
      const { districtList, detailAddress } = this.addressData
      const params = {
        name: this.formData.contact,
        province: districtList[0],
        city: districtList[1],
        district: districtList[2] || '',
        detailedAddress: detailAddress,
        phoneNumber: this.formData.contactPhone || this.formData.telephone,
        // companyName:'',
        aimd5: this.parseResultMd5
      }
      aiAddrAnalysisCallback(params)
    },
    /**
     * 刷新列表
     * @param val 是否强制刷新第一页
     */
    refreshList(val) {
      this.$emit('refreshList', val)
    },
    changeNum() {
      //限制长度
      if (this.formData.contactPhone.length > 11) {
        this.formData.contactPhone = this.formData.contactPhone.slice(0, 11)
      }
    }
  }
}
</script>

<style lang='scss' scoped>
// .dialog-extend-css {
//   /deep/ {
//     .address-cascader--wrapper {
//       .el-popover__reference {
//         margin-right: 14px;
//       }
//     }
//     .address-input--wrapper {
//       .el-form-item__content {
//         margin-left: 15px;
//       }
//     }
//   }
// }
.address-parse__content {
  position: relative;
  
  .address-parse__btn {
    position: absolute;
    bottom: 13px;
    right: 13px;
    width: 72px;
    border-radius: 4px;
    
    &.is-plain {
      background: #f7f7f7;
      
      &:hover,
      &:focus {
        background: #8365f6;
      }
    }
  }
}

.address {
  /deep/ .el-form-item {
    margin-right: 0;
  }
}

/deep/ .el-form-item__content {
  line-height: 20px;
}

/deep/ .address-parse__input {
  .el-textarea__inner {
    width: 100%;
    height: 148px;
    padding: 12px;
    opacity: 1;
    background: #f7f7f7;
    border-radius: 6px;
    border-width: 0;
    color: $--color-text-primary;
  }
  
  .el-input__count {
    right: 108px;
    bottom: 20px;
    font-size: 14px;
    color: #999999;
    background: none;
  }
}

.w_full {
  /deep/ .el-form-item__content {
    width: 100%;
  }
}

.textarea_col {
  margin-bottom: 0;
}

.el-form-item__label {
  color: #333333;
}

.address-container {
  /deep/ .el-row {
    .el-col {
      &:first-child {
        width: 30%;
      }
      
      &:last-child {
        width: 70%;
      }
    }
    
    .el-form-item {
      display: block;
    }
  }
}

/deep/ .dialog-footer {
  .el-loading-mask {
    border-radius: 20px;
  }
}

/* form reset */
.el-form--inline .el-form-item {
  margin-right: 0;
}

/deep/ .el-input__inner {
  height: 30px;
}

.form-address-item {
  /deep/ {
    .el-form-item {
      margin-right: 0;
    }
  }
}

.address-container {
  /deep/ .el-row .el-col {
    &.address-cascader--wrapper {
      width: calc(50% + 15px) !important;
      
      .input-container .el-input__icon {
        right: 29px !important;
      }
    }
    
    &.address-input--wrapper {
      width: calc(50% - 15px) !important;
    }
    
    padding: 0 !important;
    
    &:last-child {
      position: relative;
      
      &::after {
        content: '详细地址';
        position: absolute;
        top: -18px;
        left: 0px;
        height: 20px;
        color: $--color-text-primary;
        font-size: 12px;
      }
      
      &::before {
        content: '*';
        position: absolute;
        top: -16px;
        left: 49px;
        color: #f56c6c;
      }
    }
  }
}

.label-required /deep/ .el-form-item__label {
  &::after {
    content: '*';
    color: #f56c6c;
    margin-right: 4px;
  }
}

.kye-form--normal {  
  /deep/ {
    .ky-ui-label .form-label-header{
      .title {
        margin-right: 12px;
      }
      &>span:last-of-type{
        color: #717187;
        font-size: $--font-size-small;
      }
    }
    .el-form-item__content {
      width: 100%;
    }
  }
}
</style>