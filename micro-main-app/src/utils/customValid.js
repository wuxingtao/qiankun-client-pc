/**
 * @Desc: customValid
 * @Author: wu xingtao
 * @Date: 2021/3/4
 */

const userNameValid = (rule , value , callback) => {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9（）】【]{2,30}$/
  if (!(reg.test(value))) {
    if (value.length < 2) {
      callback(new Error('收件人姓名不能少于两个字'))
    } else if (value.length > 30) {
      callback(new Error('收件人姓名不能超过10个字'))
    } else {
      callback(new Error('请输入正确的收件人姓名'))
    }
  } else {
    callback()
  }
}

const customValid = {
  userNameValid
}

export default customValid
