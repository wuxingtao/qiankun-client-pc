<template>
  <el-drawer title="本人签收" :visible.sync="drawer" :before-close="handleClose" size="540px" :with-header="false" class="slefSign">
    <div class="slefSign-header">
      <svg-icon icon-class="icon-delete-selfSign" class="icon-delete-selfSign" @click="closeSelfSign" /><span>本人签收</span>
      <el-button type='primary' v-if="!showTips" size='small' @click="saveSelfSign" class="save-self-sign">保存</el-button>
    </div>
    <div class="slef-warning" v-if="showTips">
      <svg-icon icon-class='self-warning' />{{selfTips}}
    </div>
    <div class="slefSign-content">
      <ky-ui-label title='签收设置' />
      <div :class="['slefSign-content-set', showTips?'slefSign-content-set-disabled':'']">
        <div class="slefSign-content-left">
          <svg-icon icon-class="icon-setting-selfSign" class="icon-setting-selfSign" />
          <div class="slefSign-content-text">
            <p class="slefSign-content-text-16">需收件人本人签收</p>
            <p class="slefSign-content-text-12">开启后，货物派送前会发送短信到收件人手机签收时出示给司机</p>
          </div>
        </div>
        <div class="slefSign-content-switch">
          <el-switch :disabled="showTips" v-model='isSelfSign' active-color='#9378FA' :width='50' inactive-color='#BFC5D1'>
          </el-switch>
        </div>
      </div>
      <ky-ui-label title='应用范围' />
      <div>
        <el-radio-group v-model="applicationRange" size="medium">
          <div class="item">
            <el-radio label="10">应用本次运单</el-radio>
          </div>
          <div class="item">
            <el-radio label="20">应用个人以后的全部运单</el-radio>
          </div>
        </el-radio-group>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { KyUiLabel } from '@comps/ky-ui'
import selfApi from '@/services/api/self-sign'
export default {
  name: 'self-sign-detail',
  components: {
    KyUiLabel
  },
  data () {
    return {
      drawer: false,
      isSelfSign: false,
      applicationRange: '10',
      selfSignSource: [],
      waybillNumber: '',
      oldSelfSign:false
    }
  },
  computed: {
    showTips () {
      return this.selfSignSource.includes('10') || this.selfSignSource.includes('20')
    },
    // eslint-disable-next-line vue/return-in-computed-property
    selfTips () {
      let title = ''
      if (this.selfSignSource) {
        if (this.selfSignSource.includes('10')) {
          title = '寄方已经设置的需本人签收运单，不能生效'
        } else if (this.selfSignSource.includes('20')) {
          title = '公司已设置为“需本人签收”，不可修改'
        }
      }
      return title
    },
  },
  methods: {
    showDrawer (waybillNumber) {
      this.waybillNumber = waybillNumber
      this.getPreference(waybillNumber)
      this.drawer = true
    },
    async saveSelfSign () {
      if (this.applicationRange === '20') {
        //调用数量接口
        let getCountParams = {
          selfSignSourceValue: this.isSelfSign ? '10' : '20'
        }
        let res = await selfApi.getPickupWaybillNumberCount(getCountParams)
        if (res.code === 0 && res.data) {
          let number = res.data
          if (Number(number) > 0) {
            let msg = '当前有' + number + '个运单未签收，是否立即生效？'
            this.$kye_message.confirm(msg, '', {
              type: 'warning'
            }).then(async () => {
              let params = {
                personalSelfSignStatus: this.isSelfSign ? 10 : 20,
                operateSource: '210'
              }
              let res = await selfApi.updateWebPickup(params)
              if (res.code === 0) {
                this.drawer = false
                this.$message.success('保存成功')
                this.freshData()
              }
            })
          }
        }
      } else {
        let params = {
          waybillNumber: this.waybillNumber,
          operateSource: '210',
          selfSignFlag: this.isSelfSign ? 10 : 20
        }
        let res = await selfApi.updateWaybillPickup(params)
        if (res.code === 0) {
          this.drawer = false
          this.$message.success('保存成功')
          this.freshData()
        }
      }
    },
    closeSelfSign () {
      if(this.oldSelfSign!=this.isSelfSign){
        this.$kye_message.confirm('您有更改信息,是否要保存', '', {
          type: 'warning',
          confirmButtonText: '保存',
          cancelButtonText: '不保存',
        }).then(()=>{
          this.saveSelfSign()
        }).catch(()=>{
          this.drawer = false
        })
      }else{
        this.drawer = false
      }
      
    },
    handleClose () {
      
    },
    async getPreference (waybillNumber) {
      console.log(waybillNumber,'waybillNumber')
      let params = {
        waybillNumber: waybillNumber
      }
      let res = await selfApi.getPreference(params)
      if (res.code === 0 && res.data) {
        this.selfSignSource = res.data.selfSignSource || []
        this.oldSelfSign=this.isSelfSign = this.selfSignSource && this.selfSignSource.length > 0
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .slefSign {
    .slefSign-header {
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
    .slef-warning {
      padding: 20px 0 0 20px;
    }
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
    }
  }
</style>