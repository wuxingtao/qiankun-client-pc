<template>
  <div class="import-vipshop-step--container">
    <div v-for="(step,index) in stepsData" :key="step" class="step-wrapper" :class="{'active':currentIndex>=index}">
      <div class="circle">{{index+1}}</div>
      <div class="text">{{step}}</div>
      <div class="line" v-if="index!=stepsData.length-1"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    currentIndex: {
      type: Number,
      default: 1
    }
  },
  data () {
    return {
      stepsData: ['上传模板', '填写入库号', '完成导入']
    }
  }
}
</script>

<style lang="scss" scoped>
  .import-vipshop-step--container {
    display: flex;
    justify-content: space-between;
    .step-wrapper {
      display: flex;
      &:not(:last-child) {
        flex: 1;
      }
      align-items: center;
      color: rgba(0, 0, 0, 0.25);
      &.active {
        color: #8365f6;
        .circle {
          border: 1px solid #8365f6;
          background-color: #8365f6;
          color: #fff;
        }
      }
      .circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.25);
        text-align: center;
        line-height: 28px;
      }
      .text {
        padding-left: 8px;
      }
      .line {
        flex: 1;
        border-top: 2px solid;
        margin: 0 16px;
      }
    }
  }
</style>