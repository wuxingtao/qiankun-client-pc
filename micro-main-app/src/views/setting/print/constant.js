/**
 * @Desc: constant
 * @Author: wu xingtao
 * @Date: 2021/2/22
 */
export default {
  // 打印面单加密选项
  checkboxGroup: [
    {
      label: '半加密' ,
      key: '20'
    } ,
    {
      label: '全加密' ,
      key: '10'
    } ,
    {
      label: '不加密' ,
      key: '30'
    }
  ] ,
  // value 加密类型， noEncryption 是否显示不加密
  sf_cg_List: [
    {
      fieldName: '寄件人' ,
      fieldColumn: 'sender' ,
      encryptType: '20' ,
      titleType: 20 ,
      noEncryption: true
    } ,
    {
      fieldName: '收件人' ,
      fieldColumn: 'receiver' ,
      encryptType: '20' ,
      titleType: 20 ,
      noEncryption: true
    } ,
    {
      fieldName: '月结账号' ,
      fieldColumn: 'monthly_account' ,
      encryptType: '20' ,
      titleType: 20 ,
    } ,
    {
      fieldName: '声明价值' ,
      fieldColumn: 'declared_value' ,
      encryptType: '20' ,
      titleType: 20 ,
    }
  ] ,
  jf_cg_List: [
    {
      fieldName: '寄件人' ,
      fieldColumn: 'sender' ,
      encryptType: '20' ,
      titleType: 30 ,
      noEncryption: true
    } ,
    {
      fieldName: '收件人' ,
      fieldColumn: 'receiver' ,
      encryptType: '20' ,
      titleType: 30 ,
      noEncryption: true
    } ,
    {
      fieldName: '月结账号' ,
      fieldColumn: 'monthly_account' ,
      encryptType: '20' ,
      titleType: 30 ,
    } ,
    {
      fieldName: '声明价值' ,
      fieldColumn: 'declared_value' ,
      encryptType: '20' ,
      titleType: 30 ,
    }
  ] ,
}
