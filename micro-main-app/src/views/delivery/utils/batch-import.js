import store from '@/store'
import defaultConfigUtil from './defaultConfigUtil'
import deliveryUtil from '@utils/deliveryUtil'
import * as commonUtil from '@utils/commonUtil'
import { watch } from '@vue/composition-api'
import { getUserDefaultTemplatePageSearch } from '@/services/api/setting'
import { remove } from 'lodash'
import fileUtil from '@utils/fileUtil'
import {cloneDeep} from 'lodash'
import REGULAR from '@/utils/regular'

class BatchImport {
  constructor() {
    this.requiredColumnTexts = ['收件公司', '收件地址', '收件人', '寄件公司', '寄件人', '服务方式', '付款方式']
    this.customColumn123={ '自定义字段1':'10','自定义字段2':'20','自定义字段3':'50'}

    //表格列字段信息
    this.tableColumns = [
      { prop: 'no', hide: true },
      // { prop: 'tips', text: '异常说明', width: '120', readOnly: true, color: '#f13e3e' },
      { prop: 'estimateFreight', text:'预估运费(元)' , width: '110',hide:true , defaultSlot:'column_estimateFreight'},
      { prop: 'coupon', text:'优惠券', width: '120', hide:true , defaultSlot:'column_coupon',headerSlot:'header_coupon'},
      { prop: 'superZoneTip', text: '超区选项', width: '140', defaultSlot:'column_superZoneTip'  },
      { prop: 'ydNo', text: '运单号', width: '150', readOnly: true, hide: true, defaultSlot:'column_ydNo' },
      { prop: 'vipshopCode', text: '入库号', width: '140', hide: true, maxlength: 21, titleHelp: { message: '请填写入库号', icon: 'el-icon-edit-outline' } },
      { prop: 'sjCompany', text: '收件公司', width: '150', maxlength: 32 ,allowSpace:true },
      { prop: 'sjContactPerson', text: '收件人', width: '100' },
      { prop: 'sjTelephone', text: '收件座机', width: '140',maxlength:21 },
      { prop: 'sjMobile', text: '收件手机', width: '140', maxlength: 11 },
      { prop: 'isSignSelf', text: '签收要求', width: '140', type: 'checkbox', label: '必须本人签收' },
      { prop: 'sjAddress', text: '收件地址', width: '300', maxlength: 140, htmlTip: true },
      { prop: 'jjCompany', text: '寄件公司', width: '300', maxlength: 32, allowSpace: true },
      { prop: 'jjContactPerson', text: '寄件人', width: '120' },
      { prop: 'sms', text: '寄件手机', width: '150', maxlength: 11 },
      { prop: 'jjTelePhone', text: '寄件座机', width: '150' ,maxlength:21},
      { prop: 'qhContactPerson', text: '取货联系人', width: '150' },
      { prop: 'qhContactWay', text: '取货人手机', width: '150', maxlength: 11 },
      { prop: 'qhTelePhone', text: '取货人电话', width: '150',maxlength:21 },
      { prop: 'qhAddress', text: '取货地址', width: '300', maxlength: 140,htmlTip:true },
      { prop: 'goods', text: '托寄物', width: '120' },
      { prop: 'count', text: '件数(件)', width: '90', maxlength: 4 },
      { prop: 'weight', text: '预估总重量(kg)', width: '210', maxlength: 9, defaultSlot: 'column_weight',hideDefaultWarning:true },
      { prop: 'cube', text: '体积(m³)', width: '100' ,maxlength:8, defaultSlot: 'column_cube' },
      { prop: 'sizeList', text: '尺寸', width: '210', defaultSlot:'column_sizeList' },
      { prop: 'payWay', text: '付款方式', width: '120',type:'select', options: store.state.common.payWayOptions },
      { prop: 'payAccount', text: '付款账号', width: '120', type:'autocomplete' },
      { prop: 'paymentCustomerName',text: '当前付款公司', width: '120',readOnly: true},
      { prop: 'paymentCustomerCode', hide: true},
      { prop: 'serviceWay', text: '服务方式', width: '140',  options: [] , defaultSlot:'column_serviceWay'},
      { prop: 'receiptFlag', text: '回单服务', width: '130',type:'select',  options:store.state.common.receiptOptions },
      { prop: 'hdCount', text: '回单份数', width: '100',maxlength:3 },
      { prop: 'declaredValue', text: '保价声明', width: '100' ,maxlength:6,defaultSlot:'column_declaredValue' ,headerSlot:'header_declaredValue'},
      { prop: 'dsMoney', text: '代收货款', width: '100' ,maxlength:9},
      {
        prop: 'mjWay',
        text: '包装服务',
        width: '150',
        type: 'select',
        options: store.state.common.wrapOptions,
        defaultSlot: 'column_mjWay',
        hideOverflow: true
      },
      { prop: 'checkedCustomsCharge', text: '报关入仓', width: '120',defaultSlot:'column_checkedCustomsCharge' }, //是否勾选报关入仓，'10'为勾选，'20'为不勾选，空为没命中报关入仓条件
      { prop: 'jjRemark', text: '运单备注', width: '150', maxlength: 160 },
      { prop: 'insuranceValueSource', hide: true }, //保费来源
      { prop: 'insuranceFeeType', hide: true }, //保费类型
      { prop: 'premium', hide: true }, //保费
      { prop: 'delayTime', hide: true }, //延迟取货时长（小时）
      { prop: 'volumetricWeightRatio', hide: true }, //抛重系数
      { prop: 'estimateArriveTime', hide: true }, //预计到达时间
      { prop: 'clientOrderWarehouseResponse', text: '报关入仓费用', hide: true }
    ]
    //默认列(除自定义列以外)
    this.defaultColumns = this.getAllDefaultColumns()
    //默认列字段名字
    this.defaultColumnTexts = this.getDefaultColumnTexts()
    //自定义列
    this.customColumns = []

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


  getDefaultColumnTexts(){
    const columns =this.defaultColumns.map(m=>m.text)
    columns.push('序号')
    columns.push('备用手机')
    return columns.filter(f=>f)
  }

  getAllDefaultColumns() {
    const compatibleFieldsDict = {
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

    const dict = this.tableColumns.map(f => ({ prop: f.prop, text: f.text }))
    Object.entries(compatibleFieldsDict).forEach(([text, prop]) => {
      dict.push({ prop, text })
    })
    for (let i = 1; i < 9; i++) {
      dict.push({ prop: 'size' + i, text: '超大件尺寸' + i })
      dict.push({ prop: 'size' + i, text: '尺寸' + i })
    }
    return dict
  }

  //处理尺寸字段
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
    row['sizeList'] = sizeList.slice(0, 100)
  }

  handleSenderPhone(row){
    if(!row.sjMobile && !row.sjTelephone){
      return
    }
    const phones = [row.sjMobile,row.sjTelephone].join(',').split(/,|，/)
      .map(f => f.replace(/[^\d- ]+/g, '')).filter(f => f)
    if(!REGULAR.mobilePhone.test(row.sjMobile)){
      row.sjMobile = ''
    }
    if(!REGULAR.landlinePhone3.test(row.sjTelephone)){
      row.sjTelephone = ''
    }
    phones.forEach(p => {
      if(!row.sjMobile && REGULAR.mobilePhone.test(p)){
        row.sjMobile = p
      }else if(!row.sjTelephone && REGULAR.landlinePhone3.test(p)){
        row.sjTelephone = p
      }
    })
    if(!row.sjTelephone){
      row.sjTelephone = phones.find(p => !REGULAR.mobilePhone.test(p))
    }
  }

  //处理excel表格行数据
  async handleExcelRowValue({ index, row }) {
    row.no = index
    const findItem = (key,text)=>text&&store.state.common[key].find(f=>f.label.includes(text))
    // 内容值转化
    row.payWay = findItem('payWayOptions',row.payWay)?.value
    row.receiptFlag =  findItem('receiptOptions',row.receiptFlag)?.value
    row.mjWay = findItem('wrapOptions',row.mjWay)?.value
    row.isSignSelf = store.getters.isSignBySelf && ['本人签收','是'].includes(row.isSignSelf)
    if(!row.qhTelePhone && !row.qhContactWay?.startsWith('1')){
      row.qhTelePhone = row.qhContactWay
      row.qhContactWay = ''
    }
    this.handleSizeList(row)

    const mobileFields = ['sms']
    mobileFields.forEach(field => {
      row[field] = (row[field] || '').replace(/[^\d]+/g, '')
    })
    this.handleSenderPhone(row)
    //
    if(!row.cube && row.sizeList?.length>0){
      const cube = deliveryUtil.convertToCube(row.sizeList)
      row.cube = cube>=10000 ? 9999.999 : cube.toFixed(3)
    }
    row.cube = Number(row.cube) || ''
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

  //处理modelList的默认值
  async convertModelListDefaulValue(modelList){
    const promises = modelList.map(async (row, index) => {
      await this.handleExcelRowValue({ index: index + 1, row})
    })
    await Promise.all(promises)
    await defaultConfigUtil.loadDataBatch(modelList)
    // return modelList//
  }

  /**
   * 取得当前用户的默认个性化模板
   * @param {Object} customerInfo 当前用户信息
   * @returns
   */
  async getCustomExcelModel(customerInfo) {
    const params = {
      companyNo: customerInfo.customCode,
      mobile: customerInfo.phone }
    return await getUserDefaultTemplatePageSearch(params)
  }


  convertExcelDataToJson({excelHeaderRow,excelBodyData}){
    // const jsonData = bodyData.map(()=>({}))
    // for(let colIndex = excelHeaderRow.length - 1; colIndex >= 0; colIndex--){
    //   const columnName = excelHeaderRow[colIndex]
    //   bodyData.forEach((row,rowIndex) => {
    //     const data = jsonData[rowIndex]
    //     data[columnName] = row[colIndex]
    //   })
    // }
    const jsonData = excelBodyData
      .map(row => {
        const data = {}
        for (let colIndex = excelHeaderRow.length - 1; colIndex >= 0; colIndex--) {
          const columnName = excelHeaderRow[colIndex]
          data[columnName] = row[colIndex]
        }
        return data
      })
    return jsonData
  }

  /**
   * 处理自定义模板
   * @param {*} param0
   * @returns 如果错误
   */
  async handleCustomExcelTemplate({ customExcelModel ,excelData}) {
    try {
      const headerIndex = customExcelModel.headerLine - 1
      const excelHeaderRow = excelData[headerIndex]
      const excelBodyData = excelData.slice(headerIndex + 1)
      if(excelBodyData.length > 1000){
        return {errorMsg:'一次最多只允许导入1000条，请修改Excel'}
      }
      const requiredColumnProps = ['sjAddress', 'sjPeople']
      const optionalColumnProps = ['sjMobile', 'sjTelPhone']
      const missingRequiredColumnProps = requiredColumnProps.filter(f=>!excelHeaderRow.includes(customExcelModel[f]))
      const missingOptionalColumnProps = optionalColumnProps.filter(f=>!excelHeaderRow.includes(customExcelModel[f]))
      let missingColumnTexts = []
      if(missingRequiredColumnProps.length>0 || missingOptionalColumnProps.length>1){
        missingColumnTexts = missingRequiredColumnProps
        if(missingOptionalColumnProps > 1){
          missingColumnTexts.push('sjMobile')
        }
        missingColumnTexts = missingColumnTexts.map(f => customExcelModel[f])
      }
      if(missingColumnTexts.length > 0){
        const text = missingColumnTexts.map(m=>`【${m}】`).join('、')
        return {
          missingColumnTexts,
          errorMsg:`标题名称（必填项）${text}缺失，请检查并导入正确模板。`
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

      const excelJsonData = this.convertExcelDataToJson({excelHeaderRow,excelBodyData})
      const modelList = excelJsonData.map(excelRow => {
        let row = this.getEmptyModel()
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
      await this.convertModelListDefaulValue(modelList)
      return {
        modelList,
        isCustomExcel: true
      }
    } catch (ex) {
      console.log('ex :>> ', ex)
    }
  }

  async getModelListByExcel({file,customerInfo}){
    const res = await fileUtil.getOriginalExcelData(file)
    if(res.code !== 0){
      res.errorMsg = res.msg
      return res
    }
    const excelData = res.data
    const params = {
      excelData : cloneDeep(excelData),
      requiredColumnTexts : this.requiredColumnTexts,
      defaultColumnTexts: this.defaultColumnTexts,
    }
    const verifyResult = this.verifyStandardExcelData(params)
    // console.log('verifyResult :>> ', verifyResult);
    if(verifyResult.errorMsg){
      return verifyResult
    }
    if(verifyResult.missingColumnTexts.length < 1){
      let modelList =  this.convertExcelDataToModelList(verifyResult)
      await this.convertModelListDefaulValue(modelList)
      verifyResult.modelList = modelList
      return verifyResult
    }

    const customExcelModel = await this.getCustomExcelModel(customerInfo)
    if (!customExcelModel) {
      return verifyResult
    }
    return this.handleCustomExcelTemplate({ customExcelModel ,excelData})

  }



  //通过excel列名取得对应字段名
  getFieldNameByExcelColumnName({excelHeaderRow,colIndex,excelCustomColumnIndexs,isCustomField123Template}){
    const headerColumnName = excelHeaderRow[colIndex]
    if(!headerColumnName){
      return ''
    }
    if((excelCustomColumnIndexs || []).includes(colIndex)){
      if(isCustomField123Template){
        const field = this.tableColumns.find(f => f.customFieldCode == this.customColumn123[headerColumnName] )
        if(field?.prop){
          return field?.prop
        }
      }
      const col = this.customColumns.find(c => c.text === headerColumnName)
      return col?.prop || headerColumnName
    }else{
      const col = this.defaultColumns.find(c => c.text === headerColumnName)
      return col?.prop || headerColumnName
    }
  }

  verifyStandardExcelData({excelData,requiredColumnTexts,defaultColumnTexts}){
    if (!excelData || excelData.length <= 2) {
      return {errorMsg: '导入的数据为空,请检查'}
    }
    let headerIndex = 0
    let excelHeaderRow = excelData[headerIndex]
    let excelCustomColumnIndexs = [] //excel自定义字段索引
    let excelCustomColumnTexts = [] //excel中自定义列
    let missingColumnTexts = [] //缺失的列
    let extraColumnTexts = [] //不支持的列
    if (['收方信息', '寄件信息', '运单基础信息'].every(d => excelHeaderRow.includes(d))) {
      headerIndex = 1
      excelHeaderRow.forEach((name, index) => {
        if ((name || '').trim() === '自定义字段') {
          const text = excelData[headerIndex][index] || ''
          if(!text || !text?.trim()){
            return
          }
          excelCustomColumnIndexs.push(index)
          excelCustomColumnTexts.push(text)
        }
      })
      excelHeaderRow = excelData[headerIndex]
      const excelHeaderColumnsExceptCustomColumn = excelHeaderRow.filter(
        (f, index) => !excelCustomColumnIndexs.includes(index)
      )
      missingColumnTexts = requiredColumnTexts.filter(
        c => !excelHeaderColumnsExceptCustomColumn.includes(c)
      )
      extraColumnTexts = excelCustomColumnTexts.filter(e => !store.getters.customFields.find(f => f.label === e))
    } else {
      missingColumnTexts = requiredColumnTexts.filter(c => !excelHeaderRow.includes(c))
      excelCustomColumnTexts = excelHeaderRow.filter(c => !defaultColumnTexts.includes(c))
      const arr = _(excelHeaderRow)
        .groupBy()
        .pickBy(x => x.length > 1)
        .keys()
        .value()
        .filter(f => f)
      excelCustomColumnTexts.push(...arr)
      excelCustomColumnIndexs = excelCustomColumnTexts.map(e => excelHeaderRow.lastIndexOf(e))
      const currentAllColumnTexts = [
        ...defaultColumnTexts,
        ...store.getters.customFields.map(m => m.label)
      ]
      extraColumnTexts = excelHeaderRow.filter(c => !currentAllColumnTexts.includes(c))
    }
    if(missingColumnTexts.length > 0){
      return { missingColumnTexts }
    }

    let excelBodyData = excelData.slice(headerIndex + 1)
    if((excelBodyData[excelBodyData.length-1][0] || '').startsWith('温馨提示')){
      excelBodyData.splice(excelBodyData.length-1)
    }

    const result = {
      missingColumnTexts,
      extraColumnTexts,
      excelCustomColumnTexts,
      excelCustomColumnIndexs,
      headerIndex,
      excelHeaderRow,
    }

    const snIndex = excelHeaderRow.indexOf('序号')
    excelBodyData = excelBodyData
      .filter(row => {
        if (snIndex < 0) {
          return true
        }
        const cellValue = row[snIndex] || ''
        if (cellValue && !cellValue.startsWith('温馨提示')) {
          return true
        }
      })
    result.excelBodyData = excelBodyData
    if(excelBodyData.length < 1){
      return {errorMsg:'导入的数据为空,请检查'}
    }
    if(excelBodyData.length > 1000){
      return {errorMsg:'一次最多只允许导入1000条，请修改Excel'}
    }
    return result
  }

  convertExcelDataToModelList({excelHeaderRow,excelBodyData,excelCustomColumnIndexs,excelCustomColumnTexts}){
    let isCustomField123Template = store.getters.customFields?.map(c=>c.code).sort().join() === '10,20,50'
    isCustomField123Template = Object.keys(this.customColumn123).every(f=>excelCustomColumnTexts.includes(f))
    const model = this.getEmptyModel()
    const jsonData = excelBodyData.map(()=>({...model}))
    for(let colIndex = excelHeaderRow.length - 1; colIndex >= 0; colIndex--){
      const params = {excelHeaderRow,colIndex,excelCustomColumnIndexs,isCustomField123Template}
      const columnName = this.getFieldNameByExcelColumnName(params)
      excelBodyData.forEach((row,rowIndex) => {
        const data = jsonData[rowIndex]
        let value = row[colIndex] || ''
        if(value && ['number','string'].includes(typeof value)){
          value = (value + '').replace(/\s+/g, '')
        }
        data[columnName] = value
      })
    }
    // const jsonData = excelBodyData
    //   .map(row => {
    //     const data = {}
    //     for (let colIndex = excelHeaderRow.length - 1; colIndex >= 0; colIndex--) {
    //       const columnName = excelHeaderRow[colIndex]
    //       data[columnName] = row[colIndex]
    //     }
    //     return data
    //   })
    return jsonData
  }
}

export default new BatchImport()
