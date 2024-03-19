import request from './request'

// 获取问卷调查详情数据
export const getQuestionDetail = (params) => {
  return request({
    headerUrl: 'web.questionPushRecord.getQuestionDetail',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}

// 提交
export const save = (params) => {
  return request({
    headerUrl: 'web.questionResult.save',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}

// 查询问卷结果
export const getByQuestionId = (params) => {
  return request({
    headerUrl: 'web.questionResult.getByQuestionId',
    method: 'post',
    data: params,
    hideErrMsg: false
  })
}