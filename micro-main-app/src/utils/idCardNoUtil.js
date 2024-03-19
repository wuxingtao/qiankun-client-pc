var idCardNoUtil = {
  /*省,直辖市代码表*/
  provinceAndCitys: {11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",
    31:"上海",32:"江苏",33:"浙江",34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",
    45:"广西",46:"海南",50:"重庆",51:"四川",52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",
    65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"},

  /*每位加权因子*/
  powers: ["7","9","10","5","8","4","2","1","6","3","7","9","10","5","8","4","2"],
  /*第18位校检码*/
  parityBit: ["1","0","X","9","8","7","6","5","4","3","2"],
  /*性别*/
  genders: {male:"M",female:"F"},

  /*校验地址码*/
  checkAddressCode: function(addressCode){
    var check = /^[1-9]\d{5}$/.test(addressCode)
    if(!check) return false
    if(idCardNoUtil.provinceAndCitys[parseInt(addressCode.substring(0,2))]){
      return true
    }else{
      return false
    }
  },

  /*校验日期码*/
  checkBirthDayCode: function(birthDayCode){
    var check = /^[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))$/.test(birthDayCode)
    if(!check) return false
    var yyyy = parseInt(birthDayCode.substring(0,4),10)
    var mm = parseInt(birthDayCode.substring(4,6),10)
    var dd = parseInt(birthDayCode.substring(6),10)
    var xdata = new Date(yyyy,mm-1,dd)
    if(xdata > new Date()){
      return false//生日不能大于当前日期
    }else if ( ( xdata.getFullYear() == yyyy ) && ( xdata.getMonth () == mm - 1 ) && ( xdata.getDate() == dd ) ){
      return true
    }else{
      return false
    }
  },

  /*计算校检码*/
  getParityBit: function(idCardNo){
    var id17 = idCardNo.substring(0,17)
    /*加权 */
    var power = 0
    for(var i=0;i<17;i++){
      power += parseInt(id17.charAt(i),10) * parseInt(idCardNoUtil.powers[i])
    }
    /*取模*/
    var mod = power % 11
    return idCardNoUtil.parityBit[mod]
  },

  /*验证校检码*/
  checkParityBit: function(idCardNo){
    var parityBit = idCardNo.charAt(17).toUpperCase()
    if(idCardNoUtil.getParityBit(idCardNo) == parityBit){
      return true
    }else{
      return false
    }
  },

  /*校验身份证号码*/
  checkIdCardNo: function(idCardNo){ 
    idCardNo=idCardNo.toUpperCase()
    //15位和18位身份证号码的基本校验
    var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo)
    if(!check){
      if(/[A-Z][0-9]{6}\([0-9A]\)/.test(idCardNo)){ //香港身份证
        return true
      }
      if(/[157][0-9]{6}\([0-9]\)/.test(idCardNo)){ //澳门身份证
        return true
      }
      if(/[A-Z][0-9]{9}/.test(idCardNo)){ //台湾身份证
        return true
      }
      return false
    } 
    //判断长度为15位或18位
    if(idCardNo.length==15){
      return idCardNoUtil.check15IdCardNo(idCardNo)
    }else if(idCardNo.length==18){
      return idCardNoUtil.check18IdCardNo(idCardNo)
    }else{
      return false
    }
  },

  //校验15位的身份证号码
  check15IdCardNo: function(idCardNo){
    //15位身份证号码的基本校验
    var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo)
     
    if(!check) return false
    //校验地址码
    var addressCode = idCardNo.substring(0,6)
    check = idCardNoUtil.checkAddressCode(addressCode) 
    if(!check) return false
    var birthDayCode = '19' + idCardNo.substring(6,12)
    //校验日期码
    check = idCardNoUtil.checkBirthDayCode(birthDayCode)
    return check 
  },

  //校验18位的身份证号码
  check18IdCardNo: function(idCardNo){
    /*
        第一位不可能是0
        第二位到第六位可以是0-9
        第七位到第十位是年份，所以七八位为19或者20
        十一位和十二位是月份，这两位是01-12之间的数值
        十三位和十四位是日期，是从01-31之间的数值
        十五，十六，十七都是数字0-9
        十八位可能是数字0-9，也可能是X
        */               
    var check =  /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/.test(idCardNo)
    if(!check) return false
    //校验地址码
    var addressCode = idCardNo.substring(0,6)
    check = idCardNoUtil.checkAddressCode(addressCode)
    if(!check) return false
    //校验日期码
    var birthDayCode = idCardNo.substring(6,14)
    check = idCardNoUtil.checkBirthDayCode(birthDayCode)
    if(!check) return false
    //验证校检码
    return idCardNoUtil.checkParityBit(idCardNo)
  },

  formateDateCN: function(day){
    var yyyy =day.substring(0,4)
    var mm = day.substring(4,6)
    var dd = day.substring(6)
    return yyyy + '-' + mm +'-' + dd
  },

  //获取信息
  getIdCardInfo: function(idCardNo){
    var idCardInfo = {
      gender:"",  //性别
      birthday:"" // 出生日期(yyyy-mm-dd)
    }
    if(idCardNo.length==15){
      var aday = '19' + idCardNo.substring(6,12)
      idCardInfo.birthday=idCardNoUtil.formateDateCN(aday)
      if(parseInt(idCardNo.charAt(14))%2==0){
        idCardInfo.gender=idCardNoUtil.genders.female
      }else{
        idCardInfo.gender=idCardNoUtil.genders.male
      }
    }else if(idCardNo.length==18){
      var aday = idCardNo.substring(6,14)
      idCardInfo.birthday=idCardNoUtil.formateDateCN(aday)
      if(parseInt(idCardNo.charAt(16))%2==0){
        idCardInfo.gender=idCardNoUtil.genders.female
      }else{
        idCardInfo.gender=idCardNoUtil.genders.male
      }

    }
    return idCardInfo
  },

  /*18位转15位*/
  getId15: function(idCardNo){
    if(idCardNo.length==15){
      return idCardNo
    }else if(idCardNo.length==18){
      return idCardNo.substring(0,6) + idCardNo.substring(8,17)
    }else{
      return null
    }
  },

  /*15位转18位*/
  getId18: function(idCardNo){
    if(idCardNo.length==15){
      var id17 = idCardNo.substring(0,6) + '19' + idCardNo.substring(6)
      var parityBit = idCardNoUtil.getParityBit(id17)
      return id17 + parityBit
    }else if(idCardNo.length==18){
      return idCardNo
    }else{
      return null
    }
  },  
}

export const checkIdCardNo= idCardNoUtil.checkIdCardNo