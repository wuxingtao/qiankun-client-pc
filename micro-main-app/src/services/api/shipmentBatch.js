import request from './request'
import { getPhone, getCustomerCode } from '@/utils/storage' 

//校验到付
export function verifyReceiverPay(receiverAddress){ 
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(), 
    sjAddress:receiverAddress
  }   
  return request({
    headerUrl: 'E-AWBSJAddressDF',
    method: 'post',
    data: params
  })
}

//校验导入数据
export async function verifyImportData(modelList,params){
  let tempParams = params
  if(!params || !params.taskId){
    tempParams= {
      companyNo: getCustomerCode(),
      mobile:getPhone(), 
      dataList:modelList
    }      
    tempParams=Object.assign(tempParams,params) 
  }
  
  let result = await request({
    headerUrl: 'inc.client.vaildImportWaybill',
    method: 'post',
    data: tempParams, 
    hideErrMsg: true,
  })
  if(result.code==601&&result.taskId){
    tempParams = {taskId : result.taskId}
    // tempParams.taskId=result.taskId 
    await new Promise(resolve=>{setTimeout(resolve,500)})
    return await verifyImportData(null,tempParams)
  }
  return result
}

//批量上传
export async function uploadImportData(modelList,mainProduct){ 
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(), 
    WaybillSource:'140',
    mainProduct,
    dataList:modelList
  }   
  const res = await request({
    headerUrl: 'E-AWBUploadData',
    method: 'post',
    data: params,  
  })
  return res 
}

//批量修改
export function modifyImportData(modelList){ 
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(), 
    datas:modelList
  }   
  return request({
    headerUrl: 'E-AWBBatchUpdate',
    method: 'post',
    data: params,  
  })
}

function getQueryServiceWayByBatchParams(modelList){
  const customCode=getCustomerCode()
  const list=modelList.map(m=>
    ({  id:m.no,
      payWay:m.payWay,
      payAccount:m.payWay==='寄方付'?customCode:m.payAccount,
      sjCompany:m.sjCompany,
      jjCompany:m.jjCompany,
      qhAddress:m.qHAddress,
      sjAddress:m.sjAddress,
    }))
  let params= {
    companyNo: customCode,
    mobile:getPhone(), 
    serviceModelQueries:list
  }   
  return params
}
//批量获取服务方式
export async function queryServiceWayByBatchAsync(modelList,params){ 
  let tempParams = params?params: getQueryServiceWayByBatchParams(modelList)  
  let res = await request({
    headerUrl: 'inc.client.batchQueryServiceModelSync',
    method: 'post',
    data: tempParams,
    hideErrMsg: true,
  })
  if(res.code==601&&res.taskId){
    tempParams = {taskId:res.taskId }
    await new Promise(resolve=>{setTimeout(resolve,500)})
    return await queryServiceWayByBatchAsync(null,tempParams)
  }
  return res
}

// 通过客户代码查询九牧王地址薄
export function queryAddressByCode(params) {
  return request({
    headerUrl: 'PC-GetOutAddressBookForJiuMuWang',
    method: 'post', 
    data: params
  })
}