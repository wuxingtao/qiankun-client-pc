/**
 * @Desc: useWeightSizeValidate
 * @Author: wu xingtao
 * @Date: 2022/1/4
 */
import store from '@/store'
import deliveryUtil from '@/utils/deliveryUtil'

export default function() {
  const planeTypeList = ['bigFlightInfo','mindFlightInfo','minFlightInfo']

  const toNumber = n =>  Number(n) || 0

  function checkOverSize(size) {
    const { minLength, lengthCompareFlag } = store.state.delivery.lengthAndWeightInitial || {}
    if (lengthCompareFlag === '10') {
      const flag =
         (minLength || minLength === 0) &&
         size &&
         (size.width > minLength || size.height > minLength || size.length > minLength)
      return flag
    } else {
      const flag =
         (minLength || minLength === 0) &&
         size &&
         (size.width >= minLength || size.height >= minLength || size.length >= minLength)
      return flag  
    }
  }
 
  function checkOverWeight(weight){
    const { minWeight, weightCompareFlag } = store.state.delivery.lengthAndWeightInitial || {}
    if (weightCompareFlag === '10') {
      const flag = (minWeight || minWeight === 0) && weight && weight > minWeight
      return flag
    } else {
      const flag = (minWeight || minWeight === 0) && weight && weight >= minWeight
      return flag
    }
  }
  /**
   * 检查尺寸超载
   * @param {Object} planeInfo 飞机信息
   * @param {Object}  size 尺寸信息 {length,width,height}
   * @returns 机信息为空则返回0，超载返回1，不超载返回-1
   */
  function checkSizeOverloadOfPlane(planeInfo,size) {
    const {length:planeLength,width:planeWidth,height:planeHeight} = planeInfo || {}
    const {length,width,height} = size || {}
    const planeSize = [planeLength  ,planeWidth , planeHeight].map(f=>toNumber(f)).sort((a,b)=>b-a)
    size = [length,width,height].map(f=>toNumber(f)).sort((a,b)=>b-a)
    if(planeSize.every(s=>s<=0)){
      return 0
    }
    const isOverload = [0,1,2].some(i=>size[i]>planeSize[i])
    return isOverload ? 1 : -1
  }
  /**
   * 检查重量超载
   * @param {Object} planeInfo 飞机信息
   * @param {Number} weight 
   * @returns 飞机信息为空则返回0，超载返回1，不超载返回-1
   */
  function checkWeightOverloadOfPlane(planeInfo,weight) {
    if( (planeInfo?.overWeight || 0) <=0 ){
      return 0
    }
    const isOverload = weight > planeInfo.overWeight 
    return isOverload ? 1 : -1
  }
 
  function exsitsPlanInfo(planeListInfo){
    if(!planeListInfo || planeTypeList.every(f=>!planeListInfo[f])){
      return false
    }
    return true
  }
  
  //是否是中/小飞机超载，但大/中飞机不超载
  function isOverLoadButNotBigPlane(planeListInfo,checkType,checkValue){
    let checkFunc = checkSizeOverloadOfPlane
    if(checkType === 'weight'){
      checkFunc = checkWeightOverloadOfPlane
    }
    const overloadOfPlane = type => checkFunc(planeListInfo[type],checkValue) === 1
    const notOverloadOfPlane = type => checkFunc(planeListInfo[type],checkValue) === -1
    const overloadOfSmallOrMiddlePlane = overloadOfPlane('minFlightInfo') || overloadOfPlane('mindFlightInfo')
    const notOverloadOfMiddleOrBigPlane = notOverloadOfPlane('mindFlightInfo') || notOverloadOfPlane('bigFlightInfo')
    const flag = overloadOfSmallOrMiddlePlane &&  notOverloadOfMiddleOrBigPlane
    return flag
  }

  function isOverLoadPlane(planeListInfo,checkType,checkValue){
    let checkFunc = checkSizeOverloadOfPlane
    if(checkType === 'weight'){
      checkFunc = checkWeightOverloadOfPlane
    }
    if(checkFunc(planeListInfo['minFlightInfo'],checkValue) === 1){
      return true
    }
    if(checkFunc(planeListInfo['mindFlightInfo'],checkValue) === 1){
      return true
    }
    if(checkFunc(planeListInfo['bigFlightInfo'],checkValue) === 1){
      return true
    }
  }
  
  function isAirMailServiceWay(serviceWay){
    serviceWay = deliveryUtil.getServiceWayCode(serviceWay,false)
    const airMailServiceWays = ['10','20','60','80','210','340','1300']
    if(airMailServiceWays.includes(serviceWay+'')){
      return true
    }
  }

  function getOverWeightMessage({planeListInfo,weight,serviceWay,count}){
    if(toNumber(weight)<=0){
      return
    }
    count = Number(count) > 0 ? count : 1
    weight = weight / count
    const overWeightAndOverloadMsg = '物品重量超出航线最大承重可能会影响时效，并且已超重将收取超重费用，详情可联系商务'
    const overWeightMsg = '物品重量已超重将收取超重费用'
    const overloadMsg = '物品重量已超出路线航班最大承重，可能影响时效，详情可联系商务'
    const overWeightAndOverloadButNotBigPlaneMsg = '物品重量超出中小型飞机最大承重，并且已超重将收取超重费用，详情可联系商务'
    const OverloadButNotBigPlaneMsg = '物品重量超出中小型飞机最大承重，可联系商务为您安排大型飞机'
    const isOverWeight = checkOverWeight(weight)

    if(!isAirMailServiceWay(serviceWay)){
      return isOverWeight ? overWeightMsg : ''
    }
    if(!exsitsPlanInfo(planeListInfo) ){
      if(weight > 80){
        return isOverWeight ? overWeightAndOverloadMsg : overloadMsg
      }else{
        return isOverWeight ? overWeightMsg : ''
      }
    }
   
    if( isOverLoadButNotBigPlane(planeListInfo,'weight',weight)){ 
      return isOverWeight ? overWeightAndOverloadButNotBigPlaneMsg : OverloadButNotBigPlaneMsg
    }
    const isOverLoad = isOverLoadPlane(planeListInfo,'weight',weight)
    if(isOverLoad){
      return isOverWeight ? overWeightAndOverloadMsg : overloadMsg
    }else{
      return isOverWeight ? overWeightMsg : ''
    }
  }

  /**
   * 
   * @param {Object} planeListInfo 飞机信息
   * @param {Object} size 尺寸 {length,width,height}
   * @returns 
   */
  function getOverSizeMessage(planeListInfo,size,serviceWay){
    if( !size?.length || !size?.width || !size?.height){
      return 
    }
    const overSizeAndOverloadMsg = '物品尺寸超出航线最大承载尺寸可能会影响时效，并且已超长将收取超长费用，详情可联系商务'
    const overSizeMsg = '物品尺寸已超长将收取一定的超长费'
    const overloadMsg = '物品尺寸已超出路线航班最大承载尺寸，可能影响时效，详情可联系商务'
    const overSizeAndOverloadButNotBigPlaneMsg = '物品尺寸超出中小型飞机最大承载尺寸，并且已超长将收取超长费用，详情可联系商务'
    const OverloadButNotBigPlaneMsg = '物品尺寸已超出中小型飞机最大承载尺寸，可联系商务为您安排大型飞机'
    const isOverSize = checkOverSize(size)
    if(!isAirMailServiceWay(serviceWay)){
      return isOverSize ? overSizeMsg : ''
    }
    const defaultPlaneSize = {length:250,width:90,height:80}
    if(!exsitsPlanInfo(planeListInfo)){
      if(checkSizeOverloadOfPlane(defaultPlaneSize,size) === 1){
        return isOverSize ? overSizeAndOverloadMsg : overloadMsg
      }else{
        return isOverSize ? overSizeMsg : ''
      }
    }
    
    if( isOverLoadButNotBigPlane(planeListInfo,'size',size)){ 
      return isOverSize ? overSizeAndOverloadButNotBigPlaneMsg : OverloadButNotBigPlaneMsg
    }
    const isOverLoad = isOverLoadPlane(planeListInfo,'size',size)
    if(isOverLoad){
      return isOverSize ? overSizeAndOverloadMsg : overloadMsg
    }else{
      return isOverSize ? overSizeMsg : ''
    }
  }
 
  return {
    getOverWeightMessage,
    getOverSizeMessage,
  }
}
 