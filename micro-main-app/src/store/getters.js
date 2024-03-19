import * as storageUtil from '@/utils/storage'
import customColumnUtil from '@utils/customColumn'

const getters = {
  isB2BUser: state => {
    const clientType = getClientType(state)
    return !clientType || clientType === '正常客户'
  },
  isVipshopUser: state => getCustomerInfo(state).vipshopFlag == '10' || false,
  mainProduct: state => getCustomerInfo(state).mainProduct,
  canModifySenderCompany: state => getCustomerInfo(state).modifyShipperFlag == '10' || false,
  warehouseType: state => getCustomerInfo(state).otherWarehouseType,
  // isSignBySelf:state=>getCustomerInfo(state).verificCodeFlag=='10'&&(state.client.requirements&&state.client.requirements.selfSignType==='30')||false,
  isSignBySelf: () => ['20', '30'].includes(storageUtil.getCustomerData()?.selfSignType),
  authorityIds: state => state.client.authorityIds, //权限ID列表
  permissionCodes: state => state.client.permissionCodes, // 权限code列表
  isEncryptField: state => state.client.authorityIds.includes('126'), //下单相关字段是否加密
  hasFrightFeeAuth: state => state.client.permissionCodes.includes('freightLookAuthFlag'), //运费权限
  encryptionText: state => state.client.encryptionText,//打印加密字符串

  projectInfo: state => state.client.projectInfo,
  paymentTypeList: state => state.client.paymentTypeList,
  defaultConfig: state => state.client.defaultConfig,
  requirements: state => state.client.requirements,
  printConfig: state => state.client.printConfig,
  printerNo: state => state.client.printerNo,
  serviceWay: state => state.client.serviceWay,
  customOriginalFields: state => state.client.customOriginalFields,
  customFields: state =>  customColumnUtil.getFormFields(state.client.customOriginalFields),
  /** 自定义表单验证规则 */
  customFieldRules: state => customColumnUtil.getFormRules(state.client.customOriginalFields),
  payCustomerInfo: state => state.client.payCustomerInfo,
  historyGoodsList: state => state.client.historyGoodsList,
  historyPayAccountList: state => state.client.historyPayAccountList,
  skuList: state => state.client.skuList,
  goodsBatchTimes: state => state.client.goodsBatchTimes,
  printTemplateList: state => state.client.printTemplateList,
  customerShortName: state => {
    return (
      (state.userInfo &&
        state.userInfo.customerInfo &&
        state.userInfo.customerInfo.customerShortName) ||
      ''
    )
  },
  customerizedPermission: state => state.client.customerizedPermission,
  isCustomerIsMonthly: state => state.userInfo && state.userInfo.isCustomerIsMonthly,
  // 2021.10重构后新接口
  newServiceWay: state => state.client.newServiceWay,
  newPayCustomerInfo: state => state.client.newPayCustomerInfo
}

function getCustomerInfo(state) {
  const customerInfo = state.userInfo && state.userInfo.customerInfo
  return customerInfo || {}
}

function getClientType(state) {
  if (!state.userInfo || !state.userInfo.customerInfo) {
    return ''
  }

  const { companyType, customerType } = state.userInfo.customerInfo
  if (companyType == '20') {
    return '电商'
  }
  switch (customerType) {
    case '10':
      return '正常客户'
    case '20':
      return '京东专运'
    case '30':
      return '公共后台'
    case '40':
      return '内部专用'
    default:
      return ''
  }
}

export default getters
