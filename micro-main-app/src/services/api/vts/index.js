import request from '@/services/api/request'
import { getPhone, getCustomerCode } from '@/utils/storage'
// vts客户端appKey
const VTS_APPKEY = '55280'

// -----新增询价单部分-----

// 获取车型数据信息
export function geiGolbalCarInfo (params) {
    return request({
        headerUrl: 'vts.cargo.BasicData.getCarTypeList',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 获取货物匹配信息
export function getGoodsInfoList (params) {
    return request({
        headerUrl: 'vts.cargo.wet.goodsInfoConfig.newList',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 高速时效
export function calcArriveTimeApi (params) {
    return request({
        headerUrl: 'vts.cargo.inquiry.demand.prescription',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 新增询价单
export function addCreateOrder (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.pc.create',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 判断是否是内部员工
export function fetchInternalPhoneNumber (params) {
    return request({
        headerUrl: 'vts.cargo.inquiry.checkInsidePhone',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 违禁品校验
export function fetchIsContraban (params) {
    return request({
        headerUrl: 'vts.cargo.baseConfig.isContraban',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 地址转寄区校验
export function fetchMapResolve (params) {
    return request({
        headerUrl: 'vts.cargo.inquiry.map.resolve',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 地址禁发
export function fetchNoExpress (params) {
    return request({
        headerUrl: 'vts.cargo.disableLineConfig.hitDisableLine',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// -----订单列表部分
export function fetchOrderList (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.pc.list',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 拷贝部分------

//地址拆分
export function splitAddress (address) {
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

//三级地址联想
export function getMultiLevelThinkList (keyWord) {
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

//获取三级地址
export function getMultiLevelSubList (id) {
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

//详细地址联想
export function addressSuggestApi (params) {
    return request({
        headerUrl: 'map.bsm.suggest.findsuggest',
        method: 'post',
        data: params,
        hideErrMsg: true
    })
}

//查询地址
export function queryAddressBook (params) {
    return request({
        headerUrl: 'web.query.address.pageList',//'wechat.common.address.pagedQuery'
        method: 'post',
        data: params
    })
}

//地址设置或取消常用 功能已弃用
export function updateCollectFlag (addressType, id, isCollect) {
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

//批量新增地址
export function addAddressList (params) {
    return request({
        headerUrl: 'web.query.address.batchSave',//'wechat.common.address.batchSave',
        method: 'post',
        data: params
    })
}

//批量删除地址
export function deleteAddressList (addressType, ids) {
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

//查询唯品会信息
export function queryVipshopInfo (keyword) {
    let params = {
        companyNo: getCustomerCode(),
        UserId: getPhone(),
        Keyword: keyword
    }
    return request({
        headerUrl: 'PC-GetCustomerVipList',
        method: 'post',
        data: params
    })
}

// ---列表配置---
//查询表格列配置
export function queryGridColumnConfig (gridName) {
    let params = {
        mobile: getPhone(),
        gridName
    }
    return request({
        headerUrl: "gw.gridConfig.queryGridConfig",
        method: "post",
        data: params,
        hideErrMsg: true
    })
}

//新增表格配置
export function addGridConfigApi (params) {
    return request({
        headerUrl: "gw.gridConfig.addGridConfig",
        method: "post",
        data: params
    })
}

//修改表格配置
export function modifyGridConfigApi (params) {
    return request({
        headerUrl: "gw.gridConfig.updateGridConfig",
        method: "post",
        data: params
    })
}

//修改地址
export function modifyAddress (params) {
    return request({
        headerUrl: 'web.query.address.update',//'wechat.common.address.update',
        method: 'post',
        data: params
    })
}

//修改唯品会地址
export function modifyVipshopAddress (params) {
    return request({
        headerUrl: 'PC-UpdateCustomerVip',
        method: 'post',
        data: params
    })
}

//智能解析
export function parseAddressInfo (addressInfo) {
    const params = { source: '官网', data: [addressInfo] }
    return request({
        headerUrl: 'web.star.addr.analysis',
        method: 'post',
        data: params
    })
}

// 订单详情
export function orderDetail (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.pc.detail',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 确认下单
export function configOrder (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.pc.inquiryConfirm',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}
// 获取经停地
export function getStopover (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.getLocationList',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}
// 销售信息
export function salesInfo (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.pc.sall',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 取消订单
export function cancel (params) {
    return request({
        headerUrl: 'vts.cargo.officialWeb.pc.cancel',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 根据货物id查询
export function goodsInfoConfig (params) {
    return request({
        headerUrl: 'vts.cargo.goodsInfoConfig.get',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

export function fetchgetActivating (params) {
    return request({
        headerUrl: 'vts.cargo.banUnloadConfig.getActivating',
        hideErrMsg: true,
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 获取保费配置
export function fetchInsuredCoefficient (params) {
    return request({
        headerUrl: 'vts.cargo.baseSettings.getSystemValue',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 校验司机备注
export function fetchCheckRemark (params) {
    return request({
        headerUrl: 'vts.cargo.validatorStringContain',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 判断手机号是否有运费权限
export function fetchCheckApply (params) {
    return request({
        headerUrl: 'web.uam.apply.check',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 发起申请查看运费
export function fetchApplyLook (params) {
    return request({
        headerUrl: 'web.uam.apply.add',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })
}

// 发起申请查看运费
export function getRestrict (params) {
    return request({
        headerUrl: 'vts.cargo.inquiry.mapWarningRestrict',
        method: 'post',
        data: params,
        appkey: VTS_APPKEY
    })

}


