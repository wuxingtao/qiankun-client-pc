<template>
  <ky-dialog
    title="添加客户编码"
    :visible.sync="dialogVisible"
    custom-class="customer-code-add-dialog"
    is-form-page
    width="400px"
    @confirm="handleConfirm"
  >
    <customer-code-form ref="customerCodeFormRef"/>
  </ky-dialog>
</template>

<script>
import { reactive, ref, toRefs } from '@vue/composition-api'
import useDialogVisibleSync from '@/hooks/useDialogVisibleSync'
import CustomerCodeForm from './customer-code-form'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    CustomerCodeForm
  },
  setup(props, { emit }) {
    const customerCodeFormRef = ref(null)
    const { dialogVisible } = useDialogVisibleSync({ props, emit })

    const state = reactive({
      customerCode: ''
    })

    const handleConfirm = async () => {
      const flag = await customerCodeFormRef.value.handleBindCustomerCode()
      if(flag){
        dialogVisible.value = false
      }
    }
    return {
      customerCodeFormRef,
      dialogVisible,
      ...toRefs(state),
      handleConfirm
    }
  }
}
</script>

<style lang="scss" scoped>
.customer-code-add-dialog{
  .customer-code-form__container{
    padding: 24px 20px;
    background: url('~@/assets/image/setting/user/customer-code3-bg.png') no-repeat 
  }
}


</style>