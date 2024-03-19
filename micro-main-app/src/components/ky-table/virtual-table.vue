<template>
  <div class='ky-table-container'>
    <vxe-table ref='table' class='editable-table'
               show-overflow show-header-overflow
               highlight-hover-row
               v-bind='$attrs'
               v-on='$listeners'
               :resizable='resizable'
               :data='data'
               :sort-config='{multiple: true}'
               :tooltip-config="{theme:'light'}"
               :optimization='{animat:false}'
               @checkbox-all='handleSelectionChange'
               @checkbox-change='handleSelectionChange'>
      <slot name='empty'>
        <div slot='empty'>
          <none-data />
        </div>
      </slot>
      <slot name='customer-select'></slot>
      <!-- 复选框列 -->
      <template v-if='multiSelect !== null'>
        <vxe-column
          v-if='multiSelect'
          type='checkbox'
          width='38'
          fixed='left'
          class-name='col-selection'
          :resizable='false'
        >
        </vxe-column>
        <vxe-column v-else width='38' fixed='left' :resizable='false' class-name='col-selection'>
          <template v-slot='{ row }'>
            <el-radio v-model='selectedRows[0]' :label='row'><i /></el-radio>
          </template>
        </vxe-column>
      </template>
      
      <!-- 序号列 -->
      <vxe-column v-if='indexColumn' type='index' width='50' label='序号' />
      <!-- 普通列 -->
      <slot></slot>
      <vxe-column
        v-for='(col, index) in columns'
        :key='col.prop + index'
        :field='col.prop'
        :title='col.text'
        :min-width='col.width'
        :sortable='col.isSort'
      >
        <template v-if='col.defaultSlot' v-slot='{ row }'>
          <slot :name='[col.defaultSlot]' v-bind='{ row, col }'></slot>
        </template>
      </vxe-column>
    </vxe-table>
    
    <!-- 分页组件 -->
    <div class='pagination-style' v-if='data && data.length && showPagination'>
      <div class='pagination-style__select-total'>已选：{{ selectedRows.length || 0 }}条</div>
      <div class='pagination-style__total-num'>总共：{{ pagination.totalCount || 0 }}{{ totalCountUnit }}</div>
      <el-pagination background ref='pagination' layout='total, ->,prev, pager, next,jumper,slot,sizes'
                     :current-page='pagination.pageIndex' :total='Number(pagination.totalCount)'
                     :page-size='pagination.pageSize' :page-sizes='pagination.pageSizes || [10, 15, 20, 30, 50]'
                     @size-change='handleSizeChange' @current-change='handlCurrentChange'>
      </el-pagination>
    </div>
  </div>
</template>

<script>
import NoneData from '@/components/none-data'

export default {
  name: 'virtual-table',
  components: {
    NoneData
  },
  props: {
    data: {
      type: Array //表格数据
    },
    resizable: {
      type: Boolean,
      default: true
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
    showPagination: {
      type: Boolean,
      default: true
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
    },
    totalCountUnit: {
      type: String,
      default: '条'
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
    }
  },
  data() {
    return {
      selectedRows: [] //勾选的行
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
  updated() {
    // 解决不能翻页时分页器展示错误问题
    this.$refs.pagination && (this.$refs.pagination.internalCurrentPage = this.pagination.pageIndex)
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
    },
    data(newVal, oldVal) {
      if (newVal !== oldVal) {
        // 定时器处理data多次变化问题
        setTimeout(() => {
          this.$refs.table.clearScroll()
          this.selectedRows = []
        }, 100)
      }
    }
  },
  methods: {
    clearSort() {
      this.$refs.table.clearSort()
    },
    handleSelectionChange(val) {
      this.selectedRows = val.records
      this.$emit('selection-change', val.records)
    },
    handleSizeChange(val) {
      this.selectedRows = []
      this.$emit('size-change', val)
    },
    handlCurrentChange(val) {
      this.selectedRows = []
      this.$emit('current-change', val)
    },
    reload(data) {
      this.$refs.table.reload(data)
    }
  }
}
</script>

<style lang='scss' scoped>
$border_color: #d9d9d9;
$height: 24px;

.custom-checkbox {
  font-size: 18px;
  cursor: pointer;
}

/deep/ {
  .vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--unchecked-icon,
  .vxe-table--render-default .is--checked.vxe-cell--checkbox .vxe-checkbox--checked-icon,
  .vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--icon {
    font-size: 14px;
  }
  .vxe-table--render-default .vxe-cell{
    padding-left: 12px !important;
  }
  .scrolling--middle, .scrolling--middle {
    //box-shadow: 4px 0 4px rgba(0, 0, 0, 0.12) !important;
    //box-shadow: unset !important;
  }
  
  .vxe-table--render-default .vxe-header--column {
    // height: 34px;
    // line-height: 34px;
    background-color: #f7f8fe;
    background-image: unset;
    
    .vxe-cell--title {
      font-weight: bold;
    }
    
    .vxe-resizable.is--line:before {
      width: 1px;
      height: 50%;
      background-color: #d5d2de;
    }
  }
  
  .vxe-table--fixed-left-wrapper {
    box-shadow: 4px 0 4px rgba(0, 0, 0, 0.05) !important;
    
    // &.scrolling--middle {
    //   box-shadow: none;
    //   border-right: 1px solid #dfe7f7;
    // }
  }
  
  .vxe-table--fixed-right-wrapper {
    &.scrolling--middle {
      box-shadow: none;
    }
  }
  
  
  .vxe-table--render-default .vxe-body--column {
    height: 36px;
    line-height: 36px;
  }
  
  .vxe-table--border-line {
    border: unset;
  }
  
  .el-pagination__total {
    display: none !important;
  }
  
  .pagination-style {
    position: relative;
    padding: 8px 0;
  }
  
  .pagination-style__select-total, .pagination-style__total-num {
    position: absolute;
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    font-size: 12px;
    font-weight: 400;
    color: #333;
  }
  
  .pagination-style__total-num {
    left: 90px;
  }
}

/deep/ .el-pagination.is-background {
  
  input {
    font-weight: normal !important;
    border: 1px solid $border_color !important;
    border-radius: 4px !important;
    color: #666666 !important;
    font-size: 12px;
  }
  
  .el-pagination__rightwrapper {
    display: flex;
    align-items: center;
    
    .btn-prev,
    .btn-next {
      box-sizing: border-box;
      border: 1px solid $border_color;
      background: none;
      color: #666666;
      margin: 0 4px;
      min-width: $height;
      height: $height;
      
      i {
        line-height: $height;
      }
    }
    
    .el-pager > li {
      background-color: #ffffff;
      box-sizing: border-box;
      border: 1px solid $border_color;
      border-radius: 2px;
      color: #666666;
      min-width: $height;
      margin: 0 4px;
      line-height: $height;
      height: $height;
      font-size: 12px;
      
      &.active {
        border-color: #dcdae2;
      }
      
      &:not(.disabled) {
        &.active {
          background-color: #f0edff;
          border-color: #dcdae2;
          color: #8365f6;
        }
      }
      
      &.el-icon-more::before {
        line-height: 24px;
      }
    }
    
    .el-pager .more::before {
      line-height: 24px;
    }
    
    .el-pagination__jump {
      font-size: 12px;
      
      .el-input__inner {
        padding: 0 3px !important;
        height: 24px;
      }
      
      .el-pagination__editor {
        line-height: 1;
      }
    }
    
    .el-pagination__sizes {
      .el-input--suffix {
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 24px;
        
        .el-input__icon {
          line-height: 24px;
        }
      }
      
      .el-input__inner {
        background: #ffffff !important;
        border: 1px solid $border_color !important;
        height: 24px;
        font-size: 12px;
      }
    }
    
    .el-pagination__total {
      color: #333333;
      font-size: 12px;
    }
    
    .el-select {
      input {
        height: $height;
      }
    }
  }
}
</style>