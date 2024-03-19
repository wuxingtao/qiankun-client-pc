
<template>
  <div class="ky-table-container">
    <el-table class="element-table" border :data="data" v-bind="$attrs" v-on="$listeners" ref="table" :row-class-name="tabRowClassName">
      <none-data slot="empty" />
     <el-table-column v-if="selectionColumn" type="selection" width="32" align="center" class-name="col-selection" />
      <slot></slot>
      <el-table-column v-for="(col,index) in columns" v-bind="col.attr" :fixed="col.fixed" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
      </el-table-column>
    </el-table>
    <pagination class="pagination" v-if="paginationVisible" v-show="data.length>0" :pagination="pagination" @size-change="handleSizeChange" @current-change="handlCurrentChange" />
  </div>
</template>

<script>
import NoneData from './none-data'
import Pagination from './pagination'
export default {
  components: { NoneData, Pagination },
  props: {
    data: {
      type: Array, //表格数据
    },
    selectionColumn:{ //是否显示复选框列
      type:Boolean,
      default:false,
    },
    paginationVisible: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Object,
      default: () => ({
        totalCount: 0,
        pageSize: 10,
        pageIndex: 1,
      }),
    },
    //表头列
    tableColumns: {
      required: false,
      type: Array,
      validator: function (cols) {
        const flag = cols.some(col => {
          const keys = Object.keys(col)
          return !keys.includes('prop') || !keys.includes('text')
        })
        if (flag) {
          console.log('tableColumns中的所有列必须都包含prop和text属性')
          return false
        }
        return true
      },
    },
  },
  inheritAttrs: false,
  data() {
    return {}
  },
  // created() {
  //   const methods=['doLayout']
  //   Object.keys(this.$refs.table).filter(k=>k===methods.includes(k)).forEach(t=>{
  //     this[t]=this.$refs.table[t]
  //   })
  // },
  methods: {
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.$emit('size-change', val)
      this.$emit('pagination-change', this.pagination)
    },
    handlCurrentChange(val) {
      this.pagination.pageIndex = val
      this.$emit('page-change', val)
      this.$emit('current-change', val)
      this.$emit('pagination-change', this.pagination)
    },
    doLayout() {
      this.$refs.table.doLayout()
    },
    toggleRowSelection(row, selected){
      this.$refs.table.toggleRowSelection(row, selected)
    },
    tabRowClassName({row,rowIndex}) {
      let index = rowIndex + 1
      if(index%2 === 0){
	       return 'warning-row'
      }
    }
  },
  // beforeUpdate() {
  //   this.$nextTick(() => {
  //     this.$refs.table.doLayout()
  //   })
  // },
  computed: {
    columns() {
      if(!this.tableColumns||this.tableColumns.length<1){
        return []
      }
      //当表格列中存在有visible的列时，则只展示visible为true的列，否则默认展示全部列
      if (this.tableColumns.find(c => c.visible)) {
        return this.tableColumns.filter(c => c.text && c.visible)
      }
      return this.tableColumns.filter(c => c.text)
    },
  },
}
</script>

<style lang="scss">
  .ky-table-container {
    .pagination {
      margin: 16px 0;
    }
  }
</style>
