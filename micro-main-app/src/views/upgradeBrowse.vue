<template>
  <div class="upgrade">
    <img src="../assets/image/browse/upgrade.png" alt srcset />
    <p class="upgrade_tips">
      您的浏览器版本过低
      <br />为了更好的体验，请升级你的浏览器
    </p>
    <a class="upgrade_btn" target="_blank" href="http://browsehappy.osfipin.com/">
      <el-button type="primary">查看升级</el-button>
    </a>
  </div>
</template>
<script>
export default {
    
}
</script>
<style lang="scss" scoped>
.upgrade{
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    &_tips{
        color: #333;
        font-size: 28px;
        line-height:36px;
        margin-top: 15px;
        text-align: center;
    }
    &_btn{
        .el-button{
            font-size: 18px;
            width: 150px;
            font-weight: normal;
            margin-top: 37px;
        }
    }
}
</style>

