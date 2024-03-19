<template>
  <el-checkbox v-model='cellValue' :disabled='col.readOnly  || row[col.prop].readOnly' @change='handleChange(col, row,$event)'>{{ col.label }}
  </el-checkbox>
</template>

<script>
import { ref ,watch} from '@vue/composition-api'

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
    
    watch(()=>props.row[props.col.prop].value,val=>{
      cellValue.value = val
    },{
      immediate:true
    })

    const handleChange = (col, row, $event) => {
      const params = {
        fieldName: col.prop, val: row[col.prop], row, value: $event
      }
      emit('change', params)
    }
    return {
      cellValue,
      handleChange
    }
  }
}
</script>

<style>
</style>