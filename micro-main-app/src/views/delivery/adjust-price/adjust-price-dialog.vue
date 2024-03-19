<template>
  <ky-dialog title="调价通知" :visible.sync="dialogVisible" confirm-text="同意" cancel-text="拒绝" @cancel="handleCancel" @confirm="handleConfirm">
     <weight/>
  </ky-dialog>
</template>

<script>
import { reactive, toRefs } from '@vue/composition-api'
import Weight from './components/weight.vue'

export default {
  components:{
    Weight
  },
  setup(props,{emit}){
    const state = reactive({
      dialogVisible:false
    })

    const showDialog = () => {
      state.dialogVisible = true
    }

    const handleConfirm = () => {
      console.log('点击保存时做的操作')
      state.dialogVisible =false
    }

    const handleCancel = () => {

    }
    return{
      ...toRefs(state),
      showDialog,
      handleConfirm,
      handleCancel
    }
  }
}
</script>

<style>

</style>