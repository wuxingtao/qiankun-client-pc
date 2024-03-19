<template>
  <el-input v-if="!col.allowSpace" size='small' style='width: 100%;' :type='col.type' :class="{'input-error': row[col.prop].errorInfo}" :maxlength='col.maxlength||50' v-model.trim='cellValue' :disabled='isReadOnly' :show-password='col.showPassword' :autocomplete="col.showPassword?'new-password':''" @change='handleChange(col, row,$event)' @blur='inputBlur(col.prop, row[col.prop])'></el-input>
  <el-input v-else size='small' style='width: 100%;' :type='col.type' :class="{'input-error': row[col.prop].errorInfo}" :maxlength='col.maxlength||50' v-model='cellValue' :disabled='isReadOnly' :show-password='col.showPassword' :autocomplete="col.showPassword?'new-password':''" @change='handleChange(col, row,$event)' @blur='inputBlur(col.prop, row[col.prop])'></el-input>
</template>

<script>
import { computed, ref ,watch} from '@vue/composition-api'

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
    const isReadOnly = computed(()=>{
      return props.col.readOnly || props.row[props.col.prop].readOnly
    })
    watch(()=>props.row[props.col.prop].value,val=>{
      cellValue.value = val
    },{
      immediate:true
    })

    const inputBlur = (fieldName, val) =>{
      if (val.edit && !val.errorInfo) {
        val.edit = false
      }
    }

    const handleChange = (col, row, $event) => {
      row[col.prop].edit = false
      const params = {
        fieldName: col.prop, val: row[col.prop], row, value: $event
      }
      emit('change', params)
    }

    return {
      cellValue,
      handleChange,
      inputBlur,
      isReadOnly
    }
  }
}
</script>

<style>
</style>