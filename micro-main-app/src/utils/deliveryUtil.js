import store from '@/store'
import * as storageUtil from '@/utils/storage'
import * as clientUtil from '@/utils/clientUtil'
import native from '@utils/native'
import dayjs from 'dayjs'
import _ from 'lodash'

class DeliveryUtil {
  async sleep(timeout = 300) {
    await new Promise(resolve => {
      setTimeout(resolve, timeout)
    })
  }
  //下单校验接口出参字段对应关系
  fieldDict = {
    //寄方信息
    jjCompany: 'preWaybillDelivery.companyName',
    jjContactPerson: 'preWaybillDelivery.person',
    sms: 'preWaybillDelivery.mobile',
    jjTelePhone: 'preWaybillDelivery.phone',
    qhAddress: 'preWaybillDelivery.address',
    qhContactPerson: 'orderPickupInfo.person',
    qhContactWay:'orderPickupInfo.mobile',
    qhTelePhone:'orderPickupInfo.phone',
    //收方信息
    sjCompany: 'preWaybillPickup.companyName',
    sjContactPerson: 'preWaybillPickup.person',
    sjMobile: 'preWaybillPickup.mobile',
    sjTelephone: 'preWaybillPickup.phone',
    sjAddress: 'preWaybillPickup.address',
    //货物信息
    goodsTime: 'goodsTime',
    goods: 'goodsType',
    weight: 'actualWeight',
    count: 'count',
    payWay: 'payMode',
    payAccount: 'payAccount',
    vipshopCode: 'productCode',
    serviceWay: 'serviceMode',
    declaredValue: 'declarativeValue',
    insuranceValueSource: 'insuranceValueSource',
    receiptFlag: 'receiptFlag',
    hdCount: 'receiptCount',
    mjWay: 'woodenFrame',
    dsMoney: 'collectionAmount',
    jjRemark: 'waybillRemark',
    sizeList: 'preWaybillGoodsSizeList',
  }

  //尺寸转立方
  convertToCube(sizeList) {
    if (!sizeList || sizeList.length < 1) {
      return 0
    }
    const toNumber = value => {
      return Number(value) || 0
    }
    let cube =
      sizeList.reduce((total, cur) => {
        total +=
          (cur.count || 1) * toNumber(cur['length']) * toNumber(cur.width) * toNumber(cur.height)
        return total
      }, 0) || 0
    if (cube > 0) {
      cube = (cube / 1000 / 1000).toFixed(4)
    }
    cube = Number(cube) || 0
    return cube
  }

  //获取抛重提示语
  getVolumetricWeightText(cube,volumetricWeightRatio){
    if(!cube || !volumetricWeightRatio){
      return ''
    }
    let volumetricWeight = cube / volumetricWeightRatio * 1000 * 1000
    volumetricWeight = volumetricWeight.toFixed(2)
    if(volumetricWeight > 0){
      return `抛重：${volumetricWeight}kg`
    }
  }

  //取得服务方式编码
  getServiceWayCode(serviceWay,returnOrignWhenEmpty = true) {
    if (!serviceWay) {
      return ''
    }
    if(Number.isInteger(Number(serviceWay))){
      return serviceWay
    }
    const {serviceWayDict , defaultServiceWayDict} = store.state.common
    const options = serviceWayDict || defaultServiceWayDict
    if (!Number.isInteger(Number(serviceWay)) && options?.length > 0) {
      const item = options.find(f => f.label === serviceWay)
      if(returnOrignWhenEmpty){
        return item?.value || serviceWay
      }
      return item?.value
    }
    if(returnOrignWhenEmpty){
      return serviceWay
    }
  }

  //从formData中取得付款账号，针对寄方付和收方付做特殊处理
  getPayAccount(formData, notEmpty) {
    if(formData.payWay === '20' && formData.paymentCustomerCode){
      return formData.paymentCustomerCode
    }
    const isSenderPay = formData.payWay === '10'
    const customerCode = isSenderPay ? storageUtil.getCustomerCode() : formData.payAccount
    if (notEmpty && !customerCode) {
      return storageUtil.getCustomerCode()
    }
    return customerCode
  }

  //从formData中取得完整的地址
  getFullAddress(formData, key) {
    if (!formData || !key) {
      return ''
    }
    if (formData[key]) {
      return formData[key] || ''
    }
    const addressData = formData[key + 'Data']
    if (!this.isAddressDataEmpty(addressData)) {
      const districtText = addressData.districtList?.join('').trim() || ''
      const address = districtText + (addressData.detailAddress || '')
      return address
    }
    return ''
  }

  /**
   * formData转化为字段校验和保存接口入参
   * @param {Object,Array} formDataList
   * @param {Object} noticePickupInfo 通知司机取货信息
   * @param {boolean} withPrint 是否是下单并打印
   * @returns
   */
  convertFormDataListToApiParams(formDataList, noticePickupInfo,withPrint) {
    if (!Array.isArray(formDataList)) {
      formDataList = [formDataList]
    }
    const orderInfos = formDataList.map(m =>
      this.convertFormDataToApiOrderParams(m, noticePickupInfo, withPrint)
    )
    const data = {
      orderSource: native.isClientMode() ? '210' : '120',
      orderType: noticePickupInfo ? '20' : '10',
      payAuthorizeFlag:'10',
      orderInfos
    }
    if(withPrint){
      data.printFlag = '10'
    }
    if(store.getters.isVipshopUser){
      data.asyncNotifyFlag = '10'
    }
    return data
  }

  getAddressDataForApiOrderParams(formData) {
    let qhAddressData = { detailAddress: formData.qhAddress }
    let sjAddressData = { detailAddress: formData.sjAddress }

    if (
      !this.isAddressDataEmpty(formData.qhAddressData) &&
      !this.isAddressDataEmpty(formData.sjAddressData)
    ) {
      qhAddressData = {
        provinceName: formData.qhAddressData?.districtList[0],
        cityName: formData.qhAddressData?.districtList[1],
        countyName: formData.qhAddressData?.districtList[2],
        detailAddress: formData.qhAddressData?.detailAddress
      }
      sjAddressData = {
        provinceName: formData.sjAddressData?.districtList[0],
        cityName: formData.sjAddressData?.districtList[1],
        countyName: formData.sjAddressData?.districtList[2],
        detailAddress: formData.sjAddressData?.detailAddress
      }
    }
    return { qhAddressData, sjAddressData }
  }
  //设置通知司机取货信息参数
  setNoticeupForApiOrderParams(orderParams, noticePickupInfo) {
    if (!noticePickupInfo) {
      return
    }
    orderParams.goodsTime = noticePickupInfo.goodsTime
    orderParams.goodsTimeFlag = noticePickupInfo.goodsTimeFlag
    orderParams.orderPickupInfo.roughlyCount = noticePickupInfo.estimateCount
    orderParams.orderPickupInfo.roughlyWeight = noticePickupInfo.estimateWeight
    orderParams.orderPickupInfo.bigGoodsFlag = noticePickupInfo.bigGoodsFlag
    orderParams.orderPickupInfo.orderRemark = noticePickupInfo.orderContent
    orderParams.orderPickupInfo.bulkCargoInfos = noticePickupInfo.bulkCargoInfos
  }
  convertFormDataToApiOrderParams(formData, noticePickupInfo) {
    const { qhAddressData, sjAddressData } = this.getAddressDataForApiOrderParams(formData)
    this.formatNumberFieldOfModel(formData)
    const orderParams = {
      preWaybillStatus: (noticePickupInfo || formData.goodsTime) ? '' : '10',
      waybillSource: native.isClientMode() ? '140' : '120',
      waybillType: '40',
      id: formData.no || 0,
      waybillNumber: formData.ydNo,
      openFlag: formData.NeedUnbox === 1 ? '10' : '20',
      //取货信息
      orderPickupInfo: {
        person: formData.qhContactPerson,
        mobile: formData.qhContactWay,
        phone: formData.qhTelePhone
      },
      selfSignFlag: formData.isSignSelf ? 10 : 20, // 数据字段：common_yes_no 10是 20否
      //寄件信息
      preWaybillDelivery: {
        companyName: formData.jjCompany,
        person: formData.jjContactPerson,
        mobile: formData.sms,
        phone: formData.jjTelePhone,
        //  address:formData.qhAddress,
        ...qhAddressData,
        outWareHouseName: formData.sendHouseName,
        outWareHouseType: formData.sendHouseName ? formData.houseType : '',
        outWareHouseFlag: formData.sendHouseName ? '10' : '',
        delayTime: formData.delayTime
      },
      //收方信息
      preWaybillPickup: {
        companyName: formData.sjCompany,
        person: formData.sjContactPerson,
        mobile: formData.sjMobile,
        phone: formData.sjTelephone,
        //  address:formData.sjAddress,
        ...sjAddressData,
        deliveryMode: formData.deliveryMode,
        selfPickupMobile: formData.selfPickupMobile
      },
      //货物信息
      goodsTime: formData.goodsTime,
      goodsType: formData.goods,
      actualWeight: formData.weight,
      count: formData.count,
      payMode: formData.payWay,
      payAccount: formData.payAccount,
      productCode: formData.vipshopCode,
      serviceMode: formData.serviceWay,
      declarativeValue: formData.declaredValue,
      insuranceValueSource: formData.insuranceValueSource || '20',
      receiptFlag: formData.receiptFlag,
      receiptCount: formData.hdCount,
      woodenFrame: formData.mjWay?.trim(),
      collectionAmount: formData.dsMoney,
      waybillRemark: formData.jjRemark,
      preWaybillGoodsSizeList: (formData.sizeList || []).map(m => ({
        length: m['length'],
        width: m.width,
        height: m.height,
        count: m.count
      })),
      volumeSize:Number(formData.cube) || '',
      couponCode: formData.coupon?.prizeCode,
      oldCouponCode: formData.oldCouponCode,
      /** 折扣后金额 */
      afterDiscountAmount: Number(formData.coupon?.afterDiscountAmount) || 0,
      estimateArriveTime: this.getEstimateArriveTime(formData),
      noPayCustomerFlag: formData.noPayCustomerFlag,
      /** 自定义字段集合 */
      customerFieldInfos: formData.customerFieldInfos,
      // version: formData.modifyVersion
    }
    if(formData.checkedCustomsCharge){
      orderParams.orderWarehouseInfo = {
        warehouseFlag: '10',
        warehouseCheckFlag: formData.checkedCustomsCharge
      }
    }
    if(formData.declaredValue){ //保价声明有值时，声明来源就为20
      orderParams.insuranceValueSource = '20'
    }
    if (formData.isSaveSenderInfo && formData.isSaveReceiverInfo) {
      orderParams.saveAddressFlag = '30'
    } else if (formData.isSaveSenderInfo) {
      orderParams.saveAddressFlag = '10'
    } else if (formData.isSaveReceiverInfo) {
      orderParams.saveAddressFlag = '20'
    }
    this.setNoticeupForApiOrderParams(orderParams, noticePickupInfo)
    return orderParams
  }

  formatNumberFieldOfModel(model) {
    const numberFields = [
      'hdCount',
      'money',
      // 'declaredValue',
      'premium',
      'dsMoney',
      'dsCommission',
      'count',
      'weight'
    ]
    const keys = Object.keys(model)
    numberFields
      .filter(n => keys.includes(n))
      .forEach(n => {
        if (Number(model[n]) <= 0) {
          model[n] = null
        } else {
          model[n] = Number(model[n]) || null
        }
      })
  }

  //获取接口需要的预计到达时间
  getEstimateArriveTime(formData) {
    if (!formData.qhAddress || !formData.sjAddress || !formData.serviceWay) {
      return null
    }
    if (!formData.estimateArriveTime) {
      return ''
    }
    return dayjs(formData.estimateArriveTime).format('YYYY-MM-DD HH:mm')
  }

  getGoodsTime(formData) {
    let goodsTime = dayjs().format('YYYY-MM-DD HH:mm')
    if (formData.goodsTime) {
      goodsTime = dayjs(formData.goodsTime).format('YYYY-MM-DD HH:mm')
    }
    return goodsTime
  }

  isAddressDataEmpty(addressData) {
    if (!addressData) {
      return true
    }
    if (
      (!addressData.districtList || addressData.districtList.length < 1) &&
      !addressData.detailAddress
    ) {
      return true
    }
    return false
  }

  //将接口校验字段转化为FormData字段
  convertFromApiCheckField(field) {
    if (!field) {
      return
    }
    field = field.replace('orderInfos.', '')
    //处理特殊字段对应关系
    const dict = {'volumeSize':'sizeList'} //,'address.limit':'_errorExt'
    if(dict[field]){
      return dict[field]
    }
    return Object.keys(this.fieldDict).find(k => this.fieldDict[k] === field)
  }

  //将表格字段转化为接口校验字段
  convertToApiCheckFields(fields) {
    if (!Array.isArray(fields)) {
      fields = [fields]
    }
    const apiFields = fields.map(f => this.fieldDict[f]).filter(f => f)
    return apiFields.map(f => 'orderInfos.' + f)
  }

  /**
   * 添加字段至校验接口结果
   * @param {Object} res {code:0,data:{errorResult:[{}],warnResult:[{}]}}
   */
  addFieldToVerifyApiResult(data, filterFields) {
    if (!data) {
      return
    }
    data.errorResult?.forEach(e => {
      e.field = this.convertFromApiCheckField(e.paramName)
    })
    data.warnResult?.forEach(e => {
      e.field = this.convertFromApiCheckField(e.paramName)
    })
    const sjAddressWarnResult = (data.warnResult || []).filter(f => f.field === 'sjAddress')
    const qhAddressWarnResult = (data.warnResult || []).filter(f => f.field === 'qhAddress')
    const getWarnMsg = warnResult => {
      return warnResult
        .map(m => m.msg)
        .reduce((init, cur, index) => {
          init += `${index + 1}.${cur}<br/>`
          return init
        }, '')
    }
    if (sjAddressWarnResult.length > 1) {
      const msg = getWarnMsg(sjAddressWarnResult)
      sjAddressWarnResult.forEach(e => (e.msg = msg))
    }
    if (qhAddressWarnResult.length > 1) {
      const msg = getWarnMsg(qhAddressWarnResult)
      qhAddressWarnResult.forEach(e => (e.msg = msg))
    }
    if (filterFields) {
      if (data.errorResult?.length > 0) {
        data.errorResult = data.errorResult.filter(f => filterFields.includes(f.field))
      }
      if (data?.warnResult?.length > 0) {
        data.warnResult = data.warnResult.filter(f => filterFields.includes(f.field))
      }
    }
  }
  //表格编辑时，取得相关字段去校验
  getApiCheckFieldsByFieldName(fieldName) {
    if (!fieldName) {
      return {}
    }
    let fields = [fieldName]
    const goodsFields = ['goods', 'serviceWay']
    const payAccountFields = ['payWay', 'payAccount']
    const serviceWayFields = ['serviceWay', 'sjAddress', 'qhAddress']
    const sjAddressFields = ['sjAddress', 'payWay','serviceWay']
    const adjustPriceFields = ['weight', 'count']
    const payAuthFields = ['sjCompany','sjMobile','sjTelephone','sjAddress','payWay']

    if (goodsFields.includes(fieldName)) {
      fields.push(...goodsFields)
    }
    if (serviceWayFields.includes(fieldName)) {
      fields.push(...serviceWayFields)
    }
    if (payAccountFields.includes(fieldName)) {
      fields.push(...payAccountFields)
    }
    if (sjAddressFields.includes(fieldName)) {
      fields.push(...sjAddressFields)
    }
    if (adjustPriceFields.includes(fieldName)) {
      fields.push(...adjustPriceFields)
    }
    if (payAuthFields.includes(fieldName)) {
      fields.push(...payAuthFields)
    }
    const apiFields = this.convertToApiCheckFields(_.uniq(fields))
    if (adjustPriceFields.includes(fieldName)) {
      fields.push('sjAddress')
    }
    return {
      apiFields,
      fields
    }
  }

  convertAddressData(addressInfo) {
    return {
      districtList: [addressInfo.province, addressInfo.city, addressInfo.district].filter(f => f),
      detailAddress: addressInfo.detailAddress
    }
  }
  /**
   * 修改或再来一单
   * @param {Object} data
   * @param {Boolean} isCopy
   * @returns
   */
  convertWaybillDetaillToFormData(data, isCopy) {
    const isSignBySelf = store.getters.isSignBySelf && data.selfSignFlag === 10
    const formData = {
      //寄方信息
      jjCompany: data.waybillDelivery.customerName,
      jjContactPerson: data.waybillDelivery.person,
      sms: data.waybillDelivery.mobile, //寄件手机号,
      jjTelePhone: data.waybillDelivery.phone,
      houseType: data.inWareHouseType || data.outWareHouseType, //仓库类型
      sendHouseName: data.outWareHouseName, //寄方退货仓
      qhAddressData: this.convertAddressData(data.waybillDelivery),
      qhAddress: data.waybillDelivery.address,
      qhContactPerson: data.contactName,
      qhContactWay: data.contactPhone,
      qhTelePhone: data.contactTelPhone,
      //收方信息
      sjAddressData: this.convertAddressData(data.waybillPickup),
      sjAddress: data.waybillPickup.address,
      sjCompany: data.waybillPickup.customerName,
      sjContactPerson: data.waybillPickup.person,
      sjMobile: data.waybillPickup.mobile,
      sjTelephone: data.waybillPickup.phone,
      isSignSelf: isSignBySelf ? true : false,
      //货物信息
      goodsTime: data.goodsTime,
      goods: data.goodsType,
      weight: data.actualWeight,
      count: data.count,
      //服务信息
      payWay: data.payMode,
      payAccount: data.paymentCustomerCode,
      vipshopCode: data.productCode,
      serviceWay: data.serviceMode,
      declaredValue: parseInt(data.insuranceValue) || '', //保价声明
      premium: '', //保费
      insuranceValueSource: data.insuranceValueSource, //10：强制保费，20：人工录入
      receiptFlag: data.receiptFlag,
      hdCount: data.receiptCount,
      mjWay: data.packageService,
      dsMoney: parseFloat(data.collectAmount) || '', //代收货款
      dsCommission: '', //代收手续费
      jjRemark: data.waybillRemark,
      sizeList: data.goodsSizeList?.map(m => ({
        length: m['length'],
        width: m.width,
        height: m.height,
        count: m.count
      })),
      cube:data.volumeSize,
      modifyVersion: data.version,
      /** 优惠券 */
      coupon: data.coupon,
      checkedCustomsCharge:(data.clearanceStorageFlag||'')+''
    }
    if(formData.payWay === '20'){
      formData.payAccount = ''
    }
    if(formData.insuranceValueSource === '10'){
      formData.insuranceFeeType = 20
    }
    if (!isCopy) {
      formData.ydNo = data.waybillNumber
      formData.oldCouponCode = data.coupon?.prizeCode
      formData.deliveryMode = data.waybillPickup.deliveryMode
      formData.selfPickupMobile = data.waybillPickup.selfPickupMobile
    } else {
      const userInfo = storageUtil.getUserData()
      const canModifySenderCompany = userInfo.customerInfo?.modifyShipperFlag == '10'
      if (!canModifySenderCompany) {
        formData.jjCompany = clientUtil.getLoginCompanyName()
      }
      formData.goodsTime = ''
      if(formData.receiptFlag === '40'){
        formData.receiptFlag = ''
      }
      if(!formData.cube && formData.sizeList?.length>0){
        const cube = this.convertToCube(formData.sizeList)
        formData.cube = cube>=10000 ? 9999.999 : cube.toFixed(3)
      }
    }
    const customFieldInfos = (data.customFieldInfos || []).map(d=>{
      d.kyField = (d.kyField || '') + ''
      return d
    })
    formData.customFieldInfos = customFieldInfos
    if (customFieldInfos.length > 0) {
      const fields = store.getters.customFields
      customFieldInfos.forEach(nextItem => {
        fields.forEach(item => {
          if (item.code == nextItem.kyField) {
            formData[item.prop] = nextItem.customerFieldValue
          }
        })
      })
    }
    return formData
  }

  //格式化服务方式选项
  formatServiceWayOptions(serviceTypeList,noticeContent){
    if(!serviceTypeList || serviceTypeList.length < 1){
      return
    }
    serviceTypeList.forEach(f=>{
      f.noticeContent = noticeContent
      // 限取限派
      if(f.restrictTypeName){
        f.disabled = true
        f.descriptionHtml = f.restrictMessage
        return
      }

      if(!f.description){
        return
      }
      if(f.longDecFlag === '10'){
        f.descriptionHtml = f.description
        return
      }
      f.descriptionTip = `<span style="color:#333333">现在下单，</span>${f.description}`
      f.description = '现在下单，'+ f.description
      const time = dayjs(f.appointmentStartTime).format('MM-DD HH:mm')
      const time2 = dayjs(f.appointmentStartTime).format('YYYY-MM-DD HH:mm')
      if(f.collectWorkday > 0 ){
        f.descriptionHtml = `收件地址为偏远地区<sapn class="high-light"> +${f.collectWorkday}个工作日</sapn>，预计<sapn class="high-light"> ${time} </sapn>到达`
      }else{
        f.descriptionHtml = f.description.replace(time2,`<span style="color: #ff8038;"> ${time} </span>`)
      }
    })
  }

  /**
   * 检查ka配置列是否都存在excel中
   * @param {Object} param.extraColumnTexts //excel列
   * @returns 1、如果excel含自定义字段1、2、3时,且ka配置列为10、20、50，则返回0
   *          2、如果excel含自定义字段1、2、3时,且ka配置列不为10、20、50，则返回1
   *          3、如果excel含自定义字段1、2、3时,且ka配置列为空，则返回2
   *          4、如果ka配置列都存在excel中，则返回3，否则返回 -1
   */
  checkImportExcelCustomColumn({excelCustomColumnTexts=[]}){
    const customFields = store.getters.customFields || []
    const customFieldsName = customFields.map(c=>c.label)
    const isCustomField123InExcel = ['自定义字段1','自定义字段2','自定义字段3'].every(f=>excelCustomColumnTexts.includes(f))
    const isKaEqual125 = customFields.map(c=>c.code).sort().join()==='10,20,50'
    if(isCustomField123InExcel){
      if(customFieldsName.length < 1){
        return 2
      }
      return isKaEqual125 ? 0 : 1
    }
    if(customFieldsName.every(f=>excelCustomColumnTexts.includes(f))){
      return 3
    }
    return -1
  }

  convetLimitReason(code,key='name',isRestrict = true){
    if(!code){
      return ''
    }
    const list = [
      {code:10,name:'pandemic',text:'疫情'},
      {code:20,name:'typhoon',text:'台风'},
      {code:30,name:'rain_snow',text:'雨雪'},
      {code:40,name:'flood_season',text:'汛期'},
      {code:50,name:'holiday',text:'假期'},
      {code:60,name:'spring_festival',text:'春运'},
      {code:70,name:'meeting',text:'国议'},
      {code:80,name:'other',text:'其它'},
      {code:200,name:'customs_warehousing',text:'报关'},
    ]
    const item = list.find(i => i.code == code) 
    if(!item){
      return ''
    }
    if(key === 'text'){
      return item[key] + (isRestrict ? '管控' : '影响')
    }
    return item[key]
  }

  //取得单票限取派结果
  getSingleRestrictResult(resData,id){
    let {restrictResult,adjustPriceResult} = resData || {}
    if(!restrictResult && !adjustPriceResult){
      return {}
    }
    restrictResult = restrictResult&& restrictResult.find(r => r.requestId === id)
    adjustPriceResult = adjustPriceResult&&adjustPriceResult.find(r => r.requestId === id)
    const adjustPriceMsg = adjustPriceResult?.noticeMessage || ''
    const restrictMsg = restrictResult?.noticeMessage || ''
    const reasonCode = restrictResult?.limitReason || 80 
    
    const result = {
      limitType: restrictResult?.limitType,
      reasonCode: reasonCode,
      limitReasonText: this.convetLimitReason(reasonCode,'text',restrictResult?.limitType === 10),
      limitReason: this.convetLimitReason(reasonCode),
      msg: restrictMsg
    }
    if(restrictResult?.limitType === 10){
      return result
    }else if(restrictResult?.limitType === 20){
      let arr = [restrictMsg,adjustPriceMsg].filter(f=>f)
      if(arr.length > 1){
        arr = arr.map((item,index) => `${index + 1}.${item}`)
      }
      result.msg = arr.join('<br/>')
      return result
    }
    result.msg = adjustPriceMsg
    return result
  }
}

export default new DeliveryUtil()
