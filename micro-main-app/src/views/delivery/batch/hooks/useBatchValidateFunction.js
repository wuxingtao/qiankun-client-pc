import Regular from '@utils/regular'

export default function () {
  
  const checkReceiverContactNumber = ({fieldName,row})=>{
    const fields = ['isSignSelf', 'sjMobile','sjTelephone']
    if(!fields.includes(fieldName)){
      return true
    }
    // fields.forEach(f=>{
    //   row[f].errorInfo = ''
    // })

    const sjMobile = row['sjMobile'].value
    const sjTelephone = row['sjTelephone'].value
    if(!sjMobile || Regular.mobilePhone.test(sjMobile)){
      row['sjMobile'].errorInfo = ''
    }
    if(!sjTelephone || Regular.landlinePhone3.test(sjTelephone)){
      row['sjTelephone'].errorInfo = ''
    }

    if (row['isSignSelf'].value && !sjMobile) {
      row['sjMobile'].errorInfo = '本人签收必须输入手机号'
      return
    }else if(!sjMobile && !sjTelephone){
      row['sjMobile'].errorInfo = '收件手机号码或固定电话至少填写一项'
      return
    }
    return true
  }

  return {
    checkReceiverContactNumber
  }
  
}