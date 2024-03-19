/**
 * @Desc: index
 * @Author: wu xingtao
 * @Date: 2022/5/5
 */
import { addGlobalUncaughtErrorHandler , registerMicroApps , start } from 'qiankun'
import {Message} from 'element-ui'

import apps from './app'

registerMicroApps(apps, {})
/**
 * 添加全局的未捕获异常处理器
 */
addGlobalUncaughtErrorHandler(event => {
  console.error(event)
  const { message: msg } = event
  // 加载失败时提示
  if (msg && msg.includes('died in status LOADING_SOURCE_CODE')) {
    Message.error('微应用加载失败，请检查应用是否可运行')
  }
})

export default start
