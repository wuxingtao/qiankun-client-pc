<template>
  <div class='express-nodata'>
    <section class='material-nodata-image'>
      <img src='../../material/components/nodata.png' />
    </section>
    <div class='nodata-text'>{{ text }}</div>
  </div>
</template>
<script>
export default {
  props: {
    text: {
      type: String,
      default: ' '
    },
  }
}
</script>
<style lang='scss' scoped>
@import './style.scss';

.material-nodata-image {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>

