/**
 * @Desc: index 智能分单提醒状态记录
 * @Author: wu xingtao
 * @Date: 2021/10/22
 * 关于失效 地址簿1天，其他页面切换失效
 */

class AddressStorage {
  constructor (key) {
    this.key = key
    this.maxNum = 3000
    this.deleteWhiteList = ['/admin/address']
  }

  setItemJson (result, isLocal) {
    if (isLocal) {
      localStorage.setItem(this.key, JSON.stringify(result))
    } else {
      sessionStorage.setItem(this.key, JSON.stringify(result))
    }
  }

  getValue (isLocal) {
    if (isLocal) {
      return localStorage.getItem(this.key) || '[]'
    } else {
      return sessionStorage.getItem(this.key) || '[]'
    }
  }

  getParseValue (isLocal) {
    return JSON.parse(this.getValue(isLocal))
  }

  isWhiteList (pathName) {
    return this.deleteWhiteList.indexOf(pathName) > -1
  }

  // valueFormat(value){
  //   return `${value}_${window.location.href}`
  // }

  hasOne (value) {
    let result = false
    const isLocal = this.isWhiteList(value)

    let parseValue = this.getParseValue(isLocal)
    if (parseValue.find(item => item.data === value)) {
      result = true
    }
    return result
  }

  /**
   * 增加新地址
   * @param value
   * @param expire 失效时间1天
   */
  addOne (value, expire = 24 * 3600 * 1000) {
    const isLocal = this.isWhiteList(value)
    if (!this.hasOne(value)) {
      let result = this.getParseValue(isLocal)
      if (result.length >= this.maxNum) {
        result.shift()
      }
      result.push({
        data: value,
        time: Date.now(),
        expire: expire
      })
      this.setItemJson(result, isLocal)
    }
  }

  /**
   * 检查是否存在未过期的，存在已过期则删除
   * @param value
   * @return {null}
   */
  checkOne (value) {
    let result = null
    const isLocal = this.isWhiteList(value)
    let parseValue = this.getParseValue(isLocal)
    for (let i = 0; i < parseValue.length; i++) {
      if (parseValue[i].data === value) {
        if (Date.now() - parseValue[i].time > parseValue[i].expire) {
          parseValue.splice(i, 1) // 已过期直接删除
        } else {
          result = parseValue[i]
        }
        break
      }
    }
    this.setItemJson(parseValue, isLocal)
    return result
  }

  /**
   * 删除指定页面记录
   * @param pathName
   */
  deleteOne (pathName) {
    if (!pathName || this.deleteWhiteList.indexOf(pathName) > -1) {
      return
    }
    const isLocal = this.isWhiteList(pathName)
    let parseValue = this.getParseValue(isLocal)
    for (let i = 0; i < parseValue.length; i++) {
      if (parseValue[i].data === pathName) {
        parseValue.splice(i, 1)
        break
      }
    }
    this.setItemJson(parseValue, isLocal)
  }
}

const addressStorage = new AddressStorage('address_page_lists')

export default addressStorage
