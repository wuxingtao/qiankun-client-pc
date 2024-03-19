import axios from 'axios'
import router from '@router'
import { Message, MessageBox } from 'element-ui'
import { getToken } from '@/utils/storage'
import ENV from '@/utils/env'
const md5 = require('md5')


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
    config.baseURL = `${ENV.BASE_URL}?${config.headerUrl}`
    // config.baseURL = `${config.headerUrl}`
    config.headers.appkey = 55357
    config.headers['Content-Type'] = 'application/json'
    config.headers.method = config.headerUrl

    // if(_token) {
    //   if(typeof getSessionInfo == 'undefined'){
    //     config.headers['x-from'] = ENV.ECAS_APP_ID
    //   }
    //   const now = Date.now()
    //   config.headers.timestamp=now
    //   config.headers.sign = createSign(_token, config.data,now)
    // }

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
    const res = response.data

    if ( res.code !== 0  ) {
      // 6001: 无效的token;60010:token为空； 100201: 用户信息已失效
      if ([60010,6001,100201].includes(res.code)) {
        if (getToken()) {
          sessionStorage.clear()
          MessageBox.confirm('用户信息已失效，请重新登录', '确定登出', {
            showCancelButton: false,
            showClose: false,
            confirmButtonText: '重新登录',
            type: 'warning',
            closeOnClickModal:false
          }).then(() => {
            // router.push('/login')
            location.href = window.location.origin + '/login'
          })
        }
      } else if(![30003,37997,49578].includes(res.code)){ //查无数据
        if(!response.config.hideErrMsg) {
          /** 适配另外一种接口返回数据格式-坑爹的后台接口 */
          if(!res.errCode || res.errCode !== '0000') {
            Message({
              message: res.msg || res.errMsg || '服务器异常，请稍后重试',
              type: 'error',
              duration: 2000
            })
          }
        }
      }
      // 返回promise对象
      return response.config.toReject ? Promise.reject(res) : response.data
    }
    return response.data
  },
  error => {
    Message({
      message: error.message,
      type: 'error',
      duration: 2000
    })
    return Promise.reject(error)
  }
)
export default service

