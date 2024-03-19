<template>
  <div class="empty-wrapper">
    <div class="line-info" :style="{'width':width,'height':height}">
       <div class="line-info-bg">
         <div class="line1">查询时间范围内未找到符合条件的数据</div>
       </div>
    </div>
   <!-- <div class="line2">跨越速运 - 按时保质完成您的任务</div>-->
  </div>
</template>

<script>
export default {
  props:{
  /*  width:{
      type: String,
      default: '38rem'
    },
    height:{
      type: String,
      default: '15rem'
    },*/
    width:{
      type: String,
      default: '30rem'
    },
    height:{
      type: String,
      default: '11rem'
    },
  },
  data(){
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
  .empty-wrapper{
    width: 100%;
    height: 100%;
    display: flex;
    /*flex-direction:column;*/
    justify-content: center;
    align-items: center;
    .line-info{
      /*flex: 1;*/
      width: 68%;
      height: 100%;
      display: flex;
      .line-info-bg{
        flex: 1;
        margin-top: -35px;
        position: relative;
        background: url("../../../assets/image/total/no-data.png") no-repeat;
        background-size: 100% 100%;
        .line1{
          width: 100%;
          position: absolute;
          left: 0;
          bottom: -20px;
          font-size: 1.4rem;
          text-align: center;
          color: #7f7e8d;
          line-height: 19px;
        }
      }
    }
  }

</style>
