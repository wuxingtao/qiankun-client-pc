<template>
  <el-select style='width: 100%;' size="small" :popper-class="`${col.prop}__table-editable-select-popper`" v-model.trim='cellValue' @change='handleChange(col, row,$event)' :disabled='col.readOnly  || row[col.prop].readOnly' transfer>
    <el-option v-for='(item, index) in options' :key='`option-${index}`' :label='item.label||item' :value='item.value||item' />
  </el-select>
</template>

<script>
import { nextTick, ref ,watch} from '@vue/composition-api'

export default {
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    }
  },

  setup (props, { emit }) {
    const cellValue = ref(props.row[props.col.prop].value)
    const options = ref( props.row[props.col.prop].options)

    watch(()=>props.row[props.col.prop],val=>{
      options.value = val.options
      nextTick(()=>{
        cellValue.value = val.value
      })
    },{
      deep:true
    })

    const handleChange = (col, row, $event) => {
      const params = {
        fieldName: col.prop, val: row[col.prop], row, value: $event.value ||  $event
      }
      emit('change', params)
    }
    return {
      cellValue,
      options,
      handleChange
    }
  }
}
</script>

<style>
</style>