
import { watch,ref} from '@vue/composition-api'

export default function({emit,props}){
  if(!props.hasOwnProperty('visible')){
    console.error('useDialogVisibleSync中props参数必须含有visible属性')
    return
  }
  const dialogVisible = ref(false)

  watch(()=>props.visible,val=>{
    dialogVisible.value = val
  })
  watch(dialogVisible,val=>{
    if (!val) {
      emit('update:visible', false)
    }
  })
  return {
    dialogVisible
  }
}