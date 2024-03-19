/**
 * Native
 * 原生能力封装类
 */

// 判断是否在客户端的原生模式
const isClientMode = () => {
  return (
    window['net_isInClient'] && typeof window['net_isInClient'] === 'function'
  )
}

// 窗体操作 - 最小化、最大化、恢复默认、关闭，可拖动。不可拖动，
const win = {
  getState: () => {
    return __call('net_getWindowState')
  },
  minimize: () => {
    __call('net_setWindowState', 0)
  },
  maximize: () => {
    __call('net_setWindowState', 1)
  },
  resume: () => {
    __call('net_setWindowState', 2)
  },
  close: () => {
    __call('net_closeWindow')
  },
  sizable: () => {
    __call('net_setSizableState', true)
  },
  noSizable: () => {
    __call('net_setSizableState', false)
  },
  setLoginFormSize: () => {
    __call('net_setLoginFormSize')
  },
  setLoginFormFlag: (isLoginForm) => {
    __call('net_setLoginFormFlag', isLoginForm)
  },
}

// 缓存
const getCacheInfo = (key) => {
  return __call('net_getCacheInfo', key)
}

const setCacheInfo = (key, value) => {
  __call('net_setCacheInfo', key, value)
}

// 获取客户端本地打印机
const getPrinterList = () => {
  return __call('net_getPrinterList')
}

// 获取打印预览图
const getPrintViewImage = (directives, dataJson, templateType) => {
  return __call('net_getPrintPreviewImage', directives, dataJson, templateType)
}

// 读取excel
const readExcel = (filePath, headerIndex) => {
  return __call('net_readExcel', filePath, headerIndex)
}
const readExcelAsync = (filePath, headerIndex) => {
  return __call('net_readExcelAsync', filePath, headerIndex)
}

// 读取excel
const fileToBase64 = (filePath, isReturnJson) => {
  return __call('net_fileToBase64', filePath, isReturnJson)
}

// 批量下载文件
const downLoadFileByBatch = (urlsJson, fileExtension) => {
  return __call('net_downLoadFileByBatch', urlsJson, fileExtension)
}

const downLoadFile = (url, fileType, fileName) => {
  return __call('net_downLoadFile', url, fileType, fileName)
}

//打印
const batchPrint = (templateText, data, noType, printName) => {
  return __call('net_batchPrint', templateText, data, noType, printName)
}

//导出表格
const exportTable = (data, fileName) => {
  return __call('net_exportTable', data, fileName)
}

//打印标签
const printTag = (data, resourceID) => {
  return __call('net_printTag', data, resourceID)
}

//获取版本号
const getVersion = () => {
  return __call('net_getVersionNo')
}

//选择文件并返回base64
const selectFileToBase64 = (fileFilter) => {
  return __call('net_selectFileToBase64', fileFilter)
}

//取得指定文件大小
const getFileSize = (filePath) => {
  const size = parseInt(__call('net_getFileSize', filePath))
  return size
}

//下载base64格式的文件
const downloadFileByBase64 = (base64, fileName, isOpenFile = true) => {
  return __call('net_downloadFileByBase64', base64, fileName, isOpenFile)
}

// 批量下载文件带文件名
const downLoadFileByBatchNew = (urlsJson, fileExtension) => {
  return __call('net_downLoadFileByBatch_New', urlsJson, fileExtension)
}

const __call = (funcName, ...args) => {
  if (window[funcName] && typeof window[funcName] === 'function') {
    return window[funcName](...args)
  }
}

/**
 * 判断是否存在相应的C#方法
 * @param {String} funcName 方法名
 * @returns
 */
const existsNativeFunc = (funcName) => {
  if (!funcName) {
    return false
  }
  let exists = window[funcName] && typeof window[funcName] === 'function'
  if (!exists && !funcName.startsWith('net_')) {
    funcName = `net_${funcName}`
    exists = window[funcName] && typeof window[funcName] === 'function'
  }
  return exists
}

export default {
  existsNativeFunc,
  isClientMode,
  win,
  getCacheInfo,
  setCacheInfo,
  getPrinterList,
  getPrintViewImage,
  readExcel,
  readExcelAsync,
  fileToBase64,
  getFileSize,
  downLoadFileByBatch,
  downLoadFile,
  batchPrint,
  exportTable,
  printTag,
  getVersion,
  selectFileToBase64,
  downloadFileByBase64,
  downLoadFileByBatchNew,
}
