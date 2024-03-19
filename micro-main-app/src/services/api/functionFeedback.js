import request from './request' 

//上传图片
export function uploadImage(base64) {
  return request({
    headerUrl: 'web.feedback.uploadimg',
    method: 'post',
    data: { file: base64 },
  })
}

//添加反馈
export function addFeedback(params) {
  return request({
    headerUrl: 'web.feedback.addFeedback',
    method: 'post',
    data: params,
  })
}

//获取反馈奖励下线时效
export function getFeedbackDeadline() {
  return request({
    headerUrl: 'web.feedback.group',
    method: 'post',
    data: {},
  })
}