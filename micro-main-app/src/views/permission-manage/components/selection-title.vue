<template>
  <div class="ky-selection-title">
    <span class="title"><slot></slot></span>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'selection-title',
  props: {},
  setup () {
    const state = reactive({})
    return { ...toRefs(state) }
  }
})
</script>

<style lang="scss" scoped>
.ky-selection-title {
  font-size: 14px;
  text-align: left;
  padding: 12px 0;
  border-bottom: 1px solid #f1f1f5;

  span {
    font-weight: bold;
    color: rgba(51, 51, 51, 0.93);
  }
}
</style>
