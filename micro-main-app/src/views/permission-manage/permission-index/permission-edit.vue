<template>
  $END$
</template>

<script>
import { defineComponent, reactive, toRefs } from '@vue/composition-api'

export default defineComponent({
  name: 'permission-edit',
  props: {},
  setup () {
    const state = reactive({})
    return { ...toRefs(state) }
  }
})
</script>

<style scoped></style>
