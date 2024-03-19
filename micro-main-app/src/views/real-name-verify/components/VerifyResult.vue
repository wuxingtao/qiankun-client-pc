<template>
  <div class='verify-result-container'>
    <img src='@/assets/image/client/realNameVerify/result-sucess.png' />
    <div class='text'>实名认证成功</div>
    <div class='btn-wrapper'>
      <el-button @click="$router.push({name:'realVerify'})">返回认证</el-button>
      <el-button type='primary' @click="$router.push({path:'/admin/delivery'})">立即寄件</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  }
}
</script>

<style lang='scss' scoped>
.verify-result-container {
  padding-top: 157px;
  text-align: center;
  font-size: 16px;
  color: #333333;

  .text {
    margin-bottom: 26px;
  }
}
</style>
