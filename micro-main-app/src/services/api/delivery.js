import request from './request'
import dayjs from 'dayjs'
import store from '@/store'
import * as storage from '@/utils/storage'
import deliveryUtil from '@/utils/deliveryUtil'
import deliveryAsyncApi from './deliveryAsync'
import formatUtil from '@/utils/format'

class Delivery {
  //获取运单号
  getWaybillNos(count = 1) {
    return request({
      headerUrl: 'web.forward.oms.preWaybillExternalPlatform.batchGetWaybillNumber',
      method: 'post',
      data: { count }
    })
  }

  //取得收货提示信息
  getReceiverAttention(customerShortName) {
    if (!customerShortName) {
      return {}
    }
    let params = {
      customerShortName: customerShortName
      // address:'测试'
    }
    return request({
      headerUrl: 'web.forward.crm.query.internet.listCustomerReceiveAttentions',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  /**
   * 历史寄、收件地址
   * @param {Number} addressType 0-寄件地址 1-收件地址
   */
  async queryAddressHistory(addressType, productType = '10') {
    let params = {
      type: addressType,
      productType
    }
    const res = await request({
      headerUrl: 'web.order.historyAddress',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if (res.code === 0) {
      res.data = res.data.map(r => ({
        company: r.companyName,
        // companyRaw:r.companyName,
        contact: r.userName,
        contactRaw: r.userName,
        contactPhone: r.phone,
        contactPhoneRaw: formatUtil.formatMobliePhone(r.phone) || r.telPhone,
        telephone: r.telPhone,
        province: r.province,
        city: r.city,
        area: r.district,
        address: [r.province, r.city, r.district, r.detailAddress].filter(f => f).join(''),
        detailAddress: r.detailAddress
      }))
    }
    return res
  }

  //批量查询保费
  queryServiceChargeByBatch(params) {
    return request({
      headerUrl: 'web.order.getWaybillExtraFee',
      method: 'post',
      data: { incrementFees: params },
      hideErrMsg: true
    })
  }

  //查询保费、代收货款费用
  queryServiceCharge({
    customerCode,
    customerShortName,
    numberOfPackages,
    declaredValue,
    collectionAmount
  }) {
    let params = {
      customerCode,
      customerShortName: customerCode ? '' : customerShortName,
      insureTypeNum: numberOfPackages,
      statementPrice: declaredValue,
      collectionPayment: collectionAmount
    }
    return request({
      headerUrl: 'web.client.customerInfo.valueAddedFee',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  // 超区收费提醒
  querySuperzoneInfo(senderAddress, receiverAddress, payAccount) {
    let params = {
      payCustomerCode: payAccount || storage.getCustomerCode(),
      mobile: storage.getPhone(),
      sendAddress: senderAddress,
      receiptAddress: receiverAddress,
      sendTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
    return request({
      headerUrl: 'web.order.getSuperZoneInfo',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  //检查最近一票填写重量与真实重量是否超过300公斤
  checkOverWeightFlag() {
    return request({
      headerUrl: 'web.order.checkLastOrderWeightNew',
      method: 'post',
      data: {},
      hideErrMsg: true
    })
  }

  //取得最近填写过的托寄物
  getHistoryGoodsList() {
    return request({
      headerUrl: 'web.query.goodsType.history',
      method: 'post',
      data: { customerCode: storage.getCustomerCode() },
      hideErrMsg: true
    })
  }

  //获取预估运费
  async getEstimateFreight(formDataList) {
    if (!Array.isArray(formDataList)) {
      formDataList = [formDataList]
    }

    const params = formDataList
      .map(m => {
        const {
          qhAddress: sendAddress,
          sjAddress: receiveAddress,
          serviceWay,
          payWay,
          dsMoney,
          receiptFlag,
          declaredValue,
          mjWay,
          weight,
          count,
          cube,
          checkedCustomsCharge
        } = m
        const sizeList = m.sizeList || []
        // const cube =  deliveryUtil.convertToCube(m.sizeList)

        //只有寄方付才算运费
        if (
          payWay != 10 ||
          !sendAddress ||
          !receiveAddress ||
          !serviceWay ||
          sendAddress.length < 10 ||
          receiveAddress.length < 10 ||
          (Number(count) <= 0 && Number(weight) <= 0 && cube <= 0)
        ) {
          return
        }
        const goodsInfos = sizeList.map(m => ({
          length: Number(m['length']),
          width: Number(m.width),
          height: Number(m.height),
          count: Number(m.count) || 1
        }))
        const statementPrice = Number(declaredValue) || 0
        const forcePremium = statementPrice <= 0 && m.insuranceFeeType === 20 ? '10' : '20'
        const superAreaMileage = m.deliveryMode != '10' ? m.superZoneDistance : 0
        return {
          sendAddress,
          receiveAddress,
          serviceMode: serviceWay,
          goodsTime: deliveryUtil.getGoodsTime(m),
          weight: Number(weight) || 0,
          unit: Number(count) || 0,
          forcePremium,
          size: cube,
          insureTypeNum: Number(count) || 0,
          collectionPayment: Number(dsMoney) || 0,
          statementPrice,
          paymentType: payWay,
          receiptMoneyYes: receiptFlag,
          woodenInfos: goodsInfos?.map(m => Object.assign({ type: mjWay }, m)),
          goodsInfos,
          onlyOne: m.no || '0',
          superAreaMileage: superAreaMileage || 0,
          fenceFlag:checkedCustomsCharge
        }
      })
      .filter(f => f)

    if (params.length < 1) {
      return
    }

    if (params.length > 30) {
      return await deliveryAsyncApi.getEstimateFreightAsync(params)
    }

    const res = await request({
      headerUrl: 'web.order.batchEstimateCost',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if (res.code === 0) {
      return res.data?.filter(f => f.successFlag)
    }
  }

  //取得最近一单寄方信息
  getRecentOrderSenderInfo() {
    return request({
      headerUrl: 'web.order.getDefaultAddress',
      method: 'post',
      data: { sourceId: 1 },
      hideErrMsg: true
    })
  }

  //获取运单历史备注
  getWaybillRemarkHistory() {
    return request({
      headerUrl: 'web.query.waybillRemark.history',
      method: 'post',
      data: { customerCode: storage.getCustomerCode() },
      hideErrMsg: true
    })
  }

  //查询默认保费
  queryDefaultDeclaredValue(formData) {
    const params = this.getPayAuthApiParams(formData)
    params.customerCode = deliveryUtil.getPayAccount(formData)
    return request({
      headerUrl: 'web.order.getPremiumInformation',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  // 批量查询默认保费
  async queryDefaultDeclaredValueByBatch(formDataList) {
    let params = formDataList.map((f, index) =>
      Object.assign(this.getPayAuthApiParams(f), {
        id: (f.no || index + 1) + '',
        customerCode: deliveryUtil.getPayAccount(f)
      })
    )
    params = params.filter(f => f.paymentType)
    params = { premiumInformationRequestList: params }
    // return request({
    //   headerUrl: 'web.order.client.batchGetPremiumInformation',
    //   method: 'post',
    //   data: { premiumInformationRequestList:params },
    //   hideErrMsg: true
    // })
    const res = await deliveryAsyncApi.getDefaultDeclaredValueAsync(params)
    // console.log('res :>> ', res);
    return res
  }

  //取得付款授权接口相关入参
  getPayAuthApiParams(formData) {
    const districtList = formData.sjAddressData?.districtList || []
    const params = {
      paymentType: formData.payWay,
      receiveAddress: formData.sjAddress,
      receiveCustomerName: formData.sjCompany,
      receiveProvince: districtList[0],
      receiveCity: districtList[1],
      receiveDistrict: districtList[2],
      receiveMobile: formData.sjMobile,
      receivePhone: formData.sjTelephone,
      noPayCustomerFlag: formData.noPayCustomerFlag
    }
    return params
  }

  //批量获取服务方式
  async queryServiceWayListByBatch(formDataList) {
    let params = formDataList.map(f =>
      Object.assign(this.getPayAuthApiParams(f), {
        orderNumber: f.no + '' || '0',
        otherCustomerCode: deliveryUtil.getPayAccount(f),
        goodsTime: deliveryUtil.getGoodsTime(f),
        sendAddress: f.qhAddress
      })
    )
    params = params.filter(f => f.paymentType)
    if (params.length < 1) {
      return { code: -1 }
    }
    try {
      if (params.length > 1) {
        const res = await deliveryAsyncApi.queryServiceWayListByBatchAsync(params)
        return res
      }
      const res = await request({
        // headerUrl: 'web.order.batchGetServiceTypes',
        headerUrl: 'web.order.batchGetServiceModes',
        method: 'post',
        data: { serviceTypeRequestList: params, source: '30' }
      })
      if (res.code === 0 && res.data[0]) {
        const noticeContent = res.data[0].noticeContent
        deliveryUtil.formatServiceWayOptions(res.data[0].serviceTypeList, noticeContent)
      }
      return res
    } catch {
      return { code: -1 }
    }
  }

  // 查询托寄物属性
  queryGoodsAttributes(goods) {
    let params = {
      vo: {
        goodsName: goods
      },
      page: '1',
      pageSize: '20'
    }
    return request({
      headerUrl: 'web.order.goodsAttribute.search',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }
  // 查询托寄物相关附加服务
  queryGoodsAditionalServices(goods) {
    return request({
      headerUrl: 'web.query.history.getAdditionalServices',
      method: 'post',
      data: { goodsType: goods, customerCode: storage.getCustomerCode() },
      hideErrMsg: true
    })
  }

  //查询仓库列表
  queryWarehouseList(pageIndex, warehouseType, warehouseName) {
    const params = {
      page: pageIndex,
      pageSize: 50,
      warehouseType,
      warehouseNumber: warehouseName,
      warehouseName: ''
    }
    return request({
      headerUrl: 'web.forward.crm.common.warehouse.openSearch',
      data: params,
      method: 'post'
    })
  }
  //批量再来一单查询运单信息
  async queryWaybillListByWaybillNumbers(waybillNumbers) {
    const params = {
      waybillNumbers,
      clientType: '10'
    }
    const res = await request({
      headerUrl: 'web.query.waybill.getWaybillDetails',
      method: 'post',
      data: params
    })
    return await this.getQueryWaybillListResult(res.data.taskId)
  }

  async getQueryWaybillListResult(taskId) {
    await deliveryUtil.sleep()
    const res = await request({
      headerUrl: 'web.query.waybill.getWaybillDetails',
      method: 'post',
      data: { taskId },
      hideErrMsg: true
    })
    if (res.code === 0 && res.data.code === 80001) {
      return await this.getQueryWaybillListResult(taskId)
    }
    return res
  }

  //修改或再来一单查询运单信息
  queryWaybillByWaybillNumber(waybillNumber, isUseInModify) {
    const params = {
      waybillNumber,
      clientType: '10',
      flag: isUseInModify ? 10 : 20
    }
    return request({
      headerUrl: 'web.query.waybill.getClientUpdateWaybillDetail',
      method: 'post',
      data: params
    })
  }

  //客户调价提醒
  async adjustPriceRemind(formData) {
    if (!formData.qhAddress || !formData.sjAddress || !formData.serviceWay) {
      return
    }
    const serviceType = deliveryUtil.getServiceWayCode(formData.serviceWay)
    const params = {
      senderAddr: formData.qhAddress,
      recipientInfoList: [
        {
          recipientAddr: formData.sjAddress,
          serviceType,
          weight: formData.weight || 1,
          billingTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          customerCode: storage.getCustomerCode()
        }
      ]
    }
    const res = await request({
      headerUrl: 'web.order.getAdjustPriceRemind',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if (res.code === 0 && res.data) {
      const item = res.data[0]
      return {
        ...item,
        adjustPriceMsg: item?.adjustPriceFlag && item?.customerAdjustPriceTips
      }
    }
  }

  //取派提醒
  async dispatchAddressRestrict(formData, ignoreReceiverAddress) {
    const params = {
      // customerCode: storage.getCustomerCode(),
      mailInfos: [
        {
          id: '1',
          goodsTime: deliveryUtil.getGoodsTime(formData),
          // goodsTimeFlag: '10',
          estimateArriveTime: deliveryUtil.getEstimateArriveTime(formData),
          sendAddress: formData.qhAddress,
          receiveAddress: ignoreReceiverAddress ? '' : formData.sjAddress,
          serviceType: deliveryUtil.getServiceWayCode(formData.serviceWay, false)
        }
      ]
    }
    const res = await request({
      headerUrl: 'web.order.client.addressDispatchRestrict',
      method: 'post',
      data: params,
      hideErrMsg: true
    })

    if (res.code === 0) {
      const errorResult = []
      const warnResult = []
      const pickupMsg =
        '该区域受不可抗力因素影响导致取货时效会受到影响，但我司会全力以赴保证客户货物时效，如为您带来不便请多谅解，感谢您对跨越的支持！'
      const deliveryMsg =
        '该区域受不可抗力因素影响导致派货时效会受到影响，但我司会全力以赴保证客户货物时效，如为您带来不便请多谅解，感谢您对跨越的支持！'
      res.data?.forEach(d => {
        switch (d.limitType) {
          case '10':
            errorResult.push({ field: 'qhAddress', msg: d.message || pickupMsg })
            break
          case '20':
            errorResult.push({ field: 'sjAddress', msg: d.message || deliveryMsg })
            break
          case '50':
            errorResult.push({ field: 'sjAddress', msg: d.message || '路线限寄' })
            break
          case '30':
            warnResult.push({ field: 'qhAddress', msg: d.message || pickupMsg })
            break
          case '40':
            warnResult.push({ field: 'sjAddress', msg: d.message || deliveryMsg })
            break
          case '60':
            break
          // default:
          //   errorResult.push({ field: 'sjAddress', msg: d.errorMsg || '校验出错' })
        }
      })
      res.data = {
        errorResult,
        warnResult
      }
    } else {
      if (!res.data) {
        res.data = { errorResult: [] }
      } else {
        res.data.errorResult = []
      }
      // !res.data && (res.data = {})
      // res.data.errorResult = [{ field: 'qhAddress', msg: res.msg || '取派提醒校验失败' }]
    }
    return res
  }

  //新增或修改运单
  async saveWaybill(params) {
    let res = await request({
      headerUrl: 'web.order.client.saveOrder',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if (res.code !== 0 || !res.data?.batchNo) {
      return res
    }
    for (let i = 0; i < 10; i++) {
      await deliveryUtil.sleep(300)
      const asyncRes = await request({
        headerUrl: 'web.query.getOrderBatchSaveResult',
        method: 'post',
        data: { batchNo: res.data.batchNo },
        hideErrMsg: true
      })
      if (asyncRes.data.state === '1') {
        res = { code: 0, msg: '保存成功' }
        const data = asyncRes.data?.verifyDataResponses
        if (data?.length > 0 && data[0]?.errorResult?.length > 0) {
          res = {
            code: -1,
            msg: data[0].errorResult[0].msg || '数据保存失败'
          }
        }
        return res
      }
    }
    return res
  }

  //批量保存
  async saveWaybillByBatch(params) {
    const deliveryBatchId = store.state.delivery.deliveryBatchId
    const res = await request({
      headerUrl: 'web.order.client.batchSaveOrder',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if (res.code === 0) {
      const asyncParams = {
        api: 'web.query.getOrderBatchSaveResult',
        id: res.data,
        count: params.orderInfos.length,
        beginTime: dayjs(),
        deliveryBatchId
      }
      return await deliveryAsyncApi.getBatchWaybillListResult(asyncParams)
    }
    return res
  }

  /**
   * 仅限单票填单字段校验
   * @param {Object} formData
   * @param {String,Array} fields 需要校验的字段名称
   * @param {Boolean} filterResultField 是否过滤掉结果中不相关的字段错误
   * @returns
   */
  async validateWaybillField(formData, fields, filterResultField = false) {
    const params = deliveryUtil.convertFormDataListToApiParams(formData)
    if (params?.orderInfos?.length > 0) {
      params?.orderInfos?.forEach(f => {
        f.preWaybillStatus = ''
      })
    }
    if (fields) {
      fields = fields.filter(f => formData[f])
      if (fields.length < 1) {
        return { code: 0 }
      }
      const apiFields = deliveryUtil.convertToApiCheckFields(fields)
      params.checkFields = apiFields
    }
    const res = await request({
      headerUrl: 'web.order.client.orderCheck',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    deliveryUtil.addFieldToVerifyApiResult(res.data, filterResultField ? fields : null)
    if (res.code !== 0) {
      res.msg = ''
      if (res.data?.errorResult?.length > 0) {
        res.msg = res.data.errorResult[0].msg
      }
    }
    return res
  }

  async validateWaybillFieldBySingle(id, params) {
    if (params?.orderInfos?.length > 0) {
      params?.orderInfos?.forEach(f => {
        f.preWaybillStatus = ''
      })
    }
    const res = await request({
      headerUrl: 'web.order.client.importCheckOrder',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    deliveryUtil.addFieldToVerifyApiResult(res.data)
    if (!res) {
      return { code: -1 }
    }
    res.data = {
      verifyDataResponses: [
        {
          id,
          ...res.data
        }
      ]
    }
    return res
  }

  async validateWaybillListField(formDataList, fieldName) {
    const params = deliveryUtil.convertFormDataListToApiParams(formDataList)
    if (params?.orderInfos?.length > 0) {
      params?.orderInfos?.forEach(f => {
        f.preWaybillStatus = ''
      })
    }
    const { apiFields, fields } = deliveryUtil.getApiCheckFieldsByFieldName(fieldName)
    if (apiFields) {
      params.checkFields = apiFields
    }
    if (formDataList.length === 1) {
      const res = await this.validateWaybillFieldBySingle(formDataList[0].no, params)
      return { res, validateFields: fields }
    }
    const deliveryBatchId = store.state.delivery.deliveryBatchId
    let res = await request({
      headerUrl: 'web.order.client.batchCheckOrder.import',
      method: 'post',
      data: params
    })
    if (res.code !== 0) {
      res.msg = res.msg || '批量校验接口异常'
      return { res }
    }
    const asyncParams = {
      api: 'web.query.getOrderBatchCheckResult',
      id: res.data,
      count: formDataList.length,
      beginTime: dayjs(),
      deliveryBatchId
    }
    res = await deliveryAsyncApi.getBatchWaybillListResult(asyncParams)
    return {
      res,
      validateFields: fields
    }
  }

  //上传唯品会入库号
  uploadVipshopCode(list) {
    const params = {
      dataList: list
    }
    return request({
      headerUrl: 'web.order.updateVipShopCode',
      method: 'post',
      data: params
    })
  }

  /** 根据用户手机号获取散客用户奖券信息 */
  getCashPrizeInfoByPhoneFWX(params) {
    return request({
      headerUrl: 'kyact.redPrizeInfoErp.getCashPrizeInfoByPhoneFWX',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  /** 根据用户手机号获取散客用户奖券信息 */
  getSkuLists(params) {
    return request({
      headerUrl: 'web.forward.crm.customer.sku.client.search',
      method: 'post',
      data: params
    })
  }

  //修改保存灰度问题数据
  saveGrayWaybillData(params) {
    return request({
      headerUrl: 'inc.client.updateUpgradeWaybillInfo',
      method: 'post',
      data: params
    })
  }

  // 查看运费-申请权限
  freightApplyAdd(applyReason = '') {
    const params = {
      authCodes: ['freightLookAuthFlag'],
      applyReason
    }
    return request({
      headerUrl: 'web.uam.apply.add',
      method: 'post',
      data: params
    })
  }

  // 查看运费-检验权限
  freightApplyCheck() {
    const params = {
      authCodes: ['freightLookAuthFlag']
    }
    return request({
      headerUrl: 'web.uam.apply.check',
      method: 'post',
      data: params
    })
  }

  //获取寄件地址列表
  getSenderAddressList() {
    return request({
      headerUrl: 'web.client.userAddress.getDeliveryAddressInfoList',
      method: 'post',
      data: {},
      hideErrMsg: true
    })
  }
  //修改选择寄件地址状态
  updateSenderAddressStatus() {
    return request({
      headerUrl: 'web.client.userAddress.updateSelectStatus',
      method: 'post',
      data: {},
      hideErrMsg: true
    })
  }

  // 超重超长
  overLengthAndWeight() {
    const params = {}
    return request({
      headerUrl: 'web.order.overLengthAndWeight',
      method: 'post',
      data: params
    })
  }
  // 获取飞机重量超载、尺寸超载起始值信息
  getPlaneOverloadInfo(sendCity, receiveCity, serviceWay) {
    serviceWay = deliveryUtil.getServiceWayCode(serviceWay, false)
    if (!sendCity || !receiveCity || !serviceWay) {
      return { code: -1 }
    }
    const airMailServiceWays = ['10', '20', '60', '80', '210', '340', '1300']
    if (!airMailServiceWays.includes(serviceWay + '')) {
      return { code: -1 }
    }
    const params = [
      {
        onlyId: 1,
        sendCity,
        receiveCity,
        nowTimeFlag: '10',
        serviceType: serviceWay
      }
    ]
    return request({
      headerUrl: 'web.order.flight.getFlightLengthAndWeight',
      method: 'post',
      data: params
    })
  }

  //获取批量导入模板url
  getBatchImportTemplateUrl(isSingBySelf = false) {
    return request({
      headerUrl: 'web.client.customizeTemplateConfig.getTemplateUrl',
      method: 'post',
      data: { selfSignFlag: isSingBySelf ? 10 : 20 },
      hideErrMsg: true
    })
  }
  //获取批量导入失败数据Excel url
  getBatchImportFailDataExcelUrl(params) {
    return request({
      headerUrl: 'web.client.customizeTemplateConfig.getExportErrorDataUrl',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }
  //获取批量导入模板更新状态
  getBatchImportTemplateStatus() {
    return request({
      headerUrl: 'web.client.customizeTemplateConfig.getDownloadStatus',
      method: 'post',
      data: {},
      hideErrMsg: true
    })
  }
  //更新批量导入Excel自定义列
  setBatchImportTemplateCustomColumns({ excelCustomColumnTexts, isDefaultKaColumns }) {
    let arr = (excelCustomColumnTexts || []).map(m => ({
      customerField: m,
      orderMustStatus: 0
    }))
    if (isDefaultKaColumns) {
      arr = store.getters.customFields?.map(m => ({
        customerField: m.label,
        orderMustStatus: m.required ? 1 : 0
      }))
    }
    return request({
      headerUrl: 'web.client.customizeTemplateConfig.updateDownloadStatus',
      method: 'post',
      data: { customerMappings: arr || [] },
      hideErrMsg: true
    })
  }

  //获取用户到付免校验权限
  getDeliveryPaymentAuth() {
    return request({
      headerUrl: 'web.query.getPayOnDeliveryPermission',
      method: 'post',
      data: {}
    })
  }
  //获取公司信息
  getCompanyInfoByName(name) {
    const params = [{ customerName: name }]
    return request({
      headerUrl: 'web.uam.payAuthorize.getCustomer',
      method: 'post',
      data: params
    })
  }

  // //获取用户调价提示信息
  // async getAdjustPriceMessage(){
  //   const res = await this.getAdjustPriceInfo()
  //   if(res.code === 0 && res.data.adjustType === '10' && res.data.strategyFlag ){
  //     return res.data.customerTips
  //   }
  // }
  //获取用户调价信息
  getAdjustPriceInfo(customerCode) {
    const params = { customerCode: customerCode || storage.getCustomerCode() }
    return request({
      headerUrl: 'web.order.adjustPrice.getAdjustPrice',
      method: 'post',
      data: params
    })
  }

  //获取用户调价详情
  getAdjustPriceDetail({ adjustId, customerCode }) {
    const params = {
      adjustId,
      customerCode: customerCode || storage.getCustomerCode(),
      source: 5
    }
    return request({
      headerUrl: 'web.order.adjustPrice.getAdjustPriceDetail',
      method: 'post',
      data: params
    })
  }

  //确认调价
  comfirmAdjustPrice({ adjustId, customerConfirmFlag, customerCode }) {
    const params = {
      adjustId,
      customerConfirmFlag,
      customerNoticeFlag: 5,
      customerCode: customerCode || storage.getCustomerCode()
    }
    return request({
      headerUrl: 'web.order.adjustPrice.customerConfirmAdjustPrice',
      method: 'post',
      data: params
    })
  }
  //获取抛重系数
  getVolumetriceWeight(params){
    return request({
      headerUrl: 'web.order.third.getCrmWeightCoefficient',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }

  //单票修改单独校验寄、收地址限取派
  async getAddressRestrictMessagesByModify(formData){
    const params = {
      source: '30',
      restrictParams: [
        {
          requestId: '1',
          deliveryInfo : {
            address: formData.qhAddress,
          }
        },
        {
          requestId: '2',
          pickupInfo : {
            address:formData.sjAddress,
            preDispatchTime:deliveryUtil.getEstimateArriveTime(formData),
          }
        }
      ]
    }
    const res = await request({
      headerUrl: 'web.order.restrict.getResult',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if(res.code === 0 && res.data){
      return {
        qhAddressResult: deliveryUtil.getSingleRestrictResult(res.data,'1'),
        sjAddressResult: deliveryUtil.getSingleRestrictResult(res.data,'2'),
      }
    }
  }

  //获取下单限取派
  async getAddressRestrictMessage(formData){
    const params = {
      source: '30',
      restrictParams: [
        {
          requestId: '1',
          serviceType:deliveryUtil.getServiceWayCode(formData.serviceWay,false) ,
          weight: formData.weight
        }
      ]
    }
    if(formData.qhAddress){
      params.restrictParams[0].deliveryInfo = {
        address: formData.qhAddress,
      }
    }
    if(formData.sjAddress){
      params.restrictParams[0].pickupInfo = {
        address:formData.sjAddress,
        preDispatchTime:deliveryUtil.getEstimateArriveTime(formData),
      }
    }
    const res = await request({
      headerUrl: 'web.order.restrict.getResult',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
    if(res.code === 0 && res.data){
      return deliveryUtil.getSingleRestrictResult(res.data,'1')
    }
  }

  //报关入仓-入仓费查询 (V1.0)
  getWarehousingPrice(formData){
    const fields = ['sjAddress', 'qhAddress', 'payWay', 'serviceWay']
    if(fields.some(f => ! formData[f])){
      return {code: -1}
    }
    const params = {
      warehousingList: [{
        id: 1,
        payMode: formData.payWay,
        serviceType: formData.serviceWay,
        beginAddress: formData.qhAddress,
        endAddress: formData.sjAddress,
        weight:formData.weight,
        sendCustomerCode:storage.getCustomerCode()
      }]
    }
    return request({
      headerUrl: 'web.order.getWarehousingPrice',
      method: 'post',
      data: params,
      hideErrMsg: true
    })
  }
}

export default new Delivery()
