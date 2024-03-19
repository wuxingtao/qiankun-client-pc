<template>
  <ky-dialog custom-class='dialog-standard-size' class='dialog-2021' title='货物规格尺寸' :visible.sync='dialogVisible'
             :close-on-click-modal='false' :width='formWidth' append-to-body :style="{'min-width':formWidth}">
    <div class='dialog-body'>
      <div class='cube__wrapper'>
        <el-form ref='sizeFormRef' :model='formData' :rules='formRules' label-position='top'>
          <el-form-item label='货物体积' prop='cube'>
            <el-input v-model.trim='formData.cube' size='small' clearable v-kyerestrict.regular='/^\d*[.]?\d{0,3}$/'
                      :maxlength='8' placeholder='请填货物体积'>
              <template slot='append'>
                <div>(㎥)</div>
              </template>
            </el-input>
          <tip-normal :msg="volumetricWeightText" :can-close="false"/>
          </el-form-item>
        </el-form>
      </div>
      
      <div class='caption'>
        <span>货物尺寸</span>
        <span>(最多100组，还可以添加{{ 100 - tableData.length }}组)</span>
      </div>
      
      <div class='dialog__header flex flex_ai_c flex_jc_b'>
        <div class='dialog__header_tip'>
          <i class='iconfont icon-warn' />
          为保证预估费用精准并安排出车，请填写件数；若您未填写将默认件数为1。
        </div>
        <el-button class='btn-add' @click='sizeAdd' v-if='!readonly'>
          <svg-icon icon-class='icon-add' class-name='icon-add mr_4' />
          新增
        </el-button>
      </div>
      <div class='dialog__table'>
        <form-table maxHeight='224' :data='tableData' :planeListInfo='planeListInfo' :serviceWay='serviceWay'
                    @sizeDelete='sizeDelete'
                    @handleSkuChange='handleSkuChange' @rowChange='handleRowChange' :readonly='readonly'
                    ref='formTableRef' />
      </div>
    
    </div>
    <span slot='footer' class='dialog-footer'>
      <el-button @click='dialogClose'>取 消</el-button>
      <el-button type='primary' @click='saveData' :loading='loading' v-if='!readonly'>保存</el-button>
    </span>
  </ky-dialog>
</template>

<script>
import { computed, nextTick, reactive, ref, toRefs, watch } from "@vue/composition-api"
import deliveryUtil from "@/utils/deliveryUtil"
import FormTable from "./form-table"
import useWeightSizeValidate from "@views/delivery/hooks/useWeightSizeValidate"
import TipNormal from '@/components/tip-normal'

export default {
  name: "DialogStandardSize",
  components: {
    FormTable,
    TipNormal
  },
  setup(props, { emit, root }) {
    const state = reactive({
      formWidth: "820px",
      dialogVisible: false,
      readonly: false,
      loading: false,
      rawItem: { name: "", weight: "", length: "", width: "", height: "", count: "", id: "", sizeMsg: "" },
      tableData: [],
      formData: {
        cube: "",
      },
      planeListInfo: {},
      serviceWay: "",
      volumetricWeightRatio: 0
    })
    const { getOverSizeMessage } = useWeightSizeValidate()
    const checkSingleCube = (rule, value, callback) => {
      if (Number(state.formData.cube) >= 10000) {
        return callback(new Error("体积最大不能超过1万立方米"))
      }
      callback()
    }
    const formRules = {
      cube: [
        { validator: checkSingleCube, trigger: "blur" }
      ]
    }
    let callbackFunc = ref(null)
    const formTableRef = ref(null)
    const sizeFormRef = ref(null)
    
    const volumetricWeightText = computed(()=>{
      return deliveryUtil.getVolumetricWeightText(state.formData.cube,state.volumetricWeightRatio)
    })
    // 存在props.visible
    watch(() => props.visible, (newValue, oldValue) => {
      if (!newValue) {
        return
      }
      init_dialog(props.sizeList)
    })
    
    watch(() => state.dialogVisible, val => {
      emit("update:visible", val)
    })
    
    watch(() => state.tableData, val => {
      nextTick(async () => {
        await formTableRef.value.formRef.validate()
      })
    })
    
    // 初始化弹窗
    function init_dialog(sizeList) {
      state.dialogVisible = true
      if (!sizeList || sizeList.length < 1) {
        state.tableData = [Object.assign({}, state.rawItem)]
      } else {
        state.tableData = sizeList.map(m => ({
          "length": m["length"],
          width: m.width,
          height: m.height,
          count: m.count,
          id: m.id,
          sizeMsg: m.sizeMsg
        }))
      }
    }
    
    /**
     * 展示弹窗
     * sizeList 规模数据[]
     * callback 保存回调函数
     * readonly 是否仅可查看
     */
    function showDialog({ sizeList, callback, readonly, cube, planeListInfo, serviceWay, volumetricWeightRatio }) {
      state.readonly = readonly
      state.formData.cube = cube
      state.planeListInfo = planeListInfo
      state.serviceWay = serviceWay
      state.volumetricWeightRatio = volumetricWeightRatio
      nextTick(() => sizeFormRef.value.clearValidate())
      init_dialog(sizeList)
      state.tableData.forEach(r => r["sizeMsg"] = getOverSizeMessage(state.planeListInfo, r, serviceWay))
      
      if (callback) {
        callbackFunc.value = callback
      }
    }
    
    // 新增行
    async function sizeAdd() {
      if (!await checkCube(true)) {
        return
      }
      if (state.tableData.length < 100) {
        state.tableData.push({ ...state.rawItem })
      } else {
        root.$message.warning("最大添加100个")
      }
    }
    
    // 删除行
    function sizeDelete(index) {
      state.tableData.splice(index, 1)
      handleRowChange()
    }
    
    async function checkCube(isAdd) {
      await sizeFormRef.value.validate()
      const sizeLists = state.tableData.filter(item => (item.width && item.height && item.length))
      const cube = deliveryUtil.convertToCube(sizeLists)
      if (cube >= 10000) {
        if (!isAdd && !state.formData.cube) {
          state.formData.cube = "9999.999"
        }
        root.$message.warning("体积累加不可超过1万立方米")
        return false
      }
      if (!isAdd && !state.formData.cube && cube) {
        state.formData.cube = cube.toFixed(3)
      }
      return true
    }
    
    async function saveData() {
      try {
        state.loading = true
        if (!await checkCube()) {
          return
        }
        // try {
        //   await formTableRef.value.formRef.validate()
        // } catch (ex) {
        //   console.log('dialogSize :>> ', ex)
        //   return root.$message.warning('请输入正确的货物信息')
        // }
        // const sizeLists = state.tableData.filter(f => Object.keys(f).some(k => f[k]))
        const sizeLists = state.tableData.filter(item => (item.width && item.height && item.length))
        emit("update:sizeList", sizeLists)
        emit("size-list-change")
        callbackFunc.value && callbackFunc.value(sizeLists, state.formData.cube)
        state.dialogVisible = false
        
      } finally {
        state.loading = false
      }
    }
    
    /**
     * 修改指定行数据
     * @param row
     * @param $index
     */
    function handleSkuChange({ row, $index }) {
      if (state.tableData[$index]) {
        state.tableData[$index] = row
      }
    }
    
    function handleRowChange() {
      const sizeLists = state.tableData.filter(item => (item.width && item.height && item.length))
      let cube = deliveryUtil.convertToCube(sizeLists)
      if (cube >= 10000) {
        cube = 9999.999
      }
      state.formData.cube = cube ? cube.toFixed(3) : ""
    }
    
    function dialogClose() {
      state.dialogVisible = false
    }
    
    return {
      ...toRefs(state),
      volumetricWeightText,
      formTableRef,
      sizeFormRef,
      formRules,
      saveData,
      sizeAdd,
      sizeDelete,
      dialogClose,
      handleSkuChange,
      handleRowChange,
      showDialog
    }
  }
}
</script>

<style lang='scss' scoped>
/deep/ {
  .dialog-standard-size {
    &.el-dialog {
      .el-dialog__body {
        height: 400px;
        margin-top: 16px !important;
        
        .cube__wrapper {
          height: 77px;
          box-sizing: border-box;
          padding: 14px 16px;
          margin-bottom: 16px;
          background-image: url('~@/assets/image/delivery/cube-bg.png');
          background-position: top right;
          background-repeat: no-repeat;
          background-color: #f6f8ff;
          
          .el-form-item__label {
            line-height: 1;
            color: #03050d;
            padding-bottom: 2px;
          }
          
          .el-form-item__content {
            line-height: 1;
          }
          
          .el-input {
            width: 240px;
            
            input {
              background: transparent;
              border: none !important;
              border-bottom: 1px solid #d5dbef !important;
              border-radius: 0;
              padding: 0;
              padding-right: 15px;
              
              &:focus {
                border-bottom: 1px solid #834eff !important;
              }
            }
            
            .el-input-group__append {
              border: none !important;
              border-radius: 0;
              border-bottom: 1px solid #e3e3e3 !important;
              background: none !important;
              padding: 0;
            }
          }
        }
        
        .caption {
          height: 28px;
          font-size: 12px;
          background: linear-gradient(270deg, #fafafa, #f6f6f6);
          border-radius: 2px;
          position: relative;
          display: flex;
          align-items: center;
          
          &::before {
            content: '';
            width: 3px;
            height: 16px;
            background: #666666;
            border-radius: 2px;
            position: relative;
          }
          
          & > span {
            &:first-of-type {
              padding-left: 12px;
              font-size: 14px;
              color: #333333;
              font-weight: bold;
            }
            
            &:last-of-type {
              color: #8f8fa8;
              padding-left: 8px;
            }
          }
        }
        
        .dialog__header {
          padding: 10px 0;
          
          button {
            font-size: 12px;
            border: none;
            padding: 6px 8px;
            border-radius: 2px;
            color: #8365f6;
          }
          
          .dialog__header_tip {
            display: flex;
            align-items: center;
            border-radius: 4px;
            color: #ff8038;
            
            .icon-warn {
              padding-right: 8px;
              font-size: $--font-size-base;
            }
          }
        }
      }
    }
  }
}
</style>
