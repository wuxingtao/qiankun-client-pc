/**
 * @Desc: message
 * @Author: wu xingtao
 * @Date: 2021/10/23
 */
import { MessageBox } from 'element-ui'

class MessageInstance {
  constructor() {
    this.class = 'messageBox-instance'
    this.defaultOptions = {
      showClose: false,
      title: '',
      iconClass: 'iconfont icon-info'
    }
  }

  // <message-box__info : 无图标, message-box-title__warning: title 存在图标>
  computedClass(customClass) {
    return customClass ? `${this.class} ${customClass}` : this.class
  }

  /**
   * tip提示 warining,带title logo
   * @param msg
   * @param showClose
   * @param confirmButtonText
   * @returns {Promise<MessageBoxData>}
   */
  warn(msg, { showClose = true, confirmButtonText, cancelButtonText, customClass }) {
    return MessageBox({
      ...this.defaultOptions,
      title: '',
      message: msg,
      customClass: this.computedClass(customClass),
      confirmButtonText: confirmButtonText || '确定',
      cancelButtonText: cancelButtonText || '取消',
      showCancelButton: false,
      showConfirmButton: false
    })
  }

  /**
   * confirm 提示
   * @param msg
   * @returns {Promise<MessageBoxData>}
   * @param options
   */
  confirm(msg, options = {}) {
    const {
      title,
      needTitle,
      type = 'warning',
      confirmButtonText,
      cancelButtonText,
      confirmButtonClass,
      cancelButtonClass,
      showCancelButton = true,
      customClass
    } = options
    const messageTitle = needTitle ? title : ''
    const customClassNew = title
      ? `message-box-title__warning ${customClass ? customClass : ''}`
      : customClass
    return MessageBox.confirm(msg, messageTitle, {
      ...this.defaultOptions,
      ...options,
      confirmButtonText: confirmButtonText || '确定',
      cancelButtonText: cancelButtonText || '取消',
      confirmButtonClass,
      cancelButtonClass,
      showCancelButton: showCancelButton,
      customClass: this.computedClass(customClassNew),
      type
    })
  }
  /**
   * tip提示 warining,带title logo
   * @param msg
   * @returns {Promise<MessageBoxData>}
   * @param options
   */
  warnConfirm(msg, options) {
    const config = {
      ...options,
      customClass: options.customClass || 'message-box-title__warning',
      needTitle: true
    }
    return this.confirm(msg, config)
  }

  $message({
    title,
    message = () => {},
    confirmButtonText,
    showCancelButton = true,
    customClass,
    ...options
  }) {
    if (title) {
      customClass = `message-box-title__warning ${customClass ? customClass : ''}`
    }
    return MessageBox({
      ...this.defaultOptions,
      title: title || '',
      message,
      confirmButtonText,
      showCancelButton,
      customClass: this.computedClass(customClass),
      ...options
    })
  }
}

const kye_message = new MessageInstance()

export default kye_message
