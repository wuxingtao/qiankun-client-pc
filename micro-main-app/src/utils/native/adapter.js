/**
 * adapter.js
 * 适配器，用于封装同一功能，在网页/客户端实现不一致的情况
 */

import native from './index'

/**
 * 打开链接
 */
const openLink = async url => {
  if (await native.isClientMode) {
    // TODO
  } else {
    // 网页打开新页签
    window.open(url)
  }
}

export default {
  openLink
}