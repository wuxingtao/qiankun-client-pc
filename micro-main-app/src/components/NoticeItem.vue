<template>
  <div class="notice-container">
    <i class="iconfont icon-warn mr_8" />
    <slot ></slot>
    <i class="el-icon-close" @click="$emit('on-close')"></i>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
  .notice-container {
    min-width: 740px;
    z-index: 99;
    // height: 38px;
    line-height: 18px;
    background: #fef6e2;
    border: 1px solid #ffe1b7;
    border-radius: 5px;
    display: flex;
    align-items: center;
    // margin: 8px 0px;
    padding: 10px 20px;
    font-size: 14px;
    color: #ff8038;
    margin-bottom: 16px;
    // .item {
    //   animation: 20s wordsLoop linear infinite normal;
    // }
    .el-icon-warning {
      padding-right: 8px;
      //color: #ffa40d;
    }
    .el-icon-close {
      margin-left: auto;
      cursor: pointer;
    }

  }
</style>
