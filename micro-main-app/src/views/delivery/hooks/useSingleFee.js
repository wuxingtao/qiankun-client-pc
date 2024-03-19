import deliveryApi from '@/services/api/delivery'
import deliveryUtil from '@/utils/deliveryUtil'
import useBatchModel from '../batch/hooks/useBatchModel'

export default function ({ formData, shareData }) {
  const { changToModelList } = useBatchModel()

  /**
   * 转化默认保费值
   * @param {Object} inFormData 表单字段
   * @param {Object} resData 默认保费接口返回的字段，{defaultDeclared，defaultPremium，premiumType}
   *  @param {Boolean} ignoreDefaultValue 忽略默认保费 
   */
  const convertDefaultDeclaredValue = ({inFormData,resData,ignoreDefaultValue})=>{
    if(!inFormData){
      return
    }
    inFormData.insuranceFeeType = ''
    inFormData.insuranceValueSource = ''
    if(!resData ){
      return
    }
    const type = resData.premiumType
    inFormData.insuranceFeeType = type
    if(ignoreDefaultValue &&  type === 10){
      inFormData.insuranceFeeType = ''
      inFormData.insuranceValueSource = '20'
    }
    if (!ignoreDefaultValue && type === 10) {
      inFormData.insuranceValueSource = '20'
      //默认保费
      inFormData.declaredValue = resData.defaultDeclared
      if(inFormData.payWay === '10'){
        inFormData.premium = resData.defaultPremium || ''
      }else{
        inFormData.premium = ''
      }
    } else if (type === 20) {
      //强制保费
      inFormData.insuranceValueSource = '10'
    }
  }

  //设置默认保费
  const setDefaultDeclaredValue = async (ignoreDefaultValue,inFormData) => {
    if(!inFormData){
      inFormData = formData
    }
    if (!inFormData.payWay || inFormData.declaredValue) {
      return
    }
    try {
      shareData && (shareData.loadingFlags.insuredFee = true)
      inFormData.insuranceFeeType = ''
      inFormData.insuranceValueSource = ''
      const res = await deliveryApi.queryDefaultDeclaredValue(inFormData)
      if (res.code !== 0) {
        return
      }
      convertDefaultDeclaredValue({inFormData,resData:res.data,ignoreDefaultValue})
    } finally {
      shareData && (shareData.loadingFlags.insuredFee = false)
    }
  }

  /**
   * 设置保费或代收货款手续费
   * @param {String} fieldName dsMoney：代收手续费,declaredValue保费
   */
  const setFeeByField = async fieldName => {
    if (!['dsMoney', 'declaredValue'].includes(fieldName)) {
      return
    }
    const isInsuredFee = fieldName === 'declaredValue'
    if (isInsuredFee) {
      formData.premium = ''
    } else {
      formData.dsCommission = ''
    }
    const value = formData[fieldName]
    if (Number(value) <= 0) {
      return
    }
    const feeType = isInsuredFee ? 'insuredFee' : 'collectionFee'
    try {
      shareData.loadingFlags[feeType] = true
      const fee = await getServiceCharge(feeType, value)
      if (isInsuredFee) {
        formData.premium = fee
      } else {
        formData.dsCommission = fee
      }
    } finally {
      shareData.loadingFlags[feeType] = false
    }
  }

  /**
   * 计算保费或代收手续费或者两者
   * @param {String} feeType 查询费用类型，insuredFee：保费，collectionFee：代收手续费
   * @param {String,Numer} value 声明价值或者代收货款
   * @param {Object} inFormData 兼容批量填写和导入计算保费
   * @returns
   */
  const getServiceCharge = async (feeType, value,inFormData) => {
    if (!['insuredFee', 'collectionFee'].includes(feeType)) {
      return
    }
    if (Number(value) <= 0) {
      return
    }
    if(!inFormData){
      inFormData = formData
    }
    if(inFormData.payWay !== '10'){
      inFormData.premium = ''
      inFormData.dsCommission = ''
      return
    }
    try{
      shareData && (shareData.loadingFlags[feeType] = true)
      let params = getInitParams(inFormData)
      const isInsuredFee = feeType === 'insuredFee'
      if (isInsuredFee) {
        params.numberOfPackages = Number(inFormData.count)
        params.declaredValue = Number(value)
      } else {
        params.collectionAmount = Number(value)
      }
      const res = await deliveryApi.queryServiceCharge(params)
      if (res.code === 0) {
        const data = res.data
        const fee = isInsuredFee ? data?.statementPriceFee : data?.collectionFee
        return fee? Number(fee).toFixed(2):0
      }
    }finally{
      shareData && (shareData.loadingFlags[feeType] = false)
    }
  }

  const getInitParams = inFormData => {
    const customerCode = deliveryUtil.getPayAccount(inFormData, true)
    let params = { customerCode }
    if(inFormData.payWay === '20' && inFormData.paymentCustomerName){
      params = { customerShortName : inFormData.paymentCustomerName}
    }
    return params
  }

  //设置保费和代收手续费
  const setInsuredAndCollectionFee = async () => {
    try {
      shareData.loadingFlags.insuredFee = true
      const declaredValue = Number(formData.declaredValue)
      const dsMoney = Number(formData.dsMoney)
      if (declaredValue <= 0 && dsMoney <= 0) {
        return
      }
      if(formData.payWay !== '10'){
        formData.premium = ''
        formData.dsCommission = ''
        return
      }
      const params = getInitParams(formData)
      if (declaredValue > 0) {
        params.numberOfPackages = Number(formData.count)
        params.declaredValue = declaredValue
      }
      if (dsMoney > 0) {
        params.collectionAmount = dsMoney
      }
      const res = await deliveryApi.queryServiceCharge(params)
      if (res.code === 0) {
        const data = res.data
        formData.premium = data?.statementPriceFee || ''
        formData.dsCommission = data?.collectionFee || ''
      }
    } finally {
      shareData.loadingFlags.insuredFee = false
    }
  }

  //批量导入和批量填写默认值处理
  const setTableRowDeclaredValue = async (row, declaredValue,premium) => {
    row.declaredValue.errorInfo = ''
    row.declaredValue.value = declaredValue
    row.premium = { value: premium }
    if ([0, '0'].includes(declaredValue) || Number(declaredValue) > 0) {
      row.insuranceFeeType = { value: '' }
      row.insuranceValueSource = { value: '20' }
    } else {
      await setDefaultDeclaredValueByRow(true, row)
    }
  }
  
  //设置表格行默认保费
  const setDefaultDeclaredValueByRow = async (ignoreDefaultValue,row) => {
    const model = changToModelList([row])[0]
    await setDefaultDeclaredValue(ignoreDefaultValue,model)
    row.insuranceFeeType = {value: model.insuranceFeeType }
    row.insuranceValueSource = {value: model.insuranceValueSource }
    row.premium = { value: model.premium }
    row.declaredValue.value = model.declaredValue
  }
    
  return {
    setFeeByField,
    getServiceCharge,
    convertDefaultDeclaredValue,
    setInsuredAndCollectionFee,
    setDefaultDeclaredValue,
    setDefaultDeclaredValueByRow,
    setTableRowDeclaredValue
  }
}
