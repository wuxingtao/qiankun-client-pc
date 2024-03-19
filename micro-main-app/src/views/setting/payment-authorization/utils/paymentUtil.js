import dayjs from 'dayjs'

class PaymentUtil{
  showMobilePhone(val){
    if(val&&val.length===11&&val.substring(0,1)==1){
      val= val.replace(/(?=(\d{4})+$)/g,' ')  
    }
    return val
   
  }
  showDate(val){
    return dayjs(val).format('YYYY-MM-DD')
  }
}

export default new PaymentUtil()