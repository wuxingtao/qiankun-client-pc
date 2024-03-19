<template>
  <el-drawer title="申请详情" :visible.sync="drawer" :before-close="handleClose" size="540px" :with-header="false" class="payment" :wrapperClosable="false">
    <div v-if="setup===1">
      <div class="payment-header">
        <svg-icon icon-class="icon-delete-selfSign" class="icon-delete-selfSign" @click="closeSelfSign" /><span class="title">给他人授权</span>
        <el-button type='primary' size='small' class="agree" :disabled='btnDisabled' @click="commit('form')">提交</el-button>
      </div>
      <el-form ref="form" :model="form" label-width="80px" :rules="rules" label-position="top">
        <div class="payment-content">
          <div class="range">
            <ky-ui-label title='付款信息' />
            <div>
              <div class="item"><span class="titleContent">付款方式</span>
                <template>
                  <el-radio-group v-model="payType" size="small" @change="resetRange">
                    <el-popover placement="top-start" width="168" trigger="hover" popper-class="payment-popover" content="您将作为收方进行付款">
                      <el-radio :label="10" slot="reference">收方付</el-radio>
                    </el-popover>
                    <el-popover placement="top-start" width="168" trigger="hover" popper-class="payment-popover" content="您将作为第三方进行付款">
                      <el-radio :label="20" slot="reference">第三方付</el-radio>
                    </el-popover>
                  </el-radio-group>
                </template>
              </div>
              <div class="item"><span class="titleContent">授权给谁</span>
                <template>
                  <el-radio-group v-model="authType" size="small" @change="resetRange">
                    <el-radio :label="10">寄方公司</el-radio>
                    <el-radio :label="20">寄方个人</el-radio>
                  </el-radio-group>
                </template>
              </div>
              <div class="payment-range">
                <div class="title-range">授权范围</div>
                <ul>
                  <el-radio-group v-model="authLevel" size="small">
                    <li v-for="(item,index) in authLevelData" :key="index">
                      <el-radio :label="item.level">{{item.text}}</el-radio>
                    </li>
                  </el-radio-group>
                </ul>
              </div>
            </div>
          </div>
          <div class="range page-style1">
            <ky-ui-label title='被授权人信息' />
            <div class="rang-info">
              <div class="input-item">
                <el-form-item label="寄方客户编码" prop="senderCustomerCode">
                  <el-input v-model.trim="form.senderCustomerCode" maxlength="20" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input>
                </el-form-item>
              </div>
              <div class="input-item" v-if="authType===20">
                <el-form-item label="寄方手机号" prop="senderMobile">
                  <el-input v-model.trim="form.senderMobile" maxlength="11" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input>
                </el-form-item>
              </div>
              <div class="input-item" v-if="authType===20">
                <el-form-item label="寄方姓名" prop="senderName">
                  <el-input v-model="form.senderName"></el-input>
                </el-form-item>
              </div>
              <div class="input-item" v-if="(authLevel===50||authLevel===40)&&payType===20">
                <el-form-item label="收方客户编码" prop="recipientCustomerCode">
                  <el-input v-model.trim="form.recipientCustomerCode" maxlength="20" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input>
                </el-form-item>
              </div>
              <div class="input-item" v-if="authLevel===50">
                <el-form-item label="收方手机号" prop="recipientMobile">
                  <el-input v-model.trim="form.recipientMobile" maxlength="11" onkeyup="value=value.replace(/[^\d]/g,'')"></el-input>
                </el-form-item>
              </div>
              <div class="input-item" v-if="authLevel===50">
                <el-form-item label="收方姓名" prop="recipientName">
                  <el-input v-model="form.recipientName"></el-input>
                </el-form-item>
              </div>
              <div class="input-item">
                <el-form-item label="备注">
                  <el-input v-model="form.remarks" maxlength="100"></el-input>
                </el-form-item>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </div>
    <div v-if="setup===2">
      <div class="payment-header">
        <svg-icon icon-class='icon-return' class="icon-delete-selfSign" @click="returnApply" /><span>确认授权信息</span>
        <el-button type='primary' size='small' class="agree" @click="confirm">确认授权</el-button>
      </div>
      <div class="payment-content">
        <div class="range">
          <ky-ui-label title='付款信息' />
          <div class="item"><span class="titleContent_2">付款方式:</span>{{payType===10?'收方付':'第三方'}}</div>
          <div class="item"><span class="titleContent_2">授权给谁:</span>{{authType===10?'寄方公司':'寄方个人'}}</div>
        </div>
        <div class="range page-style1">
          <ky-ui-label title='被授权人信息' />
          <div class="item"><span class="titleContent_2">寄件客户编码:</span>{{form.senderCustomerCode}}</div>
          <div class="item"><span class="titleContent_2">寄方公司名称:</span>{{form.senderCustomerName}}</div>
          <div class="item" v-if="authType===20"><span class="titleContent_2">寄方手机号码:</span>{{form.senderMobile}}</div>
          <div class="item" v-if="authType===20"><span class="titleContent_2">寄方姓名:</span>{{form.senderName}}</div>
          <div class="item" v-if="(authLevel===50||authLevel===40)&&payType===20"><span class="titleContent_2">收方客户编码:</span>{{form.recipientCustomerCode}}</div>
          <div class="item" v-if="(authLevel===50||authLevel===40)&&payType===20"><span class="titleContent_2">收方公司名称:</span>{{form.recipientCustomerName}}</div>
          <div class="item" v-if="authLevel===50"><span class="titleContent_2">收方手机号码:</span>{{form.recipientMobile}}</div>
          <div class="item" v-if="authLevel===50"><span class="titleContent_2">收方姓名:</span>{{form.recipientName}}</div>
          <div class="item">
            <div class="titleContent_2">备注:</div>{{form.remarks}}
          </div>
        </div>
        <div class="range">
          <ky-ui-label title='授权信息' />
          <div class="item"><span class="titleContent_2">授权范围:</span>{{authLevelName}}</div>
        </div>
        <div class="tips">
          <img src="@/assets/image/waybill/tips-icon.png" class="img" alt="" />
          {{tips}}
        </div>
      </div>
    </div>
  </el-drawer>

</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import paymentApi from '@/services/api/payment-authorization'
import REGULAR from '@/utils/regular'

export default {
  name: 'authorized-others-apply',
  components: {
    KyUiLabel,
  },
  data () {
    let checkSendCustomerCode = async (rule, value, callback) => {
      if (value) {
        const { data } = await paymentApi.getCustomerName_new({ customerCode: value })
        if (data) {
          this.form.senderCustomerName = data
        } else {
          callback('寄方客户编码有误')
        }
      } else {
        this.form.senderCustomerName = ''
      }
    }
    let checkRecipientCustomerCode = async (rule, value, callback) => {
      if (value) {
        const { data } = await paymentApi.getCustomerName_new({ customerCode: value })
        if (data) {
          this.form.recipientCustomerName = data
        } else {
          callback('收方客户编码有误')
        }
      } else {
        this.form.recipientCustomerName = ''
      }
    }
    return {
      drawer: false,
      setup: 1,
      model: {},
      row: {},
      payType: '',
      authLevel: '',
      authType: '',
      receivePay: false,
      othersPay: false,
      tips: '',
      form: {
        senderCustomerCode: '',
        senderCustomerName: '',
        senderMobile: '',
        senderName: '',
        recipientCustomerCode: '',
        recipientCustomerName: '',
        recipientMobile: '',
        recipientName: '',
        remarks: ''
      },
      rules: {
        senderCustomerCode: [
          { required: true, message: '请输入寄方客户编码', trigger: 'blur' },
          { pattern: REGULAR.positiveOrZero, message: '请输入正确的客户编码', trigger: 'blur' },
          { validator: checkSendCustomerCode, trigger: 'blur' }
        ],
        senderMobile: [
          { required: true, message: '请输入寄方手机号', trigger: 'blur' },
          { pattern: REGULAR.mobileNumber, message: '请输入正确的手机号', trigger: 'blur' },
        ],
        senderName: [
          { required: true, message: '请输入寄方姓名', trigger: 'blur' },
        ],
        recipientCustomerCode: [
          { required: true, message: '请输入收方客户编码', trigger: 'blur' },
          { pattern: REGULAR.positiveOrZero, message: '请输入正确的客户编码', trigger: 'blur' },
          { validator: checkRecipientCustomerCode, trigger: 'blur' }

        ],
        recipientMobile: [
          { required: true, message: '请输入收方手机号', trigger: 'blur' },
          { pattern: REGULAR.mobileNumber, message: '请输入正确的手机号', trigger: 'change' },

        ],
        recipientName: [
          { required: true, message: '请输入收方姓名', trigger: 'blur' },
        ],
      },
      authLevelData: [{ level: 40, text: '寄给本公司的所有运单' }]
    }
  },
  computed: {
    authLevelName () {
      return this.authLevelData.filter(val => { return val.level === this.authLevel })[0].text
    },
    btnDisabled () {
      return !this.payType || !this.authLevel || !this.authType || !this.form.senderCustomerCode
    },
  },
  methods: {
    showDrawer (id) {
      if (id) {
        this.setFormData(id)
      }
      this.setup = 1
      this.drawer = true

    },
    closeSelfSign () {
      this.drawer = false
    },
    handleClose () {

    },

    //提交
    async commit (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.getTips()
          this.setup = 2
        } else {
          return false
        }
      })
    },
    async reject () {
      this.$refs.rejectRef.showDialog(this.row)
    },
    getParams () {
      let payInfo = {
        payType: this.payType,
        authType: this.authType,
        authLevel: this.authLevel
      }
      let givedAuthInfo = Object.assign({ authType: this.authType }, this.form)
      if (this.authType !== 20) {
        givedAuthInfo.senderMobile = '',
        givedAuthInfo.senderName = ''
      }
      if (!((this.authLevel === 50 || this.authLevel === 40) && this.payType === 20)) {
        givedAuthInfo.recipientCustomerName = '',
        givedAuthInfo.recipientCustomerCode = ''
      }
      if (this.authLevel !== 50) {
        givedAuthInfo.recipientMobile = '',
        givedAuthInfo.recipientName = ''
      }
      return Object.assign({ payInfo: payInfo }, { givedAuthInfo: givedAuthInfo })
    },
    resetRange () {
      if (this.payType === 20) {
        this.authLevelData = [{ level: 20, text: '寄出的所有运单' }]
        if (this.authType === 10) {
          this.authLevelData.push({ level: 40, text: '寄给指定的收方公司的所有运单' })
          // this.authLevelData.push({ level: 50, text: '寄给指定的收方公司个人的所有运单' })
        }
      } else {
        this.authLevelData = [{ level: 40, text: '寄给本公司的所有运单' }]
      }
      this.authLevel = this.payType === 10 ? 40 : 20
    },

    async confirm () {
      let params = this.getParams()

      let res = await paymentApi.giveAuth(params)
      if (res.code === 0) {
        this.$message.success('提交成功')
        this.drawer = false
        this.resetFormData()
        this.$emit('success')
      }
    },
    returnApply () {
      this.setup = 1
    },
    async getTips () {
      let params = this.getParams()
      let res = await paymentApi.getGiveAuthPopoutInfo(params)
      if (res.code === 0) {
        this.tips = res.data
        //this.tips='您授权为上海长盛达（02155839657）付款，如您点击确定'
      }
    },
    resetFormData () {
      this.form = {
        senderCustomerCode: '',
        senderCustomerName: '',
        senderMobile: '',
        senderName: '',
        recipientCustomerCode: '',
        recipientCustomerName: '',
        recipientMobile: '',
        recipientName: '',
        remarks: ''
      }
    },
    async setFormData (id) {
      let params = {
        authId: id,
        againAuth: true
      }
      let res = await paymentApi.getPayAuthDetail(params)
      if (res.code === 0 && res.data) {
        let result = res.data
        this.authLevel = result.payInfoResp.authLevel
        this.authType = result.payInfoResp.authType
        this.payType = result.payInfoResp.payType
        this.form = result.givedAuthInfo
      }
    }
  },
}
</script>

<style lang="scss" scoped>
  .payment {
    .payment-header {
      height: 54px;
      background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
      box-shadow: 0px 1px 0px 0px #ffffff inset;
      font-size: 18px;
      font-family: PingFangSC, PingFangSC-Medium;
      font-weight: bold;
      text-align: left;
      color: #03050d;
      line-height: 54px;
      border-bottom: 1px solid #f1f1f5;
      .icon-delete-selfSign {
        padding: 0 16px;
      }
      .agree {
        position: absolute;
        right: 20px;
        top: 11px;
      }
      .title {
        font-size: 16px;
        font-family: PingFangSC, PingFangSC-Medium;
        font-weight: bold;
        text-align: left;
        color: #03050d;
        line-height: 18px;
      }
    }
    .payment-content {
      padding: 24px 20px 24px 20px;
      color: #03050d;
      /deep/.el-radio {
        color: #03050d;
        width: 120px;
        margin: 0 !important;
      }
      .payment-range {
        display: flex;
        margin-top: 10px;
        .title-range {
          width: 72px;
           &:after {
            content: '*';
            color: #f56c6c;
            margin-left: 2px;
            position: relative;
            top: 2px;
          }
        }
        li {
          height: 30px;
        }
      }
      .item {
        line-height: 28px;
        .titleContent {
          width: 72px;
          height: 17px;
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: left;
          line-height: 17px;
          display: inline-block;
          &:after {
            content: '*';
            color: #f56c6c;
            margin-left: 2px;
            position: relative;
            top: 2px;
          }
        }
        .titleContent_2 {
          width: 84px;
          height: 17px;
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: left;
          line-height: 17px;
          color: #999999;
          display: inline-block;
        }
      }

      .range {
        padding-bottom: 20px;
        .rang-info {
          display: flex;
          flex-wrap: wrap;
          & > div:nth-child(2n) {
            margin-right: 0;
          }
          .input-item {
            width: 48%;
            margin-right: 20px;
          }
        }
      }
      .tips {
        width: 500px;
        background: #fff9e6;
        border-radius: 2px;
        color: #ff8038;
        line-height: 26px;
        .img {
          margin: 0 8px;
          // margin-top: 8px;
          width: 14px;
        }
      }
    }
  }
</style>

<style lang="scss" >
  .payment-popover {
    padding: 10px 20px;
  }
</style>