<template>
  <div class="cell__mjWay__wrapper">
    <el-tooltip :disabled="!isBatchFill || !!cellValue" content="如您已包装货物，无需选择" placement="bottom" effect="light" popper-class="mjway__tooltip-popper">
      <el-select style='width: 100%;' size="small" popper-class="mjway__el-select-dropdown" v-model='cellValue' @change='handleChange(col, row,$event)' :disabled='col.readOnly  || row[col.prop].readOnly' transfer>
        <el-option v-for='(item, index) in options' :key='`option-${index}`' :label='item.label||item' :value='item.value||item'>
                  <mj-way-template :item="item"/>
                </el-option>
      </el-select>
    </el-tooltip>
    <el-tooltip :content="tipMsg" placement="bottom"  popper-class="vxe-table-cell-popover">
      <div class="cell__mjWay__tip" v-show='isBatchFill&&cellValue&&cellValue.trim()'>{{tipMsg}}</div>
    </el-tooltip>
  </div>
</template>

<script>
import { nextTick, ref, watch } from '@vue/composition-api'
import MjWayTemplate from '../../components/common/mj-way-template'

export default {
  components: {
    MjWayTemplate
  },
  props: {
    row: {
      type: Object
    },
    col: {
      type: Object
    },
    isBatchFill: {
      type: Boolean
    }
  },

  setup (props, { emit }) {
    const cellValue = ref(props.row[props.col.prop].value)
    const options = ref(props.row[props.col.prop].options)
    const tipMsg = ref('选择包装服务后，我司将重新称重并收取一定的包装费')

    watch(() => props.row[props.col.prop], val => {
      options.value = val.options
      nextTick(() => {
        cellValue.value = val.value
      })
    }, {
      deep: true
    })

    const handleChange = (col, row, $event) => {
      const params = {
        fieldName: col.prop, val: row[col.prop], row, value: $event.value || $event
      }
      emit('change', params)
    }

    return {
      cellValue,
      options,
      handleChange,
      tipMsg
    }
  }
}
</script>

<style lang="scss" scoped>
  .cell__mjWay__wrapper {
    // .tip-normal--container{
    //   white-space: pre-wrap;
    // }
    .cell__mjWay__tip {
      color: #ffa40d;
      text-overflow: ellipsis;
      overflow: hidden;
      line-height: 1;
    }
  }
</style>