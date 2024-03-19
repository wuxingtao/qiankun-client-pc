/**
 * @Desc: permissionEnum
 * @Author: wu xingtao
 * @Date: 2021/11/23
 */
export const permissionLevel = {
  OWNER: 1,
  ADMIN: 2,
  NORMAL: 3,
  ALL: ''
}

export const paymentAccountType = {
  SUPER: 10, // 主授权人
  SECOND: 20, // 副授权号
  NORMAL: null, // 普通人 <30 || null || '30' || 0>
  NORMAL_NEW: 30 // 普通人心
}
