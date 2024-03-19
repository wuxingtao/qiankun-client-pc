import { onMounted, ref } from '@vue/composition-api'
import { queryGridColumnConfig , addGridConfigApi, modifyGridConfigApi } from '@/services/api/common'
import { cloneDeep } from 'lodash'
import { getPhone } from '@/utils/storage'

export default function useHistoryColumns(props) {
  if (!validateProps(props)) {
    return
  }
  const { tableConfigName, tableColumns } = props
  const tableConfigId = ref('')
  // onMounted(()=>{initTableColumns(tableConfigName)})

  const initTableColumns = async tableConfigName => {
    const result = await queryTableColumsConfig(tableConfigName)
    if(!result){
      tableConfigId.value =''
      return
    }
    const { historyColumns, tableConfigId: id } = result
    if (!historyColumns) {
      return
    }
    tableConfigId.value = id
    mergeHistoryColumns(tableColumns,historyColumns)
  }

  return {
    tableConfigId,
    initTableColumns,
    copyOriginTableColumns,
    saveTableColumsConfig
  }
}

/**
 * 合并历史表格列
 * @param {Array} tableColumns 原始表格列
 * @param {Array} historyColumns 历史表格列
 */
const mergeHistoryColumns = async (tableColumns,historyColumns)=> {
  const existsInColumns = (columns, col) =>
    columns.find(f => f.prop === col.prop)
  //表格后来可能新增的列
  const newColumns = tableColumns.filter(
    col => !existsInColumns(historyColumns, col)
  )
  // 过滤历史记录列存在于表格列中的数据
  const tempHistoryColumns = historyColumns.filter(col =>
    existsInColumns(tableColumns, col)
  )
  tableColumns.length = 0
  tableColumns.push(...newColumns)
  tableColumns.push(...tempHistoryColumns)
}

/**
 * 校验props参数是否正确
 * @param {Object} props 组件props
 * @returns
 */
const validateProps = props => {
  const { tableConfigName, tableColumns } = props
  if (!tableConfigName) {
    console.error('使用自定义排序时，tableConfigName不能为空')
    return
  }
  if (!tableColumns || tableColumns.length < 1) {
    console.error('使用自定义排序时，tableColumns不能为空')
    return
  }
  return true
}

/**
 * 复制原始表格列，并把禁止隐藏和显示的列展示在最前端
 * @param {Array} tableColumns 原始表格列
 * @param {Boolean} isClientMode 是否在客户端壳里
 * @returns 返回已排序好的表格列副本
 */
const copyOriginTableColumns = (tableColumns,isClientMode) => {
  const tableColumnsCopy = cloneDeep(tableColumns)
  tableColumnsCopy
    .filter(col => !col.hasOwnProperty('visible'))
    .forEach(col => {
      col.visible = false
    })
  let columns = tableColumnsCopy
  if (isClientMode) {
    columns = tableColumnsCopy.filter(f => f.prohibitHide)
    columns.push(
      ...tableColumnsCopy.filter(f => !f.prohibitHide && f.visible)
    )
    columns.push(
      ...tableColumnsCopy.filter(f => !f.prohibitHide && !f.visible)
    )
    return columns
  }
  columns.sort((a, b) => ((a.prohibitHide || a.visible) && !b.visible ? -1 : 0))
  return columns
}

/**
 * 查询历史表格列配置
 * @param {String} tableConfigName 表格配置名称
 * @returns
 */
const queryTableColumsConfig = async tableConfigName => {
  const res = await queryGridColumnConfig(tableConfigName)
  if (res.code === 0 && res.data?.gridAttribute) {
    const historyColumns = JSON.parse(res.data.gridAttribute)
    return {
      tableConfigId: res.data.id,
      historyColumns,
    }
  }
}

/**
 * 保存自定义列配置
 * @param {Array} columns 表格列
 * @param {String} tableConfigId 表格列配置Id
 * @param {String} tableConfigName 表格列配置名称
 * @returns 保存成功时返回表格列配置Id
 */
const saveTableColumsConfig = async (columns , tableConfigId,tableConfigName)=>{
  const params = {
    gridAttribute: JSON.stringify(columns)
  }
  const isModify = !!tableConfigId
  const func = isModify ? modifyGridConfigApi : addGridConfigApi
  if (isModify) {
    params.id = tableConfigId
  } else {
    params.mobile = getPhone()
    params.gridName = tableConfigName
  }
  const res = await func(params)
  if (res.code === 0) {
    if (!isModify) {
      const configId = res.data
      return configId
    }
    return tableConfigId
  }
}