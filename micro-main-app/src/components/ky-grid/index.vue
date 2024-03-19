<template>
  <div class="ky-grid--container">
    <!-- 总行数：{{tableRowCount}}
    错误行数：{{validateResult.summary.errorRowCount}},错误个数：{{validateResult.summary.errorCount}}
    {{validateResult.errorList}} -->
    <vxe-grid ref="xGridRef" :columns="gridColumns" resizable show-overflow show-header-overflow highlight-hover-row :scroll-y="{mode: 'wheel',gt: 30}" :optimization="{animat:false}" height="700" :sort-config="{trigger: 'cell',showIcon:false,sortMethod: customSortMethod}" v-bind="$attrs" v-on="$listeners" :edit-config="{trigger: 'click', mode: 'cell'}" :tooltip-config="{contentMethod: formatCellTooltip}" :valid-config="{autoPos:false,showMessage:false}" @edit-actived="editActivedEvent">
      <!-- 在父组件内定义的插槽 -->
      <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
      <!-- 错误信息汇总列 -->
      <template #column_errorSummary="{ row }">
        <svg-icon icon-class="icon-warning" v-show="existsErrorInRow({row})" />
      </template>
      <!-- 操作列 -->
      <template #column_operation="{row , column }">
        <vxe-button type="text" status="primary" content="删除" @click="removeRow({row})" />
        <vxe-button v-if="column.params.modifyButtonVisible" type="text" status="primary" content="修改" @click="$emit('on-modify-row',{row})" />
      </template>
      <!-- 复选框列 -->
      <template #column_checkbox="{ row, column }">
        <vxe-checkbox v-model="row[column.property]" :content="column.params&&column.params.text" @change="cellValueChange({ row, column })" />
      </template>
      <!-- 普通列 -->
      <template #column_normal="{ row, column }">
        <span>{{ formatCellValue({ row, column }) }}</span>
        <div class="error-info" v-show="getCellErrorInfo({ row, column })">{{getCellErrorInfo({ row, column })}}</div>
        <tip-normal v-if="!getCellErrorInfo({ row, column }) && getCellWarningInfo({ row, column }) " :value="row[column.property]" :msg="getCellWarningInfo({ row, column })" @close="(e)=>e.warningInfo=''" />
      </template>
    </vxe-grid>
  </div>
</template>

<script>
import { ref, watch } from '@vue/composition-api'
import userGridOverrideMethods from './hooks/userGridOverrideMethods'
import useInitColumnEditRender from './hooks/useInitColumnEditRender'
import useValidateResult from './hooks/useValidateResult'
import TipNormal from '@/components/tip-normal'

export default {
  components: { TipNormal },
  props: {
    tableColumns: {
      type: Array,
    },
    dynamicOption: {
      type: Object,
    },
    validateRules: {
      type: Object,
    },
    validating: {
      type: Boolean,
    },
  },
  setup (props, { emit, root }) {
    const xGridRef = ref(null)
    const tableRowCount = ref(0)
    const { validateResult, resetValidateResult, cellValueChange } = useValidateResult(props.validateRules, root)
    const gridColumns = useInitColumnEditRender(props.tableColumns, cellValueChange)
    const gridOverrideMethods = userGridOverrideMethods(xGridRef, tableRowCount, validateResult, resetValidateResult)
    watch(
      () => validateResult.validating,
      flag => {
        emit('update:validating', flag)
      }
    )

    const getRowValidateResult = (row, type = 0) => {
      const typeName = type === 0 ? 'errorList' : 'warningList'
      return validateResult[typeName]?.find(f => f.row === row)
    }

    const existsErrorInRow = ({ row }) => {
      const item = getRowValidateResult(row)
      return item?.rowErrors?.length > 0
    }

    const getCellErrorInfo = ({ row, column }) => {
      const item = getRowValidateResult(row)
      if (item?.error) {
        return item.error[column.property]
      }
    }
    const getCellWarningInfo = ({ row, column }) => {
      const item = getRowValidateResult(row, 1)
      if (item?.warning) {
        return item.warning[column.property]
      }
    }
    const formatCellValue = ({ row, column }) => {
      const cellValue = row[column.property]
      if (column.editRender?.name === '$select') {
        const isDynamicOption = column.editRender.isDynamicOption
        const options = isDynamicOption
          ? props.dynamicOption[column.property]
          : column.editRender.options
        const item = options?.find(f => f.value === cellValue)
        if (item) {
          return item.label
        }
        // return ''
      }
      return cellValue
    }
    const formatCellTooltip = ({ row, column }) => {
      if (column.params?.isErrorTipColumn) {
        const item = getRowValidateResult(row)
        if (item && item.rowErrors?.length > 0) {
          return item.rowErrors.map((e, index) => `${index + 1}.${e}`).join('\n')
        }
      }
    }
    const customSortMethod = ({ data }) => {
      if (validateResult.errorList?.length < 1) {
        return
      }
      data.sort((a, b) => {
        const aErrorLength = getRowValidateResult(a)?.rowErrors?.length
        const bErrorLength = getRowValidateResult(b)?.rowErrors?.length
        if (aErrorLength < 1 && bErrorLength < 1) {
          return 0
        }
        return bErrorLength - aErrorLength
      })
    }
    const editActivedEvent = ({ row, column }) => {
      if (row.__OPTIONS && row.__OPTIONS[column.property]) {
        column.editRender.options = row.__OPTIONS[column.property]
      }
    }

    return {
      xGridRef,
      gridColumns,
      tableRowCount,
      cellValueChange,
      formatCellValue,
      editActivedEvent,
      validateResult,
      existsErrorInRow,
      getCellErrorInfo,
      getCellWarningInfo,
      formatCellTooltip,
      customSortMethod,
      ...gridOverrideMethods
    }
  },
}
</script>

<style lang="scss">
  .vxe-table--tooltip-wrapper {
    &.theme--dark {
      background-color: rgba(0, 0, 0, 0.5);
      &.placement--top .vxe-table--tooltip-arrow {
        &,
        &::before {
          border-top-color: rgba(0, 0, 0, 0.3);
        }
      }
    }
    div {
      line-height: 20px;
    }
  }
</style>
<style lang="scss" scoped>
  .ky-grid--container {
    /deep/ {
      th,
      td {
        vertical-align: middle;
      }
      @include scroll-bar;
      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      &::-webkit-scrollbar-thumb {
        background-clip: unset;
      }
      .vxe-table--border-line {
        border: unset;
      }
      .vxe-table--header-wrapper {
        background-color: #f7f8fe;
        color: #333333;
      }
      .vxe-table--header .vxe-header--row .vxe-header--column {
        line-height: 1;
        .vxe-resizable.is--line:before {
          width: 1px;
          height: 14px;
          background-color: #d5d2de;
        }
      }
      .vxe-table--body-wrapper {
        padding-bottom: 24px;
      }
      .vxe-cell {
        .error-info {
          z-index: 1;
          position: absolute;
          padding: 3px 8px;
          color: #2c1e58;
          font-size: 14px;
          line-height: 20px;
          background: #eae6ff; //rgba(0, 0, 0, 0.7);
          border-radius: 4px;
          top: 94%;
          &::after {
            content: '';
            border-color: transparent transparent #eae6ff;
            border-width: 0 6px 6px;
            border-radius: 3px;
            border-style: solid;
            position: absolute;
            top: -5px;
            left: 20px;
          }
        }
      }
    }
  }
</style>