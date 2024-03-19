<template>
  <ky-dialog title="弹窗示例" :visible.sync="dialogVisible" is-form-page confirm-text="保存" @confirm="handleConfirm">
    弹窗示例
     <el-input placeholder="请输入公司名称" v-model.trim="company" clearable></el-input>
  </ky-dialog>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import useDialogVisibleSync from '@/hooks/useDialogVisibleSync'

export default {
  props:{
    visible: {
      type: Boolean,
      default: false,
    },
  },
  setup(props,{emit}){
    const { dialogVisible } = useDialogVisibleSync({ props, emit })

    const state = reactive({
      company:''
    })

    const handleConfirm =()=>{
      console.log('点击保存时做的操作')
      state.dialogVisible =false
    }
    return{
      dialogVisible,
      ...toRefs(state),
      handleConfirm,
    }
  }
}
</script>

<style>

</style>