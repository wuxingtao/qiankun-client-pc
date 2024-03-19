<template>
  <footer class='signle-footer--wrapper footer admin-footer'>
    <div :style="{paddingLeft:$store.state.isMenuCollapse?'93px':'196px'}" v-if="formData.payWay === '10'">
      <freight :loading='shareData.loadingFlags.estimateFreight' :estimateFreight='shareData.estimateFreight'
               :coupon='shareData.coupon'>
        <template v-if='!exsitEstmateFreight' #description>
          请先填写必填项及重量、件数，获取预估费用
        </template>
      </freight>
    </div>
    <div class='btn-wrapper'>
      <el-button @click='handleReset' :loading='loading'>清空</el-button>
      <el-button class='btn-secondary' @click='saveDataHandler' :loading='loading'>仅保存</el-button>
      <el-button class='btn-secondary' @click='saveDataAndPrintHandler' :loading='loading'>保存并打印</el-button>
      <el-button type='primary' class='btn-secondary' style='background: #f2effe;' @click='noticeToPickupHandler'
                 :loading='loading'>通知司机取货
      </el-button>
      <el-button type='primary' @click='noticePickupAndPrintHandler' :loading='loading'>通知司机并打印</el-button>
    </div>
  
  </footer>
</template>

<script>
import { computed } from "@vue/composition-api"
import Freight from "./freight/index"

export default {
  props: {
    shareData: { type: Object },
    formData: { type: Object },
    loading: { type: Boolean },
    saveData: { type: Function },
    saveDataAndPrint: { type: Function },
    noticeToPickup: { type: Function },
    noticePickupAndPrint: { type: Function },
    resetFormData: { type: Function },
  },
  components: {
    Freight,
  },
  setup(props, { root }) {
    const handleReset = async () => {
      root.$reportUtils.clkExpressSingleSubbutton({ button_name: "清空" })
      const msg = "是否清空默认信息？"
      try {
        await root.$confirm(msg, "清空", {
          distinguishCancelAndClose: true,
          confirmButtonText: "是",
          cancelButtonText: "否"
        })
        props.resetFormData(false, true, true)
      } catch (action) {
        if (action === "cancel") {
          props.resetFormData(false, true)
        }
      }
    }
    
    const saveDataHandler = () => {
      root.$reportUtils.clkExpressSingleSubbutton({ button_name: "仅保存" })
      props.saveData("save")
    }
    
    const saveDataAndPrintHandler = () => {
      root.$reportUtils.clkExpressSingleSubbutton({ button_name: "保存并打印" })
      props.saveDataAndPrint()
    }
    
    const noticeToPickupHandler = () => {
      root.$reportUtils.clkExpressSingleSubbutton({ button_name: "通知司机取货" })
      props.noticeToPickup()
    }
    
    const noticePickupAndPrintHandler = () => {
      root.$reportUtils.clkExpressSingleSubbutton({ button_name: "通知司机并打印" })
      props.noticePickupAndPrint(true)
    }
    
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
      handleReset,
      exsitEstmateFreight,
      saveDataHandler,
      saveDataAndPrintHandler,
      noticeToPickupHandler,
      noticePickupAndPrintHandler
    }
  },
}
</script>

<style lang='scss' scoped>
@import '~@/assets/scss/footer.scss';

.signle-footer--wrapper {
  .fregith--wrapper {
    font-size: 14px;
    color: #424242;
    display: flex;
    align-items: center;
    
    & > span {
      font-size: 18px;
      color: #ffa40d;
      padding-right: 4px;
    }
    
    /deep/ .icon-question {
      color: #999999;
    }
  }
}

@media screen and (max-width: 1100px) {
  .footer {
    .el-button {
      padding: 11px 12px;
      font-size: 12px;
      min-width: initial;
    }
  }
}

</style>
