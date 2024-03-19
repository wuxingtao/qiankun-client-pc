<template>
  <el-tooltip popper-class="vxe-table-cell__tooltip" placement="bottom" v-if="errors && errors.length > 0" :open-delay="300" effect="light">
    <div slot="content">
      <p v-for="(item, index) in errors" :key="index">{{ `${index + 1}.${item}` }}</p>
    </div>
    <span style="padding-left: 6px">
      <svg-icon icon-class="icon-warning" />
    </span>
  </el-tooltip>
</template>

<script>
export default {
  props: {
    errors: {
      type: [Array]
    }
  }
}
</script>

<style lang='scss'>
.popover-errors-summary20210608 {
  color: #fff;
  pointer-events: none;
  &,
  &.is-dark {
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    font-size: 12px;
  }

  &[x-placement^='top'] .popper__arrow {
    &,
    &::after {
      border-top-color: rgba(0, 0, 0, 0.3);
    }
  }
}
</style>