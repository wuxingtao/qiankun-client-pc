/**
 * @Desc: preferenceEnum
 * @Author: wu xingtao
 * @Date: 2022/3/7
 */

// 偏好偏好设置选项
export const receiveOptions = [
  { key: 10, label: '周六不收货' },
  { key: 20, label: '周日不收货' },
  { key: 30, label: '法定节假日不收货' },
  { key: 40, label: '每天不收货时间段' },
  { key: 50, label: '全年都收货' }
]

function receiveOptionsToObject(arr) {
  let result = {}
  receiveOptions.forEach(item => {
    result[item.key] = item
  })
  return result
}

export const preference_options_object = receiveOptionsToObject(receiveOptions)
