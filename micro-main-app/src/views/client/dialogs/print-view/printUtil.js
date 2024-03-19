import store from '@/store'
import { splitArrayToGroup } from '@/utils/commonUtil'

class PrintUtil{
  async addPrintFlag(waybills){
    if(store.getters.authorityIds.includes('121')){
      await this.addPrintCompanyGoodsFlag(waybills)
    }else  if(store.getters.authorityIds.includes('122')){
      await  this.addPrintCompanyFlag(waybills)
    }
  }

  async addPrintCompanyGoodsFlag(waybills){
    let flags =  store.state.print.companyGoodsFlags
    if(!flags || flags.length<1){
      await store.dispatch('print/setCompanyGoodsFlagsAction')
    }
    flags =  store.state.print.companyGoodsFlags
    if(!flags || flags.length<1){
      return
    }
    waybills.forEach(w=>{
      const item= flags.find(f=>f.companyName === w.sjCompany)
      if(item && Number(w.count)>0 && item.commodityCode){
        const codeArr = item.commodityCode.split(/[,，]/)
        const codeString = new Array(Number(w.count)).fill().map((m,index)=>`'${codeArr[index] || ''}'`).join(',')
        w.jjRemark += codeString
      }
    })
  }

  async addPrintCompanyFlag(waybills){
    let flags =  store.state.print.companyFlags
    if(!flags || flags.length<1){
      await store.dispatch('print/setCompanyFlagsAction')
    }
    flags =  store.state.print.companyFlags
    if(!flags || flags.length<1){
      return
    }
    waybills.forEach(w=>{
      const item= flags.find(f=>f.sendCustomerName === w.jjCompany && f.receiverCustomerName === w.sjCompany)
      if(item){
        w.waterMark =`${w.waterMark || ''} 生产部`
      } 
    })
  }
  addPrintCompanyFlagByWaybill(waybills,localPrintDataList){
    if(!store.getters.authorityIds.includes('122')){
      return
    }
    localPrintDataList.forEach(p=>{
      p.data&&p.data.forEach(d=>{
        const model = waybills.find(w=>w.ydNo === d.ydCode)
        if(model&&model.waterMark){
          d.waterMark = model.waterMark
        }
      })     
    })
  }

  //转换为A4模板
  convertLocalPrintDataListForA4Stub(localPrintDataList){
    const dataList = localPrintDataList.map(d=>JSON.parse(d.templateData))
    const count = 4
    const dataListGroup = splitArrayToGroup(dataList,count,false)
    const resultDataList = dataListGroup.map(g=>{
      const data = g.reduce((model,cur,index)=>{
        if(index === 0 ){
          return {...cur}
        }
        Object.keys(cur).forEach(k=>{
          model[`${k}_${index}`] = cur[k]
        })
        return model
      },{})
      return {data,count:g.length}
    })

    let resultPrintDataList =  resultDataList.map(d=>({
      templateText:this.getA4TemplateText(localPrintDataList[0].templateText,d.count),
      templateData:JSON.stringify(d.data),
      templateType:'A4Stub'
    }))
    return resultPrintDataList
  }
  getA4TemplateText(templateText,count=0){
    templateText = templateText.replace(/\${/g,'~{')
    templateText = templateText.replace(/\/\/.*?\n/g,'') //去除模板中注释内容
    const directive = JSON.parse(templateText)
    let templateTextArray =  directive.directives
    const newTemplateTextArray = [...JSON.parse(JSON.stringify(templateTextArray))]
    templateTextArray.forEach(line=>{
      const coordinateDataArray = directive.positions
      for(let i =1 ; i < count ;i++){
        let tempLine = JSON.parse(JSON.stringify(line))
        this.handleFieldsInLine(tempLine,i)
        const coordinate =coordinateDataArray[i-1]
        tempLine.x += coordinate.x
        tempLine.y += coordinate.y
        newTemplateTextArray.push(tempLine)
      }    
    })

    templateText = JSON.stringify(newTemplateTextArray).replace(/~{/g,'${')
    return templateText
  }
  handleFieldsInLine(line,index){
    if(!line.field || !line.field.includes('{')){
      return
    }
    const regex = new RegExp(`~{(.*?)}`,'g')
    let result
    while (( result = regex.exec(line.field)))  {
      line.field = line.field.replace(new RegExp(result[0],'g'),`~{${result[1]}_${index}}`)
    }
  }
}

export default new PrintUtil()