<template>
  <ky-dialog custom-class="dialog-waybill-modify--container" title='修改运单' :visible.sync='dialogVisible' width='820px' append-to-body>
    <single-info-whole v-if='dialogVisibleCopy' ref='singleInfoWholeRef' :isModify='true' :ydNo='ydNo' :tempFormData.sync='formData' :tempShareData.sync='shareData' @loading-change='loading=$event'
    :needWareCheck="true">
      <template #dialog-sender-title>
        <span class="title-tip">填写手机号更方便取货</span>
        <div class='yd-no'>运单号：{{ ydNo }}
          <el-button type='text' v-clipboard='ydNo'>
            <svg-icon icon-class='copy' class='icon-copy' />
            复制
          </el-button>
        </div>
      </template>
    </single-info-whole>
    <dialog-waybill-footer slot='footer' :visible.sync='dialogVisible' :loading='saveLoading' :shareData='shareData' :confirmButtonEvent='handleClickSave' confirmButtonText='保存' />
  </ky-dialog>
</template>

<script>
import { reactive, ref, nextTick, watch, toRefs } from '@vue/composition-api'
import { throttle } from 'lodash'
import { getFormData, getShareData } from '../utils/formData'
import SingleInfoWhole from './single-info-whole'
import DialogWaybillFooter from './dialog-waybill-footer'
import deliveryUtil from '@/utils/deliveryUtil'

export default {
  components: {
    SingleInfoWhole,
    DialogWaybillFooter,
  },
  activated () {
    this.$store.dispatch('supplier/setExistSupplierInfoAction')
  },
  setup (props, { emit, root }) {
    const loading = ref(false)
    const dialogVisible = ref(false)
    const dialogVisibleCopy = ref(false) //解决窗体关闭时闪烁问题
    const ydNo = ref('')
    const isParentWaybill = ref(false)
    const singleInfoWholeRef = ref(null)
    const shareData = reactive(getShareData())
    const formData = reactive(getFormData())
    const state = reactive({
      saveLoading:false
    })

    watch(dialogVisible, flag => {
      if (!flag) {
        singleInfoWholeRef.value.clearFormData({ inFormData: formData, inShareData: shareData })
        singleInfoWholeRef.value.hideDialog()
      }
    })

    const handleClickSave = throttle(async function () {
      try{
        state.saveLoading = true
        await saveData()
      }finally{
        state.saveLoading = false
      }
    },1000)

    const saveData = async function () {
      await deliveryUtil.sleep(300)
      if(loading.value){
        await saveData()
        return
      }

      const result = await singleInfoWholeRef.value.saveData()
      if (result) {
        dialogVisible.value = false
        nextTick(() => dialogVisibleCopy.value = false)
        emit('save-success', { isParentWaybill: isParentWaybill.value })
      }
    }

    const showDialog = waybillNumber => {
      ydNo.value = waybillNumber
      dialogVisible.value = true
      dialogVisibleCopy.value = true
      nextTick(async () => {
        try{
          state.saveLoading = true
          const wholeRef = singleInfoWholeRef.value
          await root.$store.dispatch('client/setCustomerMappingFieldAction')
          const model = await wholeRef.getWaybillByWaybillNumber()
          isParentWaybill.value = model.waybillParentInden === 10
          if (shareData.waybillModifyStatus === '20') {
            root.$message.warning('运单已调度且服务方式为内部件或特惠时不支持修改')
            dialogVisible.value = false
            return
          }
          await wholeRef.showModel(model)
        }finally{
          state.saveLoading = false
        }
      })
    }

    return {
      singleInfoWholeRef,
      ydNo,
      loading,
      dialogVisible,
      dialogVisibleCopy,
      shareData,
      formData,
      ...toRefs(state),
      handleClickSave,
      showDialog
    }
  }
}
</script>

<style lang='scss'>
  .client-mode {
    .dialog-waybill-modify--container {
      .el-dialog__footer {
        min-height: 56px;
      }
    }
  }
</style>
<style lang='scss' scoped>
  .ky-dialog {
    /deep/ .el-dialog__body {
      padding: 12px 0 !important;
      margin: 0 !important;
      background-color: #fff;

      .notice-container {
        min-width: 708px;
      }

      .yd-no {
        margin-left: auto;
        display: flex;
        align-items: center;
        padding-left: 8px;
        font-size: 12px;
        font-weight: bold;
        height: 28px;
        color: rgba(51, 51, 51, 0.93);
        background: url('~@/assets/image/shipment/yd-no-bg.png') no-repeat;
        background-position-x: right;

        button {
          position: relative;
          padding-left: 25px;
          font-size: 12px;
          &::before {
            content: '';
            display: block;
            position: absolute;
            right: 60px;
            top: 8px;
            width: 1px;
            height: 14px;
            background: #dcdae2;
          }

          .icon-copy {
            padding-right: 6px;
          }
        }
      }

      .single-info-whole--container {
        background-color: #fff;

        .notices {
          left: 50%;
          transform: translateX(-50%);
        }
      }
    }
  }
</style>

