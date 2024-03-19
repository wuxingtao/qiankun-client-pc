<template>
  <ky-dialog title="自定义排序" :visible.sync="dialogVisible" @confirm="saveData" width="1053px">
    <div class="column__body">
      <div>
        <h4 class="title">选中的字段将显示在列表上（注：拖动或点击以下字段，可进行排序）</h4>
        <el-checkbox :indeterminate="isIndeterminate" :value="checkAll" class="select-all" @change="handleCheckAllChange">全选
        </el-checkbox>
      </div>

      <!--  拖拽列表  -->
      <div class="column__drag">
        <div class="content">
          <draggable v-if="!$native.isClientMode()" v-model="columnList" ghost-class="ghost" v-bind="dragOptions">
            <transition-group>
              <template v-for="element in columnList">
                <div class="drag-item drag--able" :class="[element.visible?'is-checked':'is-unchecked']" :key="element.text">
                  <el-button class="item__btn" @click.stop="handleClickButton(element)">
                    <span v-show="element.visible" class="num">{{ getItemIndex(element)  }}</span>
                    <span :title="element.text" class="text">{{ element.text}}</span>
                  </el-button>
                </div>
              </template>
            </transition-group>
          </draggable>
          <div v-else>
            <template v-for="(element) in columnList">
              <div class="drag-item drag--able" :class="[element.visible?'is-checked':'is-unchecked']" :key="element.text || element.label" v-dragging="{ item: element, list: columnList, group: 'item' }">
                <el-button class="item__btn" @click.stop="handleClickButton(element)">
                  <span v-show="element.visible" class="num">{{ getItemIndex(element) }}</span>
                  <span :title="element.text" class="text">{{ element.text }}</span>
                </el-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </ky-dialog>
</template>

<script>
import draggable from 'vuedraggable'
import { addGridConfigApi, modifyGridConfigApi } from '@/services/api/common'
import { getPhone } from '@/utils/storage'

export default {
  name: 'column-filter',
  props: {
    status: {
      type: Number,
      default: 1
    },
    allCheckColumns: {
      type: Array,
      default: () => {
        return [[], [], [], []]
      }
    }
  },
  components: { draggable },
  data () {
    return {
      // 当前列版本号
      version: '',
      dialogVisible: false,
      gridConfigId: '', // 存储id
      gridName: '',  // 存储名称
      // 选中的列 ['']
      checkedColumns: [],
      // 选中的列对象 [{}]
      checkedColumnsDrag: [],
      // 全部数据列 [{prop:'',text:'',visible:false,prohibitSetPosition: false,unList:true}] prohibitSetPosition: 不可取消 unList:不列入选项
      columnList: [],
      // 不可操作列
      columnUnList: [],
      // 拖动后保存新列
      columnListNew: [],
      columnListObj: {},
      dragOptions: {
        animation: 0,
        group: 'description',
        // disabled: !this.editable,
        ghostClass: 'ghost',
        chosenClass: 'chosen',
        draggable: '.drag--able'
      }
    }
  },
  computed: {
    checkedCount () {
      return this.columnList.filter(f => f.visible).length
    },
    // 部分选中
    isIndeterminate () {
      return this.checkedCount > 0 && this.checkedCount !== this.columnList.length
    },
    // 全选
    checkAll () {
      return this.checkedCount > 0 && this.checkedCount === this.columnList.length
    },

  },
  mounted () {
    // 兼容IE 拖拽后触发的事件
    this.$dragging.$on('dragged', this.dragChange)
  },
  methods: {
    /* 触发全选 */
    handleCheckAllChange (val) {
      if (val) {
        this.columnList.forEach(col => col.visible = true)
      } else {
        this.columnList.filter(f => !f.prohibitHide).forEach(col => col.visible = false)
      }
    },
    /* 单个check选中 */
    handleChange (val) {
      this.checkedColumnsDrag = val.map(item => {
        return this.columnListObj.hasOwnProperty(item) ? this.columnListObj[item] : {}
      })
    },
    getItemIndex (element) {
      return this.columnList.filter(d => d.visible).findIndex(el => el === element) + 1
    },
    // 已选中提示
    handleClickButton (item) {
      if (item.prohibitHide) {
        this.$message.warning(`${item.label || item.text}不支持隐藏`)
        return
      }
      item.visible = !item.visible
    },
    /* 初始化显示弹窗 */
    showDialog ({ gridConfigId, gridName, columns, checkedColumns = [], version }) {
      this.version = version
      let checkedColumnsArr = [...checkedColumns]
      let checkedColumnsDrag = []

      this.gridConfigId = gridConfigId
      this.gridName = gridName
      const columnUnList = []
      const columnFilter = []

      columns.forEach(item => {
        if (item.unList) {
          columnUnList.push(item)
        } else {
          columnFilter.push(item)
        }
        if (item.prop) {
          const name = item.prop.toString()
          this.columnListObj[name] = item
        }
        if (checkedColumns.length === 0 && (item.prohibitSetPosition || item.visible)) {
          checkedColumnsArr.push(item.prop)
          checkedColumnsDrag.push(item)
        }
      })
      // 有传参已选中的列
      if (checkedColumns && checkedColumns.length > 0) {
        checkedColumnsDrag = []
        checkedColumns.forEach(item => {
          if (this.columnListObj[item]) {
            checkedColumnsDrag.push(this.columnListObj[item])
          }
        })
      }

      this.columnUnList = columnUnList
      this.columnList = columns
      this.checkedColumns = checkedColumnsArr
      this.checkedColumnsDrag = checkedColumnsDrag
      this.dialogVisible = true
    },
    /* column 列表拖拽change */
    dragChange () {
      this.checkedColumns = this.checkedColumnsDrag.map(item => {
        return item.prop
      })
    },
    /* 删除指定字段 */
    deleteItem (prop) {
      for (let i = 0; i < this.checkedColumnsDrag.length; i++) {
        if (this.checkedColumnsDrag[i].prop === prop) {
          this.checkedColumnsDrag.splice(i, 1)
          break
        }
      }
      const deleteIndex = this.checkedColumns.indexOf(prop)
      if (deleteIndex !== -1) {
        this.checkedColumns.splice(deleteIndex, 1)
      }
    },
    // 筛选可见表格列
    getColumns (columns) {
      return columns.filter(item => {
        return item.visible || item.prohibitSetPosition || item.unList
      })
    },
    // 筛选已选中的数组列
    getCheckedColumns (columns) {
      let result = []
      columns.forEach(item => {
        if (!item.unList && (item.visible || item.prohibitSetPosition)) {
          result.push(item.prop)
        }
      })
      return result
    },
    saveResult () {
      let result = []
      let columnCopy = [...this.columnList]
      let checkedDragCopy = [...this.checkedColumnsDrag]
      for (let i = 0; i < this.checkedColumns.length; i++) {
        for (let j = 0; j < columnCopy.length; j++) {
          if (this.checkedColumns[i] === columnCopy[j].prop) {
            columnCopy.splice(j, 1)
            j--
          }
        }
      }
      checkedDragCopy.forEach(item => {
        item.visible = true
      })
      columnCopy.forEach(item => {
        item.visible = false
      })

      result = this.columnUnList.concat(checkedDragCopy, columnCopy)
      this.columnListNew = result
      return result
    },
    saveData () {
      if (this.checkedCount < 1) {
        this.$message.warning('表格列不能全部隐藏')
        return
      }
      const newColumnList = [...this.columnList]

      let arr = [...this.allCheckColumns]
      arr[this.status - 1] = newColumnList
      // 存在版本号存储为{version:'',columns:''}
      let gridAttribute = !this.version ? JSON.stringify(this.columnList) : JSON.stringify({
        _version: this.version,
        columns: arr
      })


      if (this.gridConfigId) {
        let params = {
          id: this.gridConfigId,
          gridAttribute: gridAttribute
        }
        modifyGridConfigApi(params).then(res => {
          if (res.code === 0) {
            this.saveDataSuccess()
          }
        })
      } else {
        let params = {
          mobile: getPhone(),
          gridName: this.gridName,
          gridAttribute: gridAttribute
        }
        addGridConfigApi(params).then(res => {
          if (res.code === 0) {
            this.gridConfigId = res.data
            this.saveDataSuccess()
          }
        })
      }
    },
    saveDataSuccess () {
      // this.columnList.unshift(...this.prohibitSetColumns)
      this.$emit('onSaveSuccess', this.columnList, this.gridConfigId)
      this.dialogVisible = false
    },

    // 已选中提示
    handleTip (item) {
      if (item.prohibitSetPosition) {
        this.$message.warning(`${item.label || item.text}不支持隐藏`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "./index1";
  /deep/ .el-dialog__header {
    padding: 16px 20px;
  }
</style>
