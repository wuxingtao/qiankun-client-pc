<template>
    <div class="ky-table-sort">
        <el-table class="element-table" border :data="data" v-bind="$attrs" v-on="$listeners" @sort-change = "sortChange"  ref="table">
            <none-data slot="empty"/>
            <el-table-column v-for="(col,index) in columns" v-bind="col.attr" v-on="col.listeners"
                             :key="col.prop + index" :prop="col.prop" :label="col.label">
                <template slot-scope="scope">
                    <slot v-if="col.slotName" :name="col.slotName" v-bind="{...scope,col}"></slot>
                    <div v-else> {{scope.row[col.prop]}}</div>
                </template>
            </el-table-column>
        </el-table>
        <slot></slot>
        <el-pagination v-if="paginationVisible" v-show="data.length>0" background
                       :current-page.sync="pagination.pageIndex" :page-size.sync="pagination.pageSize || 10"
                       :page-sizes="pagination.pageSizes || [10, 15, 20,30, 50]"
                       layout="total, ->,prev, pager, next,jumper,slot,sizes" :total="Number(pagination.totalCount)"
                       @size-change="(size)=>{$emit('size-change',size)}" @current-change="(page)=>{$emit('page-change',page)}">
            <el-button type="primary" size="mini"
                       style="height: 28px;line-height: 28px;padding: 0 10px;margin-right: 5px; background: #9c84f8; border-color: #9c84f8;"
                       round>确定
            </el-button>
        </el-pagination>
    </div>
</template>
<script>
import NoneData from './none-data'
export default {
  name: 'ky-table-sort',
  components: {NoneData},
  props: {
    data: {
      type: Array, //表格数据
    },
    //表头列
    columns: {
      required: false,
      type: Array,
      validator: function (cols) {
        const flag = cols.some(col => {
          const keys = Object.keys(col)
          return !keys.includes('prop') || !keys.includes('label')
        })
        if (flag) {
          console.log('tableColumns中的所有列必须都包含prop和label属性')
          return false
        }
        return true
      },
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
  },
  inheritAttrs: false,
  watch:{
    'columns.length': {
      handler(n) {
        if (n > 0) {
          let isMac = /macintosh|mac os x/i.test(navigator.userAgent)
          if (!isMac) return
          this.$nextTick(() => {
            let dom = this.$refs.table.$el.querySelector('.el-table__body-wrapper')
            dom.addEventListener('scroll', () => {
              let scrollTop = dom.scrollTop
              let scrollHeight = dom.scrollHeight
              let height = dom.offsetHeight
              if ((scrollTop + height) >= scrollHeight) {
                dom.scrollTop = scrollHeight - height
                dom.style.paddingBottom = '6px'
              } else {
                dom.style.paddingBottom = '0px'
              }
            })
          })
        }
      },
      immediate: true
    },
  },
  data() {
    return {
      prevProp: '', //记录前一次的prop值，
      prevSort: 'descending'//记录前一次的排序状态（elementUI默认有三种，即descending，ascending和null）
    }
  },
  methods: {
    sortChange({column, prop, order}) {// 接收三个参数，分别是当前列的所有属性值，当前列的prop, 当前列的排序状态
      if (order !== null && this.prevProp !== prop) {
        let columns = this.$refs.table.columns.find(item => item.property === this.prevProp)
        if(columns){
          columns.order = null
        }
      }
      if (order === null) {
        if(this.prevProp===prop){
          column.order =this.prevSort || 'descending'
          return
        }else{
          column.order = this.prevSort === 'descending' ? 'ascending' : 'descending'
        }
      }
      this.prevProp = prop
      this.prevSort = order || column.order
      order = order || column.order
      this.$emit('sort-change-asc',{column, prop, order})
    },
    clearSort(){
      if(this.$refs.table){
        this.$refs.table.columns.forEach(item=>{
          item.order = null
        })
        this.$refs.table.clearSort()
      }
    },
    doLayout() {
      this.$refs.table.doLayout()
    }
  },
}
</script>

<style lang="scss">

</style>
