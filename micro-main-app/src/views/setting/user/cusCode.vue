<template>
  <div class='page-style1'>
    <div class='page-box__title'>
      <div>
        <span class="cursor" @click='handleCancel'>
          <i class='el-icon-back theme-color fs_18 mr_8 f_w_700'></i>
          {{customerCode?'更换客户编码':'绑定客户编码'}}
        </span>
      </div>
    </div>
    <div v-if='customerCode' class='customer-code-info'>
      <div class='title'>已绑定的客户名称</div>
      <div class='info-wrapper'>
        <div class='info'>
          <span>公司名称</span>
          <span>{{ customerInfo.customerName }}</span>
        </div>
        <div class='info'>
          <span>客户编码</span>
          <span>{{ customerInfo.customerCode }}</span>
        </div>
        <div class='info'>
          <span>账号状态</span>
          <span>已绑定</span>
        </div>
      </div>
    </div>
    <customer-code-tip v-else />
    <div class='cusCode ml_20 mr_20'>
      <el-form :model='ruleForm' :rules='rules' ref='formName'>
        <el-form-item label='客户编码' prop='code'>
          <el-input type='text' size='medium' v-model='ruleForm.code' autocomplete='new-password' :readonly='readonly' @input='handleCodeInput' placeholder='请输入客户编码' :maxlength='20' @focus="handleFocus('readonly')"></el-input>
        </el-form-item>
        <el-form-item label='编码密码' prop='pass'>
          <el-input v-model='ruleForm.pass' type='password' size='medium' autocomplete='new-password' placeholder='请输入客户密码' :readonly='readonly2' :maxlength='15' @focus="handleFocus('readonly2')"></el-input>
        </el-form-item>
        <el-form-item class='btn__wrapper'>
          <el-button  v-if="!customerCode" v-btnThrottle size='small' class="ky-button" @click="$router.push({ name: 'customerCodeApply',params:{routePath:'/admin/user/cusCode'}})"> 申请客户编码
          </el-button>
          <el-button v-btnThrottle size='small' class="ky-button" type='primary' :disabled='submitDisabled' @click='submitForm()'> {{customerCode?'更换客户编码':'绑定客户编码'}}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import CustomerCodeTip from './components/customer-code-tip'
import store from '@/store'
import useCustomerCode from './hooks/useCustomerCode'

export default {
  name: 'cusCode',
  components: {
    CustomerCodeTip
  }, 
  async beforeRouteEnter(to, from, next) {
    await store.dispatch('setCustomerListAction')
    if(store.state.customerList?.length > 0){
      next('/admin/user/customer-code')
      return
    }
    next()
  },
  data () {
    return {
      ruleForm: {
        code: '',
        pass: ''
      },
      rules: {
        code: [
          { required: true, message: '请输入客户编码', trigger: 'change' }
          // { pattern: REGULAR.positiveOrZero, message: '请输入正确的客户编码', trigger: 'change' }
        ],
        pass: [
          { required: true, message: '请输入客户编码密码', trigger: 'change' },
          { pattern: /^[^\u4e00-\u9fa5]{1,32}$/, message: '请输入正确的客户密码', trigger: 'change' }
        ]
      },
      hasChange: false,
      readonly: true,
      readonly2: true
    }
  },
  activated () {
    this.readonly = true
    this.readonly2 = true
  },
  computed: {
    submitDisabled () {
      return !this.ruleForm.code || !this.ruleForm.pass
    },
    customerInfo () {
      return this.$store.state.userInfo.customerInfo
    },
    customerCode () {
      return this.customerInfo?.customerCode
    }
  },
  methods: {
    handleCodeInput () {
      this.ruleForm.code = this.ruleForm.code.replace(/[^\d]/g, '')
    }
    ,
    handleFocus (val) {
      this[val] = false
    }
    ,
    //绑定客户编码
    submitForm () {
      this.$refs['formName'].validate(valid => {
        if (!valid) return
        const { bindCustomerCode } = useCustomerCode(this)
        const params = {
          customerCode: this.ruleForm.code,
          password: this.ruleForm.pass
        }
        bindCustomerCode(params)
      })
    },
    async changeBindCustomerCode () {
      const { bindCustomerCode } = useCustomerCode(this)
      const params = {
        customerCode: this.ruleForm.code,
        password: this.ruleForm.pass,
        isChangCustomerCode: true
      }
      bindCustomerCode(params)
    },
    handleCancel () {
      let params = this.hasChange ? { 'refresh': '1' } : {}
      this.$router.push({ name: 'user', params })
    }
  }
}
</script>

<style lang='scss' scoped>
  .page-box__title {
    background-color: #f5f7fb;
    height: unset;
    & > div {
      background-color: #fff;
      padding-left: 20px;
      margin-bottom: 8px;
      border-radius: 0 0 4px 4px;
      box-sizing: border-box;
      & > span {
        height: 40px;
        display: flex;
        align-items: center;
        font-size: 15px;
        font-weight: bold;
      }
    }
  }

  .customer-code-info {
    width: 600px;
    height: 110px;
    margin: 20px 20px 36px;
    border-radius: 4px;
    box-sizing: border-box;
    background: url('~@/assets/image/setting/user/customer-code-bg.png') no-repeat top right;

    .title {
      width: 134px;
      height: 26px;
      line-height: 26px;
      text-align: left;
      padding-left: 10px;
      box-sizing: border-box;
      background-image: url('~@assets/image/setting/customer-info-header.png');
      background-position: center;
      background-repeat: no-repeat;
      background-size: 100%;
      color: #fff;
    }

    .info-wrapper {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;

      .info {
        display: flex;
        flex-direction: column;

        span:first-of-type {
          font-size: 12px;
          line-height: 1;
          text-align: left;
          color: #8f8fa8;
          margin-bottom: 8px;
        }

        span:last-of-type {
          font-size: 16px;
          font-weight: bold;
          text-align: left;
          color: #03050d;
        }
      }
    }
  }

  .cusCode {
    width: 530px;

    /deep/ {
      .el-form-item__label {
        color: #03050d;
        font-size: 12px;
        height: 12px;
        line-height: 12px;
      }

      .el-form-item {
        margin-bottom: 24px;
        width: 600px;
        text-align: center;
      }

      .el-form-item__content {
        height: 45px;
        font-size: 12px;
      }

      .el-input {
        font-size: 12px;
      }

      .el-input__inner {
        height: 32px;
        line-height: 32px;
        border: none;
        border-bottom: 1px solid #e9e9e9;
        padding: 0;
      }
    }

    .cusCode_bot {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 86px;
      width: 300px;
      border: 1px solid #e5e5e5;
      border-radius: 2px;

      .cusCode_num {
        line-height: 20px;
        color: #8365f6;

        * {
          vertical-align: middle;
        }
      }

      .line {
        width: 1px;
        height: 34px;
        background: #e5e5e5;
        margin: 0 32px;
      }
    }
    .btn__wrapper {
      padding-top: 20px;
      text-align: left;
    }
  }
</style>

