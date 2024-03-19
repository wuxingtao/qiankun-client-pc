<template>
  <div v-loading.lock="loading">
    <div class="page-box__title cursor ml_20 mr_20" @click="handleCancel">
      <i class="el-icon-back theme-color fs_18 mr_8 f_w_700"></i>详情
    </div>
    <div class="warm-prompt" v-if="status === 1">
      <img src="../../../assets/image/setting/warm-prompt.png" class="warm-prompt-img" />
      <p>温馨提示：以下申请人申请您作为付款方，如您点击同意，则申请方客户编码下选择您作为付款方的所有订单费用，由您付款，请核实并谨慎选择。</p>
    </div>
    <div class="approve-status">
      <h2 class="warn-text">{{ statusText() }}</h2>
      <p v-if="isViewResult" :class="{'warn-result': true, 'warn-result-color': status === 6}">{{ statusResult() }}</p>
      <p class="warn-status" v-if="isViewStatus">{{ statusWarn() }}</p>
      <el-button class="refuse" v-if="status === 1" @click="handleConfirm('20')" >拒绝</el-button>
      <el-button class="agree" v-if="status === 1" @click="handleConfirm('10')" >同意</el-button>
      <el-button class="refuse" v-if="status === 2" @click="handleConfirm('30')">解除授权</el-button>
      <el-button class="refuse" v-if="status === 4 || status === 5">再次申请</el-button>
    </div>
    <div class="apply-message">
      <h2 class="apply-title">申请信息</h2>
      <div  class="message-content">
        <div class="message-left">申请人</div>
        <div class="message-right">{{ messageObj.applyName }}</div>
      </div>
      <div  class="message-content">
        <div class="message-left">手机号码</div>
        <div class="message-right">{{ addBlank(messageObj.applyMobile) }}</div>
      </div>
      <div  class="message-content">
        <div class="message-left">所在公司</div>
        <div class="message-right">{{ messageObj.applyCustomerName }}</div>
      </div>
      <div  class="message-content">
        <div class="message-left">客户编码</div>
        <div class="message-right">{{ messageObj.applyCustomerCode }}</div>
      </div>
      <div  class="message-content">
        <div class="message-left">备注</div>
        <div class="message-right">{{ messageObj.applyReason }}</div>
      </div>
      <div  class="message-content">
        <div class="message-left">申请时间</div>
        <div class="message-right">{{ messageObj.applyTime }}</div>
      </div>
    </div>
    <div class="apply-message" v-if="status === 2 || status === 3 || status === 7">
      <h2 class="apply-title">操作信息</h2>
      <div  class="message-content">
        <div class="message-left">操作人</div>
        <div class="message-right">{{ messageObj.authName }}</div>
      </div>
      <div  class="message-content">
        <div class="message-left">操作时间</div>
        <div class="message-right">{{ messageObj.authSTime }}</div>
      </div>
      <div  class="message-content" v-if="status === 3">
        <div class="message-left">拒绝原因</div>
        <div class="message-right">{{ messageObj.rejectReason }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPayAuth, apply } from '@/services/api/pyAuth'
export default {
  name: 'authorizationAccountDetail',
  data() {
    return {
      messageObj: {},
      status: 1,
      loading: false
    }
  },
  async activated() {
    this.getPayAuthData()
  },
  computed: {
    isViewResult() {
      if (this.status === 4 || status === 5 || status === 6) return true
      return 6
    },
    isViewStatus() {
      if (this.status === 5 || this.status === 6) return false
      return true
    }
  },
  methods: {
    async getPayAuthData() {
      try {
        this.loading = true
        const result = await getPayAuth({ id: this.$route.query.id })
        this.messageObj = result && result.data
        this.getStatus()
      } finally {
        this.loading = false
      }
    },
    getStatus() {
      switch (this.messageObj.authStatus) {
        case '10':
          this.status = 1
          return
        case '20':
          this.status = 2
          return
        case '30':
          this.status = 3
          return
        case '40':
          this.status = 7
          return
      }
    },
    async handleConfirm(operateType) {
      try {
        this.loading = true
        const result = await apply({ operateType, authIds: [this.messageObj.id], applyCustomList: [{ applyId: String(this.messageObj.id || 0), applyCustomerCode: this.messageObj.applyCustomerCode, applyMobile: this.messageObj.applyMobile }] })
        if (result && result.code === 0) {
          this.$message({
            message: '提交成功',
            type: 'success'
          })
        }
        this.getPayAuthData()
      } finally {
        this.loading = false
      }
    },
    handleCancel() {
      this.$router.push({name: 'approverCooperationAuthorization'})
    },
    addBlank(num) {
      if (!num) return num
      return String(num).replace(/^(\d{3})(\d{4})(\d{4})$/, "$1" + ' ' + "$2" + ' ' + "$3")
    },
    statusText() {
      switch (this.status) {
        case 1:
          return '待审批'
        case 2:
          return '已同意'
        case 3:
          return '已拒绝'
        case 7:
          return '已解除'
        default:
          return <div><span style="margin-right: 16px;">深圳水晶石</span><span>59605484958</span></div>
      }
    },
    statusWarn() {
      switch (this.status) {
        case 1:
          return '对方申请您作为付款方'
        case 2:
          return '您已同意作为付款方'
        case 3:
          return '您已拒绝作为付款方'
        case 4:
          return '拒绝原因：这里有50个字的原因。'
        case 7:
          return '您已解除作为付款方'
      }
    },
    statusResult() {
      switch(this.status) {
        case 4:
          return '对方已拒绝'
        case 5:
          return '对方已解除'
        case 6:
          return '审核中'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-box__title {
    width: auto;
    margin-bottom: 0;
  }

  .warm-prompt {
    display: flex;
    align-items: center;
    padding: 9px 0 9px 16px;
    margin: 20px;
    border: 1px solid #8365f6;
    border-radius: 5px;
    background: #f3f0ff;
    color: #8365f6;

    .warm-prompt-img {
      width: 14px;
      height: 14px;
      margin-right: 8px;
    }
  }

  .approve-status {
    margin: 0 20px;
    padding: 50px 34px;
    border: 1px solid #e6e6e6;
    border-radius: 5px;

    .warn-text {
      font-size: 24px;
      font-weight: 600;
      color: #333;
    }

    .warn-result {
      margin-top: 8px;
      font-weight: 600;
      font-size: 16px;
      color: #ff3a4d;
    }

    .warn-result-color {
      color: #ffa40d;
    }

    .warn-status {
      margin-top: 10px;
      margin-bottom: 16px;
      color: #999999;
    }

    .refuse {
      width: 84px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      border: 1px solid #7556ed;
      border-radius: 17px;
      background: rgba(220,218,226,0.00);
      color: #7556ed;
      padding: 0;
      box-sizing: border-box;
    }

    .agree {
      width: 84px;
      height: 32px;
      line-height: 32px;
      text-align: center;
      background: #7556ed;
      border: 1px solid #7556ed;
      border-radius: 16px;
      color: #ffffff;
      padding: 0;
      box-sizing: border-box
    }

  }

  .apply-message {
    margin: 16px 20px;
    padding: 24px;
    border: 1px solid #e6e6e6;
    border-radius: 5px;

    .apply-title {
      font-size: 16px;
      font-weight: 500;
      color: #333333;
      margin-bottom: 24px;
    }

    .message-content {
      display: flex;
      margin-bottom: 16px;

      .message-left {
        min-width: 68px;
        margin-right: 46px;
        color: #999999;
      }

      .message-right {
        color: #333333;
      }
    }

    .message-bottom {
      margin-bottom: 0
    }

  }

</style>