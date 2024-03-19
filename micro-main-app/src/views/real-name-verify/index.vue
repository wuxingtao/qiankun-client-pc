<template>
  <div class="real-name-verify-container page__container">
    <div class="page-box__title cursor ml_20 mr_20 bg_white" @click="handleCancel">
      <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>实名认证
    </div>
    <div class="page__content pl_20 pr_20">
      <div class="tip" v-if="tipVisible">
        <i class="el-icon-warning tip-icon"></i>
        根据国家邮政局《寄递渠道”三个100%”》的要求，寄件必须实名认证。
        <i class="el-icon-close cursor" @click="tipVisible=false"></i>
      </div>
      <div class="card-wrapper">
<!--        <div v-if="verifiedOfPersonal" class="bg_white personal-verified">-->
<!--          <div class="verified-flag">-->
<!--            <svg-icon icon-class="icon-guard"/>-->
<!--            已认证-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <img src="@/assets/image/client/realNameVerify/personal.png"/>-->
<!--            <span @click="$router.push({path:'personal-verify',query:{id:idOfPersonal}})" class="cursor-pointer">更换实名信息-->
<!--            <svg-icon icon-class="arrow-right2"/>-->
<!--          </span>-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <div class="col-label">姓名</div>-->
<!--            <div class="col-value">{{ idName }}</div>-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <div class="col-label">身份证</div>-->
<!--            <div class="col-value">{{ idNo }}</div>-->
<!--          </div>-->
<!--        </div>-->
        <div class="bg_white personal-unverify" @click="$router.push({name:'personalVerify',params:{id:idOfPersonal,verified:verifiedOfPersonal}})">
          <img src="@/assets/image/client/realNameVerify/personal.png"/>
          <div class="flex_1">
            <div class="title">个人认证</div>
            <div>用于个人实名认证，上传您的身份证信息即可完成实名认证</div>
          </div>
          <img src="@/assets/image/client/realNameVerify/arrow-right.png"/>
        </div>

<!--        <div v-if="verifiedOfEnterprise" class="bg_white enterprise-verified">-->
<!--          <div class="verified-flag">-->
<!--            <svg-icon icon-class="icon-guard"/>-->
<!--            已认证-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <img src="@/assets/image/client/realNameVerify/enterprise.png"/>-->
<!--            <span @click="$router.push({path:'enterprise-verify',query:{id:idOfEnterprise}})" class="cursor-pointer">更换实名信息-->
<!--            <svg-icon icon-class="arrow-right2"/>-->
<!--          </span>-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <div class="col-label">公司名称</div>-->
<!--            <div class="col-value">{{ companyName }}</div>-->
<!--          </div>-->
<!--          <div class="row">-->
<!--            <div class="col-label">证件号码</div>-->
<!--            <div class="col-value">{{ companyNo }}</div>-->
<!--          </div>-->
<!--        </div>-->
        <div class="bg_white enterprise-unverify" @click="$router.push({name:'enterpriseVerify',params:{id:idOfEnterprise,verified:verifiedOfEnterprise}})">
          <img src="@/assets/image/client/realNameVerify/enterprise.png"/>
          <div class="flex_1">
            <div class="title">企业认证</div>
            <div>用于企业组织认证，完成认证后企业员工寄件时，可不用再单独认证</div>
          </div>
          <img src="@/assets/image/client/realNameVerify/arrow-right.png"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { queryVerifyStatusInfo } from '@/services/api/realNameVerify'

export default {
  data() {
    return {
      verifiedOfPersonal: false ,
      verifiedOfEnterprise: false ,
      idOfPersonal: '' ,//个人实名认证数据Id
      idName: '' ,
      idNo: '' ,
      idOfEnterprise: '' ,//企业实名认证数据Id
      companyName: '' ,
      companyNo: '',
      tipVisible:true
    }
  } ,
  async activated() {
    await this.handleInfo()
  } ,
  methods: {
    handleCancel() {
      this.$router.push({name: 'user'})
    },
    async handleInfo(){
      let res = await queryVerifyStatusInfo()
      if (res.code !== 0) {
        return
      }
      this.verifiedOfPersonal = !!res.data.personCertification
      this.verifiedOfEnterprise = !!res.data.enterpriseCertification
      if (this.verifiedOfPersonal) {
        let data = res.data.personCertification
        this.idOfPersonal = data.id
        this.idName = data.idCardName
        this.idNo = data.idCardNo
      }
      if (this.verifiedOfEnterprise) {
        let data = res.data.enterpriseCertification
        this.idOfEnterprise = data.id
        this.companyName = data.certificationName
        this.companyNo = data.certificationCode
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.page__container {
  background-color: #F7f9fa;;
  overflow-x: hidden;
  font-size: 14px;
  height: 100%;
  box-sizing: border-box;
  .page-box__title{
    margin: 0;
    padding: 0 20px;
    font-weight: bold;
  }
}

.real-name-verify-container {
  font-size: 14px;

  .tip {
    height: 38px;
    line-height: 38px;
    opacity: 0.9;
    background: #ffedd1;
    border: 1px solid #fda009;
    border-radius: 5px;
    color: #FFA40D;
    margin: 10px  0;

    &-icon {
      padding: 0 9px 0 20px;
      color: #FFA40D;
    }
    .el-icon-close{
      float: right;
      padding: 12px 10px 0 0;
      font-size: 16px;
    }

  }

  .card-wrapper {
    display: flex;

    & > div {
      flex: 1;
      border: 1px solid #ebebeb;
      border-radius: 4px;
      box-shadow: 0px 6px 16px 0px rgba(238, 239, 240, 0.5);
      padding: 53px 30px;
      color: #999999;
      line-height: 20px;

      &:first-of-type {
        margin-right: 39px;
      }

      &[class$="-unverify"] {
        display: flex;
        align-items: center;

        & > img:last-of-type {
          cursor: pointer;

          &:first-of-type {
            height: 36px;
          }

          &:last-of-type {
            width: 18px;
            height: 18px;
          }
        }

        & > div:first-of-type {
          padding: 0 16px;
        }

        .title {
          font-size: 18px;
          font-weight: bold;
          color: #333333;
          line-height: 16px;
          padding-bottom: 8px;
        }
      }

      &[class$="-verified"] {
        position: relative;
        background: url("~@/assets/image/client/realNameVerify/verified-bg.png") no-repeat;
        background-size: cover;
        padding: 32px 0 34px 40px;

        .verified-flag {
          position: absolute;
          right: -3px;
          top: 19px;
          background: url("~@/assets/image/client/realNameVerify/verified-flag-bg.png") no-repeat;
          width: 81px;
          height: 31px;
          color: #ffffff;
          box-sizing: border-box;
          padding: 4px 0 0 11px;
        }

        .row {
          display: flex;

          &:not(:last-of-type) {
            padding-bottom: 16px;
          }

          &:nth-child(2) {
            display: block;
            color: #7c57df;
            padding-bottom: 24px;

            img {
              vertical-align: bottom;
              padding-right: 16px;
            }
          }

          .col-value {
            color: #333333;
          }
        }

        &.personal-verified {
          .col-label {
            width: 61px;
            text-align: justify;
            text-align-last: justify;
            padding-right: 42px;
          }
        }

        &.enterprise-verified {
          .col-label {
            width: 84px;
            padding-right: 24px;
          }
        }
      }
    }
  }
}
</style>
