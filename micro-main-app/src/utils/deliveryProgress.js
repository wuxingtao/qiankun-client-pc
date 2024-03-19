import store from '@/store'
//批量导入进度条
class DeliveryProgress {
  constructor() {
    this.importStepEnum = Object.freeze({
      LOADEXCEL: 1, //读取Excel
      INITTABLE: 2, //加载数据至表格
      SERVICEWAY: 3, //获取服务方式
      ESTIMATEFRIGHT: 4, //预估运费
      VALIDATE: 5, //导入校验
      SAVE: 6, //导入保存
    })
  }
  getMaxProgressByApiOrStep(api, step) {
    const apisInfo = [
      {
        step: this.importStepEnum.LOADEXCEL,
        max: 5,
      },
      {
        step: this.importStepEnum.INITTABLE,
        max: 6,
      },
      {
        step: this.importStepEnum.SERVICEWAY,
        api: 'web.order.client.getBatchGetServiceTypesResult',
        max: 30,
      },
      { step: this.importStepEnum.VALIDATE, api: 'web.query.getOrderBatchCheckResult', max: 90 },
      {
        step: this.importStepEnum.ESTIMATEFRIGHT,
        api: 'web.query.getBatchEstimateFeeResult',
        max: 99,
      },
      { step: this.importStepEnum.SAVE, api: 'web.query.getOrderBatchSaveResult', max: 100 },
    ]
    const key = api ? 'api' : 'step'
    const max = apisInfo.find(f => f[key] === (api || step))?.max || 0
    return max
  }
  //设置导入相关异步接口进度
  setImportProgressByApiResData(api, resData) {
    if (!resData) {
      return
    }
    const max = this.getMaxProgressByApiOrStep(api)
    if (max < 1) {
      return
    }
    const { completedNum, totalNum } = resData
    if (Number(completedNum) >= 0 && Number(totalNum) > 0) {
      const progress = ((completedNum / totalNum) * max).toFixed(0)
      store.commit('delivery/setImportProgess', Number(progress))
    }
  }
}

export default new DeliveryProgress()
