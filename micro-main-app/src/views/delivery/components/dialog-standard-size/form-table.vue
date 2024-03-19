<template>
  <el-form :model='{ data }' ref='formRef' :disabled='readonly'>
  <el-table
    :data='data'
    :indexColumn='true'
    :key='Date.parse(new Date())'
    :max-height='maxHeight'
    border
    class='element-table'
    ref='tableRef'
  >
  <el-table-column type='index' :index='indexMethod' width='80' label='序号' />
  <el-table-column label='操作' width='80'>
    <template slot-scope='{ row, $index }'>
      <el-button type='text' size='mini' @click='delteItem($index)' :disabled='data.length === 1 || readonly'>删除
      </el-button>
    </template>
  </el-table-column>
  <el-table-column label='规格' width='140' v-if='skuLists && skuLists.length > 0'>
    <template slot-scope='{ row, $index }'>
      <el-form-item>
        <el-select
          class='border--normal'
          size='small'
          v-model='row && row.id'
          @change='skuChange({ row, $index })'
          @focus='skuFocus($event, { row })'
          clearable
          style='width:110px;'
        >
          <el-option
            v-for='(item, index) in skuLists'
            :key='index'
            :label='item.goodsName'
            :value='item.id'
          ></el-option>
        </el-select>
      </el-form-item>
    </template>
  </el-table-column>
  <el-table-column label='尺寸(cm)' prop='size' width='350px'>
    <template slot-scope='{ row, $index }'>
      <!-- <el-form-item :prop="'data.' + $index + '.size'" :rules='formRules.size'> -->
      <el-form-item :prop="'data.' + $index + '.size'">
        <div class='flex-wrap size-wrapper'>
          <el-input
            v-model='row.length'
            size='small'
            class='border--normal'
            v-kyerestrict.currency
            maxlength='3'
            placeholder='长'
            @change="handleSizeChange(row,$index,'length')"
          >
          </el-input>
          
          <el-input
            v-model='row.width'
            size='small'
            class='border--normal'
            v-kyerestrict.currency
            maxlength='3'
            placeholder='宽'
            @change="handleSizeChange(row,$index,'width')"
          >
          </el-input>
          
          <el-input
            v-model='row.height'
            size='small'
            class='border--normal'
            v-kyerestrict.currency
            maxlength='3'
            placeholder='高'
            @change="handleSizeChange(row,$index,'height')"
          >
          </el-input>
        </div>
        <ky-tip v-show='row.sizeMsg' :msg='row.sizeMsg' />
      </el-form-item>
    </template>
  </el-table-column>
  <el-table-column label='数量(件)' prop='count'>
    <template slot-scope='{ row, $index }'>
      <el-form-item :prop="'data.' + $index + '.count'" :rules='formRules.count'>
        <el-input
          v-model.number='row.count'
          size='small'
          class='border--normal'
          v-kyerestrict.positiveNotZero
          maxlength='4'
          placeholder='件数'
          @change="$emit('rowChange',{field:'count'})"
        >
        </el-input>
      </el-form-item>
    </template>
  </el-table-column>
  </el-table>
  </el-form>
</template>

<script>
import { onMounted, reactive, toRefs, ref, computed } from "@vue/composition-api"
import deliveryApi from "@api/delivery"
import { getCustomerCode } from "@utils/storage"
import commonUtil from "../../utils/commonUtil"
import useWeightSizeValidate from "@views/delivery/hooks/useWeightSizeValidate"

export default {
  name: "formTable",
  props: {
    data: {
      type: Array,
      default: () => []
    },
    sizeDelete: {
      type: Function,
      default: () => ""
    },
    readonly: {
      type: Boolean
    },
    planeListInfo: {
      type: Object
    },
    serviceWay: {
      type: [String, Number]
    },
    maxHeight: {
      type: [String, Number]
    }
  },
  setup(props, { emit, $forceUpdate }) {
    const formRef = ref(null)
    const state = reactive({
      skuLists: []
    })
    
    onMounted(() => {
      console.log(props.maxHeight, 1111)
    })
    
    const tableData = computed(() => {
      return props.data.map(item => item)
    })
    
    const { getOverSizeMessage } = useWeightSizeValidate()
    
    const indexMethod = index => {
      const key = index + 1
      return key > 9 ? key : `0${key}`
    }
    
    const checkSize = (rule, value, callback) => {
      const $index = rule.field.split(".")[1]
      const row = props.data[$index]
      const msg = commonUtil.checkSizeItem(row)
      if (msg) {
        return callback(new Error(msg))
      }
      callback()
    }
    
    const checkCount = async (rule, value, callback) => {
      const arr = rule.field.split(".")
      const currentValue = props[arr[0]][arr[1]][arr[2]]
      if (currentValue == "0" && Number(currentValue) <= 0) {
        return callback(new Error("值必须大于0"))
      }
      const field = rule.field.replace("count", "size")
      formRef.value.validateField(field)
      callback()
    }
    
    const formRules = reactive({
      size: [{ validator: checkSize, trigger: "blur" }],
      count: [{ validator: checkCount, trigger: "blur" }],
      weight: [{ validator: checkCount, trigger: "blur" }]
    })
    
    onMounted(() => {
      handleSku()
    })
    
    async function handleSku() {
      let res = await deliveryApi.getSkuLists({ customerCode: getCustomerCode() })
      if (res.code === 0) {
        state.skuLists = res.data.map(item => {
          return {
            ...item,
            length: item.goodsLength,
            width: item.goodsWidth,
            height: item.goodsHeight,
            name: item.goodsName
          }
        })
      }
    }
    
    /**
     * 删除行
     * @param index
     */
    function delteItem(index) {
      emit("sizeDelete", index)
    }
    
    /**
     * 修改指定行数据
     * @param row
     * @param index
     */
    function skuChange({ row, $index }) {
      const item = state.skuLists.filter(item => {
        return item.id === row.id
      })
      if (item.length > 0) {
        const { width, height, length, name } = item[0]
        const newRow = Object.assign(row, { width, height, length, name })
        emit("handleSkuChange", { row: newRow, $index })
        handleSizeChange(row, $index, "goodsName")
      }
    }
    
    /**
     *
     */
    function skuFocus(event, { row }) {
      if (event.target) {
        event.target.readOnly = false
        if (!event.target.hasInputListener) {
          event.target.hasInputListener = true
          event.target.addEventListener("input", function(e) {
            const index = state.skuLists.findIndex(x => x.id == row.id)
            if (state.skuLists[index]) {
              state.skuLists[index]["goodsName"] = e.target.value
              state.skuLists[index]["name"] = e.target.value
            }
          })
        }
      }
    }
    
    function skuBlur(event, { row }) {
      if (!event.target.value) {
        return
      }
      const index = state.skuLists.findIndex(x => x.id == row.id)
      if (state.skuLists[index]) {
        state.skuLists[index]["goodsName"] = event.target.value
        state.skuLists[index]["name"] = event.target.value
      }
    }
    
    function handleSizeChange(row, index, key) {
      emit("rowChange", { field: key })
      row["sizeMsg"] = getOverSizeMessage(props.planeListInfo, row, props.serviceWay)
    }
    
    return {
      ...toRefs(state),
      tableData,
      formRef,
      formRules,
      indexMethod,
      checkSize,
      checkCount,
      delteItem,
      skuChange,
      skuFocus,
      skuBlur,
      handleSizeChange
    }
  }
}
</script>

<style lang='scss' scoped>

.border--normal {
  ::v-deep input {
    border: 1px solid #d9d9d9;
    border-radius: 2px !important;
    padding: 0 8px !important;
    height: 28px;
    line-height: 28px;
    
    &:focus {
      border-color: #834eff !important;
    }
  }
}

.element-table {
  .border--normal {
    width: 90px;
    margin-right: 8px;
    display: inline-block;
    
    &:last-child {
      margin-right: 0;
    }
  }
  
  .size-wrapper {
    line-height: 38px;
  }
  
  .el-form-item {
    margin: 0;
    
    /deep/ {
      .ky-tip__container {
        position: relative;
        padding: 0 0 2px 2px;
      }
    }
  }
  
  ::v-deep {
    .el-table__header-wrapper thead tr > th {
      padding: 6px 0px !important;
      height: 36px;
      line-height: 36px;
    }
    
    .el-table__row {
      td:first-child {
        padding-left: 6px;
      }
    }
    
    // .el-table__body-wrapper tr td {
    //   height: 42px;
    // }
  }
}

::v-deep .el-table .cell {
  overflow: initial;
}

::v-deep .el-table__body-wrapper {
  padding-bottom: 24px;
}

::v-deep .el-form-item__error {
  top: 32px;
  z-index: 2;
  padding-bottom: 4px;
  padding-top: 0;
  position: initial;
}
</style>
