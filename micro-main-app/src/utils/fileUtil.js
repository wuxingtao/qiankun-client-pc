import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { Message } from 'element-ui'
import native from '@utils/native'
import * as commonUtil from '@utils/commonUtil'
import * as commonApi from '@/services/api/common'

class FileUtil {
  /**
   * 取得相应环境对应的文件上传url
   * @returns
   */
  getUploadFileUrl() {
    let url = 'https://api.ky-express.com/router/upload'
    if (['uc-uat.ky-express.com', 'uc-dev.ky-express.com'].includes(window.location.hostname)) {
      url = 'https://api-uat.kyeapi.com/router/upload'
    } else if ('uc-stg.ky-express.com' === window.location.hostname) {
      url = 'https://api-stg.kyeapi.com/router/upload'
    } else if ('localhost' === window.location.hostname) {
      url = 'https://api-uat.kyeapi.com/router/upload'
    }
    // if (process.env.NODE_ENV !== 'production') {
    //   url = 'http://api-uat.kyeapi.com/router/upload'
    // }
    return url
  }

  //上传文件至文件中心
  async uploadFileToFileCenter(inputFile, bizCode = 'eam_excel_file', fileType = 'xls') {
    try {
      const base64 = await this.readFileToBase64(inputFile, true)
      let file = commonUtil.base64ToFile(base64, inputFile.name)
      const url = this.getUploadFileUrl()
      let data = {
        bizCode,
        bizId: `excel${uuidv4()}`,
        type: fileType,
        file
      }
      let formData = new FormData()
      Object.entries(data).forEach(([key, value]) => formData.append(key, value))
      let res = await axios.post(url, formData)
      if (res.data.code === 0) {
        return res.data.data[0]
      }
    } catch (ex) {
      console.log('uploadFileToFileCenter :>> ', ex)
      Message.error('文件上传失败')
    }
  }

  /**
   * 读取文件并转化为base64
   * @param {File} file
   * @param {boolean} removeFileInfo 是否移除base64文件头信息
   */
  async readFileToBase64(file, removeFileInfo) {
    if ((await native.getClientFrameType()) === 1) {
      const fileInfo = JSON.parse(await native.fileToBase64(file.filePath || file.name, true))
      file.filePath = file.name
      file.name = fileInfo.name
      return fileInfo.base64
    }
    const base64 = await this.readFileToBase64ByFileReader(file, removeFileInfo)
    return base64
  }

  async readFileToBase64ByFileReader(file, removeFileInfo) {
    const rawFile = file.raw
    return new Promise(function(resolve, reject) {
      let reader = new FileReader()
      let result = ''
      reader.readAsDataURL(rawFile)
      reader.onload = function() {
        result = reader.result
      }
      reader.progress = function(rawFile) {
        // console.log(rawFile)
      }
      reader.onerror = function(error) {
        reject(error)
      }
      reader.onloadend = function() {
        if (removeFileInfo) {
          result = result.split(',')[1]
        }
        resolve(result)
      }
    })
  }

  /**
   * 获取Excel原始数据
   * @param {File} file Excel文件
   * @returns 返回接口数据
   */
  async getOriginalExcelData(file){
    const result = await this.uploadFileToFileCenter(file)
    if (!result) {
      return {
        code: 3005,
        errorMsg: 'Excel上传失败'
      }
    }
    const params = {
      bizId: result.bizId,
      bizCode: result.bizCode,
      originalName: file.name
    }
    const res = await commonApi.parseExcelData(params)
    return res
  }

  /**
   * 通过url下载文件，兼容客户端壳内下载
   * @param {String} url 文件url
   * @param {String} fileName 文件名
   * @param {string} fileType 文件类型
   * @returns 
   */
  async downloadFileByUrl(url,fileName,fileType='excel'){
    if (!(await native.isClientMode())) {
      window.location.href = url
      return
    }
    await native.downLoadFile(url, fileType, fileName)
  }
}

export default new FileUtil()
