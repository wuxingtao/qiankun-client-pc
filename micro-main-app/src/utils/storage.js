import CryptoJS from 'crypto-js'
import Native from './native/index'
import store from '@/store'

const MAX_ACCOUNT_COUNT = 100

// 保存账号、密码
const saveLoginAccount = async (phone, password) => {
  const cache = await __getLocalCache('LOGIN_ACCOUNT')
  let array = cache ? JSON.parse(cache) : []

  // 判断当前是否已保存该账号
  for (let i = 0; i < array.length; i++) {
    let item = array[i]
    if (phone === CryptoJS.AES.decrypt(item.phone, 'LOGIN_PHONE').toString(CryptoJS.enc.Utf8)) {
      array.splice(i, 1)
      break
    }
  }

  // 加密
  let cipherPhone = CryptoJS.AES.encrypt(phone, 'LOGIN_PHONE').toString()
  let cipherPassword = CryptoJS.AES.encrypt(password, 'LOGIN_PASSWORD').toString()

  // 保存到数组首位
  array.unshift({ phone: cipherPhone, password: cipherPassword })
  if (array.length > MAX_ACCOUNT_COUNT) {
    array.length = MAX_ACCOUNT_COUNT
  }
  __setLocalCache('LOGIN_ACCOUNT', JSON.stringify(array))
}

// 获取账号、密码
const getLoginAccount = async () => {
  const cache = await __getLocalCache('LOGIN_ACCOUNT')
  let array = cache ? JSON.parse(cache) : []

  // 解密并返回
  array.forEach(account => {
    account.phone = CryptoJS.AES.decrypt(account.phone, 'LOGIN_PHONE').toString(CryptoJS.enc.Utf8)
    account.password = CryptoJS.AES.decrypt(account.password, 'LOGIN_PASSWORD').toString(
      CryptoJS.enc.Utf8
    )
  })
  return array
}

// 移除记住的账号、密码
const removeLoginAccount = async phone => {
  const cache = await __getLocalCache('LOGIN_ACCOUNT')
  let array = cache ? JSON.parse(cache) : []

  // 当前已保存则移除
  for (let i = 0; i < array.length; i++) {
    let item = array[i]
    if (phone === CryptoJS.AES.decrypt(item.phone, 'LOGIN_PHONE').toString(CryptoJS.enc.Utf8)) {
      array.splice(i, 1)
      break
    }
  }
  __setLocalCache('LOGIN_ACCOUNT', JSON.stringify(array))
}

// 登录相关信息
const setLoginData = data => {
  if (data && data.ecasToken) {
    sessionStorage.setItem('LOGIN_DATA', JSON.stringify(data))
    sessionStorage.setItem('TOKEN', data.ecasToken.accessToken)
    sessionStorage.setItem('PHONE', data.phone)
    if (data.customerCode) {
      sessionStorage.setItem('CUSTOMER_CODE', data.customerCode)
    }
  }
}

const getLoginData = () => {
  return sessionStorage.getItem('LOGIN_DATA')
    ? JSON.parse(sessionStorage.getItem('LOGIN_DATA'))
    : {}
}

const getToken = () => {
  return sessionStorage.getItem('TOKEN')
}

const getPhone = () => {
  return sessionStorage.getItem('PHONE')
}

const getCustomerCode = () => {
  return sessionStorage.getItem('CUSTOMER_CODE')
}

const setCustomerCode = customerCode => {
  return sessionStorage.setItem('CUSTOMER_CODE', customerCode)
}

const getCustomerName = () => {
  const customerInfo = getUserData().customerInfo
  return customerInfo && customerInfo.customerName
}

const getCustomerShortName = () => {
  const customerInfo = getUserData().customerInfo
  return customerInfo && customerInfo.customerShortName
}

const getCustomerId = () => {
  const customerInfo = getUserData().customerInfo
  return customerInfo && customerInfo.id
}

const getPayCustomerCode = () => {
  return getUserData().payCustomerCode || ''
}

// 用户相关信息
const setUserData = data => {
  sessionStorage.setItem('USER_DATA', JSON.stringify(data))
}

const getUserData = () => {
  return sessionStorage.getItem('USER_DATA') ? JSON.parse(sessionStorage.getItem('USER_DATA')) : {}
}

const setCustomerData = data => {
  if(!data || Object.keys(data).length<1){
    setCustomerCode('')
  }
  sessionStorage.setItem('CUSTOMER_DATA', JSON.stringify(data))
  if(data?.customerCode){
    setCustomerCode(data.customerCode)
  }
}

const getCustomerData = () => {
  return sessionStorage.getItem('CUSTOMER_DATA')
    ? JSON.parse(sessionStorage.getItem('CUSTOMER_DATA'))
    : {}
}

// 实名认证信息
const setRealNameData = data => {
  sessionStorage.setItem('REAL_NAME_DATA', JSON.stringify(data))
}

const getRealNameData = () => {
  return sessionStorage.getItem('REAL_NAME_DATA')
    ? JSON.parse(sessionStorage.getItem('REAL_NAME_DATA'))
    : {}
}

// 用户个性配置
const getUserPreference = async key => {
  const cache = await __getLocalCache('USER_PREFERENCE')
  if (!cache) {
    return ''
  }
  return JSON.parse(cache)[key]
}

const setUserPreference = async (key, value) => {
  const cache = await __getLocalCache('USER_PREFERENCE')
  let obj = cache ? JSON.parse(cache) : {}
  obj[key] = value
  __setLocalCache('USER_PREFERENCE', JSON.stringify(obj))
}

// 用户本地配置缓存
const getUserSetting = async key => {
  const cache = await __getLocalCache('USER_SETTING')
  if (!cache) {
    return ''
  }
  return JSON.parse(cache)[key]
}

const setUserSetting = async (key, value) => {
  const cache = await __getLocalCache('USER_SETTING')
  let obj = cache ? JSON.parse(cache) : {}
  obj[key] = value
  __setLocalCache('USER_SETTING', JSON.stringify(obj))
}

const __setLocalCache = (key, value) => {
  localStorage.setItem(key, value)
  Native.setCacheInfo(key, value)
}

const __getLocalCache = async key => {
  return localStorage.getItem(key) || (await Native.getCacheInfo(key))
}

//打印组件Id数据
const setPrintAppData = data => {
  localStorage.setItem('PRINT_APP_DATA', JSON.stringify(data))
}
const getPrintAppData = () => {
  const data = localStorage.getItem('PRINT_APP_DATA')
  return data ? JSON.parse(data) : []
}

const declaredValueFlagKey = 'DECLAREDVALUE_DESC'
const getOrSetDeclaredValueFlag = isSet=>{
  if(isSet){
    localStorage.setItem(declaredValueFlagKey,true)
    store.commit('delivery/setDeclaredValueDescripChecked',true)
    return
  }
  const flag = !!localStorage.getItem(declaredValueFlagKey)
  store.commit('delivery/setDeclaredValueDescripChecked',flag)
  return flag
}

const removeDeclaredValueFlag = ()=>{
  store.commit('delivery/setDeclaredValueDescripChecked',false)
  localStorage.removeItem(declaredValueFlagKey)
}

export {
  getUserPreference,
  setUserPreference,
  saveLoginAccount,
  getLoginAccount,
  removeLoginAccount,
  setLoginData,
  getLoginData,
  getToken,
  getPhone,
  getCustomerCode,
  setCustomerCode,
  setUserData,
  getUserData,
  setCustomerData,
  getCustomerData,
  setRealNameData,
  getRealNameData,
  getCustomerId,
  getCustomerName,
  getCustomerShortName,
  getPayCustomerCode,
  setPrintAppData,
  getPrintAppData,
  getUserSetting,
  setUserSetting,
  getOrSetDeclaredValueFlag,
  removeDeclaredValueFlag
}
