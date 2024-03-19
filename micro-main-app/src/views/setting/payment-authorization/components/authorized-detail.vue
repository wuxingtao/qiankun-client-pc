<template>
  <el-drawer title="审批详情" :visible.sync="drawer" size="540px" :with-header="false" class="payment" :wrapperClosable="false">
    <div v-if="setup===1">
      <div class="payment-header">
        <svg-icon icon-class="icon-delete-selfSign" class="icon-delete-selfSign" @click="closeSelfSign" /><span class="title">审批详情</span>
        <div v-if="model.authStatus===10">
          <el-button size='small' class="reject" @click="reject">拒绝</el-button>
          <el-button type='primary' size='small' class="agree" @click="save">同意</el-button>
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

        <ky-ui-label title='申请信息' />
        <div>
          <div class="item" v-if="row.applicationType===20&&hasApplicantInfo&&model.applicantInfo.count>1"><span class="titleContent">运单信息:</span>共{{hasApplicantInfo&&model.applicantInfo.count}}票运单<span class="see-waybill-detail" @click="viewDetail">查看运单详情></span></div>
          <div class="item"><span class="titleContent">付款方式:</span>{{hasApplicantInfo&&showPayType(model.applicantInfo.payType)}}</div>
          <div class="item">
            <span class="titleContent">申请人:</span>{{hasApplicantInfo&&model.applicantInfo.applyName}}
          </div>
          <div class="item"><span class="titleContent">申请手机:</span>{{hasApplicantInfo&&showMobilePhone(model.applicantInfo.applyMobile)}}</div>
          <div class="item"><span class="titleContent">申请公司:</span>{{hasApplicantInfo&&model.applicantInfo.applyCustomerName}}</div>
          <div class="item"><span class="titleContent">客户编码:</span>{{hasApplicantInfo&&model.applicantInfo.applyCustomerCode}}</div>
          <div class="item" v-if="hasApplicantInfo&&model.applicantInfo.remarks">
            <div class="titleContent">备注:</div>{{hasApplicantInfo&&model.applicantInfo.remarks}}
          </div>
          <div class="item"><span class="titleContent">申请日期:</span>{{hasApplicantInfo&&showDate(model.applicantInfo.applyDate)}}</div>
          <div class="range1" v-if="row.applicationType===20&&hasApplicantInfo&&model.applicantInfo.count===1">

            <waybill-info-only :waybillModel="model.applicantInfo"></waybill-info-only>
          </div>
        </div>
        <div class="range" v-if="model.authStatus===10">
          <ky-ui-label title='授权范围'>
            <el-popover placement="right" trigger="hover" popper-class="payment">
              <div class="subject">
                <div v-for="(item,index) in model.authLeveleDetailList" :key="index">{{serialNumber[index]}}<span v-html="item.subject"></span></div>
              </div>
              <i class="iconfont icon-help icon-right" slot="reference"></i>
            </el-popover>
          </ky-ui-label>
          <div>
            <el-radio-group v-model="applicationRange" size="medium">
              <div class="authRange" v-for="(item,index) in model.authLeveleDetailList" :key="index">
                <el-radio :label="item.authLevel"><span v-html="item.authRange"></span></el-radio>
              </div>
            </el-radio-group>
          </div>
        </div>
        <div class="range" v-if="model.authStatus!==10">
          <ky-ui-label title='操作信息' />
          <div v-if="model.authStatus===40">
            <operation-info :examineInfoList="model.examineInfoList"></operation-info>
          </div>
          <div v-else>
            <div class="item"><span class="titleContent">操作人:</span>{{examineInfo.operatorPerson}}</div>
            <div class="item" v-if="examineInfo.operatorType===20"><span class="titleContent">授权范围:</span>{{examineInfo.authRange}}</div>
            <div class="item" v-if="examineInfo.operatorType===30&&examineInfo.refuseReason">
              <div class="titleContent">拒绝原因:</div>{{examineInfo.refuseReason}}
            </div>
            <div class="item"><span class="titleContent">审批时间:</span>{{examineInfo.examineDate}}</div>
          </div>
        </div>
        <!-- <div class="range1" v-if="row.applicationType===20&&hasApplicantInfo&&model.applicantInfo.count===1">
          <ky-ui-label title='运单信息' />
            <waybill-info-only :waybillModel="model.applicantInfo"></waybill-info-only>
        </div> -->
      </div>
    </div>
    <div v-if="setup===2">
      <div class="payment-header">
        <svg-icon icon-class='icon-return' class="icon-delete-selfSign" @click="returnApply" /><span>运单详情</span>
      </div>
      <div class="payment-waybillInfo">
        <waybill-info :waybillModel="waybillModel"></waybill-info>
      </div>
    </div>
    <reject-authorized ref="rejectRef" @success="rejectSuccess"></reject-authorized>
    <agree-tips ref="agreeTipsRef" @success="agree"></agree-tips>
  </el-drawer>

</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import paymentApi from '@/services/api/payment-authorization'
import RejectAuthorized from './reject-authorized'
import WaybillInfo from './waybill-info'
import paymentUtil from '../utils/paymentUtil'
import OperationInfo from './operation-info'
import AgreeTips from './agree-tips'
import WaybillInfoOnly from './waybill-info-only'


export default {
  name: 'authorized-detail',
  components: {
    KyUiLabel,
    RejectAuthorized,
    WaybillInfo,
    OperationInfo,
    AgreeTips,
    WaybillInfoOnly
  },
  data () {
    return {
      drawer: false,
      model: {},
      row: {},
      statusUrl: require('@assets/image/paymentAuth/in-review.png'),
      applicationRange: '',
      setup: 1,
      waybillModel: {},
      serialNumber: ['a. ', 'b. ', 'c. ', 'd. ', 'e. ', 'f. ', 'g. ']
    }
  },
  computed: {
    hasApplicantInfo () {
      return this.model.applicantInfo
    },
    hasPayInfoResp () { //examineInfoList
      return this.model.payInfoResp
    },
    examineInfo () {
      return this.model.examineInfoList && this.model.examineInfoList.length > 0 ? this.model.examineInfoList.map(el => el.operatorType === this.model.authStatus ? el : {})[0] : {}
    },
  },

  methods: {
    showDrawer (row, model) {
      this.row = row
      this.model = model
      this.drawer = true
      console.log('333', this.drawer)
    },
    closeSelfSign () {
      this.drawer = false
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
    showStatus (status) {
      let name = ''
      switch (status) {
        case 10:
          name = '待授权'
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

    async save () {
      let params = {
        authId: this.row.id,
        authLevel: this.applicationRange
      }
      let res = await paymentApi.getPopoutInfo(params)
      if (res.code === 0) {
        this.$refs.agreeTipsRef.showDialog(res.data)
      }
    },
    async agree () {
      let params = {
        authId: this.row.id,
        authLevel: this.applicationRange,
        pass: true,
        fromType:'40'
      }
      let requests = {
        requests: [params]
      }
      let res = await paymentApi.examineAuth(requests)
      if (res.code === 0) {
        if (res.data && res.data.length > 0) {
          this.$message.warning(res.data[0].resultMsg)
        } else {
          this.$message.success(res.msg)
          this.drawer = false
          this.$emit('success')
        }
      }
    },
    async reject () {
      this.$refs.rejectRef.showDialog(this.row)
    },
    rejectSuccess () {
      this.drawer = false
      this.$emit('success')
    },
    returnApply () {
      this.setup = 1
    },
    async viewDetail () {
      await this.getWaybillDetail()
      this.setup = 2
    },
    async getWaybillDetail () {
      let params = {
        authId: this.row.id
      }
      if (this.row.authStatus === 10) {
        params.type = 1
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
    showDate (val) {
      return paymentUtil.showDate(val)
    },
    showMobilePhone (val) {
      return paymentUtil.showMobilePhone(val)
    },

  },

}
</script>

<style lang="scss" scoped>
  @import '../css/index.scss';
</style>
<style lang="scss">
  .payment {
    .subject {
      font-size: 12px;
      font-weight: 400;
      text-align: left;
      color: #03050d;
      line-height: 18px;
    }
  }
</style>