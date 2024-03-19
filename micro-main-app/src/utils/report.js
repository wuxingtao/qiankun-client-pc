// 初始化友盟SDK
;(function (w, d, s, q) {
  w[q] = w[q] || []
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s)
  j.async = true
  j.id = 'beacon-aplus'
  j.src = 'https://public-res.kye-erp.com/bigdata/kyelog/aplus_web_v2_md5_1b26.js'
  f.parentNode.insertBefore(j, f)
})(window, document, 'script', 'aplus_queue')

import request from '@/services/api/request'
import { getQueryObject } from '@/utils/commonUtil'
import { getToken } from '@/utils/storage'
import native from '@utils/native'

window.report = (function () {
  if (window.location.href.includes('uc.ky-express.com')) {
    // 生产环境
    let appKey = native.isClientMode() ? '3hr24vntx0wi8i79j6kp4izp' : '488rrhfkm3p7v9uwkmoy6g80'
    window.aplus_queue.push({
      action: 'aplus.setMetaInfo',
      arguments: ['appKey', appKey]
    })
    window.aplus_queue.push({
      action: 'aplus.setMetaInfo',
      arguments: ['aplus-rhost-v', 'kye-log-sdk.ky-express.com']
    })
  } else {
    // 测试环境
    let appKey = native.isClientMode() ? 'tbdvrfsd9v26t3e7eprq9xnh' : '5l4bt39ctiu2f0eiw1390if0'
    window.aplus_queue.push({
      action: 'aplus.setMetaInfo',
      arguments: ['appKey', appKey]
    })
    window.aplus_queue.push({
      action: 'aplus.setMetaInfo',
      arguments: ['aplus-rhost-v', 'kye-log-sdk-uat.ky-express.com']
    })
  }

  function push(action, args) {
    window.aplus_queue.push({
      action,
      arguments: args
    })
  }

  function sendPV(args) {
    push('aplus.sendPV', [
      { is_auto: false },
      {
        ts: new Date().getTime(), //当前时间戳
        url: window.location.href, //当前page的url
        ...args
      }
    ])
  }

  push('aplus.setMetaInfo', ['aplus-waiting', 'MAN'])

  updateGlobalProperty(push)
  // updateUserProfile(push)

  let currentPageCode = null
  return {
    /* 上报按钮点击事件 */
    sendClickEvent(event, params = {}) {
      this.send(event, 'CLK', params)
    },
    /* 上报自定义事件 */
    sendOtherEvent(event, params = {}) {
      this.send(event, 'OTHER', params)
    },
    /* 上报自动曝光事件 */
    sendExpEvent(event, params = {}) {
      this.send(event, 'EXP', params)
    },
    send(event, type, params) {
      if (currentPageCode) {
        params.page_name = currentPageCode
        push('aplus.record', [event, type, params])
      }
    },
    /* 上报页面浏览事件 */
    sendPV(pageCode, args = {}) {
      currentPageCode = pageCode
      if (!currentPageCode) return

      sendPV({
        page_name: pageCode,
        title: document.title,
        ...args
      })
    },
    sendPVForRouter(to) {
      setTimeout(() => {
        let pageCode = getPageCodeForRouter(to)
        this.sendPV(pageCode)
      }, 50)
    },
    updateUserInfo() {
      updateUserProfile(push)
    }
  }
})()

function updateGlobalProperty(push) {
  const { traceId } = getQueryObject()
  traceId && push('aplus.setMetaInfo', ['globalproperty', { traceId }])
}

function updateUserProfile(push) {
  const token = getToken()
  if (!token) return

  push('aplus.setMetaInfo', ['_hold', 'BLOCK'])
  request({
    headerUrl: 'web.ssoUser.getBuriedPointUserInfo',
    method: 'post',
    data: { accessToken: token },
    hideErrMsg: true,
    appkey: '55262'
  }).then(response => {
    const data = response.data
    push('aplus.setMetaInfo', ['_user_id', data.userId])
    push('aplus.setMetaInfo', ['_anony_id', data.userId])
    push('aplus.record', [
      '$$_user_profile',
      'OTHER',
      {
        userid: data.userId,
        customer_code: data.customerCode,
        mobile_number: data.encryptPhone,
        wx_openid: data.xcxOpenId
      }
    ])

    push('aplus.appendMetaInfo', ['globalproperty', {
      userid: data.userId,
      customer_code: data.customerCode,
      mobile_number: data.encryptPhone
    }])
    
  }).finally(() => {
    push('aplus.setMetaInfo', ['_hold', 'START'])
  })
}

function getPageCodeForRouter(router) {
  return router.meta?.pageCode
}
