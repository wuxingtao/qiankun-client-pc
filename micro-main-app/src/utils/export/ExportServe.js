/**
 * @Desc: ExportServe 运单管理导出
 * @Author: wu xingtao
 * @Date: 2021/10/26
 */
import { queryExportWaybill, waybillExportStatus, waybillGetExportResult } from '@api/waybillOld'
import store from '@/store'
import native from '@utils/native'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

class ExportServe {
  constructor() {
    this.queueList = [] // 只允许存在一个轮询
    this.loopNum = 0
    this.loopLimit = 500
    this.maxProgress = 100 // 最大进度条
    this.timeOut = 2000 // 轮询间隔
  }

  queueClear(status = 'FINISH') {
    this.queueList = []
    this.loopNum = 0
    store.dispatch('waybill/update_export_status', status)
  }

  loop_add() {
    this.loopNum += 1
  }

  loop_check() {
    let result = false
    if (this.loopNum >= this.loopLimit) {
      this.queueClear('LIMIT')
    } else {
      this.loop_add()
      result = true
    }
    return result
  }

  /**
   * 导出状态轮询
   * @param restart 是否重启任务
   * @returns {Promise<{}>}
   */
  async workFlow(restart = false) {
    let res = {}
    store.dispatch('waybill/update_export_process', 0)

    if (!restart) {
      this.queueList.push('exportStatusRotation')
    }
    if (this.queueList.length > 1) {
      this.queueList.shift()
    } else {
      res = await this.exportStatusRotation()
    }

    return res
  }

  async exportStatusRotation() {
    if (!this.loop_check()) {
      return
    }

    let res = await this.waybillExportStatus()
    if (res.code === 0 && res.data) {
      const firstData = res.data[0]
      if (firstData) {
        store.dispatch(
          'waybill/update_export_process',
          firstData.speed > this.maxProgress ? this.maxProgress : firstData.speed
        )
        store.dispatch('waybill/update_export_status', firstData.taskStatus)
      }

      for (const item of res.data) {
        switch (item.taskStatus) {
          case 'WORKING':
            await new Promise(resolve => {
              setTimeout(resolve, this.timeOut)
            })
            res = await this.exportStatusRotation()
            break
          case 'FINISH':
            res = await this.waybillGetExportResult()
            this.queueClear('FINISH')
            break
          case 'FAIL':
            res = await this.waybillGetExportResult()
            this.queueClear('FAIL')
            break
          default:
            this.queueClear()
        }
      }
    } else {
      this.queueClear()
    }
    return res
  }

  // 获取导出任务状态
  async waybillExportStatus() {
    return await waybillExportStatus()
  }

  // 获取导出结果
  async waybillGetExportResult() {
    let res = await waybillGetExportResult()
    if (res.code === 0 && res.data) {
      store.dispatch('waybill/update_export_status', 'FINISH')
      res.data.forEach(item => {
        if (item.urls) {
          this.downloadFileBatch(item.urls)
        }
      })
    }
  }

  // 开始导出
  async startExport(params, root) {
    store.dispatch('waybill/update_export_status', '')
    let res = await queryExportWaybill(params)
    if (res.code === 0) {
      await this.workFlow()
    } else if (res.code === 40005) {
      await this.workFlow()
    } else {
      this.queueClear()
      res.msg && root.$message.error(res.msg)
    }
  }

  async downloadFileBatch(urls) {
    if (await native.isClientMode()) {
      //   await native.downLoadFileByBatch(JSON.stringify(urls), '.xlsx')
      for (const d of urls) {
        await native.downLoadFile(d, 'excel', `运单列表-${dayjs().format('YYYYMMDD-HHmmss')}.xlsx`)
      }
    } else {
      for (let d = 0; d <= urls.length; d++) {
        setTimeout(() => {
          this.downloadFile(urls[d])
        }, d * 1000)
      }
    }
  }

  downloadFile(url) {
    const iframe = document.createElement('iframe')
    iframe.style.display = 'none'
    iframe.style.height = 0
    iframe.src = url
    document.body.appendChild(iframe)
    setTimeout(() => {
      iframe.remove()
    }, 5 * 60 * 1000)
  }
}

const exportServe = new ExportServe()
export default exportServe
