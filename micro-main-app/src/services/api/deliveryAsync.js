import request from './request'
import dayjs from 'dayjs'
import store from '@/store'
import deliveryUtil from '@/utils/deliveryUtil'
import deliveryProgress from '@/utils/deliveryProgress'
import { Message } from 'element-ui'
import * as storage from '@/utils/storage'

//下单异步轮询相关接口
class DeliveryAsync {
  //异步轮询获取预估运费
  async getEstimateFreightAsync(params) {
    const deliveryBatchId = store.state.delivery.deliveryBatchId
    const res = await request({
      headerUrl: 'web.order.client.batchGetEstimateFee',
      method: 'post',
      data: { estimateFeeRequestList: params },
      hideErrMsg: true
    })
    if (res.code === 0) {
      const asyncParams = {
        api:'web.query.getBatchEstimateFeeResult',
        id: res.data,
        count: params.length,
        beginTime: dayjs(),
        deliveryBatchId
      }
      const asyncRes = await this.getCommonAsyncApiResult(asyncParams)
      if (asyncRes.code === 0) {
        return asyncRes.data.asyData?.filter(f => f.successFlag)
      }
    }
  }

  //异步轮询批量获取服务方式
  async queryServiceWayListByBatchAsync(params) {
    const deliveryBatchId = store.state.delivery.deliveryBatchId
    const res = await request({
      // headerUrl: 'web.order.client.batchGetServiceTypes',
      headerUrl: 'web.order.client.batchGetServiceModes',
      method: 'post',
      data: { serviceTypeRequestList: params }
    })
    if (res.code === 0) {
      const asyncParams = {
        api:'web.query.getBatchServiceTypesResult',
        id: res.data,
        count: params.length,
        beginTime: dayjs(),
        deliveryBatchId
      }
      const asyncRes = await this.getCommonAsyncApiResult(asyncParams)
      if (asyncRes.code === 0) {
        res.data = asyncRes.data.asyData
        return res
      }
    }
  }

  //异步轮询获取默认保费
  async getDefaultDeclaredValueAsync(params) {
    const deliveryBatchId = store.state.delivery.deliveryBatchId
    const res = await request({
      headerUrl: 'web.order.client.batchAsyGetPremiumInformation',
      method: 'post',
      data: { customerCode: storage.getCustomerCode(), ...params },
      hideErrMsg: true
    })
    if (res.code === 0) {
      const asyncParams = {
        api:'web.query.getBatchPremiumInformationResult',
        id: res.data,
        count: params.length,
        beginTime: dayjs(),
        deliveryBatchId
      }
      const asyncRes = await this.getCommonAsyncApiResult(asyncParams)
      if (asyncRes?.code === 0) {
        return asyncRes.data.asyData
      }
    }
  }

  /**
   *
   * @param {String} api 接口名称
   * @param {String} id
   * @returns
   */
  async getCommonAsyncApiResult({ api, id, count, beginTime, deliveryBatchId }) {
    const isBreak = await this.checkPolling({ count, beginTime, api, deliveryBatchId})
    if (isBreak) {
      return
    }
    const res = await request({
      headerUrl: api,
      method: 'post',
      data: { batchNo: id },
      hideErrMsg: true
    })
    deliveryProgress.setImportProgressByApiResData(api, res.data)
    if (res.data?.state == '0') {
      return this.getCommonAsyncApiResult({ api, id, count, beginTime, deliveryBatchId })
    }
    return res
  }

  /**
   * 轮询等待时间
   * @returns 如果中断请求则返回true
   */
  async checkPolling({ count, beginTime, api, deliveryBatchId }) {
    if(deliveryBatchId && deliveryBatchId != store.state.delivery.deliveryBatchId){
      return true
    }
    const span = dayjs().diff(beginTime, 's')
    if (deliveryProgress.getMaxProgressByApiOrStep(api) > 0 && span === 0) {
      store.commit('delivery/setImportProgess', 0)
    }
    console.log('span :>> ', span)
    let isBreak = false
    let sleepTime = 300
    if (count > 500) {
      if (span > 3 * 60) {
        isBreak = true
      }
      sleepTime = 3000
    } else if (count > 200) {
      if (span > 2 * 60) {
        isBreak = true
      }
      sleepTime = 2000
    } else if (count > 50) {
      if (span > 1 * 60) {
        isBreak = true
      }
      sleepTime = 1000
    } else {
      if (span > 1 * 30) {
        isBreak = true
      }
      sleepTime = 300
    }
    if (isBreak) {
      if (['web.query.getOrderBatchSaveResult'].includes(api)) {
        let msg = '跨越系统正在处理你的订单，请稍后在运单管理查看结果'
        Message.warning(msg)
      } else {
        Message.error('请求超时，请稍后再试')
      }
      return true
    }
    await deliveryUtil.sleep(sleepTime)
  }

  /**
   * 获取批量校验或保存结果
   * @param {String} api 接口名称
   * @param {String} id 任务Id
   * @param {Number} count 运单条数
   * @returns
   */
  async getBatchWaybillListResult({api, id, count, beginTime, deliveryBatchId}) {
    const isBreak = await this.checkPolling({ count, beginTime, api ,deliveryBatchId})
    if (isBreak) {
      return
    }
    const res = await request({
      headerUrl: api,
      method: 'post',
      data: { batchNo: id },
      hideErrMsg: true
    })
    if (!res.data) {
      return res
    }
    deliveryProgress.setImportProgressByApiResData(api, res.data)
    if (res.data.state === '0') {
      return this.getBatchWaybillListResult({api, id, count, beginTime, deliveryBatchId})
    } else {
      res.data?.verifyDataResponses?.forEach(data => {
        deliveryUtil.addFieldToVerifyApiResult(data)
      })
    }
    return res
  }
}

export default new DeliveryAsync()
