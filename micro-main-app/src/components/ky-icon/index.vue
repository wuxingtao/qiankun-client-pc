<style lang="css">
.ky-iconfont {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
<template>
  <svg class="ky-iconfont" aria-hidden="true">
    <use :xlink:href="'#' + type"></use>
  </svg>
</template>
<script>
export default {
  props: {
    type: {
      type: String,
      default: ''
    }
  }
}
</script>
