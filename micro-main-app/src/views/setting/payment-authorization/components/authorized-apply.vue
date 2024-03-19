<template>
  <el-drawer class='payment' title='申请详情' size='540px' ref='drawer' :visible.sync='drawer' :before-close='beforeClose' :with-header='false' :wrapperClosable="false">
    <div class='payment-header'>
      <div>
        <svg-icon icon-class='icon-delete-selfSign' class='icon-delete-selfSign' @click='closeHandler' />
        <span class="title">申请付款授权</span>
      </div>
      <el-button class='button' type='primary' size="small" :disabled='btnDisabled' @click='submit'>提交</el-button>
    </div>
    <el-form ref='form' :model='form' label-width='80px' :rules='rules' label-position='top'>
      <div class='payment-content'>
        <div class='range'>
          <ky-ui-label title='付款信息' />
          <el-form-item class='flex-item' label='付款方式' prop='payType'>
            <el-popover placement='top-start' width='168' trigger='hover' content='对方将作为收方进行付款' popper-class="payment-popover">
              <el-radio border label='10' slot='reference' v-model='form.payType'>收方付</el-radio>
            </el-popover>
            <el-popover placement='top-start' width='168' trigger='hover' content='对方将作为第三方进行付款' popper-class="payment-popover">
              <el-radio border label='20' slot='reference' v-model='form.payType'>第三方付</el-radio>
            </el-popover>
          </el-form-item>
          <div class='form-content'>
            <el-form-item label='付款方账号' prop='payAccount'>
              <el-input v-model.trim='form.payAccount' onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="20" placeholder='付款方编码或主副授权号' @blur='getCustomerName'></el-input>
            </el-form-item>
            <el-form-item label='付款方公司'>
              <el-input v-model.trim='form.payCustomerName' maxlength="50" placeholder='公司名称' :disabled='disabled.payCustomerName'></el-input>
            </el-form-item>
          </div>
        </div>
        <div class='range'>
          <ky-ui-label title='申请人信息' />
          <div class='form-content'>
            <el-form-item label='申请人' prop='applyName'>
              <el-input v-model.trim='form.applyName' placeholder='请填写申请人' :disabled='disabled.applyName'></el-input>
            </el-form-item>
            <el-form-item label='申请手机'>
              <el-input v-model.trim='form.applyMobile' :disabled='true' placeholder='请填写手机号码'></el-input>
            </el-form-item>
            <el-form-item label='申请公司'>
              <el-input v-model.trim='form.applyCustomName' :disabled='true' placeholder='请填写公司名称'></el-input>
            </el-form-item>
            <el-form-item label='客户编码'>
              <el-input v-model.trim='form.code' :disabled='true' placeholder='请填写客户编码'></el-input>
            </el-form-item>
            <el-form-item label='备注'>
              <el-input v-model.trim='form.remarks' maxlength="100" placeholder='请填写备注'></el-input>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
  </el-drawer>
</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import paymentApi from '@/services/api/payment-authorization'
import { getCustomerCode, getPhone, getCustomerShortName } from '@/utils/storage'
import REGULAR from '@/utils/regular'
import { getUserData } from '@/utils/storage'
import { mapState } from 'vuex'

export default {
  name: 'authorized-apply',
  components: {
    KyUiLabel
  },
  data () {
    return {
      drawer: false,
      model: {},
      row: {},
      form: {
        payType: '',
        payAccount: '',
        payCustomerName: '',
        applyName: '',
        applyMobile: getPhone(),
        applyCustomName: getCustomerShortName(),
        code: getCustomerCode(),
        remarks: ''
      },
      disabled: {
        applyName: false,
        payCustomerName: false
      },
      rules: {
        payType: [
          { required: true, message: '请选择付款方式', trigger: 'blur' }
        ],
        payAccount: [
          { required: true, message: '请填写付款方编码或主副授权号', trigger: 'blur' },
          { pattern: REGULAR.positiveOrZero, message: '请填写正确的付款方编码或主副授权号', trigger: 'blur' },
        ],
        applyName: [
          { required: true, message: '请填写申请人', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.$watch(newVal => {
      if (newVal) {
        this.initForm()
      }
    })
  },
  computed: {
    btnDisabled () {
      const { payType, payAccount, applyName } = this.form
      return !payType || !payAccount || !applyName
    },
    ...mapState({
      userInfo: state => {
        return state.userInfo || getUserData() || {}
      }
    })
  },
  methods: {
    showDrawer (row) {
      if (row) {
        this.form.payType = row.payType + ''
        this.form.payAccount = row.payAccount
        this.getCustomerName()
      }
      this.drawer = true
    },
    initForm () {
      if (this.$store.state.realNameInfo) {
        const { realName } = this.$store.state.realNameInfo
        if (realName) {
          this.form.applyName = realName
          this.disabled.applyName = true
        } else {
          this.form.applyName = this.userInfo.userName
          this.disabled.applyName = false
        }
      } else {
        this.form.applyName = this.userInfo.userName
        this.disabled.applyName = false
      }
    },
    closeHandler () {
      this.$refs.drawer.closeDrawer()

    },
    beforeClose (done) {
      this.form = {
        payType: '',
        payAccount: '',
        payCustomerName: '',
        applyName: '',
        applyMobile: getPhone(),
        applyCustomName: getCustomerShortName(),
        code: getCustomerCode(),
        remarks: ''
      }
      this.initForm()
      done()
    },
    async getCustomerName () {
      if (this.form.payAccount) {
        const { data } = await paymentApi.getCustomerName({ customerCode: this.form.payAccount })
        if (data) {
          this.form.payCustomerName = data
          this.disabled.payCustomerName = true
        } else {
          this.form.payCustomerName = ''
          this.disabled.payCustomerName = false
        }
      }
    },
    submit () {
      this.$refs.form.validate(async validate => {
        if (validate) {
          const {
            payType,
            payAccount,
            applyMobile,
            remarks,
            payCustomerName,
            applyName,
            applyCustomName
          } = this.form
          const params = {
            payType,
            payAccount,
            applyMobile,
            remarks,
            payCustomerName,
            applyName,
            applyCustomName
          }
          for (let key in params) {
            if (!params[key]) {
              delete params[key]
            }
          }
          const { data } = await paymentApi.payAuthorizeApply(params)
          if (data) {
            this.$message.success('提交成功')
            this.closeHandler()
          }
        }
      })
    },

  }
}
</script>

<style lang='scss' scoped>
  $height: 24px;
  $item-width: 140px;

  .payment {
    padding: 0;
    .payment-header {
      height: 54px;
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      box-shadow: 0px 1px 0px 0px #ffffff inset;
      font-size: 18px;
      font-weight: bold;
      text-align: left;
      color: #03050d;
      line-height: 54px;
      border-bottom: 1px solid #f1f1f5;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .icon-delete-selfSign {
        padding: 0 16px;
      }

      .button {
        width: 80px;
        height: 32px;
        margin-right: 20px;
        background: #8365f6;
        border-radius: 4px;
        padding: 0;
        text-align: center;
      }
      .title {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: bold;
        text-align: left;
        color: #03050d;
        line-height: 18px;
      }

      /deep/ .is-disabled {
        background: #c1c7cf;
        color: #fff;
        border-color: #c1c7cf;
      }
    }

    .payment-content {
      padding: 24px 20px 24px 20px;
      color: #03050d;

      .flex-item {
        display: flex;
        align-items: center;
        text-align: left;

        /deep/ {
          .el-form-item__content {
            display: flex;
            line-height: $height;

            .el-radio {
              height: $height;
              padding: 0 12px;
              line-height: $height;
              margin-right: 20px;
              box-sizing: content-box;
            }

            .el-radio__label {
              line-height: $height;
              font-size: 12px;
              padding: 0;
            }

            .el-radio__input {
              display: none;
            }

            .el-radio {
              color: #03050d;
            }
          }
        }
      }

      .form-content {
        display: flex;
        flex-wrap: wrap;
        /deep/ .el-form-item__error {
          white-space: nowrap;
        }
      }

      /deep/ {
        .el-form-item {
          margin-bottom: 20px;
          margin-right: 20px;

          .el-form-item__label {
            height: $height;
            line-height: $height;
            font-size: 12px;
            color: #03050d;
            margin-right: 23px;
          }

          .el-form-item__content {
            width: $item-width;
            line-height: $height;

            .el-input {
              width: $item-width;
              height: $height;
              font-size: 12px;

              .el-input__inner {
                height: $height;
                line-height: $height;
                border: none;
                border-bottom: 1px solid #dcdfe6;
                padding: 0;
                border-radius: 0;
              }
            }
          }
        }
      }

      .item {
        height: 32px;
        line-height: 32px;
      }

      .range {
        padding-bottom: 20px;
      }
    }
  }
</style>
<style lang="scss" >
  .payment-popover {
    padding: 10px 20px;
  }
</style>

