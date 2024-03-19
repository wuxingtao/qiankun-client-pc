import { groupBy,trim } from '@/utils/commonUtil'
import {readExcel} from '@utils/clientUtil'
import batchImport from './batch-import'

class Anta{
  async handANTAData(file){
    let  { jsonData: excelDatas ,msg  }=await readExcel(file, 0)
    if (msg || !excelDatas || excelDatas.length<1) {
      return msg || '导入的数据为空,请检查'
    }
    //这里如果想要按照name进行分组即如下：
    const groups = groupBy(excelDatas, item=>item.上游单号)
    let items=[] 
    for(let g in groups){
      const model={
        jjRemark:g,
        volume:groups[g].reduce((total,cur)=>total+cur.体积,0),
        weight:groups[g].reduce((total,cur)=>total+cur.重量,0),
        sjMobile:groups[g][0].电话+'', 
        sjContactPerson:groups[g][0].联系人,
        sjAddress:groups[g][0].地址, 
        cargoOWner:groups[g][0].货主,
        customColumnValue_01:groups[g].map(r=>r.箱号).join(',')
      }
      const tempModel=batchImport.getEmptyModel()
      Object.assign(tempModel,model)  
      items.push(tempModel)
    } 
    console.log(items)
    const promises = items.map(async (row,index)=>{
      await batchImport.handleExcelRowValue({index,row})
      return row
    })
    const modelList=await Promise.all(promises)
    return {modelList}
  }
}

export  default new Anta()