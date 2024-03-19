<!-- 表格组件封装 -->
<template>
  <div>
    <el-table :data="data"
              border
              :height="height? height:null"
              header-row-class-name="kye__table--header"
              header-cell-class-name="kye__header--cell"
              row-class-name="kye__table--row"
              cell-class-name="kye__body--cell"
              class="k__table"
              @selection-change="handleSelection"
    >
      <div slot="empty" class="empty-wrap">
        <svg-icon icon-class="none-data" />
        <div>未找到符合条件的数据<br />建议您调整筛选条件再试试</div>
      </div>
      <template v-for="(item,index) in columns">
        <slot v-if="item.slot" :name="item.slot" :item="data[index]"></slot>
        <el-table-column v-else
                         :type="item.type"
                         :prop="item.prop" :label="item.label"
                         :width="item.width" :min-width="item.minWidth"
                         :align="item.align"
                         :fixed="item.fixed" :key="item.type ? null : item.prop + index">
        </el-table-column>
      </template>
    </el-table>

    <div class="k-pagination">
      <span class="fs_14">共{{ pagination.dataCount }}条</span>
      <el-pagination background
                     :current-page="pagination.pageIndex"
                     :page-size="pagination.pageSize"
                     :page-sizes="[10, 30, 50]"
                     layout="prev, pager, next,jumper,sizes"
                     :total="Number(pagination.dataCount)"
                     @size-change="handleSizeChange"
                     @current-change="handleCurrentChange">
      </el-pagination>
    </div>
  </div>
</template>

<script>
export default {
  name: 'k-table' ,
  props: {
    // 数据源
    data: {
      type: Array ,
      default: () => []
    } ,
    // 展示列
    columns: {
      type: Array ,
      default: () => [{label: '' , prop: '' , fixed: false}]
    } ,
    height: {
      type: String | Number ,
      default: () => null
    } ,
    total: {
      type: Number ,
      default: () => 0
    }
  } ,
  watch: {
    total: {
      handler(val) {
        this.pagination.dataCount = val
      } ,
      immediate: true
    },
    multipleSelection(){
      this.$emit('selection-change',this.multipleSelection)
    }
  } ,
  data() {
    return {
      // 选中列
      multipleSelection: [] ,
      pagination: {
        dataCount: 0 ,
        pageSize: 10 ,
        pageIndex: 1 ,
      } ,
      loading: false
    }
  } ,
  mounted() {
    document.getElementsByClassName('el-pagination__jump')[0].childNodes[0].nodeValue = '跳至'
  } ,
  methods: {
    //切换页码
    handleSizeChange(val) {
      this.pagination.pageSize = val
      this.handleList()
    } ,
    // 切换页数
    handleCurrentChange(val) {
      this.pagination.pageIndex = val
      this.handleList()
    } ,
    handleList() {
      this.$emit('refreshList' , {...this.pagination})
    },
    // 列选择事件
    handleSelection(val){
      this.multipleSelection = val
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/libs/_var.scss';
/deep/ .k__table {
  color: #333333;

  .kye__table--header {
    th {
      height: 42px;
      background: #f7f8fe;
      font-weight: 500;
      color: #333333;
    }

    th[colspan='1'] {
      &::after {
        content: '';
        display: block;
        border-right: 1px solid #dcdae2;
        height: 12px;
        float: right;
        top: 0;
        position: absolute;
        right: 0;
        bottom: 0;
        margin: auto;
        //margin-right: -12px;
        //margin-top: 6px;
      }

      &:last-child {
        &:after {
          content: none;
        }
      }
    }
  }

  &.el-table--border {
    border: 0;

    td, th {
      border-right: 0;
    }
  }

  &.el-table--group {
    border: 0;
  }
}

.k-pagination {
  display: flex;
  height: 60px;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;

  ::v-deep .el-pagination {
    * {
      font-size: 12px !important;
    }

    .btn-prev, .btn-next {
      margin: 0;
      border: 1px solid #d6dde5;
      background: none;
      color: #666666;
    }

    .btn-prev {
      border-top-left-radius: 50%;
      border-bottom-left-radius: 50%;
    }

    .btn-next {
      border-top-right-radius: 50%;
      border-bottom-right-radius: 50%;
      margin-left: -1px;
    }

    .el-pager {
      margin-left: -1px;
    }

    .el-pager li {
      margin: 0 !important;
      background: none;
      color: #666666;
      border-radius: 0;
      border-color: #d6dde5;
      border-width: 1px 1px 1px 0;
      border-style: solid;
      font-weight: 400;
      &.active{
        border-color: $themeColor;
      }

      &:last-child {
        border-right: 0;
      }
    }

    .el-pagination__jump {
      .el-input__inner {
        background: #f2f6fd;
        border-radius: 14px;
      }
    }
  }
}

/deep/ .el-table__empty-block {
  height: 100%;
  .el-table__empty-text {
    display: flex;
    align-items: center;
    .empty-wrap {
      height: 100%;
      margin: 10px auto;
      line-height: 20px;
      .svg-icon {
        width: 150px;
        height: 150px;
        margin-bottom: 24px;
      }
    }
  }
}
</style>
