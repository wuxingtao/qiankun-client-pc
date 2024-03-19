<template>
  <div class="declared-value--cell" @click="showDeclaredValueDialog(row)">
    <el-input v-if="visibleInput" size='mini' v-model='cellValue' :maxlength='7' :disabled='readonly' @blur='inputBlur(col.prop, row[col.prop])' ></el-input>
    <div v-else>{{ row.declaredValue.value || '' }}</div>
    <div class="default-tip" v-if="Number(row.declaredValue.value) <= 0 && row.insuranceFeeType.value === 20">
      如您未保价，将默认收取2元保价费，最高赔偿2000元
    </div>
    <div class="fee" v-if="getPremium(row)">保费:
      <span>{{getPremium(row)}}元</span>
    </div>

    <dialog-single-declared-value ref="dialogSingleDeclaredValueRef" @on-confirm="handleDialogConfirm" />
  </div>
</template>

<script>
import useBatchModel from '../hooks/useBatchModel'
import DialogSingleDeclaredValue from '../../components/dialog-single-declared-value'
import { computed, ref, watch } from '@vue/composition-api'
import useSingleFee from '../../hooks/useSingleFee'

export default {
  components: {
    DialogSingleDeclaredValue
  },
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    },
    readonly: {
      type: Boolean
    }
  },
  setup (props, { emit,root }) {
    const cellValue = ref(props.row[props.col.prop].value)
    const dialogSingleDeclaredValueRef = ref(null)
    const { changToModelList } = useBatchModel()
    const visibleInput = computed(() => root.$store.state.delivery.declaredValueDescripChecked)

    const { getServiceCharge, setTableRowDeclaredValue } = useSingleFee({})

    const getPremium = row => {
      if(row.payWay.value !== '10'){
        return
      }
      const value = (Number(row.premium?.value) || 0).toFixed(2)
      return Number(value) > 0 ? value : ''
    }

    const showDeclaredValueDialog = row => {
      if (props.readonly || root.$store.state.delivery.declaredValueDescripChecked) {
        return
      }
      const model = changToModelList([row])[0]
      const data = {
        declaredValue: row.declaredValue.value,
        premium: row.premium.value
      }
      dialogSingleDeclaredValueRef.value.showDialog(data, row, model)
    }

    const handleDialogConfirm = async result => {
      try{
        root.$store.commit('delivery/setLoadingOfBatch',{field:'declaredValue',loading:true})
        if (!result.isFromDialog) {
          const declaredValue = result
          const model = changToModelList([props.row])[0]
          const premium = await getServiceCharge('insuredFee', declaredValue, model)
          result = {
            declaredValue,
            premium,
            row:props.row,
          }
          await setTableRowDeclaredValue(props.row, declaredValue,premium)
        }
      }finally{
        root.$store.commit('delivery/setLoadingOfBatch',{field:'declaredValue',loading:false})
      }
      // emit('change', result)
      handleChange(result)
    }

    watch(() => props.row[props.col.prop].value, val => {
      cellValue.value = val
    }, {
      immediate: true
    })

    const handleChange = result => {
      const val = props.row[props.col.prop]
      const params = {
        fieldName:props.col.prop,
        val: val,
        row:props.row,
        value: val.value,
      }
      Object.assign(params, result)
      emit('change', params)
    }

    const inputBlur = (fieldName, val) => { 
      handleDialogConfirm(cellValue.value)
      if (val.edit && !val.errorInfo) {
        val.edit = false
      }
    }

    return {
      cellValue,
      visibleInput,
      handleDialogConfirm,
      dialogSingleDeclaredValueRef,
      showDeclaredValueDialog,
      getPremium,
      inputBlur
    }
  }
}
</script>

<style lang="scss" scoped>
  .declared-value--cell {
    min-height: 38px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: pointer;
    & > div {
      line-height: 1;
      flex: 1;
      line-height: 1;
      color: #03050d;
      &:first-of-type{
        padding-top: 3px;
      }
      &.fee,
      &.default-tip {
        margin-top: 5px;
        line-height: 12px;
        font-size: 12px;
        color: #999999;
        & > span {
          color: #fe743c;
        }
      }
      &.default-tip {
        color: #fe743c;
      }
    }
    /deep/.el-input{
      display: flex;  
      flex-direction: column;  
      justify-content: center;
    }
  }
</style>