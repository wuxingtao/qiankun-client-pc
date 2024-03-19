<template>
  <div class="cell-waybill-number__wrapper">
    {{ cellValue }}
    <el-button type='text' v-clipboard='cellValue'>
        <i class="iconfont icon-copy"/>
      </el-button>
      <!-- <el-button class="ky-button-icon" icon="iconfont icon-copy"></el-button> -->
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, watch } from '@vue/composition-api'

export default defineComponent({
  name: 'cell-waybill-number',
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    }
  },
  setup(props) {
    const state = reactive({
      cellValue: props.row.ydNo.value
    })
    watch(
      () => props.row['ydNo'],
      val => {
        state.cellValue = val.value
      },
      {
        deep: true
      }
    )

    return {
      ...toRefs(state)
    }
  }
})
</script>

<style lang="scss" scoped>
.cell-waybill-number__wrapper {
}
</style>
