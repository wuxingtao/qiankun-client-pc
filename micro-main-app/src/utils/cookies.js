import Cookies from 'js-cookie'

const LoginFlagKey = 'Login-data'

const GrayFlagKey = 'gray'

/**
 * 根域名, 用于设置cookie在子域共享
 * 本地环境使用当前hostname
 */
// const ROOT_DOMAIN = process.env.NODE_ENV.trim()  === 'development' ? window.location.hostname : 'ky-express.com'

//设置登录标识(官网静态页面使用)
export function setWebSiteLoginFlag({ token, phone, customCode }) {
  let user = JSON.stringify({
    token: token,
    phone: phone,
    customCode: customCode
  })
  Cookies.set(LoginFlagKey, user, { domain: 'ky-express.com' })
}

//移除登录标识(官网静态页面使用)
export function removeWebSiteLoginFlag() {
  Cookies.remove(LoginFlagKey, { domain: 'ky-express.com' })
}

//设置灰度标识
export function setGragFlag(value) {
  Cookies.set(GrayFlagKey, value)
}
