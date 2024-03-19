<template>
  <div class="cell-weight__wrapper">
    <el-input v-if="isInputVisble(row,col)" v-model="cellValue" @change="handleChange(col, row, $event)" :disabled='col.readOnly || row[col.prop].readOnly' @blur='inputBlur(col.prop, row[col.prop])' />
    <table-cell-label v-else :row="row" :col="col"/>
    <ky-tip v-show="!hasError && row['weight'].warningInfo" :msg="row['weight'].warningInfo" />
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch } from '@vue/composition-api'
import TableCellLabel from '@comps/table/components/table-cell-label'

export default defineComponent({
  name: 'cell-weight',
  props: {
    row: {
      type: Object,
    },
    col: {
      type: Object,
    },
  },
  components:{
    TableCellLabel
  },
  setup (props, { emit }) {
    const state = reactive({
      cellValue: props.row.weight.value,
    })
    watch(() => props.row['weight'], val => {
      state.cellValue = val.value
    }, {
      deep: true
    })

    const hasError = computed(() => {
      return props.row['weight']['errorInfo']
    })

    const inputBlur = (fieldName, val) => {
      if (val.edit && !val.errorInfo) {
        val.edit = false
      }
    }
    const isInputVisble = (row, column) => {
      if (column.readOnly || row[column.prop].readOnly) {
        return true
      }
      return (
        (row[column.prop].edit || row[column.prop].errorInfo) ||
          column.showPassword
      )
    }

    const handleChange = (col, row, $event) => {
      const params = {
        fieldName: col.prop,
        val: row[col.prop],
        row,
        value: $event.value || $event,
      }
      emit('change', params)
    }

    return {
      ...toRefs(state),
      hasError,
      inputBlur,
      isInputVisble,
      handleChange
    }
  },
})
</script>

<style lang="scss" scoped>
  .cell-weight__wrapper {
    /deep/{
      .el-input{
        display: table-cell;
      }
    }
    .ky-tip__container {
      position: unset;
    }
  }
</style>
