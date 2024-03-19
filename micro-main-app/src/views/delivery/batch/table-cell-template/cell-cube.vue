<template>
  <div class="cell-cube__wrapper">
    <el-input v-if="isInputVisble(row,col)" v-model="cellValue" @change="handleChange(col, row, $event)" :disabled='col.readOnly || row[col.prop].readOnly' @blur='inputBlur(col.prop, row[col.prop])' />
    <table-cell-label v-else :row="row" :col="col"/>
    <tip-normal style="margin-top: 12px" :msg="getVolumetricWeightText(row)" :can-close="false"/>
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch } from '@vue/composition-api'
import TableCellLabel from '@comps/table/components/table-cell-label'
import TipNormal from '@/components/tip-normal'
import deliveryUtil from '@/utils/deliveryUtil'

export default defineComponent({
  name: 'cell-cube',
  props: {
    row: {
      type: Object,
    },
    col: {
      type: Object,
    },
  },
  components:{
    TableCellLabel,
    TipNormal
  },
  setup (props, { emit }) {
    const state = reactive({
      cellValue: props.row.cube.value,
    })
    watch(() => props.row['cube'], val => {
      state.cellValue = val.value
    }, {
      deep: true
    })

    const hasError = computed(() => {
      return props.row['cube']['errorInfo']
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

    const getVolumetricWeightText = row => {
      return deliveryUtil.getVolumetricWeightText(row.cube.value,row.volumetricWeightRatio.value)
    }
    
    return {
      ...toRefs(state),
      hasError,
      inputBlur,
      isInputVisble,
      handleChange,
      getVolumetricWeightText
    }
  },
})
</script>

<style lang="scss" scoped>
  .cell-cube__wrapper {
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
