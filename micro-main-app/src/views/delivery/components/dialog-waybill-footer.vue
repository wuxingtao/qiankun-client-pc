<template>
  <span class="dialog-footer dialog-waybill-footer--container">
    <freight ref="freightDetailRef" :visible-discounted="!isBatchImport" :loading="shareData.loadingFlags.estimateFreight" :estimateFreight="shareData.estimateFreight || {}" :coupon="shareData.coupon" :isInDialog="true">
      <template v-if="!exsitEstmateFreight" #description>
        请先填写必填项及重量、件数，获取预估费用
      </template>
    </freight>
    <div class='btns--wrapper'>
      <el-button @click='dialogVisible = false' :loading='loading'>取 消</el-button>
      <el-button type='primary' :loading='loading' @click='confirmButtonEvent'>{{ confirmButtonText }}</el-button>
    </div>
  </span>
</template>

<script>
import Freight from "./freight/index"
import { ref, computed } from "@vue/composition-api"
import useDialogVisibleSync from "@/hooks/useDialogVisibleSync"

export default {
  components: {
    Freight
  },
  props: {
    visible: {
      type: Boolean,
    },
    loading: {
      type: Boolean
    },
    confirmButtonText: {
      type: String,
      default: "确定"
    },
    confirmButtonEvent: {
      type: Function,
    },
    shareData: {
      type: Object
    },
    isBatchImport: {
      type: Boolean
    },
  },
  setup(props, { emit }) {
    const freightDetailRef = ref(null)
    const { dialogVisible } = useDialogVisibleSync({ props, emit })
    
    const exsitEstmateFreight = computed(() => {
      if (!props.shareData.estimateFreight) {
        return false
      }
      if (Object.keys(props.shareData.estimateFreight).length < 1) {
        return false
      }
      return true
    })
    
    return {
      dialogVisible,
      freightDetailRef,
      exsitEstmateFreight
    }
  }
}
</script>

<style lang='scss' scoped>
.dialog-waybill-footer--container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .btns--wrapper {
    margin-left: auto;
  }
}
</style>