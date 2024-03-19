import request from './request'

class Print{
  //136两联模板批量打印
  batchPrint_136 (params) {
    return request({
      headerUrl: 'KYE_BatchPrint_136',
      method: 'post',
      data: params
    })
  }
}

export default new Print()

