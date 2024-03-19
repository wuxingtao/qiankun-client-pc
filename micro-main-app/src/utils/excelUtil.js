import { saveAs } from 'file-saver'
import XLSX from 'xlsx'

/* --- Export Functions --- */

/**
 * 导出excel
 * @param {Object} options
 * @param {Array} options.theadColumns 表头列数组 eg:[{prop:'id',text:'序号'}],如果不传则取jsonData第一行的键为列名
 * @param {Array} options.jsonData 导出的json数据 eg:[{prop:1}]
 * @param {string} options.filename [excel] 导出文件名
 * @param {string} options.excelType [xlsx] excel文件类型
 * @param {sheetName} options.sheetName [sheet1] sheet名称
 * @param {Array} customizeThead 自定义表头,支持多级表头 eg:[['序号']]；
 * @param {Array} cellMerges 单元格合并规则 eg:['A1:A2','B1:E1','F1:H1','I1:L1']
 * @param {Boolean} autoWidth 宽度是否自适应(注：导出xls类型的excel不支持)
 */
export function exportExcel ({
  theadColumns,
  jsonData,
  filename = 'excel',
  excelType = 'xlsx',
  sheetName = 'sheet1',
  autoWidth = true,
  customizeThead = [],
  cellMerges = [],
  canDataEmpty = false
}) {
  if (!canDataEmpty && (!jsonData || jsonData.length < 1)) {
    throw new Error('jsonData 不能为空')
  }
  if (!theadColumns) {
    theadColumns = Object.keys(jsonData[0]).reduce((cols, cur) => {
      cols.push({ prop: cur, text: cur })
      return cols
    }, [])
  }
  let aoa = formatJsonDataToArray(theadColumns, jsonData, customizeThead, cellMerges)
  let sheet = XLSX.utils.aoa_to_sheet(aoa)
  if (cellMerges.length > 0) {
    if (!sheet['!merges']) {
      sheet['!merges'] = []
    }
    cellMerges.forEach((item) => {
      sheet['!merges'].push(XLSX.utils.decode_range(item))
    })
  }
  if (autoWidth) {
    setColumnWidth(sheet, aoa)
  }
  let workbook = {
    SheetNames: [sheetName],
    Sheets: {},
  }
  workbook.Sheets[sheetName] = sheet
  // 生成excel的配置项
  let wopts = {
    bookType: excelType, // 要生成的文件类型
    bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
    type: 'binary',
  }
  let wbout = XLSX.write(workbook, wopts)
  let blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
  saveAs(blob, `${filename}.${excelType}`)
}

// 设置宽度
function setColumnWidth(worksheet, data) {
  /*设置worksheet每列的最大宽度*/
  const colWidth = data.map((row) =>
    row.map((val) => {
      /*先判断是否为null/undefined*/
      if (val == null) {
        return {
          wch: 10,
        }
      } else if (val.toString().charCodeAt(0) > 255) {
        /*再判断是否为中文*/
        return {
          wch: val.toString().length * 2,
        }
      } else {
        return {
          wch: val.toString().length,
        }
      }
    })
  )
  /*以第一行为初始值*/
  let result = colWidth[0]
  for (let i = 1; i < colWidth.length; i++) {
    for (let j = 0; j < colWidth[i].length; j++) {
      if (result[j]['wch'] < colWidth[i][j]['wch']) {
        result[j]['wch'] = colWidth[i][j]['wch']
      }
    }
  }
  worksheet['!cols'] = result
}

/**
 * 将json数据转化为数组
 * @param {Array} theadColumnss  表头 eg:[{prop:'id',text:'序号'}]
 * @param {Array} jsonData 导出json数据 eg:[{prop:1}]
 * @param {Array} customizeThead 自定义表头 eg:[['序号']]
 * @return eg:[[序号][1]]
 */
function formatJsonDataToArray(theadColumns, jsonData, customizeThead) {
  let propArray = []
    ,textArray = []
  theadColumns.forEach(({ prop, text }) => {
    propArray.push(prop)
    textArray.push(text)
  })
  let data = jsonData.map((j) => propArray.map((p) => j[p]))
  //如果启用自定义表头，则不启用默认表头
  if (customizeThead.length > 0) {
    for (let i = customizeThead.length - 1; i > -1; i--) {
      data.unshift(customizeThead[i])
    }
  } else {
    data.unshift(textArray)
  }
  return data
}

//字符串转ArrayBuffer
function s2ab(s) {
  let buf = new ArrayBuffer(s.length)
  let view = new Uint8Array(buf)
  for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff
  return buf
}

/* --- Import Functions --- */

/**
 * 读取Excel文件,返回json数据
 * @param {Object(File)} file
 * @param {Number} headerIndex 指定Excel的标题行，从0开始
 * @return {Promise} Promise
 */
export function readExcel(file, headerIndex = 0) {
  if (!/\.(xlsx|xls|csv)$/.test(file.name.toLocaleLowerCase())) {
    throw new Error('只支持读取.xlsx, .xls, .csv文件')
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        let header = getExcelHeader(worksheet, headerIndex)
        let jsonData = XLSX.utils.sheet_to_json(worksheet, { header })
        jsonData = JSON.stringify(jsonData).replace(/[\\f\\n\\r\\t\\v]/g, '')
        jsonData = JSON.parse(jsonData)
        jsonData.splice(0, headerIndex + 1)
        resolve({ jsonData, header })
      } catch (ex) {
        reject(ex)
      }
    }
    reader.readAsArrayBuffer(file.raw)
  })
}

function getExcelHeader(worksheet, headerIndex) {
  let header = []
  const range = XLSX.utils.decode_range(worksheet['!ref'])
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: headerIndex })]
    let text = cell && cell.t ? XLSX.utils.format_cell(cell) : 'COLUMN' + C
    header.push(text)
  }
  return header
}
