// 邮箱
export function validateEmail(email) {
  const reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
  return reg.test(email)
}

// 手机号码
export function validatePhone(phone) {
  const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|19[0-9]|14[057]|165|166|168|199|198)[0-9]{8}$/
  return reg.test(phone)
}

//固定电话
export function validateFixPhone(val) {
  const reg = /(^(0[0-9]{2,3}-)?([2-9][0-9]{6,7}|400[0-9]{6,7})(-[0-9]{1,7})?$)|(^(400-)?[2-9]{6,7}$)/
  return reg.test(val)
}

//数字或者带有小数点的数字
export function validateNum(val) {
  const reg = /^\d+(\.\d+)?$/
  return reg.test(val)
}

// 校验只能输入正整数数字
export function validateNumber(val) {
  const reg = /^[0-9]\d*$/
  return reg.test(val)
}

// 密码校验 密码 数字 特殊字符 不能为纯数字和纯字母，6-20位
export function validatePass(val) {
  const reg = /^(?=.*\d)(?=.*[A-Za-z])[\x20-\x7e]{6,20}$/
  return reg.test(val)
}

// 收寄件公司名称校验    字母、中文、数字、括号、-和\u3000 全角空格，\u0020 半角空格
export function validateCompany(val) {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9-()（）*,，\u0020\u3000－]+$/
  return reg.test(val)
}

//联系人姓名校验    字母、中文、数字、括号、-和\u3000 全角空格，\u0020 半角空格·、#
export function validateName(val) {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9-()（）*,，\u0020\u3000，。：；·〞/\.\\〝、:­－#]+$/
  return reg.test(val)
}

//校验购货方名称，购货方地址，开户银行及账号    字母、中文、数字、括号和-
export function validateThingName(val) {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9-()（）,，]+$/
  return reg.test(val)
}

// 校验纳税人识别号      字母、中文、数字、括号和- 空格
export function validateNashui(val) {
  const reg = /^[\u4e00-\u9fa5a-zA-Z0-9()（）,，\u0020\u3000]+$/
  return reg.test(val)
}

// 校验是否含有中文
export function validateZhong(val) {
  const reg = /[\u4e00-\u9fa5]/
  return reg.test(val)
}
