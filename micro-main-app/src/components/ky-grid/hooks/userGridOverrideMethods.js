
export default function(xGridRef,tableRowCount,validateResult,resetValidateResult){
  const getTableRowCount = ()=>{
    return getTableData.length || 0
  }
  
  const getTableData = () => {
    return xGridRef.value.getTableData().fullData
  }

  const insertRows = rows => {
    xGridRef.value.insert(rows)
    tableRowCount.value = getTableRowCount()
  }
  const removeRow = ({ row }) => {
    const index = validateResult.errorList?.findIndex(f => f.row === row)
    index >= 0 && validateResult.errorList.splice(index, 1)
    xGridRef.value.remove(row)
    tableRowCount.value = getTableRowCount()
  }

  const loadData = data => { 
    xGridRef.value.loadData(data) 
    tableRowCount.value = getTableRowCount()
    resetValidateResult()
  }

  const clearData = () => {
    resetValidateResult()
    tableRowCount.value = 0
    xGridRef.value.reloadData([])
  }

  const refeashColumns = columns =>{
    if(columns?.length < 1){
      return
    }
    columns.forEach(col=>{
      const column = xGridRef.value.getColumnByField(col.field)
      if(column){
        column.title = col.title
        if(column.visible != col.visible){
          if(col.visible){
            xGridRef.value.showColumn(column)
          }else{
            xGridRef.value.hideColumn(column)
          }
        }
      }
    })
  }
  // const loadColumn = columns =>{
  //   xGridRef.value.loadColumn(columns)
  // }

  return {
    getTableData,
    insertRows,
    removeRow,
    loadData,
    clearData,
    refeashColumns
  }

}