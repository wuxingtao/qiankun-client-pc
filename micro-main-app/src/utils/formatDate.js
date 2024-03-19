import dayjs from 'dayjs'

export default {
  /** 格式化年月日-入参是时间戳(毫秒) */
  date(val) {
    if(val){
      return dayjs(Number(val)).format('YYYY-MM-DD')
    }
  },
  /** 格式化年月日:时分秒-入参是时间戳(毫秒) */
  dateTime(val) {
    if(val){
      return dayjs(val).format('YYYY-MM-DD HH:mm:ss')
    }
  },
  dateTimeHM(val) {
    if(val){
      return dayjs(val).format('YYYY-MM-DD HH:mm')
    }
  },
  dateConnectorChange(val,symbol){
    return val.replace(/-|\//g,symbol)
  },
  formatDate(val) {
    if (val) {
      return dayjs(val).format('YYYY-MM-DD HH:mm')
    }
  },
  /* 匹配时间格式 */
  dateSymbolFormat(val,symbol='/'){
    return val.replace(/([1-9]\d{3})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/g,`$1${symbol}$2${symbol}$3`)
  }
}
