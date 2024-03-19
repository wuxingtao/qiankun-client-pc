<template>
  <div class="table-cell-label__container" :class="{'has-error':row[col.prop].errorInfo}" :style='{color:col.color}'>
    {{ row[col.prop].value }}
  </div>
</template>

<script>
export default {
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
  .table-cell-label__container {
    box-sizing: border-box;
    height: 28px;
    line-height: 28px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    &.has-error{
      border-color: #f13e3e ;
    }
  }
</style>