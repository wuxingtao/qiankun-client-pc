import store from '@/store'
import { readExcel } from '@utils/clientUtil'
import defaultConfigUtil from './defaultConfigUtil'
import deliveryUtil from '@utils/deliveryUtil'
import * as commonUtil from '@utils/commonUtil'
import { watch } from '@vue/composition-api'
import { getUserDefaultTemplatePageSearch } from '@/services/api/setting'
import { remove } from 'lodash'
import batchImport from './batch-import'
class BatchImport {
  constructor() {
    this.requiredColumns = ['收件公司', '收件地址', '收件人', '寄件公司', '寄件人', '服务方式', '付款方式']
    //表格列字段信息
    this.tableColumns = [...batchImport.tableColumns]
    // this.tableColumns = [
    //   { prop: 'no', hide: true },
    //   // { prop: 'tips', text: '异常说明', width: '120', readOnly: true, color: '#f13e3e' },
    //   { prop: 'estimateFreight', text:'预估运费(元)' , width: '110',hide:true , defaultSlot:'column_estimateFreight'},
    //   { prop: 'coupon', text:'优惠券', width: '120', hide:true , defaultSlot:'column_coupon',headerSlot:'header_coupon'},
    //   { prop: 'superZoneTip', text: '超区选项', width: '140', defaultSlot:'column_superZoneTip'  },
    //   { prop: 'ydNo', text: '运单号', width: '150', readOnly: true, hide: true, defaultSlot:'column_ydNo' },
    //   { prop: 'vipshopCode', text: '入库号', width: '140', hide: true, maxlength: 21, titleHelp: { message: '请填写入库号', icon: 'el-icon-edit-outline' } },
    //   { prop: 'sjCompany', text: '收件公司', width: '150', maxlength: 32 ,allowSpace:true },
    //   { prop: 'sjContactPerson', text: '收件人', width: '100' },
    //   { prop: 'sjTelephone', text: '收件座机', width: '140',maxlength:21 },
    //   { prop: 'sjMobile', text: '收件手机', width: '140', maxlength: 11 },
    //   { prop: 'isSignSelf', text: '签收要求', width: '140', type: 'checkbox', label: '必须本人签收' },
    //   { prop: 'sjAddress', text: '收件地址', width: '300', maxlength: 140, htmlTip: true },
    //   { prop: 'jjCompany', text: '寄件公司', width: '300', maxlength: 32, allowSpace: true },
    //   { prop: 'jjContactPerson', text: '寄件人', width: '120' },
    //   { prop: 'sms', text: '寄件手机', width: '150', maxlength: 11 },
    //   { prop: 'jjTelePhone', text: '寄件座机', width: '150' ,maxlength:21},
    //   { prop: 'qhContactPerson', text: '取货联系人', width: '150' },
    //   { prop: 'qhContactWay', text: '取货人手机', width: '150', maxlength: 11 },
    //   { prop: 'qhTelePhone', text: '取货人电话', width: '150',maxlength:21 },
    //   { prop: 'qhAddress', text: '取货地址', width: '300', maxlength: 140,htmlTip:true },
    //   { prop: 'goods', text: '托寄物', width: '120' },
    //   { prop: 'count', text: '件数(件)', width: '90', maxlength: 4 },
    //   { prop: 'weight', text: '预估总重量(kg)', width: '210', maxlength: 9, defaultSlot: 'column_weight',hideDefaultWarning:true },
    //   { prop: 'cube', text: '体积(m³)', width: '100' ,maxlength:8 },
    //   { prop: 'sizeList', text: '尺寸', width: '210', defaultSlot:'column_sizeList' },
    //   { prop: 'payWay', text: '付款方式', width: '120',type:'select', options: store.state.common.payWayOptions },
    //   { prop: 'payAccount', text: '付款账号', width: '120', type:'autocomplete' },
    //   { prop: 'paymentCustomerName',text: '当前付款公司', width: '120',readOnly: true},
    //   { prop: 'paymentCustomerCode', hide: true},
    //   { prop: 'serviceWay', text: '服务方式', width: '140',  options: [] , defaultSlot:'column_serviceWay'},
    //   { prop: 'receiptFlag', text: '回单服务', width: '130',type:'select',  options:store.state.common.receiptOptions },
    //   { prop: 'hdCount', text: '回单份数', width: '100',maxlength:3 },
    //   { prop: 'declaredValue', text: '保价声明', width: '100' ,maxlength:6,defaultSlot:'column_declaredValue' ,headerSlot:'header_declaredValue'},
    //   { prop: 'dsMoney', text: '代收货款', width: '100' ,maxlength:9},
    //   {
    //     prop: 'mjWay',
    //     text: '包装服务',
    //     width: '150',
    //     type: 'select',
    //     options: store.state.common.wrapOptions,
    //     defaultSlot: 'column_mjWay',
    //     hideOverflow: true
    //   },
    //   { prop: 'jjRemark', text: '运单备注', width: '150', maxlength: 160 },
    //   { prop: 'insuranceValueSource', hide: true }, //保费来源
    //   { prop: 'insuranceFeeType', hide: true }, //保费类型
    //   { prop: 'premium', hide: true }, //保费
    // ]
    this.compatibleFieldsDict = {
      特殊包装: 'mjWay',
      收件人名: 'sjContactPerson',
      收件联系方式: 'sjMobile',
      寄件手机: 'sms',
      寄件人名: 'jjContactPerson',
      声明价值: 'declaredValue',
      寄件地址: 'qhAddress',
      寄件联系方式: 'sms',
      产品编码: 'customRemark',
      入库号: 'vipshopCode',
      拖寄物: 'goods',
      件数: 'count',
      '重量(kg)':'weight',
      取货人姓名: 'qhContactPerson',
      取货联系方式: 'qhContactWay',
      取货人手机: 'qhContactWay',
      备注: 'jjRemark',
      寄件备注: 'jjRemark',
    }
    this.excelDefaultFields = this.getExcelDefaultFields()

    watch(() => store.getters.customFields, fields => {
      remove(this.tableColumns,c=>c.prop.startsWith('customColumnValue_'))
      this.customColumns = fields.map((item, index) => ({
        customFieldCode:item.code,
        prop: item.prop,
        text: item.label,
        width: '150',
        maxlength:item.maxlength,
        required: item.required
      }))
      this.tableColumns = [...this.tableColumns, ...this.customColumns]
    }, {
      immediate: true
    })
  }

  getExcelDefaultFields(){
    const columns = this.tableColumns.map(m=>m.text)
    columns.push(...Object.keys(this.compatibleFieldsDict))
    columns.push('序号')
    columns.push('备用手机')
    Array.from({length:8}).forEach((f,i)=>{
      columns.push(`尺寸${i + 1}`)
    })
    return columns
  }

  getCopyOfTableColumns() {
    const columns = this.tableColumns.map(a => Object.assign({}, a))
    columns.find(f=>f.prop === 'payWay').options =store.state.common.payWayOptions
    if(store.state.supplier.existSupplierInfo){
      columns.find(f=>f.prop === 'goods').defaultSlot = 'column_goods'
    }
    return columns
  }

  getEmptyModel() {
    const model = {}
    this.tableColumns.forEach(item => {
      model[item.prop] = ''
    })
    return model
  }

  getFieldMapDict() {
    const dict = this.tableColumns.map(f => ({ prop: f.prop, text: f.text }))
    Object.entries(this.compatibleFieldsDict).forEach(([text, prop]) => {
      dict.push({ prop, text })
    })
    for (let i = 1; i < 9; i++) {
      dict.push({ prop: 'size' + i, text: '超大件尺寸' + i })
      dict.push({ prop: 'size' + i, text: '尺寸' + i })
    }
    return dict
  }

  handleSizeList(row) {
    const stringList = []
    for (let i = 1; i < 9; i++) {
      row['size' + i] && stringList.push(...row['size' + i].split(/[,，]/))
      delete row['size' + i]
    }
    if(typeof row.sizeList === 'string'){
      stringList.push(...row.sizeList.split(/[,，]/))
    }
    let sizeList = stringList
      .filter(s => s)
      .map(s => {
        const arr = s.split('*')
        let obj = {
          length: arr[0] || '',
          width: arr[1] || '',
          height: arr[2] || '',
          count: arr[3] || '',
        }
        return obj
      })
    // if(sizeList.length < 1 && typeof row.sizeList === 'string'){
    //   sizeList = commonUtil.parseJson(row.sizeList) || []
    //   sizeList = sizeList.filter(f=>f.length&&f.width&&f.height).map(f=>({
    //     length:f.length,
    //     width:f.width,
    //     height:f.height,
    //     count:f.count || ''
    //   }))
    // }
    row['sizeList'] = sizeList.slice(0, 100)
    // .filter(f=>!commonUtil.checkSizeItem(f))
  }

  //处理excel表格行数据
  async handleExcelRowValue({ index, row,isNeedConvertValue }) {
    row.no = index
    const findItem = (key,text)=>text&&store.state.common[key].find(f=>f.label.includes(text))
    if(isNeedConvertValue){
      row.payWay = findItem('payWayOptions',row.payWay)?.value
      row.receiptFlag =  findItem('receiptOptions',row.receiptFlag)?.value
      row.mjWay = findItem('wrapOptions',row.mjWay)?.value
      row.isSignSelf = store.getters.isSignBySelf && ['本人签收','是'].includes(row.isSignSelf)
      if(!row.qhTelePhone && !row.qhContactWay?.startsWith('1')){
        row.qhTelePhone = row.qhContactWay
        row.qhContactWay = ''
      }
      this.handleSizeList(row)
    }
    if(!row.cube && row.sizeList?.length>0){
      const cube = deliveryUtil.convertToCube(row.sizeList)
      row.cube = cube>=10000 ? 9999.999 : cube.toFixed(3)
    }
    if(row.payWay !== '30'){
      row.payAccount = ''
    }
    row.vipshopCode = commonUtil.trim(row.vipshopCode)

    const floatFields = ['weight', 'dsMoney']
    floatFields.forEach(field=>{
      const value = parseFloat(row[field]) || 0
      row[field] = value > 0 ? value.toFixed(2) : ''
    })

    const numberFields = ['hdCount', 'count', 'declaredValue']
    numberFields.forEach(field => {
      const value = parseInt(row[field])
      row[field] = value > 0 ? (value + '') : ''
    })
  }

  //excel列名及excel原始数据处理
  async convertExcelColumnNameAndData({ isExcelDatas = true,isNeedConvertValue, excelDatas, notLoadDefaultConfig }) {
    const isCustomField123Template = isExcelDatas && this.checkCustomField123Template({excelDatas})
    const promises = excelDatas.map(async (d, index) => {
      let row = {}

      this.getFieldMapDict().forEach(item => {
        row[item.prop] = row[item.prop] || d[isExcelDatas ? item.text : item.prop] || ''
        if(['number','string'].includes(typeof row[item.prop])){
          row[item.prop] = row[item.prop] ? (row[item.prop] + '').replace(/\s+/g, '') : ''
        }
        if(['sjMobile','sms'].includes(item.prop) ){
          row[item.prop] = row[item.prop].replace(/[^\d]+/g, '')
        }
      })

      if(isExcelDatas && isCustomField123Template){
        this.handleCustomField123({d,row})
      }

      await this.handleExcelRowValue({ index: index+1, row, isNeedConvertValue:isNeedConvertValue || isExcelDatas })
      return row
    })
    const modelList = await Promise.all(promises)
    if (!notLoadDefaultConfig) {
      await defaultConfigUtil.loadDataBatch(modelList)
    }
    return modelList
  }

  checkCustomField123Template({excelDatas}){
    const flag = store.getters.customFields?.map(c=>c.code).sort().join()==='10,20,50'
    const excelHeaderColumns = Object.keys(excelDatas[0])
    if(['自定义字段1','自定义字段2','自定义字段3'].every(f=>excelHeaderColumns.includes(f))){
      return flag
    }
  }

  handleCustomField123({d,row}){
    const customFields123 = ['50','20','10'].map(m=>{
      const col = this.tableColumns.find(f=>f.customFieldCode === m)
      if(col){
        return col
      }else{
        return {prop:`customColumnValue_hide_${m}`}
      }
    })
    if(customFields123.length>0){
      customFields123.forEach((col,cIndex)=>{
        const colText = `自定义字段${cIndex+1}`
        if(d[colText]){
          row[col.prop] = d[colText]
        }
      })
    }
  }

  //检查数据是否符合要求
  verifyExcelData(excelDatas) {
    try {
      if (!excelDatas || excelDatas.length < 1) {
        return {msg:'导入的数据为空,请检查'}
      }
      // const lastRow = excelDatas[excelDatas.length - 1]
      // if (lastRow['序号'] && (lastRow['序号']).toString().startsWith('温馨提示')) {
      //   excelDatas.splice(excelDatas.length - 1, 1)
      // }
      // excelDatas = excelDatas.filter(d=> !d.hasOwnProperty('序号') ||( d['序号']&&!d['序号'].toString().startsWith('温馨提示')))
      for (let i = excelDatas.length - 1; i >= 0; i--) {
        const row = excelDatas[i]
        if (row.hasOwnProperty('序号') && (!row['序号'] || row['序号'].toString().startsWith('温馨提示'))) {
          excelDatas.splice(i, 1)
        }
      }
      if (excelDatas.length < 1) {
        return {msg:'导入的数据为空,请检查'}
      }
      const excelHeaderColumns = Object.keys(excelDatas[0])
      const missingColumns = this.requiredColumns.filter(c => !excelHeaderColumns.includes(c))
      const currentAllColumns = [...this.excelDefaultFields]
      currentAllColumns.push(... store.getters.customFields.map(m => m.label))
      const excelCustomColumns = excelHeaderColumns.filter(c=> !this.excelDefaultFields.includes(c))
      const extraColumns = excelHeaderColumns.filter(c=> !currentAllColumns.includes(c))
      if (missingColumns.length > 0) {
        return {
          missingColumns,
          extraColumns,
          excelCustomColumns,
          msg:'导入Excel格式不正确,请使用正确的模板'
        }
      }
      if(excelDatas?.length > 1000){
        return {msg:'一次最多只允许导入1000条，请修改Excel'}
      }
      return{
        excelCustomColumns,
        extraColumns
      }
    } catch (ex) {
      console.log('ex :>> ', ex)
      return {msg:'数据校验出错'}
    }
  }

  async getCustomExcelModel(customerInfo) {
    const params = { companyNo: customerInfo.customCode, mobile: customerInfo.phone }
    return await getUserDefaultTemplatePageSearch(params)
  }

  //处理自定义模板
  async handleCustomExcelTemplate({ customerInfo, file }) {
    try {
      const errorMsg = '导入Excel格式不正确,请使用正确的模板'
      const customExcelModel = await this.getCustomExcelModel(customerInfo)
      if (!customExcelModel) {
        return { errorMsg ,noneCustomExcel:true}
      }
      const headerIndex = customExcelModel.headerLine - 1
      let { jsonData: excelDatas, msg } = await readExcel(file, headerIndex,1001)
      if (msg) {
        return { errorMsg: msg }
      }
      const excelHeaderColumns = Object.keys(excelDatas[0])
      const requiredColumns = ['sjAddress', 'sjPeople']
      const optionalColumns = ['sjMobile', 'sjTelPhone']
      const missingRequiredColumns = requiredColumns.filter(f=>!excelHeaderColumns.includes(customExcelModel[f]))
      const missingOptionalColumns = optionalColumns.filter(f=>!excelHeaderColumns.includes(customExcelModel[f]))
      let missingColumns = []
      if(missingRequiredColumns.length>0 || missingOptionalColumns.length>1){
        missingColumns = missingRequiredColumns
        if(missingOptionalColumns > 1){
          missingColumns.push('sjMobile')
        }
        missingColumns = missingColumns.map(f => customExcelModel[f])
      }
      if(missingColumns.length > 0){
        const missingColumnsText = missingColumns.map(m=>`【${m}】`).join('、')
        return {
          missingColumns,
          errorMsg:`标题名称（必填项）${missingColumnsText}缺失，请检查并导入正确模板。`
        }
      }
      const map = {
        sjCompany: 'sjCompanyNa',
        sjAddress: 'sjAddress',
        sjContactPerson: 'sjPeople',
        sjTelephone: 'sjTelPhone',
        sjMobile: 'sjMobile',
        jjCompany: 'jjCompanyNa',
        qhAddress: 'jjAddress',
        jjContactPerson: 'jjPeople',
        jjTelePhone: 'jjTelPhone',
        sms: 'jjMobile',
        serviceWay: 'serverModel',
        payWay: 'payType',
        payAccount: 'payCardNo',
        dsMoney: 'dSHKAmount',
        declaredValue: 'saveValue',
        receiptFlag: 'isHD',
        goods: 'article',
        count: 'number',
        weight: 'hwWeight',
        jjRemark: 'jjNote',
      }
      const tempModelDatas = excelDatas.map(excelRow => {
        let row = {}
        Object.entries(map).forEach(([key, value]) => {
          row[key] = excelRow[customExcelModel[value]] || ''
        })
        store.getters.customFields?.forEach(m=>{
          if(excelRow[m.label]){
            row[m.prop] = excelRow[m.label]
          }
        })
        return row
      })
      const params = { isExcelDatas: false, excelDatas: tempModelDatas,isNeedConvertValue:true }
      const modelList = await this.convertExcelColumnNameAndData(params)
      return { modelList }
    } catch (ex) {
      console.log('ex :>> ', ex)
    }
  }

  /**
   * 将excel转化为modelList
   * @returns {errorMsg:'',missingColumns:[],extraColumns:[],modelList}
   */
  async convertExcelDataToModelList({ customerInfo, file, headerIndex = 1 ,firstVerifyResult}) {
    let { jsonData: excelDatas, msg,code ,fileCenterParams } = await readExcel(file, headerIndex,1001)
    const verifyResult = this.verifyExcelData(excelDatas) || {}
    verifyResult.fileCenterParams = fileCenterParams
    let errorMsg = msg || verifyResult.msg
    if (errorMsg && headerIndex === 1) {
      //兼容标题在第一行的excel模板
      const params = { customerInfo, file, headerIndex: 0 ,firstVerifyResult:verifyResult}
      const result = await this.convertExcelDataToModelList(params)
      return result
    }
    if([3003,3004].includes(code)){
      return {errorMsg}
    }
    const getVerifyResult = ()=>{
      if(firstVerifyResult.missingColumns?.length < verifyResult.missingColumns?.length){
        return firstVerifyResult
      }
      return verifyResult
    }
    if (errorMsg && headerIndex === 0) {
      //兼容自定义模板
      const params = { customerInfo, file }
      var customExcelResult = await this.handleCustomExcelTemplate(params)
      if(customExcelResult.noneCustomExcel){
        return getVerifyResult()
      }
      return customExcelResult
    }
    if (errorMsg) {
      Object.assign(verifyResult, { errorMsg })
      return getVerifyResult()
    }
    const params = { excelDatas }
    const modelList = await this.convertExcelColumnNameAndData(params)
    return Object.assign(verifyResult, { modelList })
  }
}

export default new BatchImport()
