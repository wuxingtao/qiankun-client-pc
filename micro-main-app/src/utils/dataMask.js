/**
 * 数据脱敏
 */
class DataMask{

  /**
   * 姓名脱敏处理
   * 1、姓名少于2个字时，不处理
   * 2、2个字时，最后一个字以星号代替
   * 3、大于2个字时，保留首尾一个字，中间以***代替
   * @param {String} name 姓名
   * @returns 
   */
  maskName(name){
    if(!name || name.length<2){
      return name
    }else if(name.length === 2){
      return name.replace(/^(.).+$/,"$1*")
    }
    return name.replace(/^(.).+(.)$/,"$1***$2")
  }

  /**
   * 手机号脱敏处理：中间4位以星号代替
   * @param {String} mobile 手机号
   * @returns 
   */
  maskMobile(mobile){
    if(!mobile){
      return ''
    }
    return mobile.replace(/^(\d{3})\d{4}(\d+)/,"$1****$2")
  }

  /**
   * 座机号脱敏处理：显示前后2个数字,中间以***代替
   * @param {String} telephone 
   * @returns 
   */
  maskTelephone(telephone){
    if(!telephone){
      return ''
    }
    return telephone.replace(/^(.).+(.)$/,"$1***$2")
  }

  /**
   * 身份证脱敏处理：显示前后各4个位,中间以****代替
   * @param {String} id 
   * @returns 
   */
  maskIdCardNo(id){
    if(!id){
      return ''
    }
    return id.replace(/^(.{4}).+(.{4})$/,"$1****$2")
  }
  /**
   * 文本全脱敏：全部以星号代替
   * @param {String} text 需全脱敏数据
   * @returns 
   */
  maskFull(text){
    if(!text){
      return ''
    }
    return text.replace(/./g, "*")
  }
}
export default new DataMask()