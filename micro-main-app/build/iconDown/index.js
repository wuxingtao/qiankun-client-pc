/**
 * @Desc: index
 * @Author: wu xingtao
 * @Date: 2022/3/17
 */
const downServe = require('./downServe')
const env = process.env.NODE_ENV

const iconDown = {
  init() {
    if (env === 'production') {
      downServe.prodInit()
    } else {
      downServe.devInit()
    }
  }
}
module.exports = iconDown
