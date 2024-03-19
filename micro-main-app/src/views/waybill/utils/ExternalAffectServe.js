import waybillApi from '@api/waybill'

class ExternalAffectServe {
  constructor() {
    this.batchId = '' // 批次号
    this.atWork = false // 占位标识符
    this.needRestart = false // 请求重启标识
    this.loopNum = 0
    this.loopLimit = 500
    this.timeout = 1000 // 轮训间隔
  }

  queueClear() {
    this.atWork = false
    this.loopNum = 0
  }

  loopAdd() {
    this.loopNum += 1
  }

  loopCheck() {
    let result = false
    if (this.loopNum >= this.loopLimit) {
      this.queueClear()
    } else {
      this.loopAdd()
      result = true
    }
    return result
  }

  async workFlow() {
    let res = {}

    // if (!restart) {
    //   res = await this.queryStatusRotation()
    // }
    this.atWork = true
    res = await this.queryStatusRotation()
    return res
  }

  async queryStatusRotation() {
    if (!this.loopCheck()) return
    let res = await this.getBatchGetExternalEffectResult()
    if (res.code === 0 && res.data) {
      if (res.data.state === '1') {
        this.queueClear()
        res = res.data
      } else if (res.data.state === '0') {
        /**
         * restart为true时需要把之前的轮训终止，并且不延迟立即启动下一次请求
         * */
        if (this.needRestart) {
          this.needRestart = false
        } else {
          await this.lazyExecution(this.timeout)
        }
        res = await this.queryStatusRotation()
      } else {
        this.queueClear()
      }
    } else {
      this.queueClear()
    }
    this.atWork = false
    return res
  }

  // 开始入口
  async startQuery(params, root) {
    this.needRestart = this.atWork
    let res = await this.batchGetExternalEffect(params)
    if (res.code === 0) {
      this.batchId = res.data
      return await this.workFlow()
    } else {
      this.queueClear()
      res.msg && root.$message.error(res.msg)
      return
    }
  }

  // 获取查询任务状态
  async batchGetExternalEffect(params) {
    return await waybillApi.batchGetExternalEffect(params)
  }

  // 获取查询结果
  async getBatchGetExternalEffectResult() {
    return await waybillApi.getBatchGetExternalEffectResult({ batchNo: this.batchId })
  }

  // 延迟阻碍
  lazyExecution(time) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }
}

const externalAffectServe = new ExternalAffectServe()
export default externalAffectServe
