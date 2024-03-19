<template>
  <div class='enterprise-verify-container' :class="[{'verify--ok': verifiedOfEnterprise}]">
    <div class='page-box__title cursor pl_20 pr_20 bg_white' @click='handleCancel'>
      <i class='el-icon-back theme-color fs_18 mr_8 f_w_700'></i>企业认证
    </div>
    <div class='page__content ml_20 mr_20'>
      <template v-if='verifiedOfEnterprise'>
        <verify-status type='1'
                       :personInfo='personInfo'
                       :enterpriseInfo='enterpriseInfo'
                       :verifiedOfEnterprise.sync='verifiedOfEnterprise'
        />
      </template>
      <template v-else>
        <template v-if='!isVerifySucess'>
          <div class='page__form'>
            <div class='category-title'>01.请上传您的营业执照</div>
            <!-- <div class="radio-wrapper">
              证件类型：
              <el-radio v-model="certificateType" label="10">营业热照</el-radio>
              <el-radio v-model="certificateType" label="20">组织机构代码</el-radio>
              <el-radio v-model="certificateType" label="30">税务登记证</el-radio>
            </div> -->
            <verify-enterprise ref='verifyEnterprise10' v-show="certificateType==='10'" certificateType='10' />
            <!-- <verify-enterprise ref="verifyEnterprise20" v-show="certificateType==='20'" certificateType='20'/>
            <verify-enterprise ref="verifyEnterprise30" v-show="certificateType==='30'" certificateType='30'/> -->
            <verify-personal ref='verifyPersonal' title='02.请输入您的二代身份证' class='mt_45' />
            <div class='btn-wrapper mt_4'>
              <el-button round @click='$router.back()'>取消</el-button>
              <el-button round type='primary' :loading='loading' v-btnThrottle @click='saveData'>提交认证</el-button>
            </div>
          </div>
        </template>
        <verify-result v-else />
      </template>

    </div>
  </div>
</template>

<script>
import VerifyStatus from '@views/real-name-verify/components/VerifyStatus.vue'
import VerifyEnterprise from './components/VerifyEnterprise.vue'
import VerifyPersonal from './components/VerifyPersonal.vue'
import VerifyResult from './components/VerifyResult.vue'
import { applyEnterpriseVerify } from '@/services/api/realNameVerify'
import verifyMixin from '@views/real-name-verify/verifyMixin'

export default {
  mixins: [verifyMixin],
  components: { VerifyPersonal, VerifyResult, VerifyEnterprise, VerifyStatus },
  data() {
    return {
      loading: false,
      id: '',
      certificateType: '10',
      isVerifySucess: false
    }
  },
  activated() {
    this.isVerifySucess = false
    this.id = this.$route.query.id || this.$route.params.id
    if (this.$route.params.verified) {
      this.verifiedOfEnterprise = true
    }
  },
  methods: {
    async saveData() {
      try {
        this.loading = true
        const verifyEnterpriseComp = this.$refs['verifyEnterprise' + this.certificateType]
        await Promise.all([this.$refs.verifyPersonal.validate(), verifyEnterpriseComp.validate()])
        let certificateData = verifyEnterpriseComp.formData
        let idData = this.$refs.verifyPersonal.formData
        let data = { id: this.id, certificateType: this.certificateType, ...idData, ...certificateData }
        let res = await applyEnterpriseVerify(data)
        if (res.code === 0) {
          this.isVerifySucess = true
          this.$message.success('认证成功')
          await this.updateVerify()
        }
        this.loading = false
      } catch (ex) {
        console.log('ex :>> ', ex)
        this.loading = false
      }
    },
    handleCancel() {
      this.$router.push({ name: 'realVerify' })
    }
  }
}
</script>

<style lang='scss' scoped>
@import './index.scss';

.page-box__title {
  width: auto;
  font-weight: bold;
}

.page__form {
  width: 530px;
}

.page__content {
  width: 530px;
  margin: 30px auto 0;

  .btn-wrapper {
    text-align: center;
    margin-top: 20px;
    background: #fff;
  }
}

.enterprise-verify-container {
  @include scroll-bar;
  padding: 0 0 56px;
  font-size: 14px;

  .category-title {
    font-size: 20px;
    font-weight: bold;
    height: 22px;
    line-height: 22px;
    margin: 0 0 20px;
    color: #333333;
  }

  .radio-wrapper {
    padding-bottom: 21px;
  }

  /deep/ .el-input__inner {
    border: none;
    border-bottom: 1px solid #e9e9e9;
    padding: 0;
  }

  /deep/ .el-form-item {
    margin-bottom: 26px;
    text-align: center;
  }

  .el-button {
    width: 200px;
    height: 36px;
    border-radius: 20px;
    font-size: 12px;
  }
}
</style>
