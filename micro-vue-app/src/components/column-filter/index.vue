<template>
  <div>
    <el-dialog :visible.sync="visible" custom-class="column-manage-dialog k-dialog"
               title="自定义排序"
               :close-on-click-modal="false"
               width="1126px">
      <div class="column__body">
        <div>
          <h4 class="title">选中的字段将显示在列表上</h4>
          <el-checkbox :indeterminate="isIndeterminate"
                       :value="checkAll"
                       class="select-all"
                       @change="handleAllChange">全选
          </el-checkbox>
        </div>

        <div class="column__list">
          <el-checkbox-group v-model="checkedColumns" @change="handleChange">
            <li class="column__item" v-for="item in columnList" :key="item.text || item.label">
              <el-checkbox-button v-if="!item.unList" :disabled="item.prohibitSetPosition" :label="item.prop"
                                  @change="(val)=>{item.visible=val}">
                <span>{{ item.text || item.label }}</span>
                <span v-if="!item.prohibitSetPosition" class="column__item--icon"></span>
              </el-checkbox-button>
            </li>
            <i v-for="(item,index) in columnList" :key="index"></i>
          </el-checkbox-group>
        </div>
        <!--  拖拽列表  -->
        <div class="column__drag">
          <div class="header mt_16 mb_16 f_w_500">
            已选中<span class="theme-color fs_18 mlr_4">{{ checkedColumnsDrag.length }}</span>个字段（注：拖动以下字段，可进行从左至右排序）
          </div>
          <div class="content">
            <draggable
                v-if="!$native.isClientMode()"
                v-model="checkedColumnsDrag"
                ghost-class="ghost"
                v-bind="dragOptions"
                @change="dragChange">
              <transition-group>
                <template v-for="(element,index) in checkedColumnsDrag">
                  <div :class="['drag-item drag--able']" :key="element.text || element.label"
                  >
                    <el-button class="item__btn" @click.stop="handleTip(element)">
                      <span class="num">{{ index + 1 }}</span>
                      <span>{{ element.text || element.label }}</span>
                      <span v-if="!element.prohibitSetPosition" class="delete"
                            @click="()=>deleteItem(element.prop)">
                        <i class="iconfont icon-btn-icon fs_12--strict"></i>
                      </span>
                    </el-button>
                  </div>

                </template>
              </transition-group>
            </draggable>
            <div v-else>
              <template v-for="(element,index) in checkedColumnsDrag">
                <div :class="['drag-item drag--able']" :key="element.text || element.label"
                     v-dragging="{ item: element, list: checkedColumnsDrag, group: 'item' }"
                >
                  <el-button class="item__btn" @click.stop="handleTip(element)">
                    <span class="num">{{ index + 1 }}</span>
                    <span>{{ element.text || element.label }}</span>
                    <span v-if="!element.prohibitSetPosition" class="delete"
                          @click="()=>deleteItem(element.prop)">
                        <i class="iconfont icon-btn-icon fs_12--strict"></i>
                      </span>
                  </el-button>
                </div>
              </template>
            </div>

          </div>
        </div>
      </div>
      <template #footer>
    <span class="dialog-footer">
      <el-button @click="visible=false">取 消</el-button>
      <el-button type="primary" @click="saveData">确 定</el-button>
    </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { addGridConfigApi , modifyGridConfigApi } from '@/services/api/common'
import { getPhone } from '@/utils/storage'

export default {
  name: 'column-filter' ,
  props: {} ,
  components: {draggable} ,
  data() {
    return {
      // 当前列版本号
      version: '',
      visible: false ,
      gridConfigId: '' , // 存储id
      gridName: '' ,  // 存储名称
      // 选中的列 ['']
      checkedColumns: [] ,
      // 选中的列对象 [{}]
      checkedColumnsDrag: [] ,
      // 全部数据列 [{prop:'',text:'',visible:false,prohibitSetPosition: false,unList:true}] prohibitSetPosition: 不可取消 unList:不列入选项
      columnList: [] ,
      // 不可操作列
      columnUnList: [],
      // 拖动后保存新列
      columnListNew: [] ,
      columnListObj: {} ,
      dragOptions: {
        animation: 0 ,
        group: 'description' ,
        // disabled: !this.editable,
        ghostClass: 'ghost' ,
        chosenClass: 'chosen' ,
        draggable: '.drag--able'
      }
    }
  } ,
  computed: {
    // 部分选中
    isIndeterminate() {
      return this.checkedColumns.length > 0 && this.checkedColumns.length !== this.columnList.length
    } ,
    // 全选
    checkAll() {
      return this.checkedColumns.length > 0 && this.checkedColumns.length === this.columnList.length
    },
  } ,
  mounted(){
    // 兼容IE 拖拽后触发的事件
    this.$dragging.$on('dragged', this.dragChange)
  },
  methods: {
    /* 触发全选 */
    handleAllChange(val) {
      if (val) {
        this.checkedColumns = this.columnList.map((item) => {
          return item.prop
        })
        this.checkedColumnsDrag = [...this.columnList]
      } else {
        let checkedKey = []
        this.columnList.forEach((item) => {
          if (item.prohibitSetPosition) {
            checkedKey.push(item.prop)
          }
        })
        this.checkedColumns = checkedKey
        this.checkedColumnsDrag = this.columnList.filter((item) => {
          return item.prohibitSetPosition && item
        })
      }
    } ,
    /* 单个check选中 */
    handleChange(val) {
      this.checkedColumnsDrag = val.map(item => {
        return this.columnListObj.hasOwnProperty(item) ?  this.columnListObj[item] : {}
      })
    } ,

    /* 初始化显示弹窗 */
    showDialog({gridConfigId , gridName , columns,checkedColumns=[],version}) {
      this.version = version
      let checkedColumnsArr = [...checkedColumns]
      let checkedColumnsDrag = []

      this.gridConfigId = gridConfigId
      this.gridName = gridName
      const columnUnList = []
      const columnFilter = []

      columns.forEach(item => {
        if(item.unList){
          columnUnList.push(item)
        }else{
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
      if(checkedColumns && checkedColumns.length > 0){
        checkedColumnsDrag = []
        checkedColumns.forEach(item=>{
          if(this.columnListObj[item]){
            checkedColumnsDrag.push(this.columnListObj[item])
          }
        })
      }

      this.columnUnList = columnUnList
      this.columnList = columnFilter
      this.checkedColumns = checkedColumnsArr
      this.checkedColumnsDrag = checkedColumnsDrag
      this.visible = true
    } ,
    /* column 列表拖拽change */
    dragChange() {
      this.checkedColumns = this.checkedColumnsDrag.map((item) => {
        return item.prop
      })
    } ,
    /* 删除指定字段 */
    deleteItem(prop) {
      for (let i = 0; i < this.checkedColumnsDrag.length; i++) {
        if (this.checkedColumnsDrag[i].prop === prop) {
          this.checkedColumnsDrag.splice(i , 1)
          break
        }
      }
      const deleteIndex = this.checkedColumns.indexOf(prop)
      if (deleteIndex !== -1) {
        this.checkedColumns.splice(deleteIndex , 1)
      }
    } ,
    // 筛选可见表格列
    getColumns(columns) {
      return columns.filter(item => {
        return item.visible || item.prohibitSetPosition || item.unList
      })
    } ,
    // 筛选已选中的数组列
    getCheckedColumns(columns){
      let result = []
      columns.forEach(item => {
        if(!item.unList && (item.visible || item.prohibitSetPosition)){
          result.push(item.prop)
        }
      })
      return result
    },
    saveResult() {
      let result = []
      let columnCopy = [...this.columnList]
      let checkedDragCopy = [...this.checkedColumnsDrag]
      for (let i = 0; i < this.checkedColumns.length; i++) {
        for (let j = 0; j < columnCopy.length; j++) {
          if (this.checkedColumns[i] === columnCopy[j].prop) {
            columnCopy.splice(j , 1)
            j--
          }
        }
      }
      checkedDragCopy.forEach((item) => {
        item.visible = true
      })
      columnCopy.forEach(item => {
        item.visible = false
      })

      result =  this.columnUnList.concat(checkedDragCopy,columnCopy)
      this.columnListNew = result
      return result
    } ,
    saveData() {
      const columnResult = this.saveResult()
      if (columnResult.every(c => !c.visible)) {
        this.$message.warning('表格列不能全部隐藏')
        return
      }
      // 存在版本号存储为{version:'',columns:''}
      let gridAttribute = !this.version ? JSON.stringify(columnResult) : JSON.stringify({
        _version: this.version,
        columns: columnResult
      })


      if (this.gridConfigId) {
        let params = {
          id: this.gridConfigId ,
          gridAttribute: gridAttribute
        }
        modifyGridConfigApi(params).then(res => {
          if (res.code === 0) {
            this.saveDataSuccess()
          }
        })
      } else {
        let params = {
          mobile: getPhone() ,
          gridName: this.gridName ,
          gridAttribute: gridAttribute
        }
        addGridConfigApi(params).then(res => {
          if (res.code === 0) {
            this.gridConfigId = res.data
            this.saveDataSuccess()
          }
        })
      }
    } ,
    saveDataSuccess() {
      // this.columnList.unshift(...this.prohibitSetColumns)
      this.$emit('onSaveSuccess' , this.columnListNew , this.gridConfigId,this.checkedColumns)
      this.visible = false
    },

    // 已选中提示
    handleTip(item){
      if(item.prohibitSetPosition){
        this.$message.warning(`${item.label||item.text}不支持隐藏`)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import './index';
</style>
