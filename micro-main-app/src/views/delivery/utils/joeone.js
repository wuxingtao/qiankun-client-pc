import { groupBy, trim } from '@/utils/commonUtil'
import { queryAddressByCode } from '@/services/api/shipmentBatch'
import { readExcel } from '@utils/clientUtil'
import batchImport from './batch-import'
class Joeone {
  constructor() {
    this.customeNo = '059596618008'
  }

  verifyExcelData(excelDatas) {
    if (!excelDatas || excelDatas.length < 1) {
      return '导入的数据为空,请检查'
    }
    const columnNames = '客户,装箱单单号,客户代码,总重量,箱总数'.split(',')
    if (columnNames.some((c) => !excelDatas[0].hasOwnProperty(c))) {
      return '导入模板不正确'
    }
  }

  async handleExcelData(excelDatas) {
    let list = []
    excelDatas.forEach((el) => {
      if (list.findIndex((i) => i['客户'] == el['客户'] && i['装箱单单号'] == el['装箱单单号']) < 0) {
        list.push({
          sjCompany: trim(el['客户']),
          customerCode: trim(el['客户代码']),
          weight: isNaN(parseFloat(trim(el['总重量']))) ? 0 : parseFloat(trim(el['总重量'])),
          count: Number(trim(el['箱总数'])),
        })
      }
    })
    let groups = groupBy(list, (item) => item.sjCompany)
    let items = []
    for (let g in groups) {
      items.push({
        sjCompany: g,
        customerCode: groups[g][0].customerCode,
        weight: groups[g].reduce((total, cur) => total + cur.weight, 0),
        count: groups[g].reduce((total, cur) => total + cur.count, 0),
      })
    }
    let res = await queryAddressByCode({ CustomerCodes: items.map((i) => i.customerCode) })
    if (res.data && res.data.dataList) {
      let addresses = res.data.dataList
      items.forEach((el) => {
        let addr = addresses.find((a) => a.customerCode == el.customerCode)
        if (addr) {
          el.sjAddress = addr.address || ''
          el.sjContactPerson = addr.contacts || ''
          el.sjMobile = trim(`${addr.mobile},${addr.phone}`, ',') || ''
        }
      })
    }
    return items
  }

  initModelList(excelDataList) {
    let list = []
    for (let i = 0; i < excelDataList.length; i++) {
      let item = excelDataList[i]
      let model = {
        no: i,
        // jjContactPerson: this.userData.userName,
        // jjCompany: this.userData.customerShortName|| this.userData.customerName,
        // jjAddress: (this.userData.address+'').replace(/null/g,''),
        // sms: this.userData.phone,
        sjContactPerson: item.sjContactPerson,
        sjCompany: item.sjCompany,
        sjAddress: item.sjAddress,
        sjMobile: item.sjMobile,
        count: item.count,
        weight: item.weight,
        serviceWay: '隔日达',
        payWay: '寄方付',
        goods: '服装',
      }
      const tempModel = batchImport.getEmptyModel()
      Object.assign(tempModel, model)
      list.push(tempModel)
    }
    return list
  }

  async convertExcelDataToModelList(file) {
    let { jsonData: excelDatas, msg } = await readExcel(file, 0)
    const errorMsg = msg || this.verifyExcelData(excelDatas)
    if (errorMsg) {
      return { errorMsg }
    }
    const excelDataList = await this.handleExcelData(excelDatas)
    const modelList = this.initModelList(excelDataList)
    return { modelList }
  }
}

export default new Joeone()
