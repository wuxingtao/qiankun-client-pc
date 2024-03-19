import axios from 'axios'
import { getToken } from '@/utils/storage'
import ENV from '@/utils/env' 
const md5 = require('md5')

/** 请求来源，官网：1 */
const FROM_ID = 1
/** 
接口签名 
签名规则参考：http://api.kyepm.com/documents/development-norms
appsecret替换成token
*/
const createSign = (token, param,timestamp) => {
  token = md5(token).toUpperCase() 
  const paramStr = JSON.stringify(param)
  return (md5(token + timestamp + paramStr)).toUpperCase()
}

export const service = axios.create({
  timeout: 10000 // 请求超时时间
})
// request拦截器
service.interceptors.request.use(
  config => {
    let _token = getToken()
    config.baseURL =config.baseURL|| ENV.BASE_URL
    config.headers.appkey = ENV.APP_KEY
    config.headers['Content-Type'] = 'application/json'
    config.headers.method = config.headerUrl
        
    if (!config.token) {
      config.headers.token = _token
    }
        
    if(_token) {
      // config.headers['x-from'] = FROM_ID
      const now = Date.now()
      config.headers.timestamp=now
      config.headers.sign = createSign(_token, config.data,now) 
    }
    config.hideErrMsg = config.hideErrMsg || false
    config.toReject = config.toReject || false
    return config
  },
  error => {
    // Do something with request error
    console.log('请求报错', error) // for debug
    Promise.reject(error)
  }
)

// respone拦截器
service.interceptors.response.use(
  response => {
    return response.data
  },
  error => { 
    return Promise.reject(error)
  }
)
export default service
