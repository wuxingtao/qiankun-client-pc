import cityGeoCoord from './geometryCities'
class ChinaGeoUtil{
  constructor(){
    this.geoCoordMap=cityGeoCoord
  }
  /**
  * 格式化数据
 * @param {Array} data 数组对象包括地址名称及值，如：[ {name:'北京市',value:199}]
 * @returns 
 */
  formatData(data) {
    var res = []
    for (var i = 0; i < data.length; i++) {
      var geoCoord = this.geoCoordMap[data[i].name]
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value)
        })
      }
    } 
    // console.log('res :>> ', res)
    return res
  } 
} 
export default new ChinaGeoUtil()