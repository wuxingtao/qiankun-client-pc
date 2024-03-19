<template>
  <div class="slefSign">
    <!-- v-if="userType!==3" -->
    <div class="slefSign-company">
      <ky-ui-label title='公司设置' />
      <div class="slefSign-content-set">
        <div class="slefSign-content-left">
          <svg-icon icon-class="icon-setting-selfSign-nor" class="icon-setting-selfSign" />
          <div class="slefSign-content-text">
            <p class="slefSign-content-text-16">需收件人本人签收</p>
            <p class="slefSign-content-text-12">开启后，货物派送前会发送短信到收件人手机签收时出示给司机</p>
          </div>
        </div>
        <div class="slefSign-content-switch">
          <el-switch v-model='companySet' active-color='#9378FA' :width='50' inactive-color='#BFC5D1' @change="saveSelfSign(true)">
          </el-switch>
        </div>
      </div>
    </div>
    <div class="self-sign-personal">
      <ky-ui-label title='个人设置' />
      <div :class="['slefSign-content-set',companySet ?'slefSign-content-set-disabled':'']">
        <div class="slefSign-content-left">

          <svg-icon icon-class="icon-setting-selfSign-nor" class="icon-setting-selfSign" />

          <div class="slefSign-content-text">
            <p class="slefSign-content-text-16">需收件人本人签收</p>
          </div>
        </div>
        <div class="slefSign-content-switch">
          <el-switch v-model='personalSet' active-color='#9378FA' :width='50' inactive-color='#BFC5D1' :disabled="companySet" @change="saveSelfSign(false)" >
          </el-switch>
        </div>
      </div>
    </div>
    <!-- <div>
      <el-button type='primary' size='small' @click="saveSelfSign" class="save-self-sign">提交</el-button>
    </div> -->
  </div>
</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import { mapState } from 'vuex'
import selfApi from '@/services/api/self-sign'
import { getLoginCompanyName } from '@utils/clientUtil'

export default {
  name: 'self-sign',
  components: {
    KyUiLabel
  },
  data () {
    return {
      personalSet: false,
      companySet: false
    }
  },
  created () {
    console.log('创建')
  },
  mounted () {
    console.log('mounted')
  },
  activated () {
    this.getWebPickup()
  },
  methods: {
    async saveSelfSign (flag) {
      //调用数量接口
      let getCountParams = null
      if (flag) {
        getCountParams = {
          customerSelfSignStatus: this.companySet? 10:20
        }
      }else{
        getCountParams = {
          personalSelfSignStatus:this.personalSet? 10:20
        }
      }

      let res = await selfApi.getPickupWaybillNumberCount(getCountParams)
      if (res.code === 0 && res.data) {
        let number = res.data
        if (Number(number) > 0) {
          let msg = '当前有' + number + '个运单未签收，是否立即生效？'
          if (this.companySet) {
            msg = getLoginCompanyName(false) + ',尚有运单未签收，是否立即生效?'
          }
          this.$kye_message.confirm(msg, '', {
            type: 'warning'
          }).then(async () => {
            this.saveData()
          }).catch(()=>{
            if(flag){
              this.companySet=!this.companySet
            }else{
              this.personalSet=!this.personalSet
            }
          })
        } else {
          this.saveData()
        }
      } else {
        this.saveData()
      }
     
    },
    async saveData (flag) {
      let params = null
      if (flag) {
        params = {
          customerSelfSignStatus: this.companySet? 10:20,
          operateSource: '210'
        }
      }else{
        params = {
          personalSelfSignStatus:this.personalSet? 10:20,
          operateSource: '210'
        }
      }

      let res = await selfApi.updateWebPickup(params)
      if (res.code === 0) {
        this.drawer = false
        this.$message.success('保存成功')
        this.freshData()
      }
    },
    async getWebPickup () {
      let res = await selfApi.getWebPickup()
      if (res.code === 0 && res.data) {
        this.personalSet = res.data.personalSelfSignStatus === 10 ? true : false
        this.companySet = res.data.customerSelfSignStatus === 10 ? true : false
      }
    }
  },
  computed: {
    ...mapState('waybill', ['userType'])
  }
}
</script>

<style lang="scss" scoped>
  .slefSign {
    padding: 24px 20px 34px 20px;
    width: 600px;
    .slefSign-content {
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
        /deep/ .el-switch.kye-switch--small {
          &.is-checked {
            .el-switch__core:after {
              margin-left: -20px;
            }
          }
          .el-switch__core {
            width: 50px;
            height: 22px;
            &:after {
              top: 1;
              width: 20px;
              height: 20px;
            }
          }
        }
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
    }
  }
</style>