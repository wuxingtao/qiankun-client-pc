import useAddress from '@/hooks/useAddress'

export default function({tableEditableRef=null}={}) {
  const { parseAddress } = useAddress()
  //将表格数据转换为Model
  const changToModelList = (tableRows, isOriginTableData = false) => {
    if (!(tableRows instanceof Array)) {
      tableRows = [tableRows]
    }
    let modelList = tableRows.map(row => {
      let item = {
        qhAddressData: { districtList: [], detailAddress: '' },
        sjAddressData: { districtList: [], detailAddress: '' }
      }
      for (var key in row) {
        if (key.startsWith('_')) {
          continue
        }
        item[key] = isOriginTableData ? row[key] : row[key].value
      }
      return item
    })
    return modelList
  }
  //将表格数据转化为Model，同时解析三级地址
  const changToModeWithParseAddress = async (tableRow, addressFields) => {
    const model = changToModelList(tableRow)[0]
    if (!Array.isArray(addressFields)) {
      addressFields = [addressFields]
    }
    for (let i = 0; i < addressFields.length; i++) {
      const field = addressFields[i]
      const address = model[field]
      if (!address) {
        continue
      }
      const addressInfo = await parseAddress(address)
      model[field + 'Data'] = addressInfo
    }
    return model
  }

  const parseAddressOfModel = async model => {
    // let addressInfo = await parseAddress(model.qhAddress)
    // model.qhAddressData =addressInfo
    // addressInfo = await parseAddress(model.sjAddress)
    // model.sjAddressData =

    model.qhAddressData = { districtList: [], detailAddress: '' }
    model.sjAddressData = { districtList: [], detailAddress: '' }
    ;['qhAddress', 'sjAddress'].forEach(f => {
      parseAddress(model[f]).then(info => {
        model[f + 'Data'].districtList = info?.districtList || []
        model[f + 'Data'].detailAddress = info?.detailAddress || ''
      })
    })
  }

  const updateTableData = ({modelList,key}) => {
    const editableTableData = tableEditableRef.value.editableTableData
    editableTableData.forEach(item => {
      const findRow = modelList.find( f => f.no === item.no?.value)
      if(findRow){
        item[key].value = findRow[key]
      }
    })
  }

  return {
    changToModelList,
    changToModeWithParseAddress,
    parseAddressOfModel,
    updateTableData
  }
}
