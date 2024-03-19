<template>
  <div>
    <slot></slot>
    <ky-drag-dialog
      title='增值服务指南' :visible.sync='dialogVisible' :modal='false'
      :width='contentWidth'
      :append-to-body='true'>
      <div class='content' :style='{height: contentHeight}'>
        <button type='button' class='el-dialog__headerbtn expand-btn' @click='toggleExpand'>
          <i class='iconfont' :class="expand ? 'icon-lessen' : 'icon-expand' "></i>
        </button>
        <div class='tab-container'>
          <div class='tab' v-for='(tab, index) in tabs' :key='index' :class="activeTab === tab.value ? 'active' : ''"
               @click='switchTab(tab.value)'>
<!--            <i :class="'iconfont icon-'+tab.icon"></i>-->
            {{ tab.label }}
          </div>
          <div class='tab-supplement'></div>
        </div>
        <component :is='activeTab'></component>
      </div>
    </ky-drag-dialog>
  </div>
</template>

<script>
import { onMounted, reactive, ref, toRefs, watch, computed } from "@vue/composition-api"
import kyDragDialog from "@comps/ky-drag-dialog"
import valuation from "./valuation"
import collecting from "./collecting"
import packaging from "./packaging"
import feedback from "./feedback"
import custom from "./custom"

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    kyDragDialog,
    valuation,
    collecting,
    packaging,
    feedback,
    custom
  },
  setup(props, { emit, root }) {
    const state = reactive({
      dialogVisible: false
    })
    const handleIdRef = ref(null)
    const expand = ref(false)
    const draggableValue = {
      handle: undefined
    }
    const tabs = [
      {
        label: "报关入仓",
        icon: "feedback2",
        value: "custom"
      },
      {
        label: "回单服务",
        icon: "feedback2",
        value: "feedback"
      },
      {
        label: "保价声明",
        icon: "valuation",
        value: "valuation"
      },
      {
        label: "代收货款",
        icon: "collecting",
        value: "collecting"
      },
      {
        label: "包装服务",
        icon: "packaging",
        value: "packaging"
      }
    ]
    const activeTab = ref(tabs[0].value)
    watch(() => props.visible, val => {
      state.dialogVisible = val
      if (!val) {
        expand.value = false
      }
    })
    watch(() => state.dialogVisible, val => {
      emit("update:visible", val)
    })
    const contentWidth = computed(() => {
      return expand.value ? "80%" : "50%"
    })
    const contentHeight = computed(() => {
      // return expand.value ? (parseInt(document.body.offsetHeight * 0.8) + 'px') : (parseInt(document.body.offsetHeight * 0.7) + 'px')
      const height = document.body.offsetHeight
      return height - 178 + "px"
    })
    const switchTab = value => {
      activeTab.value = value
    }
    const handleConfirm = () => {
      state.dialogVisible = false
    }
    const toggleExpand = () => {
      expand.value = !expand.value
      // 每次宽度变化时检测是否溢出屏幕或被遮挡
      // 原生选择器兼容客户端
      const kyDragDialog = document.querySelector(".ky-drag-dialog")
      if (expand.value) {
        kyDragDialog.style.left = "50%"
        kyDragDialog.style.transform = "translateX(-50%)"
      } else {
        kyDragDialog.style.left = "calc(55% - 8px)"
        kyDragDialog.style.transform = ""
      }
    }
    onMounted(() => {
      draggableValue.handle = handleIdRef.value
    })
    return {
      ...toRefs(state),
      handleConfirm,
      draggableValue,
      tabs,
      activeTab,
      switchTab,
      expand,
      toggleExpand,
      contentHeight,
      contentWidth
    }
  }
}
</script>

<style lang='scss' scoped>
.content {
  padding-bottom: 20px;
  
  .expand-btn {
    top: 0;
    right: 48px;
    line-height: 38px;
    font-size: 12px;
    
    .iconfont {
      font-size: 12px !important;
    }
    
    :hover {
      cursor: pointer;
    }
  }
  
  .tab-container {
    display: flex;
    align-items: flex-end;
    height: 62px;
    margin-bottom: 23px;
    margin-right: 16px;
    border-bottom: 1px solid #D8D8D8;
    position: relative;
    
    .tab {
      width: 72px;
      height: 52px;
      line-height: 52px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      color: $--color-text-primary;
      margin-right: 48px;
      //border: 1px solid #EBEEF4;
      //border-bottom: none;
      //background-image: url("~@assets/image/delivery/addtional-description-tab-bg.png");
      //background-size: cover;
      //background-repeat: no-repeat;
      //background-position: bottom;
      border-radius: 12px 12px 0 0;
      overflow: hidden;
      
      i {
        font-size: 18px;
      }
      
      //&:nth-of-type(2), &:nth-of-type(3) {
      //  margin-left: -2px;
      //}
      
      &.active {
        //height: 62px;
        //line-height: 62px;
        color: #8365F6;
        //background: url("~@assets/image/delivery/addtional-description-tab-active-bg.png");
        //background-size: cover;
        //background-repeat: no-repeat;
        //background-position: bottom;
        &::after {
          content: '';
          width: 72px;
          height: 4px;
          background: #8365f6;
          border-radius: 5px;
          display: block;
          position: absolute;
          bottom: -2px;
        }
      }
    }
    
    .tab-supplement {
      flex: 1;
      height: 100%;
      box-sizing: border-box;
      border-bottom: 1px solid #EBEEF4;;
    }
  }
}

/deep/ {
  .ky-drag-dialog {
    margin-top: 20px !important;
    max-width: 1200px;
    left: calc(50% - 8px);
    //right: 8px;
    border-radius: 4px;
    box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12);
    
    .el-dialog__header {
      width: 100%;
      height: 38px;
      padding: 0 16px 0 20px;
      font-size: 14px;
      font-weight: bold;
      text-align: left;
      color: $--color-text-primary;
      line-height: 38px;
      box-sizing: border-box;
      
      .el-dialog__title {
        font-size: 14px;
      }
      
      .el-dialog__headerbtn {
        top: 0;
        font-size: 12px;
        
        i {
          color: #666666;
          font-size: 12px !important;
        }
        
        .el-dialog__close {
          font-size: 14px !important;
        }
      }
    }
    
    .el-dialog__body {
      margin-top: 14px;
      padding: 0 4px 0 20px;
    }
  }
}

</style>
<style lang='scss'>

</style>