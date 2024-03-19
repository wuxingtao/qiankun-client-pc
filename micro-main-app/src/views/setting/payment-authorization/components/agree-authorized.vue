<template>
  <el-drawer title="同意授权" :visible.sync="drawer"  size="540px" :with-header="false" class="payment" :wrapperClosable="false">
    <div class="payment-header">
      <svg-icon icon-class="icon-delete-selfSign" class="icon-delete-selfSign" @click="closeSelfSign" /><span>同意授权</span>
      <el-button type='primary' size='small' @click="saveSelfSign" class="save-self-sign">提交</el-button>
    </div>
    <div class="payment-content">
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
          <div class="item" v-for="(item,index) in model.authLeveleDetailList" :key="index">
            <el-radio :label="item.authLevel"><span v-html="item.authRange"></span></el-radio>
          </div>
        </el-radio-group>
      </div>
      <div v-if="row.applicationType===20&&model.applicantInfo.count===1">
        <ky-ui-label title='运单信息' />
        <div class="payment-waybillInfo">
          <waybill-info-only v-if="model.applicantInfo" :waybillModel="waybillModel"></waybill-info-only>
          <waybill-info v-else  :waybillModel="waybillModel"></waybill-info>
        </div>
      </div>
      <agree-tips ref="agreeTipsRef" @success="agree"></agree-tips>
    </div>
  </el-drawer>
</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import paymentApi from '@/services/api/payment-authorization'
import WaybillInfo from './waybill-info'
import WaybillInfoOnly from './waybill-info-only'
import AgreeTips from './agree-tips'

export default {
  name: 'agree-authorized',
  components: {
    KyUiLabel,
    WaybillInfo,
    AgreeTips,
    WaybillInfoOnly
  },
  data () {
    return {
      drawer: false,
      isSelfSign: false,
      applicationRange: 10,
      selfSignSource: [],
      waybillNumber: '',
      oldSelfSign: false,
      payType: '',
      authorized: '',
      row: {},
      model: {},
      waybillModel: {},
      serialNumber:['a. ','b. ','c. ','d. ','e. ','f. ','g. ']
    }
  },
  computed: {

  },
  methods: {
    showDrawer (row,model) {
      this.row = row
      this.model=model

      if (row.applicationType===20&&model.applicantInfo&&model.applicantInfo.count>1) {
        this.getWaybillDetail()
      }else{
        this.waybillModel=model.applicantInfo
      }
      this.drawer = true
    },
    async saveSelfSign () {
      let params = {
        authId: this.row.id,
        authLevel: this.applicationRange
      }
      let res =await paymentApi.getPopoutInfo(params)
      if (res.code === 0) {
        // this.$kye_message.confirm(res.data, '', {
        //   type: 'warning',
        // }).then(() => {
        //   this.agree()
        // })
        this.$refs.agreeTipsRef.showDialog(res.data)
      }
    },
    closeSelfSign () {
      this.drawer = false
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
        if(res.data&&res.data.length>0){
          this.$message.warning(res.data[0].resultMsg)
        }else{
          this.$message.success(res.msg)
          this.drawer = false
          this.$emit('success')
        }
      }
    },
    async getDetailInfo () {
      let params = {
        authId: this.row.id,
        type:1
      }
      let res = await paymentApi.getPayAuthDetail(params)
      if (res.code === 0 && res.data) {
        this.model = res.data
        this.applicationRange = this.model.authLeveleDetailList[0].authLevel
      }
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
    }
  }
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
      .save-self-sign {
        position: absolute;
        right: 20px;
        top: 11px;
      }
    }
    .payment-content {
      padding: 24px 20px 24px 20px;
      &-set {
        margin-top: 20px;
        margin-bottom: 24px;
        height: 88px;
        background: #ffffff;
        border: 1px solid #d6d6d6;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-right: 20px;
        .icon-setting-selfSign {
          width: 20px;
          height: 20px;
          padding: 0 18px 0 20px;
        }
        &-disabled {
          background-color: #f3f3f3;
        }
      }
      .item {
        height: 32px;
        line-height: 32px;
      }
      &-left {
        display: flex;
        align-items: center;
      }
      &-text {
        &-16 {
          font-size: 16px;
          font-family: PingFang, PingFang-Heavy;
          font-weight: 800;
          text-align: left;
          color: rgba(51, 51, 51, 0.93);
          line-height: 30px;
        }
        &-12 {
          font-size: 12px;
          font-family: PingFangSC, PingFangSC-Regular;
          font-weight: 400;
          text-align: justify;
          color: #666666;
          line-height: 12px;
        }
      }
      &-swicth {
        padding-right: 20px;
      }
      .icon-right {
          font-size: 1.4rem;
          color: #9598a7;
          cursor: pointer;
          padding-left: 8px;
        }
    }
  }
</style>

<style lang="scss">
  .payment {
    .subject {
      font-size: 12px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #03050d;
      line-height: 18px;
    }
  }
</style>