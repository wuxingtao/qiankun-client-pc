<template>
  <ky-table :data="visibleData" ref="kyTable" v-bind="$attrs" v-on="$listeners" :tableColumns="tableColumns" :height="height">
  </ky-table>
</template>

<script>
import _ from 'lodash'
export default {
  props: {
    data: {
      type: Array, //表格数据
    },
    height:{
      type:String,
      default:'calc(100vh - 234px)'
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
      default: 42
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
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.initScrollData()
    })
    this.$refs.kyTable.$refs.table.bodyWrapper.addEventListener('scroll', this.debounceFn)
  },
  activated(){
    window.addEventListener('resize', this.initScrollData)
  },
  deactivated(){
    window.removeEventListener('resize',this.initScrollData)
  },
  beforeDestroy(){
    window.removeEventListener('resize',this.initScrollData)
  },
  methods: {
    initScrollData () {
      this.screenHeight = parseFloat(this.$refs.kyTable.$refs.table.bodyHeight.height)
      this.handleScroll()
    },
    debounceFn: _.debounce(function (e) {
      this.handleScroll(e)
    }, 10),
    handleScroll () {
      //当前滚动位置
      const scrollTop = this.$refs.kyTable.$refs.table.bodyWrapper.scrollTop
      const bodys = this.$refs.kyTable.$refs.table.$el.getElementsByClassName(
        "el-table__body"
      )
      Array.from(bodys).forEach(v => {
        v.style.height = this.tableHeight + "px"
        let paddingTop = scrollTop
        let paddingBottom = this.tableHeight - this.visibleRowCount * this.rowHeight - scrollTop
        if (this.startRowIndex + this.visibleRowCount >= this.data.length) {
          paddingTop = scrollTop - this.rowHeight 
          paddingBottom = 0
        } 
        v.style.paddingTop = paddingTop + 'px'
        v.style.paddingBottom = paddingBottom + 'px'
      })

      this.startRowIndex = Math.floor(scrollTop / this.rowHeight)
      this.endRowIndex = this.startRowIndex + this.visibleRowCount
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
  },
}
</script>

<style lang="scss" scoped>
</style>