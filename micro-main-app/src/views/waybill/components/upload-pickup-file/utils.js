
/**
 * 读取文件
 * @param { file } file 文件对象
 * @param { string } dataurl 文件的 base64
 * @param { string } filename 文件名称
 * @returns { file } 返回一个 File 对象
 */
export function dataURLtoFile(dataurl, filename) {
  // 获取到base64编码
  const arr = dataurl.split(',')
  // 将base64编码转为字符串
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n) // 创建初始化为0的，包含length个元素的无符号整型数组
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, {
    type: 'image/jpeg',
  })
}

/**
 * 转换为数组
 * @param { any | any[] } item 文件对象
 * @returns { any[] } 返回一个数组
 */
export const toArray = item => {
  return Array.isArray(item) ? item : [item]
}

/**
 * 检测文件大小
 * @param { file | file[] } files 文件对象
 * @param { number } maxSize 大小
 * @returns { Boolean } 如果文件大小超出 maxSize 则返回 true 否则为 false
 */
export const isOversize = (files, maxSize) => {
  return toArray(files).some(file => {
    if (file) {
      return file.fileSize > maxSize
    }
    return false
  })
}

/**
 * 生成随机字符串
 * @returns { string }
 */
export const uuid = () => {
  function b(a) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : ([1e7] + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

/**
 * 获取文件后缀
 * @returns { string }
 */
export const getFileSuffix = (fileName = '') => {
  return fileName
    .split('.')
    .pop()
    .toLowerCase()
}

/**
 * 转换单位
 * @returns { string }
 */
export const toUnitSize = (fileSize = 0) => {
  if (fileSize <= 100) {
    return `${fileSize.toFixed(2)}K`
  }
  return `${(fileSize / 1024).toFixed(2)}M`
}

/**
 * 格式化文件名称
 * @returns { string[] }
 */
export const formatFileName = fileName => {
  let index = fileName.lastIndexOf('.')
  return [fileName.slice(0, index - 2), fileName.slice(index - 2)]
}

/**
 * 检查是否是 Invalid Date
 * @returns { boolean }
 */
export const isInvalidDate = date => {
  return date instanceof Date && isNaN(date.getTime())
}
