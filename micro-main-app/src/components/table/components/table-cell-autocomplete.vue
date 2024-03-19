<template>
  <el-autocomplete size='small' style='min-width: 100%;' :type='col.type' :class="{'input-error': row[col.prop].errorInfo}" popper-class="table-editable-autocomplete-popper" :maxlength='col.maxlength||50' v-model.trim='cellValue' :disabled='col.readOnly || row[col.prop].readOnly'   @select="handleChange"
  @change='handleChange' @blur='inputBlur(col.prop, row[col.prop])' :fetch-suggestions='(queryString,cb)=>col.fetchSuggestions(queryString,cb,row)'>
    <div class="option__wrapper" slot-scope='{ item }'>
      <div class='label'>{{ item.label }}</div>
      <div class='value'>{{ item.value }}</div>
    </div>
  </el-autocomplete>
</template>

<script>
import {debounce} from 'lodash'
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

    const inputBlur = (fieldName, val) =>{
      if (val.edit && !val.errorInfo) {
        val.edit = false
      }
    }
    
    const handleChange = debounce(function($event){
      const params = {
        fieldName: props.col.prop, val: props.row[props.col.prop], row:props.row, value: $event.value || $event
      }
      emit('change', params)
    },300)

    return {
      cellValue,
      inputBlur,
      handleChange,
    }
  }
}
</script>

<style lang="scss">
  .table-editable-autocomplete-popper {
    &.el-autocomplete-suggestion {
      width: unset !important;
      min-width: 100px;
      li {
        height: 54px;
        font-size: 12px;
        color: #333333;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .option__wrapper > div {
          line-height: 1;
          &.value {
            margin-top: 8px;
            color: #999999;
          }
        }
        // &.has-desc {
        //   height: 54px;
        // }
      }
    }
  }
</style>