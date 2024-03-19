<template>
  <div class="cell-customs-charge__wrapper" v-if="cellValue">
    <el-checkbox v-model="cellValue" true-label="10" false-label="20"> 
    </el-checkbox> 
    <div class="description ellipsis" v-html="description"> </div>
  </div>
  <div v-else>
    --
  </div>
</template>

<script>
import { defineComponent, reactive, toRefs, computed, watch } from '@vue/composition-api'

export default defineComponent({
  name: 'cell-customs-charge',
  props: {
    row: {
      type: Object,
    },
    col: {
      type: Object,
    },
  },
  setup (props, { emit }) {
    const state = reactive({
      cellValue: props.row.checkedCustomsCharge.value,
    })
    watch(() => props.row.checkedCustomsCharge, val => {
      state.cellValue = val.value
    }, {
      deep: true
    })

    watch(()=>state.cellValue, value =>{
      const params = {
        fieldName: props.col.prop,
        val: props.row[props.col.prop],
        row: props.row,
        value: value,
      }
      emit('change', params)
    })

    const description = computed(()=>{
      const data = props.row.checkedCustomsCharge.data
      if(!data){
        return ''
      }
      const replaceAmount = (text,amount) => {
        if(!text || !amount){
          return text
        }
        const html = `<span style="color:#FF706D;">${amount}</span>`
        return text.replace(new RegExp(amount, 'ig'),html)
      }
      if(state.cellValue === '10'){
        return replaceAmount(data.fenceTips,data.totalAmount) 
      }
      if(state.cellValue === '20'){
        return replaceAmount(data.excTips,data.excTotalAmount) 
      }
      return ''
    })
    
    return {
      ...toRefs(state),
      description
    }
  },
})
</script>

<style lang="scss" scoped>
  .cell-customs-charge__wrapper {
    display: flex;
    flex-direction: column;
    .el-checkbox{
      line-height: 1;
      margin-bottom: 6px;
      &::after{
        content: '报关入仓服务';
        color: $--color-text-primary;
        padding-left: 6px;
        position: relative;
        top: 1px;
      }
     /deep/ .el-checkbox__inner::after{
        top: 2px;
        left: 4px;
      }
    }
    .description{
      width: calc(100% - 15px);
      border: 1px solid transparent;
      font-size: $--font-size-small;
      color: #666666;
      line-height: 1;
      padding-left: 20px;
    }
  }
</style>
