<template>
  <div class='personal-verify-container' :class="[{'verify--ok': verifiedOfPersonal}]">
    <div class='page-box__title cursor pl_20 pr_20 bg_white' @click='handleCancel'>
      <i class='el-icon-back theme-color fs_18 mr_8 f_w_700'></i>个人认证
    </div>
    <div class='page__content ml_20 mr_20'>
      <template v-if='verifiedOfPersonal'>
        <verify-status type='0'
                       :personInfo='personInfo'
                       :enterpriseInfo='enterpriseInfo'
                       :verifiedOfPersonal.sync='verifiedOfPersonal'
        />
      </template>
      <template v-else>
        <template v-if='!isVerifySucess'>
          <verify-personal ref='verifyPersonal' />
          <div class='btn-wrapper'>
            <el-button round @click='$router.back()'>取消</el-button>
            <el-button type='primary' :loading='loading' round v-btnThrottle @click='saveData'>提交认证</el-button>
          </div>
        </template>
        <verify-result v-else />
      </template>
    </div>
  </div>
</template>

<script>
import verifyMixin from '@views/real-name-verify/verifyMixin'
import verifyPersonal from './components/VerifyPersonal.vue'
import VerifyResult from './components/VerifyResult.vue'
import { applyPersonalVerify } from '@/services/api/realNameVerify'
import VerifyStatus from '@views/real-name-verify/components/VerifyStatus.vue'
import UserService from '@/services/module/user'
import { setRealNameData } from '@utils/storage'

export default {
  mixins: [verifyMixin],
  components: { verifyPersonal, VerifyResult, VerifyStatus },
  data() {
    return {
      loading: false,
      id: '',
      ocrRecognitionResult: false,
      isVerifySucess: false
    }
  },
  activated() {
    this.isVerifySucess = false
    this.id = this.$route.query.id || this.$route.params.id
    if (this.$route.params.verified) {
      this.verifiedOfPersonal = true
    }
  },
  methods: {
    async saveData() {
      try {
        this.loading = true
        let res2 = await this.$refs.verifyPersonal.validate()
        console.log(res2)
        let data = { id: this.id, ...this.$refs.verifyPersonal.formData }
        let res = await applyPersonalVerify(data)
        if (res.code === 0) {
          this.isVerifySucess = true
          this.$message.success('认证成功')
          await this.updateVerify()
        }
        this.loading = false
      } catch (e) {
        this.loading = false
      }
    },
    handleCancel() {
      this.$router.push({ name: 'realVerify' })
    }
  },
  computed: {}
}
</script>

<style lang='scss' scoped>
@import './index.scss';

.personal-verify-container {
  font-size: 14px;

  .page-box__title {
    width: auto;
  }

  .page__content {
    width: 530px;
    margin: 86px auto 0;

    .btn-wrapper {
      text-align: center;
      margin-top: 35px;
      background: #fff;
    }
  }

  /deep/ .el-input__inner {
    border: none;
    border-bottom: 1px solid #e9e9e9;
    padding: 0;
  }

  /deep/ .el-form-item {
    margin-bottom: 45px;
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
