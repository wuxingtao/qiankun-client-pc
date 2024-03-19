<template>
  <div class="empty-wrapper">
    <svg-icon icon-class="none-data2" />
    <div>未找到符合条件的数据<br />建议您调整筛选条件再试试</div>
  </div>
</template>

<script>
  export default {

  }
</script>

<style lang="scss" scoped>
  .empty-wrapper {
    width: 100%;
    text-align: center;
    margin: 10px auto;
    line-height: 20px;
    color: #909399;
    font-size: 14px;
    .svg-icon {
      width: 150px;
      height: 150px;
      margin-bottom: 24px;
    }
  }
</style>