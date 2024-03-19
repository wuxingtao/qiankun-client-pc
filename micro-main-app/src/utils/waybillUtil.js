import { getAutoOrderInfo } from '@/services/api/waybillOld'
import { readFileToBase64, getExtraPacking } from '@utils/clientUtil'
import { base64ToFile } from '@utils/commonUtil'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'
import store from '@/store'
import { batchPrint, batchPrint_136, batchPrint_210, getPrinters,batchPrint_130} from '@/services/api/common'
import {  getPhone, getCustomerCode } from '@/utils/storage'

class WaybillUtil {
  //判断是否可下单
  async canPlaceOrder() {
    let res = await getAutoOrderInfo()
    if (res.code === 0) {
      const model = res.data
      if (model && model.isCanAutoAddOrder === '0') {
        const msg = `您的公司暂不支持下单，如有疑问请联系您的商务${model.contactPeople} ${model.contactPhone}`
        return msg
      }
    }
  }

  //处理打印数据
  /*
  运单打印查询结果字段转换
*/
  convertQueryPrintModels(waybills) {
    if (!waybills) {
      return []
    }
    const result = waybills.map(val => ({
      ydNo: val.waybillNumber,
      goods: val.goodsType,
      sjQH: val.pickup.pickupAreaCode,
      sjCompany: val.pickup.pickupCustomerName,
      sjContactPerson: val.pickup.pickupPerson,
      sjAddress: val.pickup.pickupAddress,
      sjMobile: val.pickup.pickupMobile,
      sjTelephone: val.pickup.pickupPhone,
      zoneName: val.pickup.networkArea,
      receiptDepotAllName: val.pickup.pickupNetwork, //收件点部
      regionCode: this.handRegion(val.pickup.region),
      jjContactPerson: val.delivery.deliveryPerson || '',
      qHAddress: val.delivery.deliveryAddress,
      JJAddress: val.delivery.deliveryAddress,
      jjTelePhone: val.delivery.deliveryPhone,
      jjCompany: val.delivery.deliveryCustomerName,
      sms: val.delivery.deliveryMobile,
      agentCode: (val.agent.agentCode || '') + '', //代理平台
      transferType: (val.agent.transferType || '') + '', //中转方式：1始发转 2目的转
      targetSortCenterName: val.agent.exterNodeName, //目的分拣中心（代理商）
      originNodeName: val.agent.originNodeName,
      JDCode: val.agent.agentNumber,
      transportType: (val.agent.transportType || '') + '',
      productType: (val.agent.productType || '') + '',
      cityShortCode: val.agent.cityShortCode, //丹鸟
      cpShortCode: val.agent.cpShortCode, //丹鸟
      originNodeCode: val.agent.originTabletrolleyCode,
      destinationNodeWaterCode: val.agent.destinationNodeWaterCode,
      destinationCrossCode: val.agent.destinationCrossCode, //目的滑道号
      destinationTabletrolleyCode: val.agent.destinationTabletrolleyCode, //目的笼车号
      temperatureType: (val.agent.temperatureType || '') + '', //温区
      road: val.agent.destinationRoad, //路区

      weight: val.actualWeight,
      count: val.count,
      serviceMode: val.serviceMode,
      payWay: this.handlePayMode(val.payMode),
      payAccount: val.paymentCustomerCode,
      totalCost: this.numberToString(val.totalCost),
      jjRemark: val.waybillRemark,

      jjDateTime: val.deliveryTime
        ? dayjs(parseInt(val.deliveryTime)).format('YYYY-MM-DD HH:mm')
        : '', //缺少寄件时间

      receiver: val.pickupPerson,
      receiptFlag: val.receiptFlag,
      hdCount: val.receiptCount,
      money: val.insuranceValue,
      dsMoney: val.collectingAmount,
      mjWay: val.woodenFrameFlag, //缺少包装服务

      serviceWay: val.serviceMode,
      payMode: this.handlePayMode(val.payMode),
      sizeList:
        val.goodsSize &&
        val.goodsSize.map(m => ({
          width: m.width,
          len: m.length,
          height: m.height,
          number: m.count || 1,
        })), //缺少尺寸数组
      vipshopCode: val.productCode,

      SJOperateDepartShortName: val.sendDepartmentName, //取派点部  --待验证
      destAirport: val.destinationAirport, //目的机场
      outboundAllocation: val.kyeInitialDistribution, //始发分拨
      destinationTransfer: val.stairDistribution, //目的分拨  --待验证

      targetSortCenterId: val.targetSortCenterId,

      SizeText: val.goodsSize,
      destinationSiteName: val.agent.destinationSiteName, //目的营业部名称
      viewBarCode: val.viewBarCode, //缺少
      freight: val.freight,
      freightWeight: val.freightWeight,
      watermark: val.watermarkCode,
      childYdCodes: val.sonNumber,
      addWorkDay:val.addWorkDay, //加工作日
      securityCode:val.securityCode
    }))
    return result
  }

  numberToString(number) {
    const value = Number(number)
    if (!number || value < 0) {
      return ''
    }
    return number + ''
  }

  async handleUploadFile(inputFile) {
    const base64 = await readFileToBase64(inputFile, true)
    return base64ToFile(base64, inputFile.name)
  }

  handlePayMode(val) {
    let payModeText = val
    switch (val) {
      case '10':
        payModeText = '寄方付'
        break
      case '20':
        payModeText = '收方付'
        break
      case '30':
        payModeText = '第三方付'
        break
    }
    return payModeText
  }

  handRegion(val) {
    let text = ''
    switch (val) {
      case '10':
        text = '华东'
        break
      case '20':
        text = '华南'
        break
      case '30':
        text = '华北'
        break
      case '40':
        text = '京津冀'
        break
    }
    return text
  }

  // 通知司机取件》格式化运单详情数据
  waybillNoticeFormat(waybill) {
    const {
      ydNo = '',
      qhAddress = '',
      jjContactPerson = '',
      sms, //寄件手机
      contactName,//取货联系人
      contactPhone,//取货联系人手机
      qhContactPerson = '',
      qhContactWay = '',
      goods,
      waybillDelivery = {},
      waybillPickup = {},
    } = waybill
    const model = {
      waybillNumber: ydNo || uuidv4(),
      deliveryAddress: waybillDelivery.address || qhAddress,
      deliveryMobile: waybillDelivery.mobile || sms,
      deliveryPerson: waybillDelivery.person || jjContactPerson,
      pickupContactPhone: contactPhone || qhContactWay ,
      pickupContactPerson: contactName || qhContactPerson,
      goodsType:goods,
      ...waybill,
    }
    model.pickupContactPhone = model.pickupContactPhone || model.waybillContactPhone || model.qhTelePhone ||model.contactFixPhone || model.deliveryMobile
    model.pickupContactPerson = model.pickupContactPerson || model.deliveryPerson
    return model
  }

  /**
   * 转化为云打印模板
   * @param {Array} waybills
   * @returns
   */
  convertPrintModelsForCloudPrint(waybills) {
    return waybills.map(val => ({
      YDCode: val.ydNo,
      JJCompanyNa: val.jjCompany,
      SJCompanyNa: val.sjCompany,
      SJAddress: val.sjAddress,
      JJAddress: val.qHAddress,
      ServerModel: val.serviceWay,
      PayType: val.payWay,
      JJPeople: val.jjContactPerson,
      SJPeople: val.sjContactPerson,
      Number: this.numberToString(val.count) || '0',
      SJQH: val.sjQH,
      SJMobile: val.sjMobile,
      SJTelPhone: val.sjTelephone,
      JJMobile: val.sms,
      JJTelPhone: val.jjTelePhone,
      JJNote: val.jjRemark + (val.mjWay ? ';' + getExtraPacking(val.mjWay, false) : ''),
      IsHD: Number(val.receiptCount) > 0 ? '1' : '0',
      DSAmount: this.numberToString(val.dsMoney),
      SaveValue: this.numberToString(val.money),
      BFAmount: this.numberToString(val.premium),
      DSHKAmount: this.numberToString(val.dsCommission),
      JJTime: val.jjDateTime,
      BJNO: val.airplaneCode,
      SizeInfoList: val.sizeList,
      Freight: this.numberToString(val.freight),
      IsUrgent: val.isUrgent,
      Article: val.goods,
      Weight: this.numberToString(val.weight),
      YJCardNo: val.payAccount,
      EndAirportShortName: val.destAirport,
      FirstClassDistFullName: val.destinationTransfer,
      SJOperateDepartShortName: val.SJOperateDepartShortName,
      SJDepot: val.receiptDepotAllName,
      zoneName: val.zoneName,
      destinationCode:
        (val.destinationCrossCode || '') + '-' + (val.destinationTabletrolleyCode || ''),
      outboundAllocation: val.outboundAllocation,
      regionCode: val.regionCode,
      JDCode: val.JDCode || val.jdCode,
      jdBzDepartName: val.destinationSiteName || val.siteName,
      jdAllCateCenterName: val.targetSortCenterName,
      jdAllCateCenterNo:
        (val.destinationCrossCode || '') + '-' + (val.destinationTabletrolleyCode || ''),
      jdDepartNumber: val.road,
      siteId: val.siteId,
      targetSortCenterId: val.targetSortCenterId,
      agentCode: val.agentCode,
      cpShortCode: val.cpShortCode,
      cityShortCode: val.cityShortCode,
      cpShortCode_cityShortCode: (val.cpShortCode || '') + '-' + (val.cityShortCode || ''),
      transferType: this.numberToString(val.transferType),
      productType: val.productType,
      transportType: this.numberToString(val.transportType),
      temperatureType: val.temperatureType,
      originNodeName: val.originNodeName,
      originNodeCode: val.originNodeCode,
      originCrossCode: val.originNodeCode ? val.originNodeCode.split('-')[0] || '' : '',
      originTabletrolleyCode: val.originNodeCode ? val.originNodeCode.split('-')[1] || '' : '',
      destinationNodeWaterCode: val.destinationNodeWaterCode,
      viewBarCode: val.viewBarCode,
      watermark: val.waterMark,
      depotAndPartition: val.receiptDepotAllName + val.zoneName,
      jdShopCode: val.JDCode || val.jdCode,
      FreezingSign: '',
      ReceiptFlag: val.receiptFlag,
      ReceiptNum: this.numberToString(val.hdCount),
      ChildYDCodes: val.childYdCodes,
      VipshopCode: val.vipshopCode,
      JFWeight:val.freightWeight,
      TotalCost:val.totalCost,
      addWorkDay:val.addWorkDay
    }))
  }

  /**
   * 转换为本地打印模板
   * @param {Array} waybills
   * @returns
   */
  convertPrintModelsForLocalPrint(waybills) {
    return waybills.map(val => ({
      agentCode: val.agentCode,
      article: val.goods,
      dsAmount: val.dsMoney,
      destinationAirport: val.destAirport,
      jjAddress: val.JJAddress,
      jjCompanyNa: val.jjCompany,
      jjMobile: val.sms,
      jjNote: val.jjRemark + (val.mjWay ? ';' + getExtraPacking(val.mjWay, false) : ''),
      jjPeople: val.jjContactPerson,
      jjTelPhone: val.jjTelePhone,
      number: val.count,
      payType: val.payWay,
      receiptFlag: val.receiptFlag,
      isHD: val.receiptFlag !== '20' ? '1' : '',
      receiptNum: val.hdCount,
      sjAddress: val.sjAddress,
      sjCompanyNa: val.sjCompany,
      sjMobile: val.sjMobile,
      sjOperateDepartShortName: val.SJOperateDepartShortName,
      sjPeople: val.sjContactPerson,
      sjTelPhone: val.sjTelephone,
      saveValue: val.money,
      serverModel: val.serviceWay,
      weight: val.weight,
      ydCode: val.ydNo,
      transferType: val.transferType,
      childYdCodes: val.childYdCodes,
      targetSortCenterName: val.targetSortCenterName,
      originNodeName: val.originNodeName,
      sizeInfoList: val.sizeList?.map(item => ({
        len: item.len || item.Len,
        height: item.height || item.Height,
        width: item.width || item.Width,
        number: item.number || item.Number,
      })),
      deliveryBarCode: val.JDCode || val.jdCode,
      transportType: val.transportType,
      productType: val.productType,
      waterMark: val.waterMark,
      jfWeight: val.freightWeight,
      yjCardNo: val.payAccount,
      depotPartition: val.zoneName,
      destinationCode:
        (val.destinationCrossCode || '') + '-' + (val.destinationTabletrolleyCode || ''),
      temperatureType: val.temperatureType,
      siteId: val.siteId,
      destinationRoad: val.road,
      targetSortCenterId: val.targetSortCenterId,
      cityShortCode: val.cityShortCode,
      cpShortCode: val.cpShortCode,
      originCode: val.originNodeCode,
      destinationNodeWaterCode: val.destinationNodeWaterCode,
      vipShopCode: val.vipshopCode,
      destinationTransfer: val.destinationTransfer,
      jjTime: val.jjDateTime,
      freight: val.freight,
      receiptAmount: val.receiptAmount,
      endBigAreaName: val.regionCode,
      originatingDistribution: val.outboundAllocation,
      motherWaybillSign: true,
      sjQH: val.sjQH,
      sjDepot: val.receiptDepotAllName,
      destinationSiteName: val.destinationSiteName || val.siteName,
      totalCost: val.totalCost,
      addWorkDay:val.addWorkDay
    }))
  }

  /**
 *
 * @param {Object} waybills 运单数据
 * @param {String} printerNo 打印机编码，
 */
  async printByCloudPrinter(waybills, printerNo,sendStubChecked,childMotherChecked,sheetType,encryptionText,isBatchPrint=true) {
    let msg = ''
    if (!printerNo) {
      ({ msg, printerNo } = await this.checkPrinter())
    }
    if (msg) {
      return msg
    }
    let models = this.convertPrintModelsForCloudPrint(waybills)
    let res
    // const sheetType = store.state.setModule.printInfo.sheetType
    if (!sheetType || sheetType === '1') {
      res = await batchPrint_210(models, printerNo, encryptionText||store.getters.encryptionText,sendStubChecked,childMotherChecked)
    }else if(sheetType==='oneCopy'||sheetType==='oneCopySub'){
      let templateId=1
      if(sheetType==='oneCopySub'){
        templateId=5
      }
      res=await batchPrint_130(models, printerNo, encryptionText||store.getters.encryptionText,sendStubChecked,childMotherChecked,templateId)
    } else {
      let templateId=1
      if ( ['3','136Stub'].includes(sheetType)){
        templateId=5
      }
      res = await batchPrint_136(models, printerNo,encryptionText|| store.getters.encryptionText,sendStubChecked,childMotherChecked,templateId)
    }
    if (res.code != 0) {
      throw res.msg
    }
    let params = {
      mobile: getPhone(),
      companyNo: getCustomerCode(),
      dataList: waybills.map((m, index) => ({ no: index, ydNo: m.ydNo })),
    }
    if(isBatchPrint){
      await batchPrint(params)
    }
  }
  /**
 * 返回打印机编号、错误信息
 */
  async  checkPrinter() {
    let sheetType = store.state.setModule.printInfo.sheetType
    if (sheetType != '1' && sheetType != '2'&&sheetType!='oneCopy'&&sheetType!='oneCopySub') {
      return { msg: '您未设置打印模板' }
    }
    let printConfig = store.state.setModule.printInfo
    if (!printConfig || !printConfig.printModel) {
      return { msg: '您未设置默认打印机' }
    }
    let printerNo = printConfig.printModel
    if (printerNo.includes('跨越云打印机')) {
      printerNo = printerNo.match(/\(([^)]*)\)/)[1]
    }
    const res = await getPrinters()
    if (res.code == 0 && res.data.dataList) {
      if (!res.data.dataList.some(p => p.printerId == printerNo)) {
        return { msg: '您未设置默认打印机' }
      }
      return { printerNo }
    } else {
      return { msg: res.msg }
    }
  }
}

export default new WaybillUtil()
