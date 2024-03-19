import {queryPaymentTypes,querySkuList,getHistoryGoodsList} from '@/services/api/shipment'
import {getSystemConfig,getEncryptInfo,getCustomerProjectInfo,getPrintConfig,getServiceAll,getPayCustomerInfo,getTemplateList,getGoodsBatchTimes,getUserPermissionApi, getCustomerServiceTypes, getPayCustomerList,GetRequirementNew,getGoodsBatch} from '@/services/api/common'
import {convertEncryptListToString} from '@/utils/clientUtil'
import {getCustomerizedPermission} from '@/services/api/report'
import selfSignApi from '@/services/api/self-sign'

class CacheOfWaybill{
  async getUserPermission(){
    const res=await getUserPermissionApi()
    if(res.code==0 &&res.data&&res.data.list&&res.data.list.resourcesID){
      const  resourcesID=res.data.list.resourcesID
      return resourcesID
    }
  }

  async getPrintConfig(){
    const res=await getPrintConfig()
    if(res.code==0 &&res.data){
      return res.data
    }
  }

  async getPaymentTypes(){
    const res=await queryPaymentTypes()
    if(res.code==0 &&res.data&&res.data.payWays){
      return res.data.payWays
    }
  }

  async getRequirementConfig(){
    const res=await GetRequirementNew()
    if(res.code==0 &&res.data?.length>0){
      const data = res.data[0]
      const flag=data.recoveryReceiptFlag
      if(flag=='10') {
        data.recoveryReceiptFlag='20'
      }else if(flag=='20') {
        data.recoveryReceiptFlag='10'
      }
      return data
    }
  }

  async getPrintEncryptText(){
    const res=await getEncryptInfo()
    if(res.code==0 &&res.data){
      const info=res.data.find(d=>d.waybillType==30)
      const encryptText= convertEncryptListToString(info&&info.fieldsList)
      if(!encryptText){
        return
      }
      return encryptText
    }
  }

  async getSystemConfig(){
    const res=await getSystemConfig()
    if(res.code==0 &&res.data&&res.data.dataList){
      return res.data.dataList
    }
  }

  async getCustomerProjectInfo(){
    const res=await getCustomerProjectInfo()
    if(res.code==0 &&res.data){
      return res.data
    }
  }

  async getServiceWays(){
    const res=await getServiceAll()
    if(res.code==0 &&res.data&&res.data.serviceWay){
      return res.data.serviceWay
    }
  }

  async getPayCustomerInfo(){
    const res=await getPayCustomerInfo()
    if(res.code==0 &&res.data){
      return res.data
    }
  }

  async getHistoryGoodsList(){
    const res=await getHistoryGoodsList()
    if (res.code === 0 && res.data) {
      const data = res.data.map(m => m.article)
      return data
    }
  }

  async getHistorySkuList(){
    const res=await querySkuList()
    if (res.code === 0 && res.data) {
      const data = res.data.map(m => m.article) //TODO 需验证是否正确
      return data
    }
  }

  async getGoodsBatchTimes(){
    const res=await getGoodsBatchTimes()
    if (res.code === 0 && res.data) {
      return res.data
    }
  }

  async getTemplateList(){
    const res=await getTemplateList()
    if (res.code === 0 && res.data) {
      return res.data
    }
  }

  async getCustomerizedPermission(){
    const res=await getCustomerizedPermission()
    if (res.code === 0 && res.data) {
      return res.data
    }
  }

  // 2021.10重构后
  async getNewServiceWays(){
    const res=await getCustomerServiceTypes()
    if(res.code==0 &&res.data){
      return res.data
    }
  }

  async getNewPayCustomerInfo(){
    const res=await getPayCustomerList()
    if(res.code==0 &&res.data){
      return res.data
    }
  }

  async getChildParentAuthority(){
    const res=await GetRequirementNew()
    if(res.code==0 &&res.data){
      return res.data[0].parentChildFlag==='10'
    }
    return false
  }

  async getGoodsBatchTimesNew(){
    const res=await getGoodsBatch()
    if (res.code === 0 && res.data) {
      return res.data
    }
  }

  async getUserType(){
    const res=await selfSignApi.getUserExternalType()
    if (res.code === 0 && res.data) {
      return res.data
    }
  }

}

export default new CacheOfWaybill()
