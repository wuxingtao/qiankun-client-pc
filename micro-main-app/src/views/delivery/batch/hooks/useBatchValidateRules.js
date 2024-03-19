import store from '@/store'
import Regular from '@utils/regular'
import deliveryApi from '@api/delivery'
import useBatchFreight from './useBatchFreight'
import commonUtil from '../../utils/commonUtil'
import deliveryUtil from '@/utils/deliveryUtil'

// senderInfoRef 批量填写时需要传
export default function({
  vm,
  tableColumns,
  tableEditableRef,
  senderInfoRef,
  totalEstimateFreight
}) {
  const { resetEstimateFreightInTable, setEstimateFreightByBatchApi } = useBatchFreight({
    vm,
    tableEditableRef,
    totalEstimateFreight
  })

  const checkEmojiOfCompanyName = async (row, valObject, fieldName) => {
    if (Regular.emoji.test(valObject.value)) {
      let name = ''
      switch (fieldName) {
        case 'jjCompany':
          name = '寄件公司'
          break
        case 'sjCompany':
          name = '收件公司'
          break
      }
      return `${name}不支持特殊字符`
    }
  }

  const checkNumber = (row, valObject, fieldName) => {
    const value = valObject.value
    if (!value) {
      return ''
    }
    if(value && ( Number(value) || 0) <= 0){
      if(fieldName !== 'declaredValue' || Number(value) !== 0){
        return '值只支持数字类型'
      }
    }
    if (fieldName === 'declaredValue' && Number(value) > 9999999) {
      return '保价声明不能大于9999999'
    }
    if (fieldName === 'dsMoney' && Number(value) > 999999.99) {
      return '代收货款不能大于999999.99'
    }
    if (Number(value) < 0) {
      return '值必须大于0'
    }
  }
  const checkHdCount = (row, valObject, fieldName) => {
    if (fieldName === 'hdCount') {
      const msg = checkNumber(row, valObject)
      if (msg) {
        return msg
      }
      const value = valObject.value
      if (Number(value) > 999) {
        return '回单份数不能大于999'
      }
    }
    if ([10, 30].includes(Number(row.receiptFlag.value)) && Number(row.hdCount.value) < 1) {
      const msg = '请输入回单份数'
      if (fieldName === 'hdCount') {
        return msg
      } else {
        row.hdCount.errorInfo = msg
      }
    }
  }
  const checkWeightAndCount = (row, valObject, fieldName) => {
    const msg = checkNumber(row, valObject)
    if (msg) {
      return msg
    }
    if (checkNumber(row, row.weight) || checkNumber(row, row.count)) {
      return
    }
    if (fieldName === 'weight') {
      // if(row.weight.value&&Number(row.weight.value)<1){
      //   return '总重量不能小于1'
      // }
      if (Number(row.weight.value) > 99999) {
        return '预估总重量不能大于99999'
      }
    }
    if (fieldName === 'count') {
      if (row.count.value && Number(row.count.value) < 1) {
        return '总件数不能小于1'
      }
      if (Number(row.count.value) > 9999) {
        return '总件数不能大于9999'
      }
    }
    if (row.weight.value) {
      // if (row.weight.value / row.count.value > 1500) {
      //   return '单件货物重量不得超过1500kg'
      // }
      // if (row.weight.value / (Number(row.count.value) || 1) >= 80 && row.sizeList.length < 1) {
      //   return '单件货物重量大于80kg,须填写货物尺寸'
      // }
    }
    fieldName === 'weight' && (row.weight.errorInfo = '')
    fieldName === 'count' && (row.count.errorInfo = '')
  }
  const checkCube = (row, valObject) => {
    const msg = checkNumber(row, valObject)
    if (msg) {
      return msg
    }
    if (Number(row.cube.value) >= 10000) {
      return '体积最大不能超过1万立方米'
    }
  }
  const checkSizeList = (row, valObject) => {
    const value = valObject.value
    if (!value || value.length < 1) {
      return
    }
    for (let i = 0; i < value.length; i++) {
      const msg = commonUtil.checkSizeItem(value[i])
      if (msg) {
        return msg
      }
    }
    if (deliveryUtil.convertToCube(value) >= 10000) {
      return '体积累加不可超过1万立方米'
    }
  }
  const customFieldRules = store.getters.customFieldRules
  const verifyRules = {
    jjCompany: [
      { required: true, msg: '请输入寄件公司' },
      { min: 2, msg: '寄件公司不能少于2个字' },
      { max: 32, msg: '寄件公司不得超过32个字' },
      { reg: Regular.text1, msg: '请输入正确的寄件公司名称' },
      { validator: checkEmojiOfCompanyName }
    ],
    jjContactPerson: [
      { required: true, msg: '请输入寄件人' },
      { min: 2, msg: '姓名不能少于2个字' },
      { max: 30, msg: '姓名不得超过30个字' },
      { reg: Regular.text2, msg: '姓名不支持空格和特殊字符' },
      { reg: /^((?!先生).)*$/, msg: '请输入真实寄件人姓名' },
      { reg: /^((?!女士).)*$/, msg: '请输入真实寄件人姓名”' },
      { reg: /^((?!小姐).)*$/, msg: '请输入真实寄件人姓名”' },
      { reg: Regular.text3, msg: '请输入真实姓名' }
    ],
    sms: [
      { required: true, len: 11, msg: '请输入11位手机号' },
      { reg: Regular.mobilePhone, msg: '请输入正确的手机号' }
    ],
    jjTelePhone: [{ reg: Regular.landlinePhone3, msg: '请输入正确的固定电话' }],
    qhContactPerson: [
      { min: 2, msg: '姓名不能少于2个字' },
      { max: 30, msg: '姓名不得超过30个字' },
      // { reg: Regular.text2, msg: '姓名不支持空格和特殊字符' },
      // { reg: /^((?!先生).)*$/, msg: '请输入真实取货人姓名' },
      // { reg: /^((?!女士").)*$/, msg: '请输入真实取货人姓名' },
      // { reg: /^((?!小姐").)*$/, msg: '请输入真实取货人姓名' },
      // { reg: Regular.text3, msg: '请输入真实姓名' }
    ],
    qhContactWay: [
      { len: 11, msg: '请输入11位手机号' },
      { reg: Regular.mobilePhone, msg: '请输入正确的手机号' }
    ],
    qhTelePhone: [{ reg: Regular.landlinePhone3, msg: '请输入正确的固定电话' }],
    qhAddress: [{ required: true, msg: '请输入取货地址' }],
    sjCompany: [
      // { required: true, msg: '请输入收件公司' },
      { min: 2, msg: '收件公司不能少于2个字' },
      { max: 32, msg: '收件公司不得超过32个字' },
      { reg: Regular.text1, msg: '请输入正确的收件公司名称' },
      { validator: checkEmojiOfCompanyName }
    ],
    sjContactPerson: [
      { required: true, msg: '请输入收件人' },
      { min: 2, msg: '姓名不能少于2个字' },
      { max: 30, msg: '姓名不得超过30个字' },
      // { reg: Regular.text2, msg: '姓名不支持空格和特殊字符' }
    ],
    sjMobile: [
      { len: 11, msg: '请输入11位手机号' },
      { reg: Regular.mobilePhone, msg: '请输入正确的手机号' }
    ],
    sjTelephone: [{ reg: Regular.landlinePhone3, msg: '请输入正确的固定电话' }],
    sjAddress: [{ required: true, msg: '请输入收件地址' }],
    goods: [
      { required: true, msg: '请输入托寄物' },
      // {max:30,msg:'托寄物填写不得超过30个字'},
      // { reg: /^[\u4E00-\u9FA5A-Za-z0-9]{2,30}$/,msg: "托寄物不可含有特殊字符"},
      { reg: Regular.text4, msg: '托寄物名称不可为纯数字或纯符号' }
    ],
    vipshopCode: [{ required: false, reg: Regular.vipshopCode, msg: '请输入正确的唯品会入库号' }],
    payWay: [{ required: true, msg: '请选择付款方式' }],
    serviceWay: [{ required: true, msg: '请选择服务方式' }],
    payAccount: [{ reg: Regular.positiveOrZero, msg: '格式不正确' }],
    weight: [
      // { required: true, msg: '请输入重量' },
      { reg: Regular.currency, msg: '预估总重量仅支持最多两位小数的数值' },
      { validator: checkWeightAndCount }
    ],
    count: [
      { reg: Regular.positiveOrZero, msg: '总件数仅支持正整数' },
      { validator: checkWeightAndCount }
    ],
    declaredValue: [
      { reg: Regular.positiveOrZero, msg: '保价声明必须为正整数' },
      { validator: checkNumber }
    ],
    dsMoney: [
      { reg: Regular.currency, msg: '代收货款仅支持最多两位小数的数值' },
      { validator: checkNumber }
    ],
    receiptFlag: [{ validator: checkHdCount }],
    hdCount: [
      { reg: Regular.positiveOrZero, msg: '回单份数仅支持正整数' },
      { validator: checkHdCount }
    ],
    sizeList: [{ validator: checkSizeList }],
    cube: [{ validator: checkCube }],
    jjRemark: [{ max: 150, msg: '备注不得超过150个字' }],
    /** 自定义字段验证规则 */
    ...customFieldRules
  }

  const superZoneFields = ['payWay', 'payAccount', 'sjAddress', 'qhAddress']
  /**
   * 校验及计算预估运费
   *  @param {[Boolean,undefined]} isCalculateEstimateFreight 是否计算预做运费
   */
  const setVerifyImportDataResult = async ({
    modelList,
    fields,
    isCalculateEstimateFreight,
    fieldName,
    row
  }) => {
    let flag = isCalculateEstimateFreight === true
    flag = flag || !fields || fields.length < 1
    isCalculateEstimateFreight = flag
    if (isCalculateEstimateFreight) {
      resetEstimateFreightInTable(modelList)
    }
    // const promiseList = []
    // promiseList.push(verifyImportData({ modelList, fields, fieldName, row }))
    // if (isCalculateEstimateFreight) {
    //   promiseList.push(setEstimateFreightByBatchApi(modelList, fields))
    // }
    // await Promise.all(promiseList)
    await verifyImportData({ modelList, fields, fieldName, row })
    if (isCalculateEstimateFreight) {
      const editableTableData = tableEditableRef.value.editableTableData
      editableTableData.forEach(row => {
        const model = modelList.find( f => f.no === row.no?.value)
        model.checkedCustomsCharge = row.checkedCustomsCharge.value
      })
      await setEstimateFreightByBatchApi(modelList, fields)
    }
    return true
  }

  const verifyImportData = ({ modelList, fields, fieldName, row }) => {
    return new Promise(async reslove => {
      try {
        const { res, validateFields } = await deliveryApi.validateWaybillListField(
          modelList,
          fieldName
        )
        if (!res?.data) {
          return false
        }
        if (row && fieldName && superZoneFields.includes(fieldName)) {
          row.superZoneDistance = {}
          modelList.forEach(m => {
            m.superZoneDistance = 0
          })
        }
        setVerifyImportDataResultByRes(res, fields, fieldName, validateFields)
      } finally {
        reslove()
      }
    })
  }

  const setVerifyImportDataResultByRes = (res, fields, fieldName, validateFields) => {
    const data = res.data.verifyDataResponses
    if (!data || data.length < 1) {
      return
    }
    const customFields = store.getters.customFields.map(item => item.prop)
    const editableTableData = tableEditableRef.value.editableTableData

    const ignoreFields = ['dsMoney', ...customFields]
    fields = fields || tableColumns.filter(c => !c.readOnly && !c.hide).map(c => c.prop)
    fields = fields.filter(f => !ignoreFields.includes(f))
    if (validateFields) {
      fields = fields.filter(f => validateFields.includes(f))
    }
    if (senderInfoRef?.value && (!validateFields || validateFields.includes('qhAddress'))) {
      //批量填写
      senderInfoRef.value.errorMsgs.qhAddress = ''
      senderInfoRef.value.errorMsgs.qhAddressRestrict = ''
      senderInfoRef.value.warningMsgs.qhAddress = ''
      senderInfoRef.value.warningMsgs.qhAddressRestrict = ''
      const dataItem = data && data[0]
      const errorMsg = dataItem?.errorResult.find(f => f.field === 'qhAddress')?.msg
      const warnMsg = dataItem?.warnResult.find(f => f.field === 'qhAddress')?.msg
      if (errorMsg) {
        senderInfoRef.value.errorMsgs.qhAddress = errorMsg
      } else if (warnMsg) {
        senderInfoRef.value.warningMsgs.qhAddress = warnMsg
      }
    }
    let errorCountChange = false
    data.forEach(rowResult => {
      const row = editableTableData.find(e => e.no.value == rowResult.id)
      if (!row) {
        return
      }
      errorCountChange = true
      const serviceWayWarnMsg = row.serviceWay.warningInfo
      fields.forEach(f => {
        row[f].errorInfo = ''
        if(f === 'serviceWay'){
          row.serviceWay.warningInfo = serviceWayWarnMsg
        }else {
          row[f].warningInfo = ''
        }
      })
      rowResult.errorResult
        ?.filter(r => fields.includes(r.field))
        ?.forEach(e => {
          row[e.field].errorInfo = e.msg
        })
      rowResult.warnResult
        ?.filter(r => fields.includes(r.field))
        ?.forEach(e => {
          row[e.field].warningInfo = e.msg
        })
      setCustomsChargeInfo(fieldName,row,rowResult)
      setAddressRestrict(fieldName,row,rowResult)
      const businessData = rowResult.businessData
      row.paymentCustomerName.value = businessData?.paymentCustomerName
      row.paymentCustomerCode.value = businessData?.paymentCustomerCode
      row.paymentCustomerName.queryPayAuthSource = businessData?.queryPayAuthSource
      if(row.delayTime){
        row.delayTime.value = businessData?.delayTime
      }else{
        row.delayTime = {value: businessData?.delayTime}
      }
      setSuperZoneInfoAndCollectionOfRow(row, businessData, fieldName)
    })
    if (errorCountChange) {
      tableEditableRef.value.setErrorCount()
    }
  }

  const setCustomsChargeInfo = (fieldName,row,rowResult) => {
    const fields = ['qhAddress','sjAddress','serviceWay','payWay']
    if(fieldName && !fields.includes(fieldName)){
      return
    }
    row.checkedCustomsCharge.value = ''
    //Object.keys(row.checkedCustomsCharge.data).length < 1 &&
    if( rowResult.clientOrderWarehouseResponse?.fenceFlag === '10'){
      row.checkedCustomsCharge.value = '10'
    }
    row.checkedCustomsCharge.data = rowResult.clientOrderWarehouseResponse
    row.clientOrderWarehouseResponse.value = rowResult.clientOrderWarehouseResponse
  }

  const setAddressRestrict = (fieldName,row,rowResult) => {
    const fields = ['qhAddress','sjAddress','serviceWay','weight']
    if(fieldName && !fields.includes(fieldName)){
      return
    }
    //固定列限寄提示
    const restrictWarningInfo = rowResult.warnResult?.find(e => e.ext === '30') || {}
    //固定列限寄
    const restrictErrorInfo = rowResult.errorResult?.find(e => e.ext === '30') || {}
    const warningReason = deliveryUtil.convetLimitReason(restrictWarningInfo.bizExt)
    const errorReason = deliveryUtil.convetLimitReason(restrictErrorInfo.bizExt)
    vm.$set(row,'_addressRestrictWarningInfo',{
      limitType: 20,
      ...restrictWarningInfo,
      reasonCode: restrictWarningInfo.bizExt,
      reason: warningReason,
    })
    vm.$set(row,'_addressRestrictErrorInfo',{
      limitType: 10,
      ...restrictErrorInfo,
      reasonCode: restrictErrorInfo.bizExt,
      reason:errorReason,
    })
  }

  const setSuperZoneInfoAndCollectionOfRow = (row, businessData, fieldName) => {
    row.businessData = { value: businessData } //保存业务数据，修改时使用
    row.dsMoney.readOnly = false
    row.dsMoney.warningInfo = ''
    if (businessData?.feature !== 0) {
      row.dsMoney.value = ''
      row.dsMoney.readOnly = true
      row.dsMoney.warningInfo = '该收件地址不支持代收货款'
    }
    if (fieldName && !superZoneFields.includes(fieldName)) {
      return
    }
    row.superZoneTip.errorInfo = ''
    row.superZoneTip.value = ''
    // row.superZoneDistance = {}
    if (businessData?.feature === 3) {
      const superZoneTip = '温馨提示:当前地址不支持派送,请切换收件地址,或咨询您的商务'
      row.superZoneTip.errorInfo = superZoneTip
      row.superZoneTip.value = '请选择超区服务'
    }
  }

  return {
    verifyRules,
    setVerifyImportDataResult
  }
}
