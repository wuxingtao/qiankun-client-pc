import deliveryApi from '@api/delivery'
let notifyInstance = null
export default function({vm}){

  const closeNotify = () => {
    if(notifyInstance){
      notifyInstance.closed = true
    }
  }
  const loadAdjustNotice = async msg =>{
    // console.log('notifyInstance :>> ', notifyInstance)
    if(notifyInstance&&!notifyInstance.closed){
      return
    }
    // notifyInstance =  vm.$ky_notify({
    //   type: 'warning',
    //   title: '时效延迟提醒',
    //   duration: 0,
    //   dangerouslyUseHTMLString: true,
    //   message: `
    //   由于贵司未同意《跨越速运价格调整政策》，上门
    //   <span style="color:#FF8038;">asdf</span>
    //   `,
    //   // onConfirm:()=>
    // })
    if(!msg){
      const res = await deliveryApi.getAdjustPriceInfo()
      const { strategyFlag, adjustType, customerTips } = res.data || {}
      if(res.code !== 0 || strategyFlag !== 2 || adjustType !== '10' || !customerTips){
        return
      }
      msg =  `
      由于贵司未同意《跨越速运价格调整政策》，上门
      <span style="color:#FF8038;">${customerTips}</span>
      ` 
    }
    notifyInstance = vm.$ky_notify({
      type: 'warning',
      title: '时效延迟提醒',
      duration: 0,
      dangerouslyUseHTMLString: true,
      message: msg,
      // onConfirm:()=>
    })
  }

  return {
    loadAdjustNotice,
    closeNotify
  }

}