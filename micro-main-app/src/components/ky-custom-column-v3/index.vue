<template>
  <ky-dialog title="自定义排序" :visible.sync="dialogVisible" @confirm="saveData" width="1053px">
    <div class="column__body">
      <div>
        <h4 class="title">选中的字段将显示在列表上（注：拖动或点击以下字段，可进行排序）</h4>
        <el-checkbox :indeterminate="isIndeterminate" :value="isCheckAll" class="select-all" @change="handleCheckAllChange">全选
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
import { ref, watch, computed } from '@vue/composition-api'
import draggable from 'vuedraggable'
import useHistoryColumns from './composables/useHistoryColumns'
import native from '@utils/native'

export default {
  name: 'ky-custom-column',
  props: {
    //配置存储名称，必须唯一，建议以路由名称来命名，以保证名称的唯一性
    tableConfigName: {
      type: String,
      required: true,
    },
    //表格列 [{prop:'',text:'',visible:false,prohibitHide: false}] prohibitHide: 不可隐藏
    tableColumns: {
      type: Array,
      required: true,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
  components: { draggable },
  data() {
    return {
      dragOptions: {
        animation: 0,
        group: 'description',
        ghostClass: 'ghost',
        chosenClass: 'chosen',
        draggable: '.drag--able',
      },
    }
  },
  setup(props, { emit, root }) {
    const { initTableColumns, tableConfigId, copyOriginTableColumns, saveTableColumsConfig } =
        useHistoryColumns(props)
    const dialogVisible = ref(false)
    const columnList = ref([])
    watch(
      () => props.visible,
      val => {
        dialogVisible.value = val
      }
    )
    watch(dialogVisible, val => {
      emit('update:visible', val)
      if (val) {
        initTableColumns(props.tableConfigName)
        console.log(props.tableColumns,'props.tableColumns')
        console.log(native.isClientMode(),'22')
        console.log(columnList.value,'columnList1')
        columnList.value = copyOriginTableColumns(props.tableColumns,native.isClientMode())
        console.log(columnList.value,'columnList2')
      }
    })
    // watch(() => props.tableConfigName,val=>{
    //   initTableColumns(val)
    // })
    const checkedCount = computed(
      () => columnList.value.filter(f => f.visible).length
    )
    const isIndeterminate = computed(
      () =>
        checkedCount.value > 0 && checkedCount.value !== columnList.value.length
    )
    const isCheckAll = computed(
      () =>
        checkedCount.value > 0 && checkedCount.value === columnList.value.length
    )

    const getItemIndex = element =>
      columnList.value
        .filter(d => d.visible)
        .findIndex(el => el === element) + 1

    const handleCheckAllChange = val => {
      if (val) {
        columnList.value.forEach(col => (col.visible = true))
      } else {
        columnList.value
          .filter(f => !f.prohibitHide)
          .forEach(col => (col.visible = false))
      }
    }
    const handleClickButton = item => {
      if (item.prohibitHide) {
        root.$message.warning(`${item.label || item.text}不支持隐藏`)
        return
      }
      item.visible = !item.visible
    }

    const saveData = async () => {
      if (checkedCount < 1) {
        root.$message.warning('表格列不能全部隐藏')
        return
      }
      const id = await saveTableColumsConfig(
        columnList.value,
        tableConfigId.value,
        props.tableConfigName
      )
      if (id) {
        tableConfigId.value = id
        emit('update:tableColumns', columnList.value)
        emit('change', columnList.value, id)
        dialogVisible.value = false
      }
    }

    return {
      dialogVisible,
      columnList,
      isIndeterminate,
      isCheckAll,
      getItemIndex,
      handleCheckAllChange,
      handleClickButton,
      saveData,
      initTableColumns,
    }
  },
}
</script>

<style lang="scss" scoped>
  @import "./index";
</style>
