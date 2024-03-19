import native from '@utils/native'
import { parseJson } from "@utils/commonUtil"
import { GetPrinters} from "@api/setting"
import { getCustomerCode , getPrintAppData} from "@utils/storage"
import printerWebsocket from '@utils/printerWebsocket'

class PrinterUtil{
  /**
   * 获取云打印机
   * @returns 
   */
  async getCloudPrinters(){
    try{
      let res = await GetPrinters({ companyNo: getCustomerCode() }, true)
      if (res.code === 0 && res.data) {
        const printers = res.data.dataList
        printers.forEach(p=>Object.assign(p,{isCloudPrinter:true}))
        return printers
      }
    }catch(ex){
      console.log('getCloudPrinters :>> ', ex)
    }
  }
  /**
   * 获取打印组件
   * @returns 
   */
  async getPrintApps(){
    const appData = getPrintAppData()
    if(appData&&appData.length>0){ 
      return appData.map(m=>({printerName:m.appId,local:true,isPrintApp:true,printerStatus:false}))
      // try{
      //   const { isOnline } =  await printerWebsocket.checkPrintAppOnline(appData.appId)
      //   return [{printerName:appData.appId,local:true,isPrintApp:true,printerStatus:isOnline}]
      // }catch{
      //   return [{printerName:appData.appId,local:true,isPrintApp:true,printerStatus:false}]
      // }
    }
    return []
  }

  /**
   * 获取本地打印机
   * @returns 
   */
  async getLocalPrinters(){
    if(await native.isClientMode()){
      return parseJson(await native.getPrinterList()) || []
    }    
  }

}

export default new PrinterUtil()