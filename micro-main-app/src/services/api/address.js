import request from './request'
import { getPhone, getCustomerCode } from '@/utils/storage'

//查询寄方信息
export function querySenderInfo(pageIndex, pageSize, keyword) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    pageIndex: pageIndex,
    pageSize: pageSize,
    keyword: keyword
  }
  return request({
    headerUrl: 'E-JJPersonInfoQuery',
    method: 'post',
    data: params
  })
}

//查询收方信息
export function queryReceierInfo(pageIndex, pageSize, keyword) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    pageIndex: pageIndex,
    pageSize: pageSize,
    keyword: keyword
  }
  return request({
    headerUrl: 'SJPersonInfoQuery',
    method: 'post',
    data: params
  })
}

//查询唯品会信息
export function queryVipshopInfo(keyword) {
  let params = {
    companyNo: getCustomerCode(),
    userId: getPhone(),
    keyword: keyword
  }
  return request({
    headerUrl: 'web.client.vipshopSelfAddressbook.getCustomerVipList',
    method: 'post',
    data: params
  })
}

// //地址智能解析
// export function parseAddressText(addressText) {
//   let params = {
//     address: addressText,
//     source: 'PC客户端（智能分析地址）'
//   }
//   return request({
//     headerUrl: 'order_intelligentParsingAddress',
//     method: 'post',
//     data: params
//   })
// }

/**
 * 批量地址拆分
 * @param {Array} addressList  必须包含address和id属性
 */
export function splitAddressList(addressList) {
  let params = {
    companyNo: getCustomerCode(),
    mobile: getPhone(),
    addresses: addressList
  }
  return request({
    headerUrl: 'E-GetAddressInfosV2',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}
//地址拆分
export function splitAddress(address) {
  let params = {
    companyName: getCustomerCode(),
    mobile: getPhone(),
    address: address
  }
  return request({
    headerUrl: 'E-GetAddressInfo',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

// // 地址解析智能分单接口-判断地址是否获取到经纬度
// export function splitAddressListNew(params) {
//   return request({
//     headerUrl: 'web.order.getAddressAnalysis',
//     method: 'post',
//     data: params,
//     hideErrMsg: true
//   })
// }

// 地址解析智能分单接口-地址解析失败提醒
export function addressAnalysisTips(params) {
  return request({
    headerUrl: 'web.order.addressAnalysisTips',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}


//三级地址联想
export function getMultiLevelThinkList(keyWord) {
  let params = {
    id: '419191838',
    method: 'address.addressBgTerritory.getMultiLevelThinkList',
    jsonrpc: '2.0',
    params: {
      keyWord
    }
  }
  return request({
    headerUrl: 'gw.foward.api',
    data: {
      'method': 'address.addressBgTerritory.getMultiLevelThinkList',
      'param': JSON.stringify(params)
    },
    method: 'post',
    token: true,
  })
}
//详细地址联想
export function addressSuggestApi(params) {
  return request({
    headerUrl: 'map.bsm.suggest.findsuggest',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}
//获取三级地址
export function getMultiLevelSubList(id) {
  let data = {}
  if (id) {
    data = {
      'method': 'addressBgTerritory.getMultiLevelSubList',
      'id': 0,
      'jsonrpc': '2.0',
      'params': {
        'commonDistrID': id
      }
    }
  } else {
    data = {
      'method': 'addressBgTerritory.getMultiLevelSubList',
      'id': 3,
      'jsonrpc': '2.0',
      'params': {
        'districtLevel': 'province'
      }
    }
  }
  return request({
    headerUrl: 'web.forward.address.addressBgTerritory.getMultiLevelSubList',
    method: 'post',
    data: data,
  })
}

/* 地址联想查询 */
export function autoMatch(keyword) {
  let params = {
    keyword: keyword
  }
  return request({
  /*  token: true, */
    headerUrl: 'gw.area.autoMatch',
    method: 'post',
    data: params
  })
}

/* 公司网点-按四级查询 */
export function listCompanyNode(params) {
  return request({
    /* token: true,*/
    headerUrl: 'gw.foward.api',
    method: 'post',
    data: {'method': 'baseconfig.companyNode.listCompanyNode','param':JSON.stringify(params)}
  })
}


export function getMultiLevelSubListNew(id, level) {
  const levels = {
    '0': 'province,\'\'',
    '1': 'city,provinceDistrID',
    '2': 'zone,cityDistrID',
    '3': 'street,zoneDistrID'
  }
  let districtLevel = 'province'
  let idParam = 'provinceDistrID'
  if (id) {
    for (let item in levels) {
      if (level == item) {
        districtLevel = levels[item].split(',')[0]
        idParam = levels[item].split(',')[1]
      }
    }
  }
  let params = {
    'method': 'addressBgTerritory.getMultiLevelSubList',
    'id': 3,
    'jsonrpc': '2.0',
    'params': {
      [idParam]: id,
      'districtLevel': districtLevel
    }
  }
  return request({
    headerUrl: 'gw.foward.api',
    method: 'post',
    data: {'method': 'address.addressBgTerritory.getMultiLevelSubList','param':JSON.stringify(params)}
  })


  /* return http(
      'gw.foward.api', {
        "method": "address.addressBgTerritory.getMultiLevelSubList",
        "param": JSON.stringify(params)
      }
  )*/
}


export function GetAddressInfo(params) {
  return request({
    headerUrl: 'E-GetAddressInfo',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}

export function getTimelinessNew(sendRegion,receiptRegion,sendAddress,receiptAddress,sendDate) {
  let params={
    sendProvince: sendRegion[0],
    sendCity: sendRegion[1],
    sendArea: sendRegion[2],
    sendTown: sendRegion.length>3 ? sendRegion[3] : '',
    sendProvinceId: sendAddress[0],
    sendCityId: sendAddress[1],
    sendAreaId: sendAddress[2],
    sendTownId: sendAddress.length>3 ? sendAddress[3] : '',
    sendRoad: '',
    receiptProvince: receiptRegion[0],
    receiptCity: receiptRegion[1],
    receiptArea: receiptRegion[2],
    receiptTown: receiptRegion.length>3 ? receiptRegion[3] : '',
    receiptProvinceId: receiptAddress[0],
    receiptCityId: receiptAddress[1],
    receiptAreaId: receiptAddress[2],
    receiptTownId: receiptAddress.length>3 ? receiptAddress[3] : '',
    receiptRoad: '',
    sendDate: sendDate,
    type: '0',
    customerCode:getCustomerCode()
  }
  return request({
    headerUrl: 'inc.client.getTimelinessNew',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}


export function GetFreightCalculat(params) {
  return request({
    headerUrl: 'E-GetFreightCalculate',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
}






//查询地址
export function queryAddressBook(params) {
  return request({
    headerUrl: 'web.query.address.pageList',//'wechat.common.address.pagedQuery'
    method: 'post',
    data: params
  })
}

//地址设置或取消常用 功能已弃用
export function updateCollectFlag(addressType,id,isCollect) {
  let params = {
    phone: getPhone(),
    addressType,
    id,
    isCollect
  }
  return request({
    headerUrl: 'wechat.common.address.updateCollectFlag',
    method: 'post',
    data: params
  })
}

// 地址设置为默认
export function addressSetDefault({id,type}) {
  const params = {id, type, phone:getPhone()}
  return request({
    headerUrl: 'web.query.address.defaultAddress',
    method: 'post',
    data: params
  })
}

//批量删除地址
export function deleteAddressList(addressType,ids) {
  let params = {
    phone: getPhone(),
    addressType,
    ids
  }
  return request({
    headerUrl: 'web.query.address.batchDelete',//wechat.common.address.batchDelete
    method: 'post',
    data: params
  })
}

//批量新增地址
export function addAddressList(params) {
  return request({
    headerUrl: 'web.query.address.batchSave',//'wechat.common.address.batchSave',
    method: 'post',
    data: params
  })
}


//修改地址
export function modifyAddress(params) {
  return request({
    headerUrl: 'web.query.address.update',//'wechat.common.address.update',
    method: 'post',
    data: params
  })
}

//修改唯品会地址
export function modifyVipshopAddress(params) {
  return request({
    headerUrl: 'web.client.vipshopSelfAddressbook.updateCustomerVip',
    method: 'post',
    data: params
  })
}

//地址智能解析-新接口
export async function aiAddrAnalysis(addressInfo) {
  const params={data:[addressInfo]}
  const res = await request({
    headerUrl: 'web.order.third.aiAddrAnalysis',
    method: 'post',
    data: params,
    hideErrMsg: true
  })
  if(res.code===0 && res.data?.length>0){
    const {name,mobilePhone,telPhone,address,province,city,district} = res.data[0]
    const data = {...res.data[0]}
    data.contact = name
    data.contactPhone = mobilePhone
    data.telephone = telPhone
    data.detailAddress = address
    data.address = [province,city,district,address].filter(f=>f).join('')
    res.data = data
  }
  return res
}

// export async function aiAddrAnalysisList(addressList){
//   const params={data:addressList}
//   const res = await request({
//     headerUrl: 'web.order.third.aiAddrAnalysis',
//     method: 'post',
//     data: params,
//     hideErrMsg: true
//   })
//   if(res.code===0 && res.data?.length>0){
//     res.data = res.data.map(item=>{
//       const {name,mobilePhone,telPhone,address,province,city,district} = item
//       const data = {...item}
//       data.contact = name
//       data.contactPhone = mobilePhone
//       data.telephone = telPhone
//       data.detailAddress = address
//       data.address = [province,city,district,address].filter(f=>f).join('')
//     }) 
//   }
//   return res
// }

//地址智能解析回调接口
export function aiAddrAnalysisCallback(params) {
  return request({
    headerUrl: 'web.order.aiAddrAnalysisCallBack',
    method: 'post',
    data: params
  })
}

// 根据经纬度查询三级地址
export function parseThirdAddress({longitude,latitude}) {
  return request({
    headerUrl: 'web.wechat.address.thirdleveladdress',
    method: 'post',
    data: {longitude,latitude}
  })
}


