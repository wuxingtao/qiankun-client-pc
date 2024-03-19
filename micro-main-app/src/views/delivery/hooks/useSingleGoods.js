import deliveryApi from '@api/delivery'
import { computed ,nextTick} from '@vue/composition-api'

export default function ({vm,formData,shareData,singleInfoBaseFormRef,errorMsgs,
  warningMsgs,initSuggestionData,setSuggestionInfo}){
  const historyGoodsList = computed(()=>{
    return vm.$store.getters.historyGoodsList
  })
  
  const queryGoodsList =(queryString, cb) =>{
    let results = historyGoodsList.value
    if (queryString && results  && results.length > 0) {
      results =results.filter(g => g && g.includes(queryString))
    }
    cb(results.filter((i, index) => index < 4).map(m => ({ 'value': m })))
  }

  const verifyGoods = async fieldName =>{
    if (fieldName === 'serviceWay') {
      singleInfoBaseFormRef.value.validateField('vipshopCode')
    }
    if (!formData.goods || !formData.serviceWay) {
      return
    }
    errorMsgs.goods = ''
    warningMsgs.goods = ''
    try {
      const res = await deliveryApi.validateWaybillField(formData,['goods','serviceWay'],true)
      const warnResult = res?.data?.warnResult
      if(warnResult?.length>0){
        warningMsgs.goods = warnResult.find(f=>f.field === 'goods')?.msg
      }
      if(res.code === 0 || !res.msg ){
        return
      }
     
      formData.NeedUnbox = 1
      nextTick(()=> errorMsgs.goods = res.msg)
      shareData.visibleOfOpenBoxTip = true
    }
    catch(ex) {
      console.log('ex :>> ', ex)
      // errorMsgs.goods = '托寄物校验失败，请稍候再试'
    }
  }

  const changeOfGoods = async()=> {
    initSuggestionData()
    await singleInfoBaseFormRef.value.validateField('goods')
    if (!formData.goods) {
      return
    }
    verifyGoods()
    let goodsTypeList
    let historyData
    const res = await deliveryApi.queryGoodsAttributes(formData.goods)
    const res2 = await deliveryApi.queryGoodsAditionalServices(formData.goods)
    goodsTypeList = res.data?.rows.map(t => t.goodsType)
    historyData = res2.data
    setSuggestionInfo(goodsTypeList, historyData)
  }

  return {
    verifyGoods,
    changeOfGoods,
    queryGoodsList
  }
}