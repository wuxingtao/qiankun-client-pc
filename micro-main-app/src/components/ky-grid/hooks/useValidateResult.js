import { reactive, watch } from '@vue/composition-api'
import { debounce } from 'lodash'
import Schema from 'async-validator'

export default function(validateRules,vm){
  const validateResult = reactive({
    validating: false,
    errorList: [], //{row,error:{'列属性名':错误提示},rowErrors:[]}
    warningList: [],//{row,warning:{'列属性名':警告提示}}
    summary: {
      errorRowCount: 0,
      errorCount: 0
    }
  })

  const resetValidateResult = ()=>{
    validateResult.errorList.splice(0,validateResult.errorList.length)
    validateResult.warningList.splice(0,validateResult.errorList.length)
  }
  
  watch(
    validateResult.errorList,
    () => {
      let errorRowCount = 0
      const errorCount = validateResult.errorList?.reduce((total, cur) => {
        if (cur.rowErrors?.length > 0) {
          errorRowCount += 1
          total += cur.rowErrors?.length || 0
        }
        return total
      }, 0)
      validateResult.summary.errorRowCount = errorRowCount
      validateResult.summary.errorCount = errorCount || 0
    },
    { deep: true }
  )

  const cellValueChange = debounce(async function({ row, column }) {
    console.log(' cellValueChange :>> ', row[column.property])
    const prop = column.property
    const cellValue = row[prop]
    if(!validateRules || !validateRules[prop]){
      return
    }
    const descriptor = { [prop]: validateRules[prop] }
    const validator = new Schema(descriptor)
    try {
      validateResult.validating = true
      await validator.validate({ [prop]: cellValue ,row}, { first: true }, errors => {
        const errorMessage = errors ? errors[0].message : ''
        let item = validateResult.errorList?.find(f => f.row === row)
        if (item && (errorMessage || (item.error && item.error[prop]))) {
          if (!item.error) {
            vm.$set(item, 'error', { [prop]: errorMessage })
          } else {
            vm.$set(item.error, prop, errorMessage)
          }
        } else if (!item && errorMessage) {
          item = { row, error: { [prop]: errorMessage } }
          validateResult.errorList.push(item)
        }
        item && vm.$set(item,'rowErrors', Object.values(item.error).filter(f => f) || [])
      })
    } catch (ex) {
    //
    } finally {
      validateResult.validating = false
    }
  }, 300)

  return {
    validateResult,
    resetValidateResult,
    cellValueChange
  }
}