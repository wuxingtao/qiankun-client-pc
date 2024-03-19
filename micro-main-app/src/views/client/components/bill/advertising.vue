<template>
  <div class="client-container" style="background-color:#F1F1F5">
    <div style="background-color:#fff; padding:6px;">
      <div class="title">
        <div class="el-icon-back" @click="returnBack"></div>
        <div style="cursor:pointer" @click="returnBack">返回</div>
      </div>
      <div class="content">
        <iframe :src="url" style="height:700px;width:100%"></iframe>
      </div>
    </div>
  </div>
</template>


<script>
export default {
  data() {
    return {
      url:''
    }
  },
  mounted(){
    this.url=this.$route.query.url
  },
  methods:{
    returnBack(){
      let routerName = "bill"
      this.$router.push({
        name: routerName
      })
    },
  }
}
</script>

<style lang="scss" scoped>
  .title {
    margin-left: -6px;
    font-size: 18px;
    line-height: 50px;
    color: #333333;
    margin: 0 24px;
    border-bottom: 1px solid #f1f1f5;
    div {
      display: inline-block;
      font-weight: bold;
    }
    .el-icon-back {
      font-size: 17px;
      margin-right: 12px;
      position: relative;
      top: 1px;
      cursor: pointer;
    }
  }

  .content {
    margin: 8px 24px 14px;
  }
</style>
