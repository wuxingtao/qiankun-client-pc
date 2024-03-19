import request from './request'
import { getPhone,getCustomerCode } from '@/utils/storage'
import { getLoginCompanyName } from '@utils/clientUtil'

//是否存在供应商信息
export async function existSupplierInfo(){
  const params={
    page:1,
    pageSize:1,
  }
  const res= await getSupplierList(params)
  return res.code===0&&res.data.rowTotal>0
}

//查询当前用户的供应商状态
export function getCurrentUserSupplierStatus() {
  const params={
    customerCode:getCustomerCode()
  }
  return request({
    headerUrl: 'web.supplier.supplierInfo.qrySupplierStatus',
    method: 'post',
    data: params
  })
}

//查询供应商列表
export async function getSupplierList(params) {
  if(params){
    params.customerCode=getCustomerCode()
  }
  return request({
    headerUrl: 'web.supplier.supplierInfo.search',
    method: 'post',
    data: params
  })
}

//查询供应商列表(特殊)
export async function getSpecialSupplierList(params) {
  if(params){
    params.customerCode=getCustomerCode()
  }
  const res=await request({
    headerUrl: 'web.supplier.supplierInfo.searchSpecial',
    method: 'post',
    data: params
  })
  if(res.code===0&&res.data.rowTotal>0){
    res.data.rows.forEach(el=>{
      console.log(el.agingAchievedRate>0,el.agingAchievedRate)
      el.agingAchievedRate=el.agingAchievedRate>0?el.agingAchievedRate+'%':0
    })
  }
  return res
}


//添加供应商
export function addSupplier(params) {
  return request({
    headerUrl: 'web.supplier.supplierInfo.save',
    method: 'post',
    data: params
  })
}

//修改供应商
export function modifySupplier(params) {
  return request({
    headerUrl: 'web.supplier.supplierInfo.update',
    method: 'post',
    data: params
  })
}

//修改供应商状态
export function modifySupplierStatus(params) {
  return request({
    headerUrl: 'web.supplier.supplierInfo.updateStatus',
    method: 'post',
    data: params
  })
}

//修改供应商下单列表运单号
export function updateAllocationWaybillNumber(params) {
  if(params){
    params.forEach(p=>{
      p.orderCompanyName=getLoginCompanyName(true)
    })
  }
  return request({
    headerUrl: 'web.supplier.updateWaybillNumbers',
    method: 'post',
    data: params
  })
}

//查询供应商下单列表
export function getAllocationList(params) {
  if(params){
    params.loginPhone=getPhone() 
  }
  return request({
    headerUrl: 'web.supplier.distributionInfo.search',
    method: 'post',
    data: params
  })
}

//保存供应商下单列表
export function saveAllocation(params) {
  if(params){
    params.loginPhone=getPhone()
  }
  return request({
    headerUrl: 'web.supplier.distributionInfo.save',
    method: 'post',
    data: params
  })
}

//修改供应商下单列表
export function modifyAllocation(params) {
  if(params){
    params.loginPhone=getPhone()
    params.updatedBy=getPhone()
  }
  return request({
    headerUrl: 'web.supplier.distributionInfo.update',
    method: 'post',
    data: params
  })
}

//删除供应商下单列表
export function deleteAllocation(params) {
  if(params){
    params.loginPhone=getPhone()
    params.enabledFlag='0'
  }
  return request({
    headerUrl: 'web.supplier.distributionInfo.delete',
    method: 'post',
    data: params
  })
}
//SKU分页查询
export function getItemInfoList(params) {
  return request({
    headerUrl: 'web.supplier.itemInfo.search',
    method: 'post',
    data: params
  })
}

//SKU新增
export function addItemInfo(params) {
  return request({
    headerUrl: 'web.supplier.itemInfo.save',
    method: 'post',
    data: params
  })
}

//SKU修改
export function updateItemInfo(params) {
  return request({
    headerUrl: 'web.supplier.itemInfo.update',
    method: 'post',
    data: params
  })
}

//SKU更新商品启用状态 
export function updateItemInfoStatus(params) {
  return request({
    headerUrl: 'web.supplier.itemInfo.updateStatus',
    method: 'post',
    data: params
  })
}

//根据ID查询SKU信息web.supplier.itemInfo.batchSave
export function getItemInfoById(params) {
  return request({
    headerUrl: 'web.supplier.itemInfo.searchById',
    method: 'post',
    data: params
  })
}

//批量导入
export function itemInfoBatchSave(params) {
  let newParams={
    itemInfoVos:params,
    supplierPhone:getPhone(),
    supplierName:getLoginCompanyName(true),
    customerCode:getCustomerCode(),
    createBy:getPhone()
  }
  return request({
    headerUrl: 'web.supplier.itemInfo.batchSave',
    method: 'post',
    data: newParams
  })
}
