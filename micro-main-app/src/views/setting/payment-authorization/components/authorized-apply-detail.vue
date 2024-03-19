<template>
  <el-drawer title="申请详情" :visible.sync="drawer"  size="540px" :with-header="false" class="payment" :wrapperClosable="false">
    <div v-if="setup===1">

      <div class="payment-header">
        <svg-icon icon-class="icon-delete-selfSign" class="icon-delete-selfSign" @click="closeDetail" /><span class="title">申请详情</span>
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
          <ky-ui-label title='付款信息' />
          <div>
            <div class="item"><span class="titleContent">付款方式:</span>{{hasPayInfoResp&&showPayType(model.payInfoResp.payType)}}</div>
            <div class="item"><span class="titleContent">付款账号:</span>{{hasPayInfoResp&&model.payInfoResp.payAccount}}</div>
            <div class="item"><span class="titleContent">付款方公司:</span>{{hasPayInfoResp&&model.payInfoResp.payCustomerName}}</div>
          </div>
        </div>
        <ky-ui-label title='申请信息' />
        <div>
          <div class="item" v-if="row.applicationType===20&&hasApplicantInfo&&model.applicantInfo.count>1"><span class="titleContent">运单信息:</span>共{{hasApplicantInfo&&model.applicantInfo.count}}票运单<span class="see-waybill-detail" @click="viewDetail">查看运单详情></span></div>
          <div class="item"><span class="titleContent">申请人:</span>{{hasApplicantInfo&&model.applicantInfo.applyName}}</div>
          <div class="item"><span class="titleContent">申请手机:</span>{{hasApplicantInfo&&model.applicantInfo.applyMobile}}</div>
          <div class="item"><span class="titleContent">申请公司:</span>{{hasApplicantInfo&&model.applicantInfo.applyCustomerName}}</div>
          <div class="item"><span class="titleContent">客户编码:</span>{{hasApplicantInfo&&model.applicantInfo.applyCustomerCode}}</div>
          <div class="item" v-if="hasApplicantInfo&&model.applicantInfo.remarks"><div class="titleContent">备注:</div>{{hasApplicantInfo&&model.applicantInfo.remarks}}</div>
          <div class="item"><span class="titleContent">申请日期:</span>{{hasApplicantInfo&&model.applicantInfo.applyDate}}</div>
            <div class="range1" v-if="row.applicationType===20&&hasApplicantInfo&&model.applicantInfo.count===1">

            <waybill-info-only :waybillModel="model.applicantInfo"></waybill-info-only>
          </div>
        </div>

        <div class="range" v-if="model.authStatus!==10">
          <ky-ui-label title='审批信息' />
          <div v-if="model.authStatus===40">
            <operation-info :examineInfoList="model.examineInfoList"></operation-info>
          </div>
          <div v-else>
            <div class="item"><span class="titleContent">操作人:</span>{{examineInfo.operatorPerson}}</div>
            <div class="item" v-if="examineInfo.operatorType===20"><span class="titleContent">授权范围:</span>{{examineInfo.authRange}}</div>
            <div class="item" v-if="examineInfo.operatorType===30&&examineInfo.refuseReason"><div class="titleContent">拒绝原因:</div><div>{{examineInfo.refuseReason}}</div></div>
            <div class="item"><span class="titleContent">审批时间:</span>{{examineInfo.examineDate}}</div>
          </div>
        </div>
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
  </el-drawer>

</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import paymentApi from '@/services/api/payment-authorization'
import WaybillInfo from './waybill-info'
import OperationInfo from './operation-info'
import WaybillInfoOnly from './waybill-info-only'


export default {
  name: 'authorized-apply-detail',
  components: {
    KyUiLabel,
    WaybillInfo,
    OperationInfo,
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
    examineInfo () {
      return this.model.examineInfoList&&this.model.examineInfoList.length>0 ? this.model.examineInfoList.map(el => el.operatorType === this.model.authStatus ? el : {})[0] : {}
    },
  },
  methods: {
    showDrawer (row,model) {
      this.row = row
      this.model=model
      this.drawer = true
    },
    closeDetail () {
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

    rejectSuccess () {
      this.drawer = false
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
    }

  }
}
</script>

<style lang="scss" scoped>
   @import '../css/index.scss'
  // .payment {
  //   .payment-header {
  //     height: 54px;
  //     background: linear-gradient(180deg, rgba(225, 221, 255, 0.46), rgba(255, 255, 255, 0));
  //     box-shadow: 0px 1px 0px 0px #ffffff inset;
  //     font-size: 18px;
  //     font-family: PingFangSC, PingFangSC-Medium;
  //     font-weight: bold;
  //     text-align: left;
  //     color: #03050d;
  //     line-height: 54px;
  //     border-bottom: 1px solid #f1f1f5;
  //     .icon-delete-selfSign {
  //       padding: 0 16px;
  //     }
  //     .reject {
  //       position: absolute;
  //       right: 90px;
  //       top: 11px;
  //     }
  //     .agree {
  //       position: absolute;
  //       right: 20px;
  //       top: 11px;
  //     }
  //     .title {
  //       font-size: 16px;
  //       font-family: PingFangSC, PingFangSC-Medium;
  //       font-weight: bold;
  //       text-align: left;
  //       color: #03050d;
  //       line-height: 18px;
  //     }
  //   }
  //   .payment-content {
  //     padding: 24px 20px 24px 20px;
  //     &-set {
  //       margin-top: 20px;
  //       margin-bottom: 24px;
  //       height: 88px;
  //       background: #ffffff;
  //       border: 1px solid #d6d6d6;
  //       border-radius: 3px;
  //       display: flex;
  //       align-items: center;
  //       justify-content: space-between;
  //       padding-right: 20px;
  //       .icon-setting-selfSign {
  //         width: 20px;
  //         height: 20px;
  //         padding: 0 18px 0 20px;
  //       }
  //       &-disabled {
  //         background-color: #f3f3f3;
  //       }
  //     }
  //     .item {
  //       line-height: 32px;
  //       .see-waybill-detail {
  //         font-size: 12px;
  //         font-family: PingFangSC, PingFangSC-Regular;
  //         font-weight: 400;
  //         text-align: left;
  //         color: #8365f6;
  //         line-height: 28px;
  //         padding-left: 16px;
  //         cursor: pointer;
  //       }
  //     }
  //     &-left {
  //       display: flex;
  //       align-items: center;
  //     }
  //     &-text {
  //       &-16 {
  //         font-size: 16px;
  //         font-family: PingFang, PingFang-Heavy;
  //         font-weight: 800;
  //         text-align: left;
  //         color: rgba(51, 51, 51, 0.93);
  //         line-height: 30px;
  //       }
  //       &-12 {
  //         font-size: 12px;
  //         font-family: PingFangSC, PingFangSC-Regular;
  //         font-weight: 400;
  //         text-align: justify;
  //         color: #666666;
  //         line-height: 12px;
  //       }
  //     }

  //     .payment-status {
  //       display: flex;
  //       justify-content: space-between;
  //       padding-bottom: 8px;
  //       &-left {
  //         &-14 {
  //           height: 14px;
  //           font-size: 16px;
  //           font-family: PingFangSC, PingFangSC-Semibold;
  //           font-weight: 600;
  //           text-align: left;
  //           color: #333333;
  //           line-height: 14px;
  //         }
  //         &-12 {
  //           height: 17px;
  //           font-size: 12px;
  //           font-family: PingFangSC, PingFangSC-Regular;
  //           font-weight: 400;
  //           text-align: left;
  //           color: #999999;
  //           line-height: 17px;
  //           padding: 12px 0;
  //         }
  //         &-applicationType {
  //           padding: 0 20px;
  //           height: 17px;
  //           font-size: 12px;
  //           font-family: PingFangSC, PingFangSC-Regular;
  //           font-weight: 400;
  //           text-align: left;
  //           color: #333333;
  //           line-height: 17px;
  //         }
  //       }
  //       &-right {
  //         width: 68px;
  //         height: 68px;
  //       }
  //     }
  //     .item {
  //       line-height: 28px;
  //       display: flex;
  //       .titleContent {
  //         width: 72px;
  //         font-size: 12px;
  //         font-family: PingFangSC, PingFangSC-Regular;
  //         font-weight: 400;
  //         text-align: left;
  //         color: #999999;
  //         flex-shrink: 0;
  //       }
  //     }

  //     .range {
  //       padding-top: 20px;
  //       padding-bottom: 20px;
  //     }
  //   }
  // }
</style>