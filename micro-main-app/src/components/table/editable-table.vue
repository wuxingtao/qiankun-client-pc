<template>
  <div>
    <vxe-table ref="xTable" class="editable-table" show-overflow show-header-overflow resizable highlight-hover-row :scroll-y="{mode: 'wheel',gt: 30}" :sort-config="{showIcon:false,sortMethod: customSortMethod}" v-loading.lock="isLoading" :row-class-name="tableRowClassName" :max-height="parseFloat(maxHeight)" :height="parseFloat(height)" :optimization="{animat:false}" :tooltip-config="{theme:'light'}" @cell-click="cellClick" v-bind="$attrs" v-on="$listeners" @scroll="handleScroll">
    <div slot="empty">
      <none-data>
        <div>请添加数据</div>
      </none-data>
    </div>
    <vxe-table-column type="seq" width="60" title="序号" v-if="indexColumn" :fixed="indexColumnFixed" />
    <vxe-table-column title="" width="50" fixed="left" v-if="errorTipColumn">
      <template slot-scope="{row}" v-if="row.errors&&row.errors.length>0">
        <el-popover trigger="hover" placement="top" popper-class="popover-errors-summary20210608">
          <p v-for="(item,index) in row.errors" :key="index">{{`${index+1}.${item}`}}</p>
          <div slot="reference">
            <svg-icon icon-class="icon-warning" />
          </div>
        </el-popover>
      </template>
    </vxe-table-column>
    <vxe-table-column v-for="(col,index) in tableColumns.filter(c=>!c.hide && c.text)" :key="`${col.prop}-${index}`" :field="col.prop" :title="col.text" :width="col.width" :show-overflow-tooltip="true" :title-help="col.titleHelp">
      <template slot-scope="{row}">
        <el-button v-if="col.type==='button'" @click.native.prevent="$emit(col.eventName,row)" type="text" size="small" :style="{color:col.color}">
          <template v-if="col.prop==='goods'">
            {{ row[col.prop].value || '添加拖寄物'}}
          </template>
          <template v-else>
            {{col.displayText || row[col.prop].value }}
          </template>
        </el-button>
        <el-checkbox v-else-if="col.type==='checkbox'" v-model.trim="row[col.prop].value" @change="selectChange(col.prop, row[col.prop], row,$event)">{{col.label}}
        </el-checkbox>
        <el-select style="width: 100%;" clearable v-else-if="col.type==='select'|| row[col.prop].options" size="small" v-model.trim="row[col.prop].value" @change="selectChange(col.prop, row[col.prop], row,$event)">
          <template v-if="col.prop!='serviceWay'">
            <el-option v-for="(item, index) in row[col.prop].options" :key="index" :label="item.label||item" :value="item.value||item" />
          </template>
          <el-option v-else v-for="item in row[col.prop].options" class="serviceWay-option" :key="item.serviceMode" :label="item.serviceMode" :value="item.serviceMode">
            <div>{{ item.serviceMode }}</div>
            <div>{{ item.timelinessExplain }}</div>
          </el-option>
        </el-select>
        <div v-else-if="isInputVisble(row,col)">
          <el-input size="small" style="width: 100%;" :type="col.type" :class="{'input-error': row[col.prop].errorInfo}" :maxlength="col.maxlength||50" v-model.trim="row[col.prop].value" @change="inputChange(col.prop, row[col.prop], row)" @blur="inputBlur(col.prop, row[col.prop])"></el-input>
        </div>
        <span v-else :style="{color:col.color}" @click="handleEncryptFields(row,col)">
         {{ row.isEncrypt&&row.isEncrypt.value? maskCellValue(row[col.prop].value,col.prop) : row[col.prop].value }}
        </span>
        <div class="error-info" v-show="row[col.prop].errorInfo">{{row[col.prop].errorInfo}}</div>
        <tip-normal v-if="!row[col.prop].errorInfo&&row[col.prop].warningInfo" :value="row[col.prop]" :msg="row[col.prop].warningInfo" @close="(e)=>e.warningInfo=''" />
        <!-- <div class="warning-info" v-if="!row[col.prop].errorInfo&&row[col.prop].warningInfo">{{row[col.prop].warningInfo}}</div> -->
      </template>
    </vxe-table-column>
    <vxe-table-column :width="visibleOfModify?120:60" :fixed="fixedColumnPosition" v-if="visibleOfOperation" field="__sortColumn" sortable>
      <template slot="header">操作</template>
      <template #default="{rowIndex,row}">
        <el-button @click.native.prevent="removeRow(rowIndex,row)" type="text" size="small">
          删除
        </el-button>
        <el-button class="btn-modify" v-if="visibleOfModify" @click.native.prevent="$emit('on-modify-row',{row, rowIndex})" type="text" size="small">
          修改
        </el-button>
      </template>
    </vxe-table-column>
  </vxe-table>
  <encrypt-field-view :visible.sync="encryptFiledVisible" :content="encryptContent"  menuText="批量填写" @on-confirm="recordDecryptResult" />
  </div>
</template>

<script>
import { debounce } from 'lodash'
import TipNormal from '@/components/tip-normal'
import editableTableEncryptMixin from './mixins/editable-table-encrypt'
export default {
  mixins:[editableTableEncryptMixin],
  components: { TipNormal },
  name: 'EditableTable',
  props: {
    maxHeight: {
      type: [Number, String],
    },
    height: {
      type: [Number, String],
    },
    //表头列
    tableColumns: {
      required: true,
      type: Array,
      validator: function (cols) {
        if (
          !cols.every(
            col =>
              Object.keys(col).indexOf('prop') > -1 ||
                Object.keys(col).indexOf('text') > -1
          )
        ) {
          console.log('tableColumns中的所有列必须都包含prop和text属性')
          return false
        }
        return true
      },
    },
    //数据校验规则
    verifyRules: {
      type: Object,
    },
    //错误总数及行数
    errorSummary: {
      type: Object,
    },
    //是否允许清除所有行
    clearable: {
      type: Boolean,
      default: true,
    },
    visibleOfOperation: {
      type: Boolean,
      default: true
    },
    visibleOfModify: {
      type: Boolean
    },
    loading: {
      type: Boolean
    },
    //序号列
    indexColumn: {
      type: Boolean,
      default: false
    },
    indexColumnFixed: {
      type: String,
      default: ''
    },
    //错误提示列
    errorTipColumn: {
      type: Boolean,
      default: false
    },
    fixedColumnPosition: {
      type: String,
      default: 'left'
    }
  },
  data () {
    return {
      isMounted: false,
      isLoading: false,
      columnsOptions: {}, //所有列的下拉选项
    }
  },
  mounted(){
    this.isMounted = true
  },
  methods: {
    handleScroll: debounce(function ({ scrollTop, scrollLeft }) {
      this.$refs.xTable.scrollTo(scrollLeft, scrollTop)
    }, 500),
    // isInputVisble (row, column) {
    //   return !column.readOnly && (row[column.prop].edit || row[column.prop].errorInfo)
    // },
    //将表格原始数据转化为相应的数据结构
    convertDataStructure (originTableRows) {
      const rows = originTableRows.map((item, rowIndex) => {
        let row = {}
        row.__rowIndex = item.no || rowIndex
        for (let key in item) {
          if(['_XID','__rowIndex','__sortColumn'].includes(key)){
            continue
          }
          row[key] = {
            value: item[key],
            edit: false, //修改状态
            errorInfo: '', //错误信息
            warningInfo: '',//警示信息
            options: this.columnsOptions[key], //下拉选项
          }
        }
        return row
      })
      const indexList =  rows.map(m=>m.__rowIndex)
      if(indexList.length!== new Set(indexList).size){
        console.warn('导入数据编号存在重复，已重新编号')
        rows.forEach((r,index)=>{
          r.__rowIndex+=index
        })
      }
      return rows
    },
    async initTableData (tableData) {
      this.isLoading = true
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
      this.isLoading = false
    },
    async addTableRows (originTableRows, index = -1) {
      this.isLoading = true
      const rows = this.convertDataStructure(originTableRows)
      await this.initVerifyTableData(rows)
      this.$refs.xTable.insertAt(rows,index >= 0?index:-1)
      this.isLoading = false
    },
    addValidatedTableRows(validatedRows){
      this.$refs.xTable.insertAt(validatedRows,-1)
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
      this.setErrorCount()
    },
    async inputChange (fieldName, val, row) {
      val.edit = false
      await this.verifyField(fieldName, val, row)
    },
    inputBlur (fieldName, val) {
      if (val.edit && !val.errorInfo) {
        val.edit = false
      }
    },
    async selectChange (fieldName, val, row, event) {
      val.value = event.label || event
      await this.verifyField(fieldName, val, row)
    },
    /**
                 * @param {String} 字段属性名
                 * @param {Object} 单元格绑定的对象
                 * @param {Object} 当前单元格所有行的数据对象
                 * @param {Boolean} 是否是第一初加载时调用
                 */
    async verifyField (fieldName, val, row, isInit) {
      if (!this.verifyRules) {
        return
      }
      this.isLoading = true
      let errorInfo = ''
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
            errorInfo = rule.msg || (fieldText + '不能为空')
          } else if (rule.min && val.value && val.value.length < rule.min) {
            errorInfo = rule.msg || ''
          } else if (rule.max && val.value && val.value.length > rule.max) {
            errorInfo = rule.msg || ''
          } else if (rule.len && val.value && val.value.length != rule.len) {
            errorInfo = rule.msg || ''
          }
          else if (val.value && rule.reg && !rule.reg.test(val.value)) {
            errorInfo = rule.msg || ''
          } else if (rule.validator) {
            errorInfo = await rule.validator(row, val, fieldName, isInit) || ''
          }
          if (errorInfo) {
            break
          }
        }
        val.errorInfo = errorInfo
        !isInit && this.setErrorCount()
      }
      this.isLoading = false
    },
    setErrorCount () {
      let errorCount = 0
      let errorRowCount = 0
      const totalRowCount = this.editableTableData.length
      this.editableTableData.forEach(item => {
        const visibleErrorColumns = this.tableColumns.filter(f=>!f.hide).map(m=>m.prop).filter(key => item[key] && item[key].errorInfo)
        const errorItems = visibleErrorColumns.map(key => item[key].errorInfo)
        this.$set(item, 'errors', errorItems)
        if (errorItems.length > 0) {
          errorRowCount += 1
          errorCount += errorItems.length
        }
      })
      this.$emit('update:errorSummary', { errorRowCount, errorCount, totalRowCount })
    },
    setErrorCountAndSort () {
      this.setErrorCount()
      this.$refs.xTable.sort('__sortColumn')
    },
    customSortMethod({data}){
      data.sort((a, b) => {
        if(!a.errors || !b.errors){
          return 0
        }
        return b.errors.length - a.errors.length
      })
    },
    tableRowClassName ({ row }) {
      if (row.errors && row.errors.length > 0) {
        return 'error-row'
      }
      return ''
    },
    clearTableRows () {
      this.$refs.xTable.remove()
      this.$emit('update:errorSummary', {})
    }
  },
  computed:{
    editableTableData(){
      if (!this.isMounted) {
        return []
      }
      const {fullData} = this.$refs.xTable.getTableData()
      return fullData
    }
  },
  watch: {
    isLoading (val) {
      this.$emit('update:loading', val)
    }
  },
}
</script>

<style lang="scss">
  .popover-errors-summary20210608 {
    color: #fff;
    &,&.is-dark{
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    font-size: 14px;
    }
    &[x-placement^="top"] .popper__arrow{
      &,&::after{
        border-top-color: rgba(0, 0, 0, 0.3);
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
</style>

<style lang="scss" scoped>
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

      tr {
        th,
        td {
          vertical-align: middle;
          background-image: linear-gradient(#dfe7f7, #dfe7f7) !important;
        }
        td {
          // padding: 3px 0;
          .el-input__inner {
            padding: 0 8px;
            border-radius: 17px;
            background: #f6f9ff;
          }
        }
         &.vxe-header--row,
        .vxe-cell--title {
          div,
          span {
            font-weight: bold;
          }
        }
      }
      .input-error {
        input {
          border-color: #f13e3e !important;
        }
      }
    }
    // .error-info,
    // .warning-info {
    //   color: #f13e3e;
    //   font-size: 12px;
    //   line-height: 16px;
    //   overflow: hidden;
    //   text-overflow: ellipsis;
    //   white-space: nowrap;
    // }
    // .warning-info {
    //   color: #ffaa00;
    // }

    .error-info,
    .warning-info {
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
        content: "";
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
  .el-select-dropdown {
    .serviceWay-option {
      height: unset;
      min-height: 54px;
      font-size: 12px;
      color: #999999;
      :first-child {
        height: 20px;
        font-size: 14px !important;
        color: #333333;
      }
    }
  }
</style>
