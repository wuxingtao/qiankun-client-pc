import request from './request'
import { getPhone, getCustomerCode ,getUserData} from '@/utils/storage'
import dayjs from 'dayjs'

//查询下单记录
export function queryWaybillRecord(sendAddress,receivesAddress){
  const params={
    sendAddress,
    receivesAddress,
    moblile:getPhone()
  }
  return request({
    headerUrl: 'inc.client.getKaWaybillInfoByAddress',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

//检查最近一票填写重量与真实重量是否超过300公斤
export function checkOverWeightFlag(){
  return request({
    headerUrl: 'inc.client.weightTips',
    method: 'post',
    data: {},
    hideErrMsg:true
  })
}

//查询预估运费和回单费
export function queryEstimateFee(params){
  return request({
    headerUrl: 'web.client.getOrderCost',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

//地址取派提醒
export function checkAddressTakeAndSendRemind(senderAddress,receiverAddress,serviceWay,addDays){
  const {customerType}=getUserData().customerInfo
  let params= {
    customerCode: getCustomerCode(),
    goodsTime: dayjs().format('YYYY-MM-DD HH:mm'),
    list:[{
      customerType,
      serviceMode:serviceWay,
      mailInfo:{
        address:senderAddress
      },
      receiveInfo:{
        address:receiverAddress
      },
      id:1, 
      addDays
    }]
  }
  return request({
    headerUrl: 'web.order.takeSend.remind',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//地址预警校验
export function checkAddressLimit(senderAddress,receiverAddress){
  let params= {
    customerCode: getCustomerCode(),
    senderAddress,
    receiverAddressList:[receiverAddress]
  }
  return request({
    headerUrl: 'wechat.order.checkLimit',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}
//获取运单号
export function getWaybillNos(count=1){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
    Count:count
  }
  return request({
    headerUrl: 'E-GetYdCodes',
    method: 'post',
    data: params
  })
}

//查询仓库列表
export function queryWarehouseList(pageIndex,warehouseType,warehouseName){
  let params={page:pageIndex,
    pageSize:50,
    warehouseType,
    warehouseNumber:warehouseName,
    warehouseName:''
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'crm.common.warehouse.openSearch',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false,
  })
}

//查询付款方式
export function queryPaymentTypes(){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
  }
  return request({
    headerUrl: 'E-GetPayWay',
    method: 'post',
    data: params
  })
}

//验证付款账号
export function validatePaymentAccount(paymentAccount){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
    CompanyNos:[{CompanyNo:paymentAccount}]
  }
  return request({
    headerUrl: 'PC-VaildCompanyNos',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}
//验证违禁品
export function validateGoods(goods,serviceWay){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
    goods,
    serviceWay
  }
  return request({
    headerUrl: 'inc.client.getContrabandInfo', //E-AWBIsContainsContraband
    method: 'post',
    data: params
  })
}

/**
 * 验证地址是否限行
 * @param {Array} addressList 数组里的每项必须包含address和id属性
 */
export function validateLimitedDelivery(addressList){
  addressList=Array.from(new Set(addressList))
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
    addressList:addressList
  }
  return request({
    headerUrl: 'gw.restrict.restrictBatchSearch',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//填单地址解析
export function anlysisWayBillAddressInfo(params){
  let tempParams= {
    company: getCustomerCode(),
    mobile:getPhone(),
  }
  tempParams=Object.assign(tempParams,params)
  return request({
    headerUrl: 'E-AnlysisBillAddress',
    method: 'post',
    data: tempParams,
    hideErrMsg: true,
  })
}

//新增运单(model中运单号不能为空)
export function addWaybill(modelList){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
    WaybillSource:'140',
    dataList:modelList
  }
  return request({
    headerUrl: 'E-AWBUploadDataWithYd',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}
//修改运单
export function modifyWaybill(data){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone()
  }
  Object.assign(params,data)
  return request({
    headerUrl: 'E-AWBUpdate',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

//保存sku
export function saveSku(goodsName,goodsWeight,goodsLength,goodsWidth,goodsHeight){
  let params={
    customerCode:getCustomerCode(),
    goodsName,
    goodsWeight,
    goodsLength,
    goodsWidth,
    goodsHeight,
    'flexVarchar1':'30'
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'crm.customer.sku.client.save',
      param: JSON.stringify(params)
    },
    method: 'post',
    token: false,
    hideErrMsg: true,
  })
}


//查询sku
export function querySkuList(goodsName,goodsWeight,goodsLength,goodsWidth,goodsHeight){
  let params={
    customerCode:getCustomerCode(),
    goodsName,
    goodsWeight,
    goodsLength,
    goodsWidth,
    goodsHeight,
    'flexVarchar1':'30'
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'crm.customer.sku.client.search',
      param: JSON.stringify(params)
    },
    hideErrMsg: true,
    method: 'post',
    token: false,
  })
}

/**
 * 查询保费、代收手续费
 * @param {Number,String} amountValue 金额
 * @param {Boolean} isInsuredValue 是否是查询保费
 */
export function queryFee(amountValue,isInsuredValue=false){
  let params= {
    companyNo: getCustomerCode(),
    mobile:getPhone(),
    declarationsValue:isInsuredValue?amountValue:'',
    agencyFund:isInsuredValue?'':amountValue,
    rateType:isInsuredValue?0:1
  }
  return request({
    headerUrl: 'E-CalculateRate',
    method: 'post',
    data: params
  })
}

//查询保费
export function queryInsuredFee(customerCode,customerShortName,numberOfPackages,declaredValue){
  let params= {
    customerCode,
    customerShortName: customerCode?'':customerShortName,
    insureTypeNum:numberOfPackages,
    statementPrice:declaredValue
  }
  return request({
    headerUrl: 'web.v2.front.crm.customer.sync.valueAddedFee',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

// // 超区收费提醒
// export function querySuperzoneInfo(senderAddress,receiverAddress,payAccount) {
//   let params= {
//     payCustomerCode:payAccount|| getCustomerCode(),
//     mobile:getPhone(),
//     sendAddress:senderAddress,
//     receiptAddress:receiverAddress,
//     sendTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
//   }
//   return request({
//     headerUrl: 'gw.commonServiceWaybill.getSuperzoneInfo',
//     method: 'post',
//     data: params,
//     hideErrMsg:true
//   })
// }

/**
 * 查询京东信息
 * @param {运单model} modelList
 * @param {是否是修改} isModify
 */
export function queryJdInfo(modelList,isModify=false,projectCode) {
  const YdInfos=modelList.map(model=>(
    {
      actualWeight:Number(model.weight),
      waybillNumber: model.no,
      deliveryAddress:model.qHAddress,
      deliveryCity:model.sendCity,
      deliveryCityId:model.sendCityDistrictId,
      deliveryCustomerName:model.jjCompany,
      deliveryDistrict:model.sendZone,
      deliveryDistrictId:model.sendZoneDistrictId,
      deliveryNetworkId:model.sendPointId,
      deliveryProvince:model.sendProvince,
      deliveryProvinceId:model.sendProvinceDistrictId,
      receiptFlag:model.receiptFlag,
      count:Number(model.count ),
      pickupDistrict:model.zone,
      pickupAddress:model.sjAddress,
      serviceMode:model.serviceWay,
      goodsType:model.goods,
      pickupCity:model.city,
      pickupCityId:model.cityDistrictId,
      pickupCustomerName:model.sjCompany,
      pickupDistrictId:model.zoneDistrictId,
      pickupMobile:model.sjMobile,
      pickupNetworkId:model.collectPointId,
      pickupPerson:model.sjContactPerson,
      pickupPhone:model.sjTelephone,
      pickupProvince:model.province,
      pickupProvinceId:model.provinceDistrictId,
      proprietaryFlag: model.feature,
      projectCode:projectCode,
    }
  ))
  let params= {
    Moblie:getPhone(),
    IsExistData:isModify,
    YdInfos
  }
  return request({
    headerUrl: 'inc.client.getOutDeliverys',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

//智能解析
export function parseAddressInfo(addressInfo) {
  const params={source:'官网',data:[addressInfo]}
  return request({
    headerUrl: 'web.star.addr.analysis',
    method: 'post',
    data: params
  })
}


// 查询托寄物属性
export function queryGoodsAttributes(goods) {
  let params= {
    goods,
    'pageIndex':'1',
    'pageSize':'20',
  }
  return request({
    headerUrl: 'PC-GetGoodsAttributes',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

// 查询托寄物相关附加服务
export function queryGoodsAditionalServices(goods) {
  let params= {
    mobile:getPhone(),
    'article':goods,
  }
  return request({
    headerUrl: 'E-GetAdditionalServices',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}
// 获取取货派货车辆与点之间距离及两点经纬度
export function getDistanceApi(params){
  return request({
    headerUrl: 'inc.client.getPickupOrSendDistance',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

// 查询路由信息（新）
export function routeQuery(params){
  return request({
    headerUrl: 'inc.client.routeQuery',
    method: 'post',
    data: params,
    hideErrMsg: true,
  })
}

// 获取司机信息（新）司机信息不从routeQuery取
export function getDriverInfoByOrderNo(params){
  return request({
    headerUrl: 'inc.client.getDriverInfoByOrderNo',
    method: 'post',
    data: params,
  })
}

//取得最近填写过的托寄物
export function getHistoryGoodsList() {
  let params= {
    mobile:getPhone(),
  }
  return request({
    headerUrl: 'E-GetGoodsNames',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

//取得最近填写过的付款账号
export function getHistoryPayAccopuntList() {
  let params= {
    mobile:getPhone(),
  }
  return request({
    headerUrl: 'E-GetPayCardNos',
    method: 'post',
    data: params,
    hideErrMsg:true
  })
}

//取得收货提示信息
export function getReceiverAttention(customerShortName){
  let params={
    customerShortName,
    address:'测试'
  }
  return request({
    headerUrl: 'gw.foward.api-auth',
    data: {
      method: 'crm.customer.sync.receiveList',
      param: JSON.stringify(params)
    },
    hideErrMsg: true,
    method: 'post',
  })
}
