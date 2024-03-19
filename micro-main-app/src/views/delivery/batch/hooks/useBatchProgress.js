import { reactive , watch} from '@vue/composition-api'
import store from '@/store'
import deliveryProgress from '@utils/deliveryProgress'

export default function(){

  const progressState =  reactive({
    importLoading:false,
    importProgress:0
  })
  
  const importStepEnum = deliveryProgress.importStepEnum
  const setImportProgressByApiResData = deliveryProgress.setImportProgressByApiResData

  watch(()=>progressState.importLoading,flag=>{
    if(flag){
      store.commit('delivery/setImportProgess',0)
      progressState.importProgress = 0
    }
  }) 

  const setImportProgress = stepType =>{
    // if(stepType === importStepEnum.LOADEXCEL){
    //   progressState.importProgress = 1
    //   return 
    // }
    // if(stepType === importStepEnum.INITTABLE){
    //   progressState.importProgress = 5
    //   return 
    // }
    const currentMaxProgress = deliveryProgress.getMaxProgressByApiOrStep(null,stepType) 
    // if(currentMaxProgress < 1){
    //   return
    // }
    const interval = setInterval(() => {
      const currentProgress = store.state.delivery.importProgess
      if(progressState.importProgress > currentMaxProgress 
        || currentProgress >= currentMaxProgress 
        || !progressState.importLoading){
        window.clearInterval(interval)
      }
      // console.log('progress :>> ', currentProgress)
      if(currentProgress > progressState.importProgress) {
        progressState.importProgress = currentProgress
      }else if(progressState.importProgress < currentMaxProgress){
        progressState.importProgress ++
      }
    }, 500)
    return interval
  }

  return{
    progressState,
    importStepEnum,
    setImportProgress,
    setImportProgressByApiResData
  }
}