import store from '@/store'
import * as storageUtil from '@/utils/storage'
import * as clientUtil from '@/utils/clientUtil'
import deliveryUtil from '@utils/deliveryUtil'
import { getUserData } from '@/utils/storage'
import deliveryApi from '@api/delivery'
import _ from 'lodash'
import useSingleFee from '../hooks/useSingleFee'
class DefaultConfigUtil {
  constructor(){
    this.senderFields = ['jjCompany','jjContactPerson','sms','jjTelePhone', 'qhContactPerson','qhContactWay','qhAddress']
  }

  async getDefaultConfig(){
    let defaultConfig = store.state.client.defaultConfig
    if (Object.keys(defaultConfig).length < 1) {
      await store.dispatch('client/setDefaultConfigAction')
      defaultConfig = store.state.client.defaultConfig
    }
    return defaultConfig
  }

  //批量加载数据
  async loadDataBatch(formDataList,vm,isSingle){
    if (!Array.isArray(formDataList)) {
      formDataList = [formDataList]
    }

    const defaultConfig = await this.getDefaultConfig()
    let requirements = store.state.client.requirements
    if (Object.keys(requirements).length < 1) {
      await store.dispatch('client/setRequirementsAction')
      requirements = store.state.client.requirements
    }

    let senderInfo = null
    for(let i = 0; i<formDataList.length;i++){
      const formData = formDataList[i]
      this.loadDataFromDefaultConfig(formData, defaultConfig, vm)
      if(this.senderFields.filter(f=>formData[f]).length<1){
        if(!senderInfo){
          senderInfo = await this.getSenderDataFromRecentOrder()
        }
        Object.assign(formData,senderInfo)
      }
      this.loadDataFromRequirements(formData, requirements)
      this.handleDefaultData(formData)
    }
    if(!isSingle){
      const promiseList = [
        this.handleDeclaredValue(formDataList),
        this.setVolumetricWeightRatio(formDataList)
      ]
      await Promise.all(promiseList) 
      // await this.handleDeclaredValue(formDataList)
      // await this.setVolumetricWeightRatio(formDataList)
    }else {
      const { payWay, serviceWay} = formDataList[0] || {}
      if(payWay && serviceWay ){
        formDataList[0].no = formDataList[0].no || 0
        await this.setVolumetricWeightRatio(formDataList)
      }
    }
  }

  async setVolumetricWeightRatio(formDataList){
    const params = formDataList.filter(f => f.payWay === '10' && f.serviceWay).map(m=>{
      return{
        no:m.no,
        serviceMode: deliveryUtil.getServiceWayCode(m.serviceWay),
        paymentType: m.payWay
      }
    })
    if(params.length < 1){
      return
    }
    const res = await deliveryApi.getVolumetriceWeight(params)
    if(res?.code === 0 && res.data?.length > 0){
      formDataList.forEach(f=>{
        const value =  res.data.find(d=>f.no == d.no)?.weightCoefficient || 0
        f.volumetricWeightRatio = value
      })
    }
  }

  //默认保费处理
  async handleDeclaredValue(formDataList){
    const existsDeclaredValueList = []
    const noDeclaredValueList = []
    formDataList.forEach(f=>{
      if(Number(f.declaredValue)>0){
        existsDeclaredValueList.push(f)
      }else{
        noDeclaredValueList.push(f)
      }
    })
    existsDeclaredValueList.forEach(f=>{
      f.insuranceFeeType = ''
      f.insuranceValueSource = '20'
    })

    const promiseList = [
      this.caculatePremium(existsDeclaredValueList),
      this.setDefaultDeclared(noDeclaredValueList)
    ]
    await Promise.all(promiseList) 
  }

  async setDefaultDeclared(formDataList){
    if(!formDataList || formDataList.length<1){
      return
    }
    const resData = await deliveryApi.queryDefaultDeclaredValueByBatch(formDataList)
    if(resData?.length > 0){
      const { convertDefaultDeclaredValue } = useSingleFee({})
      formDataList.forEach(f=>{
        const data = resData.find(c=>c.id == f.no)
        if(data){
          convertDefaultDeclaredValue({inFormData:f,resData:data})
        }
      })
    }
  }

  //计算保费
  async caculatePremium(formDataList){
    if(!formDataList || formDataList.length<1){
      return
    }
    const params = formDataList.filter(f=>f.payWay==='10').map(m=>{
      const customerCode = deliveryUtil.getPayAccount(m,true)
      return{
        id:m.no,
        customerCode,
        premiumFee:Number(m.declaredValue),
        unitNumber: Number(m.count) || null
      }
    })
    if(params.length<1){
      return
    }
    const res = await deliveryApi.queryServiceChargeByBatch(params)
    const dataList = res?.data
    if(dataList?.length>0 && res.code === 0){
      formDataList.forEach(f=>{
        const value = dataList.find(d=>f.no === d.id)?.premiumPrice || ''
        f.premium = value
      })
    }
  }


  //默认值处理
  handleDefaultData(formData){
    const customerInfo = getUserData()?.customerInfo
    const canModifySenderCompany = customerInfo?.modifyShipperFlag == '10'
    if (!canModifySenderCompany || !formData.jjCompany) {
      formData.jjCompany = clientUtil.getLoginCompanyName()
    }
    const dsMoney = parseFloat(formData.dsMoney) || 0
    formData.dsMoney = dsMoney > 0 ? dsMoney.toFixed(2) : ''
    if (!formData.qhContactPerson) {
      formData.qhContactPerson = formData.jjContactPerson
    }
    if (!formData.qhContactWay && !formData.qhTelePhone) {
      formData.qhContactWay = formData.sms
    }
    if ([10, 30].includes(Number(formData.receiptFlag))) {
      if ((Number(formData.hdCount) || 0) <= 0) {
        formData.hdCount = '1'
      }
    } else if ((Number(formData.hdCount) || 0) > 0) {
      formData.receiptFlag = '10'
    }
    if(formData.payWay === '30' && !formData.payAccount){
      const account = storageUtil.getPayCustomerCode()
      formData.payAccount = account || ''
    }
  }

  //加载默认配置
  loadDataFromDefaultConfig(formData, config, vm) {
    if (!config || Object.keys(config).length < 1) {
      return
    }
    clientUtil.formatEmptyOfObject(config)
    const districtList = [config.sendProvince,config.sendCity,config.sendArea].filter(f=>f)
    if (!formData.qhAddress) {
      formData.qhAddress = districtList.join('').trim() + config.sendAddress
      formData.qhAddressData = formData.qhAddressData || {}
      formData.qhAddressData.districtList = districtList
      formData.qhAddressData.detailAddress = config.sendAddress
    }

    formData.jjCompany = formData.jjCompany || config.sendCompany
    formData.jjContactPerson = formData.jjContactPerson || config.sender
    formData.sms = formData.sms || config.sendMobile
    formData.jjTelePhone = formData.jjTelePhone || config.sendPhone
    formData.qhContactPerson = formData.qhContactPerson || config.pickupPerson
    formData.qhContactWay = formData.qhContactWay || config.pickupMobile
    formData.goods = formData.goods || config.goodsName
    formData.serviceWay = formData.serviceWay || config.serviceModel
    formData.dsMoney = formData.dsMoney || config.collectionFee

    const paywayOptions = store.state.common.payWayOptions
    const getPayWayCode = ()=> paywayOptions.find(f=>f.label === config.payType)?.value
    formData.payWay = formData.payWay || getPayWayCode() || ''
    const loadPayAccount = ()=>{
      if(formData.payWay !== '30'){
        formData.payAccount = ''
        return
      }
      const account = storageUtil.getPayCustomerCode()
      if(formData.payWay === '30' && account){
        return
      }
      formData.payAccount = formData.payAccount || config.payAccount
    }
    if(vm){
      vm.$nextTick(() => { loadPayAccount()})
    }else{
      loadPayAccount()
    } 
    formData.jjRemark = formData.jjRemark || config.remark
    if (Number(formData.weight || 0) <= 0 && Number(config.totalWeight) > 0) {
      formData.weight = parseInt(config.totalWeight) || ''
    }
    if (Number(formData.count || 0) <= 0 && Number(config.totalNumber) > 0) {
      formData.count = parseInt(config.totalNumber) || ''
    }
  }
  //加载客户后台配置
  loadDataFromRequirements(formData, requirements) {
    if (!requirements) {
      return
    }
    if (![10, 20, 30].includes(Number(formData.receiptFlag))) {
      const receiptFlag = requirements.recoveryReceiptFlag
      formData.receiptFlag = ['20','40'].includes(receiptFlag) ? '' : receiptFlag
    }
  }

  //获取最近一票寄方信息
  async getSenderDataFromRecentOrder(){
    const res = await deliveryApi.getRecentOrderSenderInfo()
    if (res.code === 0 && res.data) {
      const data = res.data
      const districtList = [data.sendProvince,data.sendCity,data.sendArea].filter(f=>f)
      return{
        jjCompany : data.sendCompany,
        jjContactPerson : data.sender,
        sms : data.sendMobile,
        jjTelePhone : data.sendPhone,
        // qhAddress : data.address,
        qhAddressData:{
          districtList,
          detailAddress : data.sendAddress
        } 
      }
    }
  }
}

export default new DefaultConfigUtil()
