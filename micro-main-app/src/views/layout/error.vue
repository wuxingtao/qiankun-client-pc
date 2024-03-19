<template>
  <div class="error">
    <div class="msg">{{msg}}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      msg: '抱歉，你访问的页面不存在！'
    }
  }
}
</script>

<style lang="scss" scoped>
.error {
  height: 100%;
  background: url('../../assets/image/404.svg') no-repeat center;

  .msg {
    width: 100%;
    position: absolute;
    text-align: center;
    bottom: 5vh;
    font-size: 28px;
    color: #999999;
  }
}
</style>