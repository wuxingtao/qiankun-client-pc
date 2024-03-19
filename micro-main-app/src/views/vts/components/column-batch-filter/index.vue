<template>
  <ky-dialog title="自定义排序"
             :visible.sync="dialogVisible"
             width="1053px">
    <div class="column__body">
      <div>
        <h4 class="title">选中的字段将显示在列表上（注：拖动或点击以下字段，可进行排序）</h4>
        <el-checkbox :indeterminate="isIndeterminate"
                     :value="checkAll"
                     class="select-all"
                     @change="handleCheckAllChange">全选
        </el-checkbox>
      </div>

      <!--  拖拽列表  -->
      <div class="column__drag">
        <div class="content">
          <div>
            <template v-for="(element) in columnList">
              <div class="drag-item drag--able"
                   :class="[element.visible?'is-checked':'is-unchecked']"
                   :key="element.text || element.label"
                   v-dragging="{ item: element, list: columnList, group: 'item' }">
                <el-button class="item__btn"
                           @click.stop="handleClickButton(element)">
                  <span v-show="element.visible"
                        class="num">{{ getItemIndex(element) }}</span>
                  <span :title="element.text"
                        class="text">{{ element.text }}</span>
                </el-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible=false">取 消</el-button>
        <el-button type="primary"
                   @click="saveData">确 定</el-button>
      </span>
    </template>
  </ky-dialog>
</template>

<script>
  import draggable from 'vuedraggable'
  import { addGridConfigApi, modifyGridConfigApi } from '@/services/api/vts'
  import { getPhone } from '@/views/vts/utils'

  export default {
    name: 'column-filter',
    props: {
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
      getItemIndex (element) {
        return this.columnList.filter(d => d.visible).findIndex(el => el === element) + 1
      },
      // 已选中提示
      handleClickButton (item) {
        console.log('xuanzhong', this.columnList);
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
        this.columnList = JSON.parse(JSON.stringify([...checkedColumns]))
        this.gridConfigId = gridConfigId
        this.gridName = gridName
        this.dialogVisible = true
      },
      /* column 列表拖拽change */
      dragChange () {
        this.checkedColumns = this.checkedColumnsDrag.map((item) => {
          return item.prop
        })
      },
      saveData () {
        if (this.checkedCount < 1) {
          this.$message.warning('表格列不能全部隐藏')
          return
        }
        const newColumnList = [...this.columnList]
        console.log(newColumnList, '保存自定义列参数');
        let gridAttribute = JSON.stringify({ _version: this.version, columns: newColumnList })
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
  @import './index1';
  /deep/ .el-dialog__header {
    padding: 16px 20px;
  }
</style>
