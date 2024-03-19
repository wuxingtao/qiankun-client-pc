<template>
  <div class='agreement'>
    <span>登录即代表同意：</span>
    <el-button type='text' @click="openDialog('userAgreement')">{{ userAgreementTitle }}</el-button>
    <el-button type='text' @click="openDialog('privacy')">{{ privacyTitle }}</el-button>
    
    <!-- 用户协议 -->
    <el-dialog :title='userAgreementTitle' :visible.sync='isUserAgreementDialogVisible' width='736px' class='dialog'>
      <el-scrollbar>
        <div v-html='userAgreementDoc' class='dialog-content'></div>
      </el-scrollbar>
      <div slot='footer' class='dialog-footer'>
        <el-button type='primary' @click='isUserAgreementDialogVisible = false'>我知道了</el-button>
      </div>
    </el-dialog>
    
    <!-- 隐私政策 -->
    <el-dialog :title='privacyTitle' :visible.sync='isPrivacyDialogVisible' width='736px' class='dialog'>
      <el-scrollbar>
        <div v-html='privacyDoc' class='dialog-content'></div>
      </el-scrollbar>
      <div slot='footer' class='dialog-footer'>
        <el-button type='primary' @click='isPrivacyDialogVisible = false'>我知道了</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import UserService from '@/services/module/user'

const USER_AGREEMENT_DOC_ID = 127
const PRIVACY_DOC_ID = 131

export default {
  data() {
    return {
      // 用户协议
      isUserAgreementDialogVisible: false,
      userAgreementTitle: '《用户协议》',
      userAgreementDoc: '',
      
      // 隐私政策
      isPrivacyDialogVisible: false,
      privacyTitle: '《隐私政策》',
      privacyDoc: ''
    }
  },
  created() {
    UserService.getHelpDoc({ id: USER_AGREEMENT_DOC_ID }).then((res) => {
      this.userAgreementDoc = res.data.content
    })
    UserService.getHelpDoc({ id: PRIVACY_DOC_ID }).then((res) => {
      this.privacyDoc = res.data.content
    })
  },
  methods: {
    openDialog(docName) {
      if (docName === 'userAgreement') {
        this.isUserAgreementDialogVisible = true
      } else {
        this.isPrivacyDialogVisible = true
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.agreement {
  width: 100%;
  font-size: 12px;
  color: #666666;
  
  .el-button {
    font-size: 12px;
    margin-left: 5px;
  }
  
  .dialog {
    &-content {
      height: 250px;
      padding: 30px 10px;
      line-height: 26px;
      
      /deep/ {
        b, strong {
          font-weight: bold;
        }
      }
    }
  }
}
</style>