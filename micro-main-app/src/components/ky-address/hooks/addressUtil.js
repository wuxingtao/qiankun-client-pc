/**
 * @Desc: specialAddress
 * @Author: wu xingtao
 * @Date: 2021/11/1
 */

const sepecialDistrict = [
  '东莞市',
  '中山市',
  '三沙市',
  '儋州市',
  '嘉峪关市',
  '潜江市',
  '仙桃市',
  '神农架林区',
  '天门市'
]

// 特殊地址去重格式化
function specialAddressFormat(address,title){
  let result = address
  for(let i=0;i<sepecialDistrict.length;i++){
    console.log(sepecialDistrict[i])
    if(address.indexOf(sepecialDistrict[i]) > -1){
      const splitArr = address.split(sepecialDistrict[i])
      if(splitArr.length === 3){
        result = splitArr[0] + sepecialDistrict[i] + splitArr[2]
      }else if(splitArr.length > 3){
        const firstSplit = address.indexOf(splitArr[2])
        result = address.slice(firstSplit)
      }

      if(address.endsWith('市')){
        result = ''
      }

      break;
    }
  }
  return result + title
}

const addressUtil = {
  specialAddressFormat
}

export default addressUtil
