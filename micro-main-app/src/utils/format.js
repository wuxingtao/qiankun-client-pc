class Format{
  formatMobliePhone(phone,separator=' '){
    if(!phone){
      return ''
    }
    const reg = /^(\d{3})(\d{0,4})(\d+)?/
    // const reg = /^(\d{3})(\d{4})(\d+)/
    return phone?.replace(reg,`$1${separator}$2${separator}$3`)?.trim()
  }
  encrptMobile(phone){
    if(!phone){
      return ''
    }
    return phone?.replace(/^(\d{3})(\d{4})(\d+)/,`$1****$3`)
  }
}

export default new Format()
