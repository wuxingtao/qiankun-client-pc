import store from '@/store'
import { computed, reactive } from '@vue/composition-api'
import deliveryApi from '@api/delivery'
import * as permissionApi from '@api/permission'
import deliveryUtil from '@/utils/deliveryUtil'
import * as storageUtil from '@/utils/storage'
import useSupplier from '../../hooks/useSupplier'
import useBatchModel from './useBatchModel'
import useBatchFreight from './useBatchFreight'
import useBatchValidateFunction from './useBatchValidateFunction'
import useBatchSuperZone from './useBatchSuperZone'
import useBatchWeightSizeValidate from './useBatchWeightSizeValidate'
import useSingleFee from '../../hooks/useSingleFee'
import { debounce } from 'lodash'

export default function({
  vm,
  loading,
  tableColumns,
  verifyRules,
  tableEditableRef,
  errorSummary,
  setVerifyImportDataResult,
  dialogSuperZoneRef,
  totalEstimateFreight,
  dialogAddressRestrictRef
}) {
  const superZoneOptions = reactive({ '20': '送货上门', '10': '网点自提' })

  const { updateAllocationWaybillNumber } = useSupplier()
  const { changToModelList } = useBatchModel()
  const { setEstimateFreightByBatchApi } = useBatchFreight({
    vm,
    tableEditableRef,
    totalEstimateFreight
  })
  const { checkReceiverContactNumber } = useBatchValidateFunction()
  const { checkSuperZone } = useBatchSuperZone({ vm, tableEditableRef, dialogSuperZoneRef })

  const { setPlaneOverloadInfo,getOverWeightMessage,parseSendAndReceiverAddress } = useBatchWeightSizeValidate()

  const resetTableData = () => {
    vm.$store.commit('delivery/setDeliveryBatchId', true)
    tableEditableRef.value.clearTableRows()
    totalEstimateFreight.value = {}
    vm.$store.commit('delivery/setRowCountWithoutFreight', 0)
  }
  //选择超区
  const handleDeliverModeChange = async row => {
    const flag = await checkSuperZone(row)
    if (!flag) {
      return
    }
    const modelList = changToModelList([row])
    loading.value = true
    await setEstimateFreightByBatchApi(modelList)
    loading.value = false
  }

  const initTableColumnsProperties = () => {
    if (vm.$store.getters.hasFrightFeeAuth) {
      setTableColoumnsProperty('estimateFreight', 'hide', false)
    } else {
      setTableColoumnsProperty('estimateFreight', 'hide', false)
    }
    initPayAccountColumnProperty()
  }

  const initPayAccountColumnProperty = ()=>{
    const setPayAccountOptions = async row =>{
      const cache = row.payAccount.cache || {}
      const fields = ['sjMobile','sjCompany','sjTelephone']
      const flag = fields.every(f=> cache[f] === row[f].value)
      if(flag){
        return
      }
      const params = {
        sjMobile : row.sjMobile.value,
        sjTelephone : row.sjTelephone.value,
        sjCompany : row.sjCompany.value
      }
      const res = await  permissionApi.uam_getThirdPartyPayaccounts(params)
      if(res.code === 0){
        row.payAccount.cache ={
          sjMobile:row.sjMobile.value,
          sjCompany:row.sjCompany.value,
          sjTelephone:row.sjTelephone.value,
        }
        row.payAccount.options = res.data?.map(m=>({label:m.customerName,value:m.payAccount})) || []
      }
    }
    const queryEvent =  async (queryString,cb,row) => {
      await setPayAccountOptions(row)
      const options = row.payAccount.options?.filter(f=>
        f.label.includes(queryString) || f.value.includes(queryString)
      )
      cb(options || [])
    }
    setTableColoumnsProperty('payAccount', 'fetchSuggestions',queryEvent)
  }

  const setTableColoumnsProperty = (props, key, value) => {
    if (!Array.isArray(props)) {
      props = [props]
    }
    props.forEach(p => {
      const col = tableColumns.find(c => c.prop === p)
      if (!col) {
        return
      }
      col[key] = value
    })
  }

  const getModelList = (senderInfoModel = null, isFilterErrorRow) => {
    let editableTableData = tableEditableRef.value.editableTableData
    if (isFilterErrorRow) {
      editableTableData = editableTableData.filter(e => e.errors && e.errors.length > 0)
    }
    const modelList = changToModelList(editableTableData)
    modelList.forEach(model => {
      // formatNumberFieldOfModel(model)
      if (senderInfoModel) {
        const senderFields = [
          'jjCompany',
          'jjContactPerson',
          'sms',
          'jjTelePhone',
          'qhAddress',
          'qhContactPerson',
          'qhContactWay',
          'qhTelePhone'
        ]
        senderFields.forEach(f => {
          model[f] = senderInfoModel[f]
        })
      }
      // else {
      //   model.qhContactWay = model.qhContactWay || model.sms || model.jjTelePhone
      // }
      const customerCode = storageUtil.getCustomerCode()
      model.payAccount = model.payWay === '10' ? customerCode : model.payAccount
      if (![10, 30].includes(Number(model.receiptFlag))) {
        model.hdCount = ''
      } else if (Number(model.hdCount) < 1) {
        model.hdCount = 1
      }
      const superZoneOption = Object.keys(superZoneOptions).find(
        f => superZoneOptions[f] === model.superZoneTip
      )
      if (superZoneOption) {
        model.deliveryMode = superZoneOption
      }
    })
    return modelList
  }

  const reloadServiceWayOptions = async row =>{
    row.serviceWay.options = []
    vm.$set(row.serviceWay,'loading',true)
    try{
      const modelList = changToModelList(row)
      await loadServiceWayOptions(modelList)
    }finally{
      vm.$set(row.serviceWay,'loading',false)
    }
  }

  //加载服务方式下拉选项
  const loadServiceWayOptions = async (modelList, autoMatch) => {
    const editableTableData = tableEditableRef.value.editableTableData
    try {
      const res = await deliveryApi.queryServiceWayListByBatch(modelList)
      autoMatchServiceWayByRes(res, autoMatch,modelList)
    } catch {
      editableTableData.forEach(row => {
        row.serviceWay.value = ''
      })
    }
    //将服务方式的值统一为编码
    modelList.forEach(m => {
      let row = editableTableData.find(e => e.no.value == m.no)
      m.serviceWay = row ? row.serviceWay.value : ''
      const item = row.serviceWay.options?.find(o => o.value === m.serviceWay)
      m.estimateArriveTime = item?.estimateArriveTime
      row.estimateArriveTime = { value: item?.estimateArriveTime }
    })
  }

  const autoMatchServiceWayByRes = (res, autoMatch,modelList) => {
    const editableTableData = tableEditableRef.value.editableTableData
    let isReVerifyServiceWay = false
    if(modelList.length < 2){
      isReVerifyServiceWay = true
    }
    if (res.code !== 0) {
      const options = store.state.common.defaultServiceWayDict
      modelList.forEach(f=>{
        const row = editableTableData.find(e => e.no.value == f.no)
        setTableRowServiceWayByAutoMatch(row,autoMatch,options,isReVerifyServiceWay)
      })
      return
    }
    res.data?.forEach(f => {
      const row = editableTableData.find(e => e.no.value == f.orderNumber)
      if (!row) {
        return
      }
      row.serviceWay.data = null
      if(f.msg){
        row.serviceWay.data = f.msg
        setTableRowServiceWayByAutoMatch(row,autoMatch,[],isReVerifyServiceWay)
        return
      }
      const options =
      f?.serviceTypeList?.map(d => Object.assign(d,{
        value: d.serviceTypeCode,
        label: d.serviceTypeName,
        description: d.description,
        estimateArriveTime: d.appointmentStartTime
      })) || []
      setTableRowServiceWayByAutoMatch(row,autoMatch,options,isReVerifyServiceWay)
    })
  }

  const setTableRowServiceWayByAutoMatch= (row,autoMatch,options,isReVerifyServiceWay)=>{
    row.serviceWay.options = options
    let serviceWay = row.serviceWay.value
    const isCode = Number.isInteger(Number(serviceWay))
    if (!isCode) {
      serviceWay = options.find(o => o.label === serviceWay)?.value
      row.serviceWay.value = serviceWay
    }
    let isResetServiceWay = true
    if (options.length === 1) {
      if (options[0].value === serviceWay) {
        isResetServiceWay = false
      }
      row.serviceWay.value = options[0].value
    } else if (autoMatch && options.find(o => o.value === serviceWay)) {
      const label = options.find(o => o.value === serviceWay).label
      const inOneDayFlag = ['当天达', '同城即日', '省内即日'].includes(label)
      const everyFunc = e => options.find(f => f.label === e)
      if (['省内即日', '省内次日'].every(everyFunc)) {
        const temp = inOneDayFlag ? '省内即日' : '省内次日'
        row.serviceWay.value = options.find(f => f.label === temp).value
      } else if (['同城即日', '同城次日'].every(everyFunc)) {
        const temp = inOneDayFlag ? '同城即日' : '同城次日'
        row.serviceWay.value = options.find(f => f.label === temp).value
      } else {
        const inTwoDayFlag = ['同城次日', '省内次日', '次日达'].includes(label)
        const intradayItem = options.find(f => f.label === '当天达')
        const nextdayItem = options.find(f => f.label === '次日达')
        if (intradayItem && inOneDayFlag) {
          row.serviceWay.value = intradayItem.value
        } else if (nextdayItem && inTwoDayFlag) {
          row.serviceWay.value = nextdayItem.value
        }
        isResetServiceWay = false
      }
    } else {
      isResetServiceWay = false
    }

    // 服务方式存在限取限派-清空
    if(row.serviceWay.value){
      const optionsSelect = options.find(f => f.value === row.serviceWay.value)
      if(optionsSelect.disabled || optionsSelect.restrictTypeName){
        row.serviceWay.value = ''
      }
    }

    if (!row.serviceWay.value) {
      row['serviceWay'].warningInfo = ''
      row['serviceWay'].errorInfo = '请选择服务方式'
    } else if (!options.find(f => f.value === row.serviceWay.value)) {
      row.serviceWay.value = ''
      row['serviceWay'].warningInfo = ''
      row['serviceWay'].errorInfo = '请重新选择服务方式'
    } else if (isResetServiceWay) {
      if(isReVerifyServiceWay){
        handleTableValueChange({fieldName:'serviceWay',row,isInit:false,isValid:true})
      }
      row['serviceWay'].errorInfo = ''
      row['serviceWay'].warningInfo = '系统已为您选择支持的服务方式'
    }
  }

  const setTableInputPropertyOnValueChange = ({ fieldName, row, isInit }) => {
    const value = row[fieldName].value
    //重置错误后需重新计算错误个数
    let isSetErrorCount = false
    switch (fieldName) {
      case 'sjAddress':
        if (row['sjAddress'].errorInfo) {
          row.dsMoney.readOnly = false
          row.dsMoney.warningInfo = ''
        }
        break
      case 'receiptFlag':
        row.hdCount.readOnly = !value || value === '20'
        if (row.hdCount.readOnly) {
          row.hdCount.value = ''
          row.hdCount.errorInfo = ''
          isSetErrorCount = true
        }
        break
      case 'payWay':
        row.payAccount.readOnly = ['10','20'].includes(value)
        if (row.payAccount.readOnly) {
          row.payAccount.value = ''
          row.payAccount.errorInfo = ''
          row.payAccount.warningInfo = ''
          isSetErrorCount = true
        }
        if (value === '30' && !row.payAccount.value) {
          const account = storageUtil.getPayCustomerCode()
          row.payAccount.value = account || ''
        }
        break
      case 'serviceWay':
        if(!isInit){
          row['serviceWay'].warningInfo = ''
        }
        {
          const item = row.serviceWay.options?.find(o => o.value === row.serviceWay.value)
          row.estimateArriveTime = { value: item?.estimateArriveTime }
        }
        break
      case 'declaredValue':
        if(!isInit){
          isSetErrorCount = true
        }
        break
    }
    if (isSetErrorCount) {
      setErrorCount()
    }
  }

  const setErrorCount = debounce(function(){
    tableEditableRef.value.setErrorCount()
  },100)

  const handleTableValueChange = async ({ fieldName, row, isInit, isValid }) => {
    if (['sjAddress', 'qhAddress'].includes(fieldName)) {
      row.sjAddressData && (row.sjAddressData.value = {})
      row.qhAddressData && (row.qhAddressData.value = {})
    }
    setTableInputPropertyOnValueChange({ fieldName, row, isInit })
    if (isValid) {
      const fields = ['isSignSelf', 'sjMobile', 'sjTelephone']
      if (fields.includes(fieldName)) {
        if (!checkReceiverContactNumber({ fieldName, row })) {
          tableEditableRef.value.setErrorCount()
          return
        }
        tableEditableRef.value.setErrorCount()
      }
    }
    if (!isValid || isInit) {
      return
    }
    const sensitiveWordFields = [
      'jjCompany',
      'jjContactPerson',
      'qhContactPerson',
      'sjCompany',
      'sjContactPerson',
    ]
    const payAccountFields = ['payWay', 'payAccount']
    const serviceWayFields = ['sjAddress', 'qhAddress', 'payWay', 'payAccount']
    const adjustPriceFields = ['weight', 'count']
    const payAuthFields = ['sjCompany','sjMobile','sjTelephone','sjAddress','payWay']
    const fields = [
      ...payAccountFields,
      ...serviceWayFields,
      ...sensitiveWordFields,
      ...adjustPriceFields,
      ...payAuthFields,
      'serviceWay',
      'goods'
      // 'sjTelephone',
    ]
    const estimateFreightFields = [
      'weight',
      'count',
      'sizeList',
      'declaredValue',
      'dsMoney',
      'receiptFlag',
      'mjWay',
      'checkedCustomsCharge'
    ]

    try {
      loading.value = true
      vm.$store.commit('delivery/setLoadingOfBatch',{field:'declaredValue',loading:true})
      const modelList = changToModelList([row])
      if (fields.includes(fieldName)) {
        if (serviceWayFields.includes(fieldName)) {
          await loadServiceWayOptions(modelList)
        }
        setVolumetricWeightRatio(fieldName,row)
        await setVerifyImportDataResult({
          modelList,
          fields,
          isCalculateEstimateFreight: true,
          fieldName,
          row
        })
        setPlaneListInfoOfRow(fieldName,row)
        await setDefaultPrime(fieldName, row)
      } else if (estimateFreightFields.includes(fieldName)) {
        await setEstimateFreightByBatchApi(modelList)
      }
    } finally {
      loading.value = false
      vm.$store.commit('delivery/setLoadingOfBatch',{field:'declaredValue',loading:false})
    }
  }
  const { setDefaultDeclaredValueByRow } = useSingleFee({})
  const setDefaultPrime = async (fieldName, row) => {
    if (!['payWay', 'payAccount'].includes(fieldName)) {
      return
    }
    row.insuranceValueSource.value = ''
    if (row.insuranceValueSource.value !== '20' || row.insuranceFeeType.value === 10) {
      row.declaredValue.value = ''
      row.premium.value = ''
      await setDefaultDeclaredValueByRow(false, row)
    }
    // else {
    //   getServiceCharge('insuredFee',row.declaredValue.value)
    // }
  }

  const setVolumetricWeightRatio = async (fieldName,row)=>{
    if(!['payWay','serviceWay'].includes(fieldName)){
      return
    }
    row.volumetricWeightRatio.value = 0
    if(row.payWay.value !== '10' || !row.serviceWay.value){
      return
    }
    const params = [{
      no: 1,
      serviceMode: row.serviceWay.value,
      paymentType: row.payWay.value
    }]
    const res = await deliveryApi.getVolumetriceWeight(params)
    if(res?.code === 0 && res.data?.length > 0){
      row.volumetricWeightRatio.value = res.data[0]?.weightCoefficient || 0
    }
  }
  const setPlaneListInfoOfRow = async (fieldName,row)=>{
    const addressFields = ['sjAddress', 'qhAddress']
    const fields = [ ...addressFields,'serviceWay']
    if(![...fields,'weight','count'].includes(fieldName)){
      return
    }
    if(addressFields.includes(fieldName)){
      row[fieldName].data = {}
      await parseSendAndReceiverAddress(row)
    }
    if(fields.includes(fieldName) || !row['planeListInfo']?.value){
      await setPlaneOverloadInfo(row)
    }
    const params = {
      planeListInfo:row['planeListInfo']?.value,
      weight:row['weight'].value,
      serviceWay:row['serviceWay'].value,
      count:row['count'].value,
    }
    const msg = getOverWeightMessage(params)
    row['weight'].warningInfo = msg
  }

  const checkPayAuth = async()=>{
    let editableTableData = tableEditableRef.value.editableTableData
    const rows = editableTableData.filter(f=>f.businessData?.value?.authorizeStatus === '20')
    if(rows.length<1){
      return true
    }
    try{
      const msg = `您有${rows.length}票运单未获得付款授权，如点击继续将向付款方发起授权申请，点击返回将为您改为寄方付`
      await vm.$confirm(msg, '温馨提示',{
        confirmButtonText: '继续',
        cancelButtonText: '返回' ,
        closeOnClickModal:false,
        showClose:false})
      return true
    }catch{
      rows.forEach(r=>{
        r.paymentCustomerName.value = ''
        r.paymentCustomerCode.value = ''
        r.payWay.value = '10'
        r.payAccount.value = ''
        r.payAccount.errorInfo = ''
        r.payAccount.warningInfo = ''
        r.payAccount.readOnly = true
        r.businessData.value.authorizeStatus = ''
      })
    }
  }

  //检查限寄
  const checkAddressRestrict = async () => {
    const editableTableData = tableEditableRef.value.editableTableData
    if(editableTableData.every(row => row._addressRestrictErrorInfo?.msg)){
      const receiverRestrictErrorInfo = editableTableData[0]._addressRestrictErrorInfo
      await dialogAddressRestrictRef.value.showDialog(receiverRestrictErrorInfo)
      return 
    }
    return true
  }

  const checkTableData = async () => {
    if(!await checkAddressRestrict()){
      return
    }
    if (errorSummary.value.errorCount > 0) {
      vm.$message.warning(`共有${errorSummary.value.errorCount}处错误，请先修改`)
      return
    }
    return true
  }

  const saveTableData = async (senderInfoModel = null, pickupInfo, withPrint) => {
    try {
      const type = pickupInfo ? '下单' : '导入'
      if(!await checkTableData()){
        return
      }
      const modelList = getModelList(senderInfoModel)
      const customFields = store.getters.customFields
      modelList.forEach(item => {
        const customerFieldInfos = customFields.reduce((arr, nextItem) => {
          const val = item[nextItem.prop]
          if (val) {
            const obj = {
              customerFieldName: nextItem.label,
              customerFieldValue: val,
              kyField: nextItem.code,
            }
            arr.push(obj)
          }
          return arr
        }, [])
        item.customerFieldInfos = customerFieldInfos
      })

      if(modelList.length < 1){
        vm.$message.warning('暂无数据，请先添加数据')
        return
      }
      modelList.sort((a, b) => Number(a.no) - Number(b.no))
      const noList = modelList.map(m => m.no)
      if (noList.length !== new Set(noList).size) {
        vm.$message.error(`数据有误，${type}失败`)
        return
      }
      if(!await checkPayAuth()){
        return
      }
      const params = deliveryUtil.convertFormDataListToApiParams(modelList, pickupInfo, withPrint)
      const res = await deliveryApi.saveWaybillByBatch(params)
      store.dispatch('delivery/setWaybillHistoryRemarksListAction')
      if (!res) {
        console.log('批量接口调用异常')
        return
      }
      if(!res.data){
        vm.$message.error(res.msg || '服务异常,请稍候再试')
        return
      }
      const data = res.data.verifyDataResponses
      if (data) {
        const allModelList = modelList.map(m => {
          // const resCurrentData = data.filter(d => !d.orderSaveError).find(d => d.id == m.no)
          const currentResData = data.find(d => d.id == m.no)
          // .filter(d => !d.orderSaveError)
          return {
            ...m,
            id: m.no,
            waybillNumber: currentResData?.waybillNumber,
            isRestrict : currentResData?.errorResult?.some(e => e.ext === '30'), //是否是限寄
            //TODO 测试 A96548258a
            isSaveSucess: currentResData && !currentResData.orderSaveError && m.goods !== 'A96548258a'
          }
        })
        const sucessModelList = allModelList.filter(f => f.isSaveSucess)
        const restrictModelList = allModelList.filter(f => f.isRestrict)
        const failModelList = allModelList.filter(f => !f.isSaveSucess && !f.isRestrict)
        const successCount = sucessModelList.length
        if (successCount < 1) {
          vm.$message.error('保存失败,请稍候再试')
          return
        }

        updateAllocationWaybillNumber(sucessModelList) //TODO 注意allocationId
        return {
          totalCount: allModelList.length,
          allModelList,
          sucessModelList,
          restrictModelList,
          failModelList
        }
      }
    } catch (ex) {
      vm.$message.error('服务异常,请稍候再试')
      console.log('saveTableData :>> ', ex)
    }
  }

  //判断批量操作是否是同一次操作，点返回或清空时deliveryBatchId会更新
  const isTheSameBatch = deliveryBatchId =>{
    return deliveryBatchId === store.state.delivery.deliveryBatchId
  }
  return {
    resetTableData,
    initTableColumnsProperties,
    setTableColoumnsProperty,
    getModelList,
    handleTableValueChange,
    setTableInputPropertyOnValueChange,
    loadServiceWayOptions,
    reloadServiceWayOptions,
    saveTableData,
    handleDeliverModeChange,
    isTheSameBatch,
    checkTableData
  }
}
