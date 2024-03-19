import request from '@/services/api/request'
import { getPhone, getCustomerCode } from "@/utils/storage"
/* 新 */
// 地址簿列表
export function addressListQuery(params) {
  return request({
    headerUrl: 'inc.client.contactPersonQuery' ,
    method: 'post' ,
    data: params
  })
}

// 收件方地址薄新增
export function addressAdd(params , hideErrMsg = false) {
  return request({
    headerUrl: 'WEB_SJPersonInfoAdd' ,
    method: 'post' ,
    hideErrMsg ,
    data: params
  })
}

// 更新地址
export function addressUpdate(params){
  return request({
    headerUrl: 'inc.client.UpdateContactPerson' ,
    method: 'post' ,
    data: params
  })
}
// 收件方地址薄删除
export function addressDelete(params) {
  return request({
    headerUrl: 'inc.client.DeleteContactPerson' ,
    method: 'post' ,
    data: params
  })
}

//获取全部地址
export async function  getAllContacterList(){
  const key = 'WAYBILL_ALL_CONTACTER_LIST'
  const jsonString = sessionStorage.getItem(key)
  if(jsonString){
    return  JSON.parse(jsonString)
  } 
  const params = {
    pageIndex:  '1' ,
    pageSize:  '10000' ,
    Keyword: '' ,
    mobile: getPhone(),
    companyNo: getCustomerCode()
  }
  const res=await addressListQuery(params)
  if(res.code===0&&res.data){  
    sessionStorage.setItem(key, JSON.stringify(res.data.dataList))
    return res.data.dataList
  }
}
