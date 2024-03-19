<template>
  <div class='ky-table-container'>
  <el-table
      v-bind='$attrs'
      v-on='$listeners'
      class='element-table'
      border
      ref='table'
      tooltip-effect="light"
      :data='data'
      @selection-change='handleSelectionChange'
      @row-click='handleRowClick'
      @row-dblclick="handleDbClick"
      @header-dragend='handleHeaderDragend'
  >
    <template v-slot:empty>
      <slot name='empty'>
        <none-data :msg="noText"/>
      </slot>
    </template>

    <!-- 复选框列 -->
    <template v-if='multiSelect !== null'>
      <el-table-column
        v-if='multiSelect'
        type='selection'
        width='32'
        align='center'
        class-name='col-selection'
      />
      <el-table-column v-else width='32' fixed :resizable='false' class-name='col-selection'>
        <template v-slot='{ row }'>
          <el-radio v-model='selectedRows[0]' :label='row'><i /></el-radio>
        </template>
      </el-table-column>
    </template>
    <!-- 序号列 -->
    <el-table-column v-if='indexColumn' type='index' width='50' label='序号' />
    <!-- 普通列 -->
    <slot></slot>
    <el-table-column
      v-for='(col, index) in columns'
      :key='col.prop + index'
      :show-overflow-tooltip='true'
      :prop='col.prop'
      :label='col.text'
      :min-width="col.minWidth || col.width + 'px'"
      :sortable="col.isSort ? 'custom' : false"
      :sort-orders="col.sortOrders || ['ascending', 'descending']"
    >
      <template v-if='col.defaultSlot' v-slot='{ row }'>
        <slot :name='[col.defaultSlot]' v-bind='{ row, col }'></slot>
      </template>
      <template v-else v-slot='{ row }'>
        {{ row[col.prop] }}
      </template>
    </el-table-column>
    <slot name='end' />
  </el-table>
  <!-- 分页组件 -->
  <div class='pagination-style' v-if='data && data.length > 0'>
    <template name='pagination-total' v-if='paginationSlot'>
      <div class='pagination-style__select-total'>已选：{{ selectAllVal.length || selectedRows.length || 0 }}条</div>
      <div class='pagination-style__total-num'>总共：{{ pagination.totalCount || 0 }}条</div>
      <pagination
        class='pagination pagination-display'
        :pagination='pagination'
        @size-change='handleSizeChange'
        @current-change='handlCurrentChange'
      />
    </template>
    <template v-else-if="$route.name === 'waybill-v3' && pagination">
      <div class='pagination-style__select-total'>已选：{{ selectAllVal.length || 0 }}条</div>
      <div class='pagination-style__total-num'>总共：{{ data.length || 0 }}个运单</div>
      <pagination
        class='pagination-display'
        :pagination='pagination'
        @size-change='handleSizeChange'
        @current-change='handlCurrentChange'
      />
    </template>
    <template v-else-if="$route.name === 'waybill-v3-migration' && pagination">
      <div class='pagination-style__select-total'>已选：{{ selectAllVal.length || 0 }}条</div>
      <div class='pagination-style__total-num'>总共：{{ pagination.totalCount || 0 }}个运单</div>
      <pagination
        class='pagination-display'
        :pagination='pagination'
        @size-change='handleSizeChange'
        @current-change='handlCurrentChange'
      />
    </template>
     <template v-else-if="$route.name === 'payment-authorization' && pagination">
      <div class='pagination-style__select-total'>总共：{{ pagination.totalCount  || 0 }}条</div>
      <pagination
        class='pagination-display'
        :pagination='pagination'
        @size-change='handleSizeChange'
        @current-change='handlCurrentChange'
      />
    </template>
    <template v-else>
      <pagination
        class='pagination'
        :pagination='pagination'
        @size-change='handleSizeChange'
        @current-change='handlCurrentChange'
      />
    </template>
  </div>
  </div>
</template>

<script>
import NoneData from '@/components/none-data'
import Pagination from '@/components/ky-table/pagination'

export default {
  name: 'ky-table',
  components: { NoneData, Pagination },
  props: {
    data: {
      type: Array //表格数据
    },
    multiSelect: {
      //复选框列为多选,还是单选,不传值时则不显示复选框列
      type: Boolean,
      default: null
    },
    indexColumn: {
      //是否显示索引列
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      validator: function(p) {
        const keys = ['totalCount', 'pageSize', 'pageIndex']
        const propKeys = Object.keys(p)
        if (!keys.every(f => propKeys.includes(f))) {
          const msg = '分页对象pagination不为空时，必须包含\'totalCount\',\'pageSize\',\'pageIndex\'属性'
          console.warn(msg)
          return false
        }
        return true
      }
      // default: () => {
      //   return {
      //     totalCount: 0,
      //     pageSize: 10,
      //     pageIndex: 1,
      //   }
      // },
    },
    //表格列
    tableColumns: {
      required: false,
      type: Array,
      validator: function(cols) {
        const flag = cols.some(col => {
          const keys = Object.keys(col)
          return !keys.includes('prop') || !keys.includes('text')
        })
        if (flag) {
          console.log('tableColumns中的所有列必须都包含prop和text属性')
          return false
        }
        return true
      }
    },
    // 是否存在分页slot
    paginationSlot: {
      type: Boolean,
      default: () => false
    },
    noText: {
      type: String,
      default: () => ''
    },
  },
  inheritAttrs: false,
  data() {
    return {
      selectedRows: [], //勾选的行
      selectAllVal: [] // 勾选中的值
    }
  },
  // created() {
  //   const methods=['doLayout']
  //   Object.keys(this.$refs.table).filter(k=>k===methods.includes(k)).forEach(t=>{
  //     this[t]=this.$refs.table[t]
  //   })
  // },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
      this.selectAllVal = val
    },
    handleRowClick (e) {
      if (this.multiSelect) {
        this.$refs.table.toggleRowSelection(e)
      } else {
        this.selectedRows = [e]
      }
    },
    handleDbClick (row) {
      this.$emit('dblClick', row)
    },
    handleHeaderDragend () {
      //解决拖动表格列宽导致固定列错位问题
      this.$nextTick(() => {
        this.doLayout()
      })
    },
    handleSizeChange (val) {
      this.pagination.pageSize = val
      this.$emit('size-change', val)
      this.$emit('pagination-change', this.pagination)
    },
    handlCurrentChange(val) {
      this.pagination.pageIndex = val
      this.$emit('current-change', val)
      this.$emit('pagination-change', this.pagination)
    },
    doLayout() {
      this.$refs.table.doLayout()
    },
    toggleRowSelection(row, selected) {
      this.$refs.table.toggleRowSelection(row, selected)
    },
    clearSort() {
      this.$refs.table.clearSort()
    }
  },
  computed: {
    columns() {
      let result = []
      if (!this.tableColumns || this.tableColumns.length < 1) {
        return []
      }
      //当表格列中存在有visible的列时，则只展示visible为true的列，否则默认展示全部列
      if (this.tableColumns.find(c => c.visible)) {
        result = this.tableColumns.filter(c => c.text && c.visible)
        return result
      }
      result = this.tableColumns.filter(c => c.text)
      return result
    }
  },
  watch: {
    columns: {
      handler(result) {
        // 运单列表记录可选列
        if (this.$route.name === 'waybill-v3') {
          this.$store.dispatch('waybill/update_table_column', result)
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang='scss' scoped>
.ky-table-container {
  .pagination-style {
    position: relative;
    padding: 8px 0 16px;

    .pagination {
      margin: 0;
    }

    &__select-total {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      font-size: 12px;
      font-weight: 400;
      color: #333333;
    }

    &__total-num {
      position: absolute;
      top: 50%;
      left: 90px;
      transform: translateY(-50%);
      font-size: 12px;
      font-weight: 400;
      color: #333333;
    }

    &::v-deep .pagination-display .el-pagination__total {
      margin: 16px 0;
      padding-left: 100px;
      display: none;
    }

    /deep/ .el-pagination.is-background .el-pager > li,
    /deep/ .el-pagination span,
    /deep/ .el-pagination button,
    /deep/ .el-pagination__editor.el-input {
      font-size: 12px !important;
    }

    /deep/ .el-pagination.is-background .el-pager .more::before {
      line-height: 22px;
    }
  }

  ::v-deep .cell {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
