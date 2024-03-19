/**
 * 全局异常日志类
 */
var __KYE_ERROR_LOG = (function () {
  // 日志开关
  var IS_OPEN = true

  // 记录上次异常
  var LAST_ERROR_STACK = ''

  // 日志模板
  function LOG(error, source) {
    // 异常类型
    this.type = 'JS_ERROR'
    // 唯一标识UUID
    try {
      if (!window.localStorage.getItem('KYE_ERROR_LOG_UUID')) {
        window.localStorage.setItem('KYE_ERROR_LOG_UUID', uuid())
      }
      this.uuid = window.localStorage.getItem('KYE_ERROR_LOG_UUID')
    } catch (e) {
      this.uuid = ''
    }
    // 用户标识
    try {
      var phone = window.sessionStorage.getItem('PHONE')
      if (phone) {
        var start = phone.length > 4 ? phone.length - 4 : 0
        this.userId = phone.substring(start)
      }else{   
        this.userId = ''
      }
    } catch (e) {
      this.userId = ''
    }
    // 设备信息
    this.userAgent = window.navigator.userAgent
    // 异常来源
    this.source = source || window.location.href
    // 异常堆栈
    this.error = error
  }

  function uuid() {
    var s = []
    var hexDigits = '0123456789abcdef'
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = '4'
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
    s[8] = s[13] = s[18] = s[23] = '-'
    var uuid = s.join('')
    return uuid
  }
  return {
    /**
     * 上报日志
     */
    REPORT: function (error, source) {
      try {
        if (!IS_OPEN) return
        if (error === LAST_ERROR_STACK) return

        // 更新上一次错误栈
        LAST_ERROR_STACK = error

        // 上报日志
        var log = new LOG(error, source)
        var xhr = new XMLHttpRequest()
        var url = 'https://collect-uat.ky-express.com/json/collector?source=pc'
        if (window.location.host === 'uc.ky-express.com') {
          url = 'https://collect.ky-express.com/json/collector?source=pc'
        }
        xhr.open('POST', url, true)
        xhr.setRequestHeader('Content-type', 'application/json;charset=UTF-8')
        xhr.setRequestHeader('method', 'cts.web.uploadWebActionLog')
        xhr.setRequestHeader('appkey', '10145')
        xhr.send(JSON.stringify([log]))
      } catch (e) {
        console.log(e)
      }
    },
    /**
     * 开启日志
     */
    OPEN: function () {
      IS_OPEN = true
    },
    /**
     * 关闭日志
     */
    CLOSE: function () {
      IS_OPEN = false
    },
  }
})()

/**
 * 监听全局异常
 */
window.onerror = function (msg, url, lineno, colno, error) {
  __KYE_ERROR_LOG.REPORT(error && error.stack, url)
}

/**
 * 监听资源加载失败
 */
window.addEventListener(
  'error',
  function (e) {
    console.log(e)
    // 过滤js error
    var target = e.target
    var isElementTarget =
      target instanceof HTMLScriptElement || target instanceof HTMLLinkElement || target instanceof HTMLImageElement
    if (!isElementTarget) return false
    // 资源加载失败上报
    __KYE_ERROR_LOG.REPORT('Fail to load resource: ' + target.src || target.href)
  },
  true
)
