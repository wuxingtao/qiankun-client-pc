<template>
  <div class="infinite-list-container" ref="container" @scroll="handleScroll">
    <div class="infinite-list-phantom" :style="{ height: tableHeight + 'px' }"></div>
      <el-table class="element-table" border  :style="{ transform: getTransform }" :data="visibleData" ref="elTable" v-bind="$attrs" v-on="$listeners"  :row-class-name="rowClass">
        <el-table-column fixed label="操作" min-width="100px">
          <template>
            <el-button type="text" class="btn-text-border" @click="handleClick">修改</el-button>
            <el-button type="text" class="btn-text-border">删除</el-button>
          </template>
        </el-table-column>
        <el-table-column v-for="(col,index) in columns" :key="col.prop + index" :show-overflow-tooltip="true" :prop="col.prop" :label="col.text" :min-width="col.width+'px'">
        </el-table-column>
      </el-table>
  </div>
</template>

<script>
export default {
  props: {
    data: {
      type: Array, //表格数据
    },
    //表格列
    tableColumns: {
      required: false,
      type: Array,
      validator: function (cols) {
        const flag = cols.some((col) => {
          const keys = Object.keys(col)
          return !keys.includes("prop") || !keys.includes("text")
        })
        if (flag) {
          console.log("tableColumns中的所有列必须都包含prop和text属性")
          return false
        }
        return true
      },
    },
    rowHeight: {
      type: Number,
      default: 65
    },
    inheritAttrs: false,
  },
  data () {
    return {
      //可视区域高度
      screenHeight: 0,
      //起始行索引
      startRowIndex: 0,
      //结束行索引
      endRowIndex: 0,
      //偏移量
      startOffset: 0,
      showHeader:true,
    }
  },
  mounted () {
    // console.log('this.$refs.elTable :>> ', this.$refs.elTable)
    // this.$refs.elTable.bodyWrapper.addEventListener('scroll',res=>{ 
    //   this.$refs.elTable.bodyWrapper.style.paddingTop='400px'
    //   this.$refs.elTable.$refs.fixedBodyWrapper.style.paddingTop='400px'
    //   console.log('res :>> ', res)
    // })
    // console.log('this.$el.clientHeight :>> ', this.$el.clientHeight, this.$el)
    this.screenHeight = this.$el.clientHeight
  },
  methods: {
    rowClass({row,rowIndex}){
      // console.log('row,rowIndex :>> ', row,rowIndex)
      return 'row'+rowIndex
    },
    handleClick(){
      this.$refs.elTable.doLayout()
    },
    handleScroll (e) {
      //当前滚动位置
      const scrollTop = this.$refs.container.scrollTop
      this.startRowIndex = Math.floor(scrollTop / this.rowHeight)
      this.endRowIndex = this.startRowIndex + this.visibleRowCount
      this.startOffset = scrollTop - (scrollTop % this.rowHeight)
    }
  },
  computed: {
    //获取真实显示列表数据
    visibleData () {
      return this.data.slice(this.startRowIndex, Math.min(this.endRowIndex, this.data.length))
    },
    //可显示的行数
    visibleRowCount () {
      return Math.ceil(this.screenHeight / this.rowHeight)
    },
    //表格总高度
    tableHeight () {
      return this.data.length * this.rowHeight
    },
    getTransform () {
      return `translate3d(0,${this.startOffset}px,0)`
    },
    columns () {
      if (!this.tableColumns || this.tableColumns.length < 1) {
        return []
      }
      //当表格列中存在有visible的列时，则只展示visible为true的列，否则默认展示全部列
      if (this.tableColumns.find((c) => c.visible)) {
        return this.tableColumns.filter((c) => c.text && c.visible)
      }
      return this.tableColumns.filter((c) => c.text)
    },
  },
}
</script>

<style lang="scss" scoped>
  .infinite-list-container {
    border: 1px solid;
    box-sizing: border-box;
    height: 500px;
    overflow: auto;
    position: relative;

    .infinite-list-phantom {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      z-index: -1;
    }

    .table-wrapper {
      left: 0;
      right: 0;
      top: 0;
      position: absolute;
    }
  }
</style>