<template>
    <vxe-table ref='xTable' class='editable-table' :show-overflow="false" show-header-overflow resizable highlight-hover-row 
    :scroll-y="{mode: 'wheel',gt: 10}" :scroll-x='{gt: 12}' :sort-config='{showIcon:false,sortMethod: customSortMethod}' 
    :row-class-name='tableRowClassName' :height='parseFloat(height)' :optimization='{animat:false}' 
    :tooltip-config="{theme:'light'}" @cell-click='cellClick' v-bind='$attrs' v-on='$listeners' @scroll='handleScroll'>
      <slot name='empty'>
        <div slot='empty'>
          <none-data>
            <div>请添加数据</div>
          </none-data>
        </div>
      </slot>
      <vxe-column type='seq' width='60' title='序号' v-if='indexColumn' />
      <vxe-column :width='fixedColumnWidth || (visibleOfModify?110:60)' fixed='left' v-if='visibleOfOperation' field='__sortColumn' sortable>
        <template slot='header'>操作</template>
        <template #default='{rowIndex,row}'>
          <el-button @click.native.prevent='removeRow(rowIndex,row)' type='text' size='small'>
            删除
          </el-button>
          <el-button class='btn-modify' v-if='visibleOfModify' @click.native.prevent="$emit('on-modify-row',{row, rowIndex})" type='text' size='small'>
            修改
          </el-button>
          <slot name="columns-fixed" v-bind='{row}'></slot>
          <table-cell-error-tip v-if='errorTipColumn && row.errors &&row.errors.length>0' :errors="row.errors"/>
        </template>
      </vxe-column>
      <vxe-column v-for='(col,index) in tableColumns.filter(c=>!c.hide && c.text)' :key='`${col.prop}-${index}`' :field='col.prop' :title='col.text' :width='col.width' :show-overflow='!col.hideOverflow' :title-help='col.titleHelp' :class-name="`cell__${col.prop}`">
        <template v-if='col.headerSlot' #header>
          <slot :name='[col.headerSlot]' v-bind='{col}'>
          </slot>
        </template>
        <template v-if='col.defaultSlot' v-slot='{row}'>
          <div :class='`cell__${col.prop}`'>
            <slot name='columns--common' v-bind='{row,col}'></slot>
            <slot :name='[col.defaultSlot]' v-bind='{row,col}'></slot>
            <div class='error-info' v-show='showErrorTip({row, col})'>
              {{ row[col.prop].errorInfo }}
            </div>
            <tip-normal v-if='!col.hideDefaultWarning && !row[col.prop].errorInfo&&row[col.prop].warningInfo' :show-html="col.htmlTip" :value='row[col.prop]' :msg='row[col.prop].warningInfo' @close="(e)=>e.warningInfo=''" />
          </div>
        </template>
        <template v-else slot-scope='{row}'>
          <table-cell-checkbox v-if="col.type==='checkbox'" :row="row" :col="col" @change="handleChange"/>
          <table-cell-select v-else-if="col.type==='select'" :row="row" :col="col" @change="handleChange" />
          <table-cell-autocomplete v-else-if="col.type==='autocomplete'" :row="row" :col="col" @change="handleChange" />
          <table-cell-input v-else-if='isInputVisble(row,col)' :row="row" :col="col" @change="handleChange"/>
          <table-cell-label v-else :row="row" :col="col"/>
          <div class='error-info' v-show='showErrorTip({row, col})'>{{ row[col.prop].errorInfo }}</div>
          <tip-normal v-if='!col.hideDefaultWarning && !row[col.prop].errorInfo&&row[col.prop].warningInfo' :show-html="col.htmlTip" :value='row[col.prop]' :msg='row[col.prop].warningInfo' @close="(e)=>e.warningInfo=''" />
        </template>
      </vxe-column>
    </vxe-table>
</template>

<script>
import { debounce, throttle, orderBy } from 'lodash'
import TipNormal from '@/components/tip-normal'
import TableCellSelect from './components/table-cell-select'
import TableCellCheckbox from './components/table-cell-checkbox'
import TableCellInput from './components/table-cell-input'
import TableCellErrorTip from './components/table-cell-error-tip'
import TableCellAutocomplete from './components/table-cell-autocomplete'
import TableCellLabel from './components/table-cell-label'

export default {
  components: {
    TipNormal,
    TableCellSelect,
    TableCellCheckbox,
    TableCellInput,
    TableCellErrorTip,
    TableCellAutocomplete,
    TableCellLabel
  },
  props: {
    fixedColumnWidth: {
      type: Number,
    },
    height: {
      type: [Number, String]
    },
    //表头列
    tableColumns: {
      required: true,
      type: Array,
      validator: function (cols) {
        if (
          !cols.every(
            col => Object.keys(col).indexOf('prop') > -1 || Object.keys(col).indexOf('text') > -1
          )
        ) {
          console.log('tableColumns中的所有列必须都包含prop和text属性')
          return false
        }
        return true
      }
    },
    //数据校验规则
    verifyRules: {
      type: Object
    },
    //错误总数及行数
    errorSummary: {
      type: Object
    },
    //是否允许清除所有行
    clearable: {
      type: Boolean,
      default: true
    },
    visibleOfOperation: {
      type: Boolean,
      default: true
    },
    visibleOfModify: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean
    },
    //序号列
    indexColumn: {
      type: Boolean,
      default: false
    },
    //错误提示列
    errorTipColumn: {
      type: Boolean,
      default: false
    },
    //按错误个数排序
    sortByErrorCount: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      isMounted: false,
      isLoading: false,
      columnsOptions: {} //所有列的下拉选项
    }
  },
  mounted () {
    this.isMounted = true
  },
  methods: {
    applyXTableMethod(methodName,args){
      this.$refs.xTable[methodName](args)
    },
    handleScroll(args){
      this.debounceScroll(args)
      this.throttleScroll()
    },
    throttleScroll:throttle(function(){
      this.viewableTableData?.forEach(row => {
        this.tableColumns?.filter(col => row[col.prop]?.edit).forEach(col => {
          row[col.prop].edit = false
        })
      })
    },3500),
    debounceScroll: debounce(function ({ isY, scrollLeft, scrollTop }) {
      this.$refs.xTable.scrollTo(scrollLeft, scrollTop)
      if (isY) {
        this.$emit('scroll-change')
      }
    }, 1000),
    isInputVisble (row, column) {
      if (column.readOnly || row[column.prop].readOnly) {
        return true
      }
      return (
        // || row[column.prop].errorInfo
        (row[column.prop].edit ) ||
          column.showPassword
      )
    },
    //将表格原始数据转化为相应的数据结构
    convertDataStructure (originTableRows) {
      const rows = originTableRows.map((item, rowIndex) => {
        let row = {}
        row.__rowIndex = item.no ?? rowIndex
        for (let key in item) {
          if (['_XID', '__rowIndex', '__sortColumn'].includes(key)) {
            continue
          }
          row[key] = {
            value: item[key],
            edit: false, //修改状态
            errorInfo: '', //错误信息
            warningInfo: '', //警示信息
            options: this.columnsOptions[key], //下拉选项
            data: {}//其余业务需要用到的字段
          }
        }
        return row
      })
      const indexList = rows.map(m => m.__rowIndex)
      if (indexList.length !== new Set(indexList).size) {
        console.warn('导入数据编号存在重复，已重新编号')
        rows.forEach((r, index) => {
          r.__rowIndex += index
        })
      }
      return rows
    },
    async initTableData (tableData, isChangeLoading = true) {
      isChangeLoading && (this.isLoading = true)
      //获取表格所有列的下拉选项
      this.columnsOptions = this.tableColumns.reduce((obj, cur) => {
        if (cur.options) {
          obj[cur.prop] = cur.options
        }
        return obj
      }, {})
      if (tableData && tableData.length > 0) {
        const rows = this.convertDataStructure(tableData)
        await this.initVerifyTableData(rows)
        this.$refs.xTable.loadData(rows)
      }
      isChangeLoading && (this.isLoading = false)
    },
    async addTableRows (originTableRows, index = -1) {
      const rows = this.convertDataStructure(originTableRows)
      await this.initVerifyTableData(rows)
      this.$refs.xTable.insertAt(rows, index >= 0 ? index : -1)
    },
    addValidatedTableRows (validatedRows) {
      this.$refs.xTable.insertAt(validatedRows, -1)
    },
    async initVerifyTableData (editableTableData) {
      const promiseList = []
      for (let row of editableTableData) {
        for (let col in row) {
          promiseList.push(this.verifyField(col, row[col], row, true))
        }
      }
      await Promise.all(promiseList)
      this.setErrorCount()
    },
    cellClick ({ row, column, cell }) {
      let cellValue = row[column.property]
      if (cellValue) {
        cellValue.edit = true
        this.$nextTick(() => {
          const input = cell.querySelector('input')
          input && input.focus()
        })
      }
    },
    removeRow (index, row) {
      if (!this.clearable && this.editableTableData.length === 1) {
        this.$message.warning('表格只剩一行数据，不允许删除')
        return
      }
      this.$refs.xTable.remove(row)
      this.$emit('on-delete-row', { row })
      this.setErrorCount()
    },
    async handleChange ({ fieldName, val, row, value }) {
      val.value = value
      await this.verifyField(fieldName, val, row)
    },
    /**
             * @param {String} 字段属性名
             * @param {Object} 单元格绑定的对象
             * @param {Object} 当前单元格所有行的数据对象
             * @param {Boolean} 是否是第一初加载时调用
             */
    async verifyField (fieldName, val, row, isInit) {
      if (this.verifyRules) {
        // this.isLoading = true
        let errorMsg = ''
        let fieldRuleArray = this.verifyRules[fieldName]
        if (fieldRuleArray && fieldRuleArray.length > 0) {
          for (let i = 0; i < fieldRuleArray.length; i++) {
            const rule = fieldRuleArray[i]
            const col = this.tableColumns.find(f => f.prop == fieldName)
            if (!col || col.hide) {
              continue
            }
            const fieldText = col.text
            if (rule.required && !val.value) {
              errorMsg = rule.msg || fieldText + '不能为空'
            } else if (rule.min && val.value && val.value.length < rule.min) {
              errorMsg = rule.msg || ''
            } else if (rule.max && val.value && val.value.length > rule.max) {
              errorMsg = rule.msg || ''
            } else if (rule.len && val.value && val.value.length != rule.len) {
              errorMsg = rule.msg || ''
            } else if (val.value && rule.reg && !rule.reg.test(val.value)) {
              errorMsg = rule.msg || ''
            } else if (rule.validator) {
              errorMsg = (await rule.validator(row, val, fieldName, isInit)) || ''
            }
            if (errorMsg) {
              break
            }
          }
          val.errorInfo = errorMsg
          !isInit && this.setErrorCount()
        }
        // this.isLoading = false
      }
      this.$emit('value-change', { fieldName, val, row, isInit, isValid: !val.errorInfo })
    },
    setErrorCount () {
      let errorCount = 0
      let errorRowCount = 0
      const totalRowCount = this.editableTableData.length
      this.editableTableData.forEach(item => {
        const visibleErrorColumns = this.tableColumns
          .filter(f => !f.hide)
          .map(m => m.prop)
          .filter(key => item[key] && item[key].errorInfo)
        const errorItems = item._addressRestrictErrorInfo?.msg ? [] : visibleErrorColumns.map(key => item[key].errorInfo)
        this.$set(item, 'errors', errorItems)
        if (errorItems.length > 0 && !item._addressRestrictErrorInfo?.msg) {
          errorRowCount += 1
          errorCount += errorItems.length
        }
        //  if(item._addressRestrictErrorInfo?.msg){
        //   errorRowCount += 1
        // }
        // else if(item._addressRestrictErrorInfo?.msg){
        //   errorRowCount += 1
        // }
        // if(item._addressRestrictErrorInfo?.msg){
        //   errorCount += 1
        // }
      })
      this.$emit('update:errorSummary', { errorRowCount, errorCount, totalRowCount })
    },
    setErrorCountAndSort () {
      this.setErrorCount()
        this.$refs.xTable?.sort('__sortColumn')
    },
    customSortMethod ({ data }) {
      if (!this.sortByErrorCount) {
        return
      }
      if(!data.some(d=>d.errors?.length > 0 || d._addressRestrictErrorInfo?.msg || d._addressRestrictWarningInfo?.msg)){
        return
      }
      const tempData = orderBy(data, 
        [d => d._addressRestrictErrorInfo?.msg || '',
          d => d.errors?.length || 0,
          d => d._addressRestrictErrorInfo?.msg || ''
        ],
        ['desc','desc','desc'])
      data.length = 0
      data.push(...tempData)
    },
    showErrorTip({row, col}){
      return !row._addressRestrictErrorInfo?.msg && row[col.prop].errorInfo
    },
    tableRowClassName ({ row }) {
      if(row._addressRestrictErrorInfo?.msg){
        return 'disabled-row-main'
      }
      if (row.errors && row.errors.length > 0) {
        return 'error-row'
      }
      return ''
    },
    clearTableRows () {
      if (!this.$refs.xTable) {
        return
      }
      this.$refs.xTable.remove()
      this.$emit('update:errorSummary', {})
    },
  },
  computed: {
    totalRowCount () {
      return this.editableTableData?.length || 0
    },
    editableTableData () {
      if (!this.isMounted) {
        return []
      }
      const { fullData } = this.$refs.xTable.getTableData()
      return fullData
    },
    viewableTableData () {
      if (!this.isMounted || !this.$refs.xTable) {
        return []
      }
      const { tableData } = this.$refs.xTable.getTableData()
      return tableData
    }
  },
  watch: {
    isLoading (val) {
      this.$emit('update:loading', val)
    }
  }
}
</script>

<style lang='scss'>
  .vxe-table-cell__tooltip{
    pointer-events: none;
  }
  .vxe-table-cell-popover {
    color: #fff;
    pointer-events: none;

    &,
    &.is-dark {
      background-color: rgba(0, 0, 0, 0.5);
      border-radius: 4px;
      font-size: 12px;
    }
  
    &[x-placement^='bottom'] .popper__arrow {
      border-bottom-width: 0;
      &,
      &::after {
        border-bottom-color: rgba(0, 0, 0, 0.5);
      }
    }
  }

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

  .vxe-select--empty-placeholder {
    font-size: 12px;
  }
  .vxe-select-option {
    font-size: 12px;
  }
  // [class$='table-editable-select-popper']{
  //   margin-top: 6px !important;
  // }

  
</style>

<style lang='scss' scoped>
  .editable-table {
    /deep/ {
      @include scroll-bar;

      &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background-clip: unset;
      }
      .vxe-body--column{
        height: 54px;
      }

      .vxe-cell{
        padding: 0 6px;
        max-height: 54px !important;
        .el-input,.el-input__inner,.el-input__icon{
          height: 28px;
          line-height: 28px;
        }
      }
      .vxe-table--border-line {
        border: unset;
      }

      .vxe-table--header-wrapper {
        background-color: #f7f8fe;
        color: #333333;
      }
      // .vxe-table--header .vxe-header--row .vxe-header--column {
      //   .vxe-resizable.is--line:before {
      //     width: 1px;
      //     height: 14px;
      //     background-color: #d5d2de;
      //   }
      // }

      // .vxe-header--column.col--ellipsis > .vxe-cell .vxe-cell--title {
      //   line-height: 48px;
      // }

      .vxe-table--body-wrapper {
        padding-bottom: 24px;
        // width: 100%;
      }
      .vxe-table--main-wrapper{
        tr.disabled-row-main{
          background: #f7f7f7;
          pointer-events: none;
          .el-input,.el-input__suffix,.el-input__suffix-inner{
            pointer-events: none;
          }
          .vxe-cell{
            &,
            .el-checkbox__label, 
            input,
            .el-input .el-input__suffix .el-input__icon,
            .declared-value--cell>div:first-of-type,
            .freight--wrapper{
            color: $--color-text-secondary !important;
          }
          }
          button,input{
            background: #f7f7f7; 
          }
          .table-cell-label__container{
            border: 1px solid #dcdfe6;
          }
        }
      }
      .vxe-table--fixed-left-wrapper {
        // overflow: visible;
        // .vxe-table--body-wrapper {
        //   overflow: visible;
        // }
        &.scrolling--middle {
          box-shadow: none;
          border-right: 1px solid #dfe7f7;
        }
        // height: calc(100% -10px) !important;
      }
      tr { 
        &.vxe-body--row.row--hover {
          background-color: #f8faff;
        }
        th,
        td {
          vertical-align: middle;
          background-image: linear-gradient(#e8eaec, #e8eaec) !important;
        }

        td {
          // span,
          // div {
          //   font-size: 12px;
          // }
          .el-input__inner {
            padding: 0 8px;
            border-radius: 4px;
            background: #ffffff;
          }
          .vxe-input--inner {
            height: 32px;
            line-height: 32px;
            padding: 0 8px;
          }
        }
        &.vxe-header--row,
        .vxe-cell--title {
          // font-size: 12px;
          // font-weight: bold;
          // line-height: 34px !important;
          // height: 34px;
          div,
          span {
            font-weight: bold;
          }
        }
      }

      .el-input {
        &.input-error input {
          border-color: #f13e3e !important;
        }

        &.is-disabled input {
          background: #f6f6f6;
          border: none;
          color: #b9b9b9 !important;
        }
      }

      .el-checkbox {
        .el-checkbox__inner {
          z-index: 0;
        }
        &.is-disabled {
          .el-checkbox__label {
            color: #b9b9b9 !important;
          }
        }
      }
      tr td.cell__jjRemark{
        .error-info {
          white-space: pre-wrap;
        }
      }
      .error-info {
        z-index: 1;
        position: absolute;
        padding: 3px 8px;
        color: #ff7374;
        line-height: 20px;
        background: #ffe6e3;
        border: 1px solid #ffabaa;
        border-radius: 4px;
        top: 94%;
        &::after {
          content: '';
          background: url('~@assets/image/delivery/arrow-red.svg');
          width: 12px;
          height: 8px;
          position: absolute;
          top: -7px;
          left: 20px;
        }
      }
    }
  }
</style>
