<template>
  <div class="toolbar-filter">
    <label>运单号：</label>
    <div>{{ row }}</div>
  </div>
</template>
<script>
export default {
  props: {
    row: String,
  }
}
</script>
<style lang="scss" scoped>
@import './style.scss';
</style>

