<template>
  <div class='page__container page--default page-style1'>
    <div class='page__content'>
      <el-form :model='formData' :rules='formRule' label-position='top' ref='form' v-loading='loading'>
        <div class='page-box pb0--strict'>
          <div class='page-header__title cursor'>
            默认设置
            <span>(配置仅适用于客户端)</span>
          </div>
        </div>
        <div class='page-box'>
          <div class='page-box__title'>
            <i class='iconfont icon-sender'></i>
            寄方信息
          </div>
          <div class='page-box__content'>
            <el-row type='flex' :gutter='20'>
              <el-col :span='6'>
                <el-form-item label='寄件公司' prop='sendCompany'>
                  <el-input placeholder='请输入寄件公司' size='medium' clearable maxLength='50' v-model='formData.sendCompany'></el-input>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='寄件人' prop='sender'>
                  <el-input placeholder='请输入真实姓名' size='medium' clearable :maxlength='30' v-model='formData.sender'></el-input>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='手机号码' prop='sendMobile'>
                  <el-input :maxlength='11' size='medium' placeholder='请输入寄件人手机号' clearable v-model='formData.sendMobile' v-kyerestrict.positive></el-input>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='固定电话' prop='sendPhone'>
                  <el-input placeholder='请输入固定电话（格式：0755-8888888-00）' size='medium' clearable v-model='formData.sendPhone'></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row type='flex' :gutter='20'>
              <el-col :span='12'>
                <el-form-item label='详细地址' label-width='100%' class='w_full form-address-item' :class="{'item-error--hide':isAddressEmpty()}" prop='address'>
                  <!-- <address-item :fullAddress.sync="formData.address" ref="addressRef" /> -->
                  <ky-address ref='addressRef' :data='addressData' />
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='取货联系人' prop='pickupPerson'>
                  <el-input placeholder='请输入真实姓名' size='medium' clearable :maxlength='30' v-model='formData.pickupPerson'></el-input>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='取货手机' prop='pickupMobile'>
                  <el-input :maxlength='11' size='medium' placeholder='请输入取货手机' clearable v-model='formData.pickupMobile' v-kyerestrict.positive></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class='page-box'>
          <div class='page-box__title'>
            <i class='iconfont icon-category-goods'></i>
            基础信息
          </div>
          <div class='page-box__content'>
            <el-row type='flex' :gutter='20'>
              <el-col :span='6'>
                <el-form-item label='付款方式' prop='payType'>
                  <el-select size='medium' placeholder='请选择付款方式' clearable v-model='formData.payType'>
                    <el-option v-for='item in payLists' :key='item' :label='item' :value='item'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span='6' v-show="formData.payType === '第三方付'">
                <el-form-item label='付款帐号' prop='payAccount'>
                  <el-autocomplete size='medium' clearable v-model='formData.payAccount' :fetch-suggestions='queryPayAccountList' v-kyerestrict.positive placeholder='请输入付款账号' :maxlength='20'>
                  </el-autocomplete>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='托寄物' prop='goodsName'>
                  <el-autocomplete size='medium' clearable v-model='formData.goodsName' :fetch-suggestions='queryGoodsList' placeholder='请输入托寄物' :maxlength='30'>
                  </el-autocomplete>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='服务方式' prop='serviceModel'>
                  <el-select size='medium' placeholder='请选择服务方式' clearable v-model='formData.serviceModel'>
                    <el-option v-for='item in serverLists' :key='item' :label='item' :value='item'></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='总件数' prop='totalNumber'>
                  <el-input placeholder='请输入件数' clearable v-model='formData.totalNumber' v-kyerestrict.positive>
                    <template slot='append'>(件)</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span='6'>
                <el-form-item label='总重量' prop='totalWeight'>
                  <el-input placeholder='请输入重量' clearable v-model='formData.totalWeight'>
                    <template slot='append'>(kg)</template>
                  </el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
        <div class='page-box'>
          <div class='page-box__title'>
            <i class='iconfont icon-category-addtional'></i>
            增值服务
          </div>
          <div class='page-box__content'>
            <el-row type='flex' :gutter='20'>
              <el-col :span='6'>
                <el-form-item label='代收货款' prop='collectionFee'>
                  <el-input placeholder='请输入' clearable v-model='formData.collectionFee'>
                    <template slot='append'>(元)</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span='18'>
                <el-form-item label='备注' props='remark'>
                  <el-input class='input-limit-suffix' placeholder='请输入备注' clearable v-model.trim='formData.remark' maxlength='150' show-word-limit></el-input>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>
      </el-form>
    </div>
    <div class='page__footer admin-footer'>
      <div class='button-group'>
        <el-button type='primary' :loading='loading' @click='handleSubmit' v-btnThrottle>保存
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import * as settingApi from '@api/setting'
import REGULAR from '@utils/regular'
import { getPhone } from '@utils/storage'

export default {
  name: 'default-setting',
  data () {
    const numberValid = (rule, value, callback) => {
      if (value > 9999) {
        callback(new Error('单票件数不能超过9999'))
      }
      callback()
    }

    const weightValid = (rule, value, callback) => {
      if (value > 999999) {
        callback(new Error('单票重量不能超过999999'))
      }
      callback()
    }
    const moneyValid = (rule, value, callback) => {
      if (value > 9999999.99) {
        callback(new Error('代收货款不能超过999999'))
      }
      callback()
    }
    // 非必填寄件人
    const userNameValid = (rule, value, callback) => {
      if (!value) {
        callback()
        return
      }
      const reg = /^[\u4e00-\u9fa5a-zA-Z0-9（）】【]{0,30}$/
      if (!(reg.test(value))) {
        if (value.length > 30) {
          callback(new Error('收件人姓名不能超过10个字'))
        } else {
          callback(new Error('请输入正确的收件人姓名'))
        }
      } else {
        callback()
      }
    }
    return {
      addressData: {
        districtList: [],
        detailAddress: '',
      },
      formData: {
        id: '',
        payType: '',
        serviceModel: '',
        sender: '',
        sendCompany: '',
        sendProvince: '',
        sendCity: '',
        sendArea: '',
        sendAddress: '',
        sendPhone: '',
        sendMobile: '',
        remark: '',
        // 付款账户
        payAccount: '',
        totalNumber: '',
        totalWeight: '',
        // 代收货款
        collectionFee: '',
        // 托寄物
        goodsName: '',
        address: '',
        pickupPerson: '',
        pickupMobile: ''
      },
      // 付款方式40 为月结用户
      payMode: '',
      formRule: {
        sender: [
          { validator: userNameValid, trigger: 'blur' }
        ],
        sendMobile: [
          { pattern: REGULAR.mobileNumber, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        sendPhone: [
          { pattern: REGULAR.landlinePhone, message: '请输入正确的固定电话', trigger: 'blur' }
        ],
        totalNumber: [
          { pattern: REGULAR.number, message: '单票件数必须为正整数', trigger: 'blur' },
          { validator: numberValid, message: '单票件数不能超过9999' }
        ],
        totalWeight: [
          { pattern: REGULAR.number, message: '单票重量必须为正整数', trigger: 'blur' },
          { validator: weightValid, message: '单票重量不能超过999999' }
        ],
        collectionFee: [
          { pattern: REGULAR.number, message: '请输入数字', trigger: 'blur' },
          { validator: moneyValid, message: '代收货款不能超过999999' }
        ],
        payAccount: [
          { pattern: REGULAR.number, message: '请输入数字', trigger: 'blur' }
        ],
        goodsName: [
          { pattern: /^[\u4e00-\u9fa5]{1,30}/, message: '请输入正确的货物信息', trigger: 'blur' },
        ],
        pickupPerson: [
          { min: 2, message: '姓名不能少于2个字', trigger: 'change' },
          { max: 30, message: '姓名不得超过30个字', trigger: 'change' },
          {
            pattern: /^[\u4E00-\u9FA5A-Za-z0-9-.·（）]{2,30}$/,
            message: '姓名不支持空格和特殊字符',
            trigger: 'change',
          },
          {
            pattern: /^((?!先生).)*$/,
            message: '姓名请不要包含“先生”',
            trigger: 'change',
          },
          {
            pattern: /^((?!女士").)*$/,
            message: '姓名请不要包含“女士”',
            trigger: 'change',
          },
          {
            pattern: /^((?!小姐").)*$/,
            message: '姓名请不要包含“小姐”',
            trigger: 'change',
          },
          {
            pattern: /^(?=.*[\u4E00-\u9FA5A-Za-z])[\s\S]{2,30}$/,
            message: '请输入真实姓名',
            trigger: 'change',
          },
        ],
        pickupMobile: [
          { len: 11, message: '请输入11位手机号', trigger: 'blur' },
          {
            pattern: REGULAR.mobileNumber,
            message: '请输入正确的手机号',
            trigger: 'blur',
          },
        ],
      },
      serverLists: [
        '当天达',
        '次日达',
        '隔日达',
        '次晨达',
        '陆运件',
        '航空件',
        '空运',
        '专运',
        '同城即日',
        '同城次日',
        '省内即日',
        '省内次日',
        '冷运件'
      ],
      // 月结用户不显示寄方付
      payLists: ['寄方付', '收方付', '第三方付'],
      loading: false,
      errorInfo: {
        address: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'historyGoodsList'
    ]),
    ...mapState(['userInfo']),
  },
  async mounted () {
    await this.handleCustom()
    await this.handleConfig()
  },
  methods: {
    isAddressEmpty () {
      if (this.addressData.districtList.length > 0 || this.addressData.detailAddress) {
        return false
      }
      return true
    },
    async handleConfig () {
      this.loading = true
      try {
        let res = await settingApi.queryDefaultConfig({})
        if (res.code === 0 && res.data) {
          const data = res.data
          this.formData = Object.assign(this.formData, data)
          this.addressData.districtList = [data.sendProvince, data.sendCity, data.sendArea].filter(f => f)
          this.addressData.detailAddress = data.sendAddress
        }
        this.loading = false
      } catch (e) {
        this.loading = false
      }

    },
    async handleCustom () {
      let res = await settingApi.queryCustomerInfo({
        phone: getPhone(),
        from: '1' // TODO: 1新官网 7 PC客户端
      })
      if (res.code === 0 && res.data) {
        this.payMode = Number(res.data.payMode)
      }
    },
    handleSubmit () {
      this.$refs.form.validate(async valid => {
        if (!valid) {
          return
        }
        const addressRef = this.$refs.addressRef
        if (!this.isAddressEmpty() && !await addressRef.validateForm()) {
          this.$message.warning('请修改提示处错误内容')
          return
        }
        const formData = { ...this.formData }
        if (formData.payType !== '第三方付') {
          formData.payAccount = ''
        }
        delete formData.address
        const districtList = this.addressData.districtList
        let params = Object.assign(formData, {
          sendProvince: districtList[0],
          sendCity: districtList[1],
          sendArea: districtList[2],
          sendAddress: this.addressData.detailAddress
        })
        let res = await settingApi.updateDefaultConfig(params)
        if (res.code === 0) {
          await this.$store.dispatch('client/setDefaultConfigAction')
          this.$message.success('保存成功')
        }
      })

    },
    // 筛选托寄物列表
    queryGoodsList (queryString, cb) {
      let results = this.historyGoodsList
      if (queryString && this.historyGoodsList && this.historyGoodsList.length > 0) {
        results = this.historyGoodsList.filter(g => g && g.includes(queryString))
      }
      cb(results.filter((i, index) => index < 5).map(m => ({ 'value': m })))
    },
    // 筛选付款账户
    queryPayAccountList (queryString, cb) {
      // let results = this.historyPayAccountList
      // if (queryString && this.historyPayAccountList && this.historyPayAccountList.length > 0) {
      //   results = this.historyPayAccountList.filter(g => g && g.includes(queryString))
      // }
      // cb(results.filter((i, index) => index < 5).map(m => ({ 'value': m })))
      cb([])
    },
  }
}
</script>

<style lang='scss' scoped>
  .page__container {
    @include scroll-bar;
    background-color: #f5f7fb;
    padding-bottom: 1px;
    overflow-x: hidden;
    font-size: $--font-size-medium;
    height: calc(100% - 63px);

    .page-header__title {
      color: #03050d;
      font-size: $--font-size-medium;
      font-weight: bold;
      padding: 12px 0;

      & > span {
        color: #8f8fa8;
        font-size: $--font-size-small;
      }
    }

    .page-box {
      padding-bottom: 0;
      &__content {
        .el-row--flex {
          flex-wrap: wrap;
        }
      }
      .page-box__title {
        border-bottom: unset;
        font-size: $--font-size-medium;
        display: flex;
        align-items: center;

        & > i {
          font-size: 18px;
          margin-right: 8px;
        }
      }
    }
  }

  .page--default {
    .el-select {
      width: 100%;
    }

    /deep/ .el-form--label-top .el-form-item__label {
      line-height: 20px;
      padding-bottom: 4px;
    }
  }

  .fw-row {
    flex-wrap: wrap;

    .el-col {
      width: 20%;
    }
  }

  .item-error--hide {
    /deep/ .is-error {
      .el-input__inner {
        border-color: #dcdfe6 !important;
      }

      .el-form-item__error {
        display: none !important;
      }
    }
  }
</style>
