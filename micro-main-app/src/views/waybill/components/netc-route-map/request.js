import axios from 'axios'
import { getToken } from '@/utils/storage'

const md5 = require('md5')
/**
 * 创建签名，用于网络请求
 * @param token
 * @param timestamp
 * @param body
 * @returns {string}
 */
const createSign = (token, timestamp, body) => {
  return md5(md5(token).toUpperCase() + timestamp + JSON.stringify(body || {})).toUpperCase()
}

const timeout = 10000
const service = axios.create({ timeout })

/** 响应拦截 */
service.interceptors.response.use(
  (response) => {
    const { data } = response
    if (data.code === 0) {
      return data
    }

    return Promise.reject(data)
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * 开放平台接口请求
 * @param apiCode
 * @param data
 * @param options
 * @returns {Promise}
 */
export const http = (apiCode, data = {}, options = {}) => {
  const timestamp = Date.now()
  const token = getToken()

  const headers = {
    appkey: options.appkey || 55262,
    method: apiCode,
    format: 'JSON',
    timestamp,
    token,
    sign: createSign(token, timestamp, data),
  }

  return service({
    ...options,
    url: `/router/rest?${apiCode}`,
    method: 'POST',
    data,
    headers,
  })
}

/**
 * 文件中心上传
 * @param data
 * @returns {Promise}
 */
export const httpFile = (data) => {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  return service({
    url: '/router/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
