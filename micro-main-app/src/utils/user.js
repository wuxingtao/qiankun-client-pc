import * as loginApi from '@/services/api/login'
import * as cookiesUtil from '@/utils/cookies'
import * as storageUtil from '@/utils/storage'

class User{
  /**
   * 检查灰度版本
   * @param {String} routePath 不为空时刷新页面并跳转到该页面
   */
  async checkGrayVersion(routePath){
    const phone = storageUtil.getPhone()
    const res = await loginApi.checkIsGrayUser(phone)
    if (res.code === 0) {
      cookiesUtil.setGragFlag(res.data)
    }
    if(routePath){
      location.href = location.origin + routePath
    }
    
  }
}

export default new User()