const waybillConditionKey='client-waybillCondition2' 
const waybillTablePageIndexKey='client-waybillTablePageIndex'
const waybillTablePageSizeKey='client-waybillTablePageSize'

//设置运单查询条件缓存
export function setWaybillCondition(data){
  if(data){
    sessionStorage.setItem(waybillConditionKey, JSON.stringify(data))
  }else{
    sessionStorage.removeItem(waybillConditionKey)
  }    
}
//读取运单查询条件缓存
export function getWaybillCondition(){
  return JSON.parse(sessionStorage.getItem(waybillConditionKey)) 
}

//设置或读取运单表格当前页
export function waybillTablePageIndex(pageIndex){
  if(pageIndex){
    sessionStorage.setItem(waybillTablePageIndexKey, pageIndex)
  }else{
    const index=  sessionStorage.getItem(waybillTablePageIndexKey)
    return Number(index)|| 1
  }
}

//设置或读取运单表格一页显示的数量
export function waybillTablePageSize(pageSize){
  if(pageSize){
    sessionStorage.setItem(waybillTablePageSizeKey, pageSize)
  }else{
    const size=  sessionStorage.getItem(waybillTablePageSizeKey)
    return Number(size)
  }
}