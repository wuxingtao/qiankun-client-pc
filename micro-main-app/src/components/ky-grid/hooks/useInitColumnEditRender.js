import { omit } from 'lodash'

export default function(tableColumns, cellValueChange) {
  const columns = tableColumns.map(col=>{
    const column = omit(col,['readOnly','options','defaultSlotName'])
    if(col.isDynamicOption){
      column.editRender = {
        name: '$select',
        isDynamicOption: true
      }
    }
    else if(col.options){
      column.editRender = {
        name: '$select',
        options:col.options
      }
    }

    if(col.defaultSlotName){
      column.slots = { default: col.defaultSlotName }
    }
    else if (!col.readOnly && !column.editRender) {
      column.editRender = {
        name: '$input',
        props: { type: 'text',maxlength:col.maxlength, placeholder:col.placeholder}
      }
    }
    if(column.editRender){
      column.editRender.events = { change: cellValueChange }
    }
    if (!column.slots) {
      column.slots = { default: 'column_normal' }
    }
    return column
  })
  return columns
}
