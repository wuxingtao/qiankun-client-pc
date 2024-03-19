const md5 = require('md5')

import axios from 'axios'
import router from '@router'
import ENV from '@/utils/env'
import { getToken } from '@/utils/storage'
import { Message, MessageBox } from 'element-ui'


// 返回码
const CODE_SUCCESS = 0
const CODE_TOKEN_INVALID = 6001
const CODE_TOKEN_EMPTY = 60010
const CODE_TOKEN_EXPIRED = 100201

// 超时时间，单位ms
const TIME_OUT = 10000

// 基础配置
const DEFAULT_CONFIG = {
  timeout: TIME_OUT,
  method: 'POST',
  withToken: true,
  headers: {
    'appKey': ENV.APP_KEY,
    'Content-Type': 'application/json',
    'x-from': ENV.ECAS_APP_ID
  }
}

// 创建请求实例
const instance = axios.create(DEFAULT_CONFIG)

// 添加请求拦截器
instance.interceptors.request.use(
  config => {
    // 请求带token，则需要加上签名信息
    if (config.withToken) {
      let timestamp = Date.now()
      let token = getToken()
      config.headers.token = token
      config.headers.timestamp = timestamp
      config.headers.sign = __createSign(token, timestamp, config.data)
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

const __createSign = (token, timestamp, param) => {
  return (md5(md5(token).toUpperCase() + timestamp + JSON.stringify(param))).toUpperCase()
}

// 添加响应拦截器
instance.interceptors.response.use(
  response => {
    let res = response.data
    if (res.code !== CODE_SUCCESS) {
      // 登录失效
      if (res.code === CODE_TOKEN_INVALID || res.code === CODE_TOKEN_EMPTY || res.code === CODE_TOKEN_EXPIRED) {
        if (getToken()) {
          sessionStorage.clear()
          MessageBox.confirm('用户信息已失效，请重新登录', '确定登出', {
            showCancelButton: false,
            showClose: false,
            confirmButtonText: '重新登录',
            type: 'warning',
            closeOnClickModal:false
          }).then(() => {
            router.push('/login')
          })
        }
      }

      // 统一处理
      else {
        // 根据配置，分为defalut(默认提示)、silent(静默模式)
        const mode = response.config.errorMode
        if (mode !== 'silent') {
          Message.error({ message: res.msg || res.errMsg || '服务器异常，请稍后重试' })
        }
        return Promise.reject(res)
      }
    }
    return res
  },
  error => {
    return Promise.reject(error)
  }
)

/**
 * 基础请求
 * @param apiCode 接口code
 * @param config 自定义配置，可选，会覆盖默认配置
 * 参见：http://www.axios-js.com/zh-cn/docs/index.html#%E8%AF%B7%E6%B1%82%E9%85%8D%E7%BD%AE
 */
const request = (apiCode, params, config) => {
  return instance.request({
    baseURL: ENV.BASE_URL + '?' + apiCode,
    data: params,
    headers: {
      method: apiCode
    },
    ...config
  })
}


/**
 * 转发接口
 */
const requestErpInterface = (interfaceName, requestParam) => {
  let params = {
    method: interfaceName,
    param: JSON.stringify(requestParam)
  }
  return request('gw.foward.api-auth', params)
}


export default {
  request,
  requestErpInterface
}