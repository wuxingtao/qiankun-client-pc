/**
 * @Desc: index
 * @Author: wu xingtao
 * @Date: 2022/3/17
 */
const env = process.env.NODE_ENV
if (env === 'production') {
  require('@/assets/fonts/iconfont/iconfont.css')
} else {
  require('@/assets/fonts/iconfont/iconfont_online.css')
}
