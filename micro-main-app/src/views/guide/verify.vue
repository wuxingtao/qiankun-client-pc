<template>
  <div class='verify'>
    <p class='title'>请完善实名认证，帮助您快速下单</p>
    <!-- 个人认证 -->
    <div class='option' @click="selectType('personal')">
      <img v-if="type === 'personal'" src='@/assets/image/admin/radio_select.png' />
      <img v-else src='@/assets/image/admin/radio.png' />
      <span class='type'>个人认证</span>
    </div>
    <p class='desc'>用于个⼈实名认证，上传您的身份证信息即可完成实名认证。</p>
    <!-- 企业认证 -->
    <div class='option' @click="selectType('enterprise')">
      <img v-if="type === 'enterprise'" src='@/assets/image/admin/radio_select.png' />
      <img v-else src='@/assets/image/admin/radio.png' />
      <span class='type'>企业认证</span>
    </div>
    <p class='desc'>⽤于企业组织认证，完成认证后企业员工寄件时，可不用再单独认证。</p>
    <!-- 按钮 -->
    <div class='btn'>
      <el-button @click='later()'>进入首页</el-button>
      <el-button type='primary' @click='next()'>立即认证</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: 'personal'
    }
  },
  methods: {
    next() {
      this.$router.push(`/admin/real-name-verify/${this.type}-verify`)
    },
    later() {
      this.$router.push('/admin')
    },
    selectType(type) {
      this.type = type
    }
  }
}
</script>

<style lang='scss' scoped>
.verify {
  .title {
    font-size: 24px;
    color: #333333;
    font-weight: bold;
  }

  .option {
    display: flex;
    margin-top: 50px;
    cursor: pointer;

    .type {
      color: #333333;
      font-weight: bold;
      font-size: 16px;
    }

    > img {
      width: 15px;
      height: 15px;
      margin-right: 10px;
    }
  }

  .desc {
    color: #666666;
    font-size: 14px;
    margin: 12px 0 0 25px;
  }

  .btn {
    width: 100%;
    text-align: center;
    margin-top: 100px;

    .el-button {
      margin: 0 10px;
      width: 200px;
      height: 36px;
      border-radius: 20px;
      font-size: 12px;
    }
  }
}
</style>