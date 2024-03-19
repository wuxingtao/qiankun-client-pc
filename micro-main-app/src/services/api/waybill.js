import request from '@/services/api/request'
import waybillUtil from '@/utils/waybillUtil'
import { Message } from 'element-ui'
import { getCustomerCode, getPhone } from '@/utils/storage'
import axios from 'axios'

class Waybill {
  /** 查看运单资料-查询回单路由 */
  getWaybillRoute(params) {
    let tempParams = {
      clientType: '10'
    }
    tempParams = Object.assign(tempParams, params)
    return request({
      headerUrl: 'web.query.waybill.route',
      data: tempParams,
      method: 'post'
    })
  }

  /** 查看运单资料-查询运单/回单/签收数据 */
  getWaybillImages(params) {
    return request({
      headerUrl: 'web.query.waybillMaterialSearch',
      data: params,
      method: 'post'
    })
  }

  /** 查看运单资料-复磅照片 */
  getWaybillCompoundImages(params) {
    return request({
      headerUrl: 'web.query.waybill.getCompoundPicture',
      data: params,
      method: 'post'
    })
  }

  /** 查看运单资料-回单照片重拍问题反馈 */
  receiptPictureFeedback(params) {
    return request({
      headerUrl: 'web.query.waybill.receiptPictureFeedback',
      data: params,
      method: 'post'
    })
  }

  /** 运单管理(新)——批次查询列表 */
  queryBatchWaybillSearch(params) {
    return request({
      headerUrl: 'web.query.waybill.search',
      data: params,
      method: 'post'
    })
  }

  /** 查看运单资料-批量下载回单/签收联/运单联 */
  getByBizCodeAndBizIds(params) {
    params = {
      ...params,
      /** 请求来源 */
      clientType: 10
    }
    return request({
      headerUrl: 'web.query.waybill.getReceiptBatch',
      data: params,
      method: 'post'
    })
  }

  /** 查看运单资料-通过运单号查询回单路由运单号(批量) */
  queryReceiptPictureInfo(params) {
    return request({
      headerUrl: 'web.query.waybill.queryReceiptPictureInfo',
      data: params,
      method: 'post'
    })
  }

  /** 查询经手单号-新接口 */
  async getReceiptListPicInfo(waybillNumber) {
    const params = {
      page: 1,
      pageSize: 10,
      waybillNumbers: [waybillNumber]
    }
    return request({
      headerUrl: 'web.query.getReceiptListPicInfo',
      data: params,
      method: 'post'
    })
  }

  /** 查询回单信息-批量 */
  queryHDPicCountAndWBNos(params) {
    let tempParams = {
      companyNo: getCustomerCode(),
      mobile: getPhone(),
      accountdate: '',
      orderNo: ''
    }
    tempParams = Object.assign(tempParams, params)
    return request({
      headerUrl: 'web.query.forward.searchReceipt',
      method: 'post',
      data: tempParams
    })
  }

  //查询运单详情
  getWaybillDetail(waybillNumber) {
    if (!waybillNumber) {
      return
    }
    let params = {
      waybillNumber: waybillNumber,
      clientType: '10'
    }
    return request({
      headerUrl: 'web.query.waybill.getWaybillDetail',
      method: 'post',
      data: params
    })
  }

  //催取条件校验
  checkWaybillUrge(params) {
    return request({
      headerUrl: 'web.query.waybill.waybillUrgeCheck',
      method: 'post',
      data: params
    })
  }

  //催取
  waybillUrge(params) {
    return request({
      headerUrl: 'web.query.waybill.waybillUrge',
      method: 'post',
      data: params
    })
  }

  //运单打印查询
  async getWaybillPrint(waybillNumbers) {
    let res = await request({
      headerUrl: 'web.query.waybillPrint.getWaybillPrintData',
      method: 'post',
      data: waybillNumbers
    })
    if (res.code === 0) {
      return waybillUtil.convertQueryPrintModels(res.data)
    }
  }

  //查询派货资料
  queryPickupFile(waybillNo) {
    let vo = {
      bizId: waybillNo,
      bizCode: 'erp_upload_image_preOrder'
    }
    let params = {
      vo: vo,
      page: 1,
      pageSize: 10,
      type: 2
    }
    return request({
      // headerUrl: 'web.forward.file.file.search',
      headerUrl: 'web.query.waybillCertificateSearch',
      method: 'post',
      data: params
    })
  }

  //查询委托书或预约单
  queryOrderFile(ydNo) {
    let vo = {
      bizId: ydNo,
      bizCode: 'pickup_proxy'
    }
    let params = {
      vo: vo,
      page: 1,
      pageSize: 10,
      type: 1
    }
    return request({
      // headerUrl: 'web.forward.file.file.search',
      headerUrl: 'web.query.waybillCertificateSearch',
      method: 'post',
      data: params
    })
  }

  //删除委托书或预约单
  deleteOrderFile(ids) {
    let params = {
      ids: ids
    }
    return request({
      headerUrl: 'web.forward.file.deleteByIds',
      method: 'post',
      data: params
    })
  }

  //上传文件至文件中心
  uploadFileToFileCenter(data, cb) {
    try {
      let url = 'https://api.ky-express.com/router/upload'
      if (
        ['uc-uat.ky-express.com', 'uc-dev.ky-express.com', 'localhost'].includes(
          window.location.hostname
        )
      ) {
        url = 'https://api-uat.kyeapi.com/router/upload'
      }
      if (['uc-stg.ky-express.com'].includes(window.location.hostname)) {
        url = 'https://api-stg.kyeapi.com/router/upload'
      }
      // let data = { bizCode, bizId: `excel${uuidv4()}`, type: fileType, file }
      let formData = new FormData()
      Object.entries(data).forEach(([key, value]) => formData.append(key, value))
      return axios.post(url, formData, {
        onUploadProgress(progressEvent) {
          //属性lengthComputable主要表明总共需要完成的工作量和已经完成的工作是否可以被测量
          if (progressEvent.lengthComputable) {
            //如果lengthComputable为false，就获取不到progressEvent.total和progressEvent.loaded
            let complete = ((progressEvent.loaded / progressEvent.total) * 100) | 0
            cb && cb(complete)
          }
        }
      })
    } catch (ex) {
      console.log('uploadFileToFileCenter :>> ', ex)
      Message.error('文件上传失败')
    }
  }

  //删除运单
  deleteWaybill(params) {
    return request({
      headerUrl: 'web.order.waybill.deleteWaybill',
      method: 'post',
      data: params
    })
  }

  //取消发货
  cancelWaybill(waybillNumbers) {
    let params = {
      waybillNumbers: waybillNumbers,
      cancelSource: '210',
      cancelMobile: getPhone(),
      customerCode: getCustomerCode()
    }
    return request({
      headerUrl: 'web.order.waybill.cancel',
      method: 'post',
      data: params
    })
  }

  //不同状态下运单批量取消发货
  batchCancelWaybill(params) {
    let waybillCancelRequests = params.map(i => {
      return {
        ...i,
        cancelSource: '210',
        cancelMobile: getPhone(),
        customerCode: getCustomerCode(),
        operateType: 20
      }
    })
    return request({
      headerUrl: 'web.order.waybill.batchCancel',
      method: 'post',
      data: { waybillCancelRequests }
    })
  }

  // 校验是否有空跑费
  batchEmptyRunningFee(waybillNumbers) {
    return request({
      headerUrl: 'web.order.waybill.batchEmptyRunningFee',
      method: 'post',
      data: { waybillNumbers }
    })
  }

  /**
   * 通知司机取货
   *  params: {
   *    orderNumbers [Array]
   *    waybillNumber [Array]
   *  }
   * */
  orderNoticePickup(params) {
    return request({
      headerUrl: 'web.order.client.orderNoticePickup',
      method: 'post',
      data: params
    })
  }

  orderNoticePickupResult(batchNo) {
    return request({
      headerUrl: 'web.query.getOrderNoticePickupResult',
      method: 'post',
      data: { batchNo }
    })
  }

  // 获取通知取货结果获取
  async orderNoticePickupAsync({ batchNo, count = 0 }) {
    let res = await this.orderNoticePickupResult(batchNo)
    if (res.code === 0 && res.data) {
      count++
      switch (res.data.state) {
        case '0':
          if (count >= 50) {
            Message.warning('跨越系统正在处理你的订单，请稍后在运单管理查看结果')
            return res
          } else {
            await new Promise(itemResolve => {
              setTimeout(itemResolve, 1000)
            })
            return await this.orderNoticePickupAsync({
              batchNo,
              count
            })
          }
        case '1':
          return res
        default:
          return res
      }
    }
  }

  // 历史记录查询接口
  searchHistoryLimit() {
    return request({
      headerUrl: 'web.query.searchHistory.limit',
      method: 'post',
      data: {
        number: 20,
        clientType: 10
      }
    })
  }

  // 历史记录删除接口
  searchHistoryDelete() {
    return request({
      headerUrl: 'web.query.searchHistory.delete',
      method: 'post',
      data: {
        isAll: 1,
        clientType: 10
      }
    })
  }

  // 输入联想
  getWaybillLink(data) {
    return request({
      headerUrl: 'web.query.waybill.getWaybillLink',
      method: 'post',
      data: {
        ...data,
        clientType: 10 // 客户端
      }
    })
  }

  // 列表通用查询接口
  getWaybillData(
    {
      generalQuery = {},
      smallQuery = [],
      waybillCustomerSource,
      waybillStatus,
      queryMode,
      page,
      pageSize,
      orderByClauses = []
    },
    beforeFn
  ) {
    const data = {
      generalQuery,
      smallQuery,
      waybillCustomerSource,
      waybillStatus,
      queryMode, // 默认查询
      clientType: 10, // 客户端
      page,
      pageSize,
      orderByClauses
    }
    // 将customerCodes从generalQuery中剥离
    data.customerCodes = generalQuery.customerCodes || []
    delete generalQuery.customerCodes
    // 如果printStatus为空不传
    if (generalQuery && !generalQuery.printStatus) delete generalQuery.printStatus
    // 如果waybillStatus传值为空则传空数组
    if (data.waybillStatus[0] === '') data.waybillStatus = []
    beforeFn && beforeFn(data)
    return request({
      headerUrl: 'web.query.waybill.search',
      method: 'post',
      data
    })
  }

  // 状态总数查询
  getWaybillStatusCounts(
    generalQuery = {},
    smallQuery = [],
    waybillCustomerSource,
    waybillStatus,
    queryMode
  ) {
    const data = {
      generalQuery: JSON.parse(JSON.stringify(generalQuery)),
      smallQuery,
      waybillCustomerSource,
      waybillStatus,
      queryMode, // 默认查询
      clientType: 10 // 客户端
    }
    // waybillStatus为全部的话不传
    if (!data.waybillStatus) delete data.waybillStatus
    // 将customerCodes从generalQuery中剥离
    data.customerCodes = generalQuery.customerCodes || []
    delete generalQuery.customerCodes
    // 如果printStatus为空不传
    if (generalQuery && !generalQuery.printStatus) delete generalQuery.printStatus
    return request({
      headerUrl: 'web.query.waybill.searchStatistics',
      method: 'post',
      data
    })
  }

  // 司机信息
  getDriverInfo(waybillNumber) {
    return request({
      headerUrl: 'web.query.waybill.getDriverInfo',
      method: 'post',
      data: { waybillNumber },
      hideErrMsg: true
    })
  }

  // 获取司机虚拟号码
  getDriverVirtualMobile(userInputMobile, waybillNumber) {
    return request({
      headerUrl: 'web.query.waybill.getDriverVirtualMobile',
      method: 'post',
      data: {
        userInputMobile,
        waybillNumber
      }
    })
  }

  /** 获取商务号码 */
  getBusinessPhone() {
    return request({
      headerUrl: 'web.query.waybill.getMarketPhone',
      method: 'post',
      data: {}
    })
  }

  /** 获取商务虚拟号码 */
  getBusinessVirtualMobile(userInputMobile, waybillNumber) {
    return request({
      headerUrl: 'web.query.waybill.getMarketVirtualMobile',
      method: 'post',
      data: {
        userInputMobile,
        waybillNumber
      }
    })
  }

  //查件管理-查询运单货物仓储信息
  getCargoStorageInfo(params) {
    if (!params || params.length === 0) {
      return { code: -1 }
    }
    return request({
      headerUrl: 'web.order.waybill.getCargoStorageInfoRefactor',
      method: 'post',
      data: params
    })
  }

  //修改货好时间 web.order.waybill.getCarGoStorageCount
  modifyDeliveryTime(params) {
    if (!params || params.length === 0) {
      return { code: -1 }
    }
    return request({
      headerUrl: 'web.order.waybill.modifyDeliveryTimeRefactor',
      method: 'post',
      data: params
    })
  }

  //获取产生保管费运单数量
  getCarGoStorageCount() {
    let params = {
      waybillSource: '30'
    }
    return request({
      headerUrl: 'web.order.waybill.getCarGoStorageCount',
      method: 'post',
      data: params
    })
  }

  //增加打印次数
  addPrintCount(params) {
    let tempParams = {
      params: params
    }
    return request({
      headerUrl: 'web.v2.printTools.addPrintCount',
      method: 'post',
      data: tempParams,
      hideErrMsg: true
    })
  }

  //列表打印
  batchPrint(params) {
    return request({
      headerUrl: 'web.order.waybillTmsPrint',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  //获取仓库类型：web.forward.map.smartorder.delivery.addressTag

  /**
   * 获取仓库类型
   *    web.forward.map.smartorder.delivery.addressTag
   *    2022-01-15 更换为：web.client.address.getAddressTag
   */
  getWarehouseType(params) {
    return request({
      headerUrl: 'web.client.address.getAddressTag',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  // 获取派货资料信息
  getUploadMaterialInfo(params) {
    return request({
      headerUrl: 'web.query.waybill.getUploadMaterialInfo',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  //更新预约信息 web.forward.oms.prewaybillExternalPlatform.updatePickupAppoint
  updatePickupAppoint(params) {
    return request({
      headerUrl: 'web.order.uploadPickupAppoint',
      method: 'post',
      data: params
    })
  }

  /** 查看所有运单资料-查询运单列表 */
  getMaterialWaybillList(params) {
    return request({
      headerUrl: 'web.query.waybill.search',
      method: 'post',
      data: params
    }).then(res => {
      let { rows = [] } = res.data
      if (rows.length > 0) {
        res.data.rows = rows.reduce((codes, nextItem) => {
          const code = nextItem.waybillNumber
          if (code) {
            codes.push(code)
          }
          return codes
        }, [])
      }
      return res.data
    })
  }

  /** 查询派货资料是否可以修改 */
  getUpdateStatus = params => {
    return request({
      headerUrl: 'web.client.deliveryUpdateRecord.getUpdateStatus',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  /** 修改派货资料修改次数 */
  updateDeliveryRecordCount = params => {
    return request({
      headerUrl: 'web.client.deliveryUpdateRecord.updateDeliveryRecordCount',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  /** 查询灰度迁移数据列表 */
  getUpgradeFaildWaybillInfo(params) {
    return request({
      headerUrl: 'inc.client.getUpgradeFaildWaybillInfo',
      method: 'post',
      data: params
    })
  }

  /** WEB_电子运单-删除运单V3 */
  deleteWaybillInfo(params) {
    return request({
      headerUrl: 'inc.client.deleteUpgradeData',
      method: 'post',
      data: params
    })
  }

  //修改打印状态
  updatePrintStatus(params) {
    return request({
      headerUrl: 'web.query.waybill.updatePrint',
      method: 'post',
      data: params
    })
  }

  //查询尺寸web.query.waybill.getGoodSize
  getGoodSize(params) {
    return request({
      headerUrl: 'web.query.waybill.getGoodSize',
      method: 'post',
      data: params
    })
  }

  /** 查件-获取批量下载回单任务结果 */
  getWaybillMaterialUrl(params = {}) {
    return request({
      headerUrl: 'web.query.waybill.getWaybillMaterialUrl',
      method: 'post',
      data: params
    })
  }

  /** 查件-开始批量下载回单任务 */
  createWaybillMaterial(params = {}) {
    return request({
      headerUrl: 'web.query.waybill.createWaybillMaterial',
      method: 'post',
      data: params
    })
  }

  /** 查件-查询运单消杀图片 */
  getKillImage(params) {
    return request({
      headerUrl: 'web.query.forward.waybillDisinfectionSearch',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  /** 查件-开始批量下载回单任务 */
  UpdateYDNumber(params = {}) {
    return request({
      headerUrl: 'web.v2.waybillExternalPlatform.batchUpdate',
      method: 'post',
      data: params
    })
  }

  /** 国际件查看运单资料-详情页 */
  getWaybillInternationalRoute(params) {
    let tempParams = {
      clientType: '10'
    }
    tempParams = Object.assign(tempParams, params)
    return request({
      headerUrl: 'web.query.waybill.internationalRoute',
      data: tempParams,
      method: 'post'
    })
  }

  /** 保存标签数据至pda */
  savePdaLabelData(params) {
    return request({
      headerUrl: 'web.order.savePdaLabelData',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  /** 运单详情-获取自提站点 */
  getSelfPickupBranchButtonInfo(params) {
    return request({
      headerUrl: 'web.query.waybill.getSelfPickupBranchButtonInfo',
      method: 'post',
      data: params
    })
  }

  /** 运单详情-设置自提信息 */
  setSelfPickupInfo(params) {
    return request({
      headerUrl: 'web.query.waybill.setSelfPickupInfo',
      method: 'post',
      data: params
    })
  }

  /** 运单详情-获取自提信息 */
  getSelfPickupButtonInfo(params) {
    return request({
      headerUrl: 'web.querywaybill.getSelfPickupButtonInfo',
      method: 'post',
      data: params
    })
  }

  /** 运单详情-取消自提 */
  cancelSelfPickup(params) {
    return request({
      headerUrl: 'web.query.waybill.cancelSelfPickup',
      method: 'post',
      data: params
    })
  }

  /** 本人签收 */
  setSelfSign(params) {
    return request({
      headerUrl: 'web.query.waybill.setSelfSign',
      method: 'post',
      data: params
    })
  }

  /** 批量查询取派外显 */
  batchGetExternalEffect(params) {
    return request({
      headerUrl: 'web.order.query.batchGetExternalEffect',
      method: 'post',
      data: {
        ...params,
        source: 10
      }
    })
  }

  getBatchGetExternalEffectResult(params) {
    return request({
      headerUrl: 'web.query.limit.getBatchGetExternalEffectResult',
      method: 'post',
      data: {
        ...params,
        source: 10
      }
    })
  }

  getExternalEffect(waybillNumber) {
    return request({
      headerUrl: 'web.query.limit.getExternalEffect',
      method: 'post',
      data: { waybillNumber }
    })
  }

  /**
   * @description: 报关入仓-更新客户报关入仓确认状态
   * @param {*}
   * @return {*}
   */  
  updateWarehousingAgreeState(params) {
    return request({
      headerUrl: 'web.order.updateWarehousingAgreeState',
      method: 'post',
      data: params
    })
  }

  /**
   * @description: 报关入仓-入仓费查询
   * @param {*}
   * @return {*}
   */  
  getWarehousingPrice(params) {
    return request({
      headerUrl: 'web.order.getWarehousingPrice',
      method: 'post',
      data: params
    })
  }
}

export default new Waybill()
