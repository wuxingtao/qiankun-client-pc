<template>
  <el-drawer title="申请详情" :visible.sync="drawer"  size="540px" :with-header="false" class="payment" :wrapperClosable="false">
    <div class="payment-header">
      <svg-icon icon-class="icon-delete-selfSign" class="icon-delete-selfSign" @click="closeSelfSign" /><span class="title">授权详情</span>
      <div v-if="model.authStatus===20">
        <!-- <el-button size='small' class="reject" @click="reject">拒绝</el-button> -->
        <el-button type='primary' size='small' class="agree" @click="relieveAuth">解除授权</el-button>
      </div>

    </div>
    <div class="payment-content">
      <div class="payment-status">
        <div class="payment-status-left">
          <p class="payment-status-left-14">{{showTitle(model.applicationType)}}</p>
          <p class="payment-status-left-12">授权状态:<span class="payment-status-left-applicationType">{{showStatus(model.authStatus)}}</span></p>
        </div>
        <div class="payment-status-right">
          <el-image :src="statusUrl"></el-image>
        </div>
      </div>
      <div class="range">
        <ky-ui-label title='授权信息' />
        <div>
          <div class="auth-title">付款信息</div>
          <div class="item"><span class="titleContent">付款方式:</span>{{hasPayInfoResp&&showPayType(model.payInfoResp.payType)}}</div>
          <div class="item"><span class="titleContent">授权给谁:</span>{{hasPayInfoResp&&model.payInfoResp.authType===10?'寄方公司':'寄方个人'}}</div>
        
        </div>
        <div>
          <div class="auth-title">被授权人信息</div>
          <div class="item"><span class="titleContent">寄件客户编码:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.senderCustomerCode}}</div>
          <div class="item"><span class="titleContent">寄方公司名称:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.senderCustomerName}}</div>
          <div class="item" v-if="hasGivedAuthInfo&&hasGivedAuthInfo.authType===20"><span class="titleContent">寄方手机号码:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.senderMobile}}</div>
          <div class="item" v-if="hasGivedAuthInfo&&hasGivedAuthInfo.authType===20"><span class="titleContent">寄方姓名:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.senderName}}</div>
          <div class="item" v-if="(hasPayInfoResp&&model.payInfoResp.authLevel===50||hasPayInfoResp&&model.payInfoResp.authLevel===40)&&hasPayInfoResp&&model.payInfoResp.payType===20"><span class="titleContent">收方客户编码:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.recipientCustomerCode}}</div>
          <div class="item" v-if="hasPayInfoResp&&model.payInfoResp.authLevel===50"><span class="titleContent">收方手机号码:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.recipientMobile}}</div>
          <div class="item" v-if="hasPayInfoResp&&model.payInfoResp.authLevel===50"><span class="titleContent">收方姓名:</span>{{hasGivedAuthInfo&&hasGivedAuthInfo.recipientName}}</div>
          <div class="item" v-if="hasGivedAuthInfo&&hasGivedAuthInfo.remarks"><div class="titleContent">备注:</div>{{hasGivedAuthInfo&&hasGivedAuthInfo.remarks}}</div>
        </div>
        <div>
          <div class="auth-title">授权范围</div>
            <div class="item"><span class="titleContent">授权范围:</span>{{hasPayInfoResp&&showRange(model.payInfoResp.authType,model.payInfoResp.authLevel)}}</div>
        </div>
        <ky-ui-label title='操作信息' style="margin-top:20px" />
         <operation-info :examineInfoList="model.examineInfoList"></operation-info>
      </div>
    </div>

    <reject-authorized ref="rejectRef" @success="rejectSuccess"></reject-authorized>
  </el-drawer>

</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import paymentApi from '@/services/api/payment-authorization'
import RejectAuthorized from './reject-authorized'
import OperationInfo from './operation-info'

export default {
  name: 'self-sign-detail',
  components: {
    KyUiLabel,
    RejectAuthorized,
    OperationInfo
  },
  data () {
    return {
      drawer: false,
      model: {},
      row: {},
      statusUrl: require('@assets/image/paymentAuth/in-review.png'),
      applicationRange: '',
      setup: 1,
      waybillModel: {}
    }
  },
  computed: {
    hasApplicantInfo () {
      return this.model.applicantInfo
    },
    hasPayInfoResp () { //examineInfoList
      return this.model.payInfoResp
    },
    hasExamineInfoList () {
      return this.model.examineInfoList
    },
    hasGivedAuthInfo () {
      return this.model.givedAuthInfo
    }
  },
  methods: {
    showDrawer (row,model) {
      this.row = row
      this.model=model
      this.drawer = true
    },
    closeSelfSign () {
      this.drawer = false
    },
    showStatus (status) {
      let name = ''
      switch (status) {
        case 10:
          name = '审核中'
          this.statusUrl = require('@assets/image/paymentAuth/in-review.png')
          break
        case 20:
          name = '已授权'
          this.statusUrl = require('@assets/image/paymentAuth/authorized.png')
          break
        case 30:
          name = '已拒绝'
          this.statusUrl = require('@assets/image/paymentAuth/rejected.png')
          break
        case 40:
          name = '已解除'
          this.statusUrl = require('@assets/image/paymentAuth/released.png')
          break
      }
      return name
    },
    showRange(authType,authLevel){
      let range=''
      switch(authLevel){
        case 20:
        case 30:
          range='寄出的所有运单'
          break
        case 40:
          range=authType==10?'寄给指定的收方公司的所有运单':'寄出的所有运单'
          break
        case 50:
          range='寄给指定的收方公司个人的所有运单'
          break
      }
      return range
    },

    showOperationTitle (status) {
      let name = ''
      switch (status) {
        case 10:
          name = '审核中'
          break
        case 20:
          name = '已授权'
          break
        case 30:
          name = '已拒绝'
          break
        case 40:
          name = '已解除'
          break
      }
      return name
    },

    showPayType (type) {
      let name = ''
      switch (type) {
        case 10:
          name = '收方付'
          break
        case 20:
          name = '第三方付'
          break
      }
      return name
    },

    async reject () {
      this.$refs.rejectRef.showDialog(this.row)
    },
    rejectSuccess () {
      this.drawer = false
    },
    returnApply () {
      this.setup = 1
    },
    viewDetail () {
      this.getWaybillDetail()
      this.setup = 2
    },
    async getWaybillDetail () {
      let params = {
        authId: this.row.id
      }
      if(this.row.authStatus===10){
        params.type=1
      }
      let res = await paymentApi.getWaybillDetailByPay(params)
      if (res.code === 0 && res.data) {
        this.waybillModel = res.data
      }
    },
    showTitle (status) {
      let name = ''
      switch (status) {
        case 10:
          name = '授权申请'
          break
        case 20:
          name = '运单申请'
          break
        case 30:
          name = '给他人授权'
          break
      }
      return name
    },
    relieveAuth () {
      this.$kye_message.confirm('解除付款授权后，客户将无法使用您的账号付款，您确定要继续解除吗？', '', {
        type: 'warning'
      }).then(async () => {
        let params = {
          authId: this.row.id
        }
        let res = await paymentApi.cancelAuth(params)
        if (res.code === 0) {
          this.$message.success('解除成功')
          this.drawer=false
          this.$emit('success')
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  @import '../css/index.scss'
</style>