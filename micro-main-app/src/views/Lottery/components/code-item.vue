<template>
<div class="code-item flex flex_ai_c flex_jc_c">
  <div class="img-avatar">
    <img :src="portrait" alt="">
  </div>
  <div class="info font-color">
    <div class="phone">{{info.mobile}}</div>
    <div class="code">抽奖码：{{info.prizeNo}}</div>
  </div>
</div>
</template>

<script>
export default {
  name: 'code-item',
  props:{
    info:{
      type:Object,
      default:()=>{}
    }
  },
  computed:{
    portrait(){
      return this.info.headPortrait || require('@assets/image/lottery/avatar_default.jpeg')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../base.scss';
.code-item{
  margin-bottom: 40px;
  flex: 0 0 33.33% !important;
}
.phone{
  margin-bottom:4px;
}
.info{
  font-size:vm(16);
  *{
    font-weight: 500;
  }
}
.font-color{
  color:#551b25;
}
.img-avatar{
  width: vm(40);
  height:vm(40);
  margin-right: vm(10);
  img{
    width:100%;
    border-radius:100%;
  }
}
</style>
