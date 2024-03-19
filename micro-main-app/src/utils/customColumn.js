class CustomColumn {
  /**
   * 取得单票表单校验规则
   * @param {Object} originalCustomColumns //[{"customerField":"箱号","kyField":"90","enabledFlag":1,"orderMustStatus":0}]
   * @param {String} originalCustomColumns.customerField 字段中文名
   * @param {String} originalCustomColumns.kyField 字段编号
   * @param {Number} originalCustomColumns.orderMustStatus 是否必填，1：必填
   */
  getFormRules(originalCustomColumns) {
    const result = (originalCustomColumns || []).reduce((rules, item, index) => {
      if (item.orderMustStatus === 1) {
        rules[`customColumnValue_${index}_${item.kyField}`] = [
          {
            required: true,
            trigger: 'blur',
            message: `请填写${item.customerField}`,
            msg: `请填写${item.customerField}`
          }
          // { max: item.maxlength, message: `${item.customerField}不能超过${item.maxlength}`, trigger: 'change' },
        ]
      }
      return rules
    }, {})
    return result
  }

  //取得表单字段信息
  getFormFields(originalCustomColumns) {
    const result = (originalCustomColumns || []).map((item, index) => {
      const obj = {
        label: item.customerField,
        code: item.kyField,
        prop: `customColumnValue_${index}_${item.kyField}`,
        required: item.orderMustStatus === 1,
        maxlength: item.kyField === '90' && ['10', '20'].includes(item.unboxingType) ? -1 : 128
      }
      return obj
    }).sort((a,b)=>a.code - b.code)
    return result
  }

  /**
   * 取得修改运单返回的字段与ka配置字段的并集
   * @param {Object} originalCustomColumns 
   * @param {Object} modifyCustomColumns 
   */
  getModifyUnionCustomColums(originalCustomColumns,modifyCustomColumns){
    originalCustomColumns = originalCustomColumns || []
    if(!modifyCustomColumns || modifyCustomColumns.length <1){
      return originalCustomColumns
    }
    const tempCustomColumns = (modifyCustomColumns || []).map(m=>{
      const item = originalCustomColumns.find(o=>o.kyField == m.kyField)
      const column = {
        customerField:m.customerFieldName,
        kyField:m.kyField,
        orderMustStatus: item?.orderMustStatus || 0,
        unboxingType: item?.unboxingType
      }
      return column
    })
    originalCustomColumns = originalCustomColumns.filter(f=>!tempCustomColumns.find(c=>c.kyField == f.kyField))
    tempCustomColumns.push(...originalCustomColumns)
    return tempCustomColumns
  }

  /**
   * 给表单赋值
   * @param {Object} formData 表单
   * @param {Object} waybillData 运单详情数据
   * @param {Array} customFields 自定义字段
   * @returns 
   */
  assignWaybillDataToFormData(formData,waybillData,customFields){
    const customFieldInfos = waybillData.customFieldInfos || []
    customFields = customFields || []
    if(customFieldInfos.length < 1 || customFields.length < 1){
      return
    }
    customFieldInfos.forEach(nextItem => {
      customFields.forEach(item => {
        if (item.code == nextItem.kyField) {
          formData[item.prop] = nextItem.customerFieldValue
        }
      })
    })
  }
}

export default new CustomColumn()
