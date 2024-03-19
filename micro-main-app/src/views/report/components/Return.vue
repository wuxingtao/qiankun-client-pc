<template>
  <div class="return-container">
     <svg-icon icon-class="icon-return" class-name="icon-return" @click="handleReturn"/>
     <slot>返回</slot>
  </div>
</template>

<script>
export default {
  props:{
    beforeRoutePath:{
      type:String,
      default:'/admin/report'
    }
  },
  methods:{
    handleReturn(){
      this.$router.push(this.beforeRoutePath)
    }
  }
}
</script>

<style lang="scss" scoped>
.return-container{
  margin: 0 20px;
  padding: 17px 0;
  border-bottom: 1px solid #f1f1f5;
  font-size: 16px;
  font-weight: bold;
  .icon-return{
    padding-right: 13px;
    cursor: pointer;
  }
}
</style>